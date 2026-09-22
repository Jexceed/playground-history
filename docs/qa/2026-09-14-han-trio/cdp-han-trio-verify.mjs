/* CDP verification driver for the three Han chapters (headless Chrome, no external deps). */
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9335;
const BASE = "http://127.0.0.1:4173/";
const OUT = "docs/qa/2026-09-14-han-trio/screens";

const CHAPTERS = [
  {
    id: "cn-ancient-04-02-han-governance", tag: "wuzhu",
    slideDone: "钱串上了", slideWrong: "还没对准方孔",
    inspectStep3: false, changePhoto: false,
  },
  {
    id: "cn-ancient-04-03-silk-road", tag: "silk",
    slideDone: "粮袋驮好了", slideWrong: "粮袋还差一点",
    inspectStep3: true, changePhoto: true,
  },
  {
    id: "cn-ancient-04-04-han-knowledge", tag: "paper",
    slideDone: "纸页晾上了", slideWrong: "纸页还湿着呢",
    inspectStep3: false, changePhoto: false,
  },
];

mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
rmSync("/tmp/cdp-han-trio", { recursive: true, force: true });
const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`,
  "--user-data-dir=/tmp/cdp-han-trio", "--no-first-run", "--mute-audio",
  "--autoplay-policy=no-user-gesture-required", "--window-size=390,600", "about:blank",
], { stdio: "ignore" });
process.on("exit", () => chrome.kill("SIGKILL"));

let version = null;
for (let i = 0; i < 40 && !version; i++) {
  await sleep(250);
  version = await fetch(`http://127.0.0.1:${PORT}/json/version`).then((r) => r.json()).catch(() => null);
}
if (!version) throw new Error("chrome devtools not reachable");
const target = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let seq = 0;
const pending = new Map();
const consoleErrors = [];
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  if (msg.method === "Runtime.exceptionThrown") consoleErrors.push(msg.params.exceptionDetails?.exception?.description ?? "exception");
  if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") consoleErrors.push("console.error");
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++seq;
  pending.set(id, (msg) => (msg.error ? reject(new Error(`${method}: ${msg.error.message}`)) : resolve(msg.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 600, deviceScaleFactor: 2, mobile: true });

const evalJs = async (expression) => {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(`eval failed: ${result.exceptionDetails.text} at ${expression.slice(0, 100)}`);
  return result.result?.value;
};
const waitFor = async (expression, label, timeout = 40000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evalJs(`Boolean(${expression})`)) return;
    await sleep(300);
  }
  throw new Error(`timeout waiting for ${label}: ${expression}`);
};
const click = async (selector) => {
  const state = await evalJs(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)return 'missing';el.scrollIntoView({block:'center'});el.click();return 'ok';})()`);
  if (state !== "ok") throw new Error(`click target missing: ${selector}`);
};

const report = { chapters: [], errors: consoleErrors };
for (const conf of CHAPTERS) {
  const checks = [];
  const check = (name, pass, detail = "") => { checks.push({ name, pass: Boolean(pass), detail }); console.log(conf.tag, pass ? "PASS" : "FAIL", name, detail); };
  const shot = async (name) => {
    const data = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`${OUT}/${conf.tag}-${name}.png`, Buffer.from(data.data, "base64"));
  };
  const overflow = async (label) => {
    const value = await evalJs(`JSON.stringify({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth})`).then(JSON.parse);
    check(`no-horizontal-overflow@${label}`, value.sw <= value.cw + 1, `${value.sw}<=${value.cw}`);
  };
  const nextVisible = async (label) => {
    const rect = await evalJs(`(()=>{const b=document.querySelector('.workbench-next');if(!b)return null;const r=b.getBoundingClientRect();return JSON.stringify({bottom:r.bottom,left:r.left,right:r.right});})()`).then((r) => (r ? JSON.parse(r) : null));
    check(`next-button-in-view@${label}`, rect && rect.bottom <= 600 && rect.left >= 0 && rect.right <= 390, JSON.stringify(rect));
  };

  await send("Page.navigate", { url: BASE });
  await waitFor(`document.querySelector('.river-path')`, "river home first load");
  await evalJs(`localStorage.clear()`);
  await send("Page.navigate", { url: BASE });
  await waitFor(`document.querySelector('[data-period-id="han"]')`, "river home");
  await sleep(600);
  await click('[data-period-id="han"]');
  await waitFor(`document.querySelector('[data-chapter-id="${conf.id}"]')`, "han station");
  check("han station lists three quests", (await evalJs(`document.querySelectorAll('.panel-card').length`)) === 3);
  await shot("01-station");
  await click(`[data-chapter-id="${conf.id}"]`);
  await waitFor(`document.querySelector('.quest-start-actions .next-button')`, "cover");
  await sleep(400);
  await shot("02-cover");
  await click('.quest-start-actions .next-button');

  // step time: era pick, wrong then right, inspection layer
  await waitFor(`document.querySelector('.quest-artifact-intro')`, "step time");
  await sleep(300);
  await shot("03-step1");
  await overflow("step1");
  await click(`[data-option-id="${conf.id}-time-2"]`);
  await waitFor(`document.querySelector('.bench-choice.try-again')`, "time wrong");
  await shot("04-step1-wrong");
  await click(`[data-option-id="${conf.id}-time-1"]`);
  await waitFor(`document.querySelector('.workbench-next')`, "time solved");
  await nextVisible("step1");
  await click(".quest-artifact-picture");
  await waitFor(`document.querySelector('.image-lightbox')`, "inspection layer");
  await shot("05-inspection");
  const links = await evalJs(`document.querySelectorAll('.image-evidence-boundary a').length`);
  check("inspection source links", links >= 2, `links=${links}`);
  await click(".image-lightbox-close");
  await waitFor(`!document.querySelector('.image-lightbox')`, "inspection closed");
  await click(".workbench-next");

  // step beginning: look-listen
  await waitFor(`document.querySelector('[data-step-id="beginning"]')`, "step beginning");
  await sleep(400);
  check("beginning has no quiz cards", (await evalJs(`document.querySelectorAll('.bench-choice').length`)) === 0);
  await shot("06-step2");
  await click(".look-listen-continue");
  await waitFor(`document.querySelector('.workbench-next')`, "beginning heard");
  await nextVisible("step2");
  await overflow("step2");
  await click(".workbench-next");

  // step journey: slide-fit partial drag then keyboard align
  await waitFor(`document.querySelector('[data-step-id="journey"]')`, "step journey");
  await sleep(400);
  await shot("07-step3-drag");
  const box = await evalJs(`(()=>{const t=document.querySelector('.alignment-track');const m=t?.querySelector('.alignment-movable');if(!m)return null;const tr=t.getBoundingClientRect(),mr=m.getBoundingClientRect();return JSON.stringify({trackW:tr.width,x:mr.x+mr.width/2,y:mr.y+mr.height/2});})()`).then((r) => (r ? JSON.parse(r) : null));
  const dx = box.trackW * -0.09;
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: box.x, y: box.y, button: "left", clickCount: 1, pointerType: "mouse" });
  for (let i = 1; i <= 6; i++) await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x + (dx * i) / 6, y: box.y, button: "left", pointerType: "mouse" });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: box.x + dx, y: box.y, button: "left", clickCount: 1, pointerType: "mouse" });
  await sleep(400);
  const bubble = await evalJs(`(()=>{const h=document.querySelector('.trip-speech h1');return h?h.textContent:'';})()`);
  check("misaligned drop retries", bubble.includes(conf.slideWrong), bubble);
  for (let i = 0; i < 9; i++) {
    await evalJs(`(()=>{const el=document.querySelector('.alignment-movable');el.focus();el.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));return true;})()`);
    await sleep(80);
  }
  await waitFor(`document.querySelector('.workbench-next')`, "journey solved");
  await shot("08-step3-done");
  check("keyboard align solves", (await evalJs(`(()=>{const m=document.querySelector('.alignment-movable');return m?m.getAttribute('aria-valuetext'):null;})()`)) === conf.slideDone);
  await nextVisible("step3");
  await overflow("step3");
  await click(".workbench-next");

  // step change: look-listen (+ optional photo)
  await waitFor(`document.querySelector('[data-step-id="change"]')`, "step change");
  await sleep(400);
  if (conf.changePhoto) check("change shows real photo", await evalJs(`Boolean(document.querySelector('.quest-artifact-picture img'))`));
  await shot("09-step4");
  await click(".look-listen-continue");
  await waitFor(`document.querySelector('.workbench-next')`, "change heard");
  await nextVisible("step4");
  await click(".workbench-next");

  // step takeaway: reunion look-listen
  await waitFor(`document.querySelector('[data-step-id="takeaway"]')`, "step takeaway");
  await sleep(400);
  check("reunion image shown", await evalJs(`(()=>{const img=document.querySelector('.workbench-art');return img&&/reunion/.test(img.src);})()`));
  await shot("10-step5");
  await click(".look-listen-continue");
  await waitFor(`document.querySelector('.workbench-next')`, "takeaway heard");
  await click(".workbench-next");

  // finish
  await waitFor(`document.querySelector('.quest-finish')`, "finish page");
  await sleep(500);
  await shot("11-finish");
  check("finish navigation buttons", await evalJs(`Boolean(document.querySelector('.finish-navigation-home'))&&Boolean(document.querySelector('.finish-navigation-replay'))`));
  await click(".family-extra > summary");
  await sleep(400);
  await shot("12-family");
  const famPractice = await evalJs(`Boolean(document.querySelector('.workbench-family .alignment-movable'))`);
  check("family practice present", famPractice);
  await click(".finish-navigation-home");
  await waitFor(`document.querySelector('.river-path')`, "back home");
  report.chapters.push({ id: conf.id, checks });
}
check_all: {
  const bad = report.chapters.flatMap((c) => c.checks.filter((k) => !k.pass));
  console.log("console errors:", consoleErrors.length, consoleErrors.slice(0, 3));
  writeFileSync("docs/qa/2026-09-14-han-trio/browser-check-cdp.json", JSON.stringify(report, null, 2));
  console.log("done", report.chapters.map((c) => `${c.id.split("-").pop()}:${c.checks.filter((k) => k.pass).length}/${c.checks.length}`).join(" "));
  ws.close();
  chrome.kill("SIGKILL");
  process.exit(bad.length || consoleErrors.length ? 1 : 0);
}
