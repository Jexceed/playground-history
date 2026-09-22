/* CDP verification driver for the Great Wall chapter (headless Chrome, no external deps). */
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;
const BASE = "http://127.0.0.1:4173/";
const OUT = "docs/qa/2026-09-14-qin-han-wall/screens";
const CHAPTER = "cn-ancient-04-05-qin-great-wall";

rmSync("/tmp/cdp-wall-check", { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`,
  "--user-data-dir=/tmp/cdp-wall-check", "--no-first-run", "--mute-audio",
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
  if (msg.method === "Runtime.exceptionThrown") consoleErrors.push(msg.params.exceptionDetails?.exception?.description ?? msg.params.exceptionDetails?.text ?? "exception");
  if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") consoleErrors.push(msg.params.args?.map((a) => a.value ?? a.description).join(" ") ?? "console.error");
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
  if (result.exceptionDetails) throw new Error(`eval failed: ${result.exceptionDetails.text} ${result.exceptionDetails.exception?.description ?? ""}\n  at ${expression.slice(0, 120)}`);
  return result.result?.value;
};
const waitFor = async (expression, label, timeout = 40000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evalJs(`Boolean(${expression})`)) return;
    await sleep(300);
  }
  const state = await evalJs(`document.readyState + '|' + (document.body?document.body.innerText.slice(0,200):'nobody')`).catch(() => "eval-broken");
  throw new Error(`timeout waiting for ${label}: ${expression} | page: ${state}`);
};
const click = async (selector) => {
  const state = await evalJs(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)return 'missing';el.scrollIntoView({block:'center'});el.click();return 'ok';})()`);
  if (state !== "ok") throw new Error(`click target missing: ${selector}`);
};
const shot = async (name) => {
  const data = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(data.data, "base64"));
  console.log("shot", name);
};
const report = { checks: [], errors: consoleErrors };
const check = (name, pass, detail = "") => { report.checks.push({ name, pass: Boolean(pass), detail }); console.log(pass ? "PASS" : "FAIL", name, detail); };
const overflow = async (label) => {
  const value = await evalJs(`JSON.stringify({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth})`).then(JSON.parse);
  check(`no-horizontal-overflow@${label}`, value.sw <= value.cw + 1, `scrollWidth=${value.sw} clientWidth=${value.cw}`);
};
const nextVisible = async (label) => {
  const rect = await evalJs(`(()=>{const b=document.querySelector('.workbench-next');if(!b)return null;const r=b.getBoundingClientRect();return JSON.stringify({bottom:r.bottom,left:r.left,right:r.right});})()`).then((r) => (r ? JSON.parse(r) : null));
  check(`next-button-in-view@${label}`, rect && rect.bottom <= 600 && rect.left >= 0 && rect.right <= 390, JSON.stringify(rect));
};
const optionId = (step, index) => `${CHAPTER}-${step}-${index}`;

const dragMovable = async (fraction, label) => {
  const box = await evalJs(`(()=>{const t=document.querySelector('.alignment-track');const m=t?.querySelector('.alignment-movable');if(!m)return null;const tr=t.getBoundingClientRect(),mr=m.getBoundingClientRect();return JSON.stringify({trackX:tr.x,trackW:tr.width,x:mr.x+mr.width/2,y:mr.y+mr.height/2});})()`).then((r) => (r ? JSON.parse(r) : null));
  if (!box) throw new Error("no movable for drag");
  const dx = box.trackW * fraction;
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: box.x, y: box.y, button: "left", clickCount: 1, pointerType: "mouse" });
  for (let i = 1; i <= 8; i++) await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x + (dx * i) / 8, y: box.y, button: "left", pointerType: "mouse" });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: box.x + dx, y: box.y, button: "left", clickCount: 1, pointerType: "mouse" });
  await sleep(400);
  console.log("dragged", label, `dx=${dx.toFixed(0)}px`);
};
const pressArrow = async (key, times) => {
  for (let i = 0; i < times; i++) {
    await evalJs(`(()=>{const el=document.querySelector('.alignment-movable');el.focus();el.dispatchEvent(new KeyboardEvent('keydown',{key:${JSON.stringify(key)},bubbles:true}));return true;})()`);
    await sleep(80);
  }
};

// 1. home
await send("Page.navigate", { url: BASE });
await waitFor(`document.querySelector('.river-path')`, "river home");
await sleep(600);
await shot("01-home");
check("home river visible", await evalJs(`Boolean(document.querySelector('[data-period-id="qin"]'))`));

// 2. station panel
await click('[data-period-id="qin"]');
await waitFor(`document.querySelector('[data-chapter-id="${CHAPTER}"]')`, "station panel");
await sleep(400);
await shot("02-station");
const cardCount = await evalJs(`document.querySelectorAll('.panel-card').length`);
check("qin station lists two quests", cardCount === 2, `cards=${cardCount}`);

// 3. cover
await click(`[data-chapter-id="${CHAPTER}"]`);
await waitFor(`document.querySelector('.quest-start-actions .next-button')`, "cover");
await sleep(500);
await shot("03-cover");
check("cover shows story scene", await evalJs(`Boolean(document.querySelector('.workbench-cover-scene'))`));

// 4. step time: wrong then right, inspection layer
await click('.quest-start-actions .next-button');
await waitFor(`document.querySelector('.quest-artifact-intro')`, "step time");
await sleep(400);
await shot("04-step1");
await overflow("step1");
await click(`[data-option-id="${optionId("time", 2)}"]`);
await waitFor(`document.querySelector('.bench-choice.try-again')`, "wrong state");
await sleep(300);
await shot("05-step1-wrong");
check("wrong option marked", await evalJs(`Boolean(document.querySelector('.bench-choice.try-again'))`));
await click(`[data-option-id="${optionId("time", 1)}"]`);
await waitFor(`document.querySelector('.workbench-next')`, "solved next");
await sleep(300);
await shot("06-step1-right");
await nextVisible("step1");
await click(".quest-artifact-picture");
await waitFor(`document.querySelector('.image-lightbox')`, "inspection layer");
await sleep(400);
await shot("07-inspection");
const links = await evalJs(`document.querySelectorAll('.image-evidence-boundary a').length`);
check("inspection source links", links >= 3, `links=${links}`);
await click(".image-lightbox-close");
await waitFor(`!document.querySelector('.image-lightbox')`, "inspection closed");
await click(".workbench-next");

// 5. step beginning: look-listen story beat (no quiz)
await waitFor(`document.querySelector('[data-step-id="beginning"]')`, "step beginning");
await sleep(400);
check("beginning has no quiz cards", await evalJs(`document.querySelectorAll('.bench-choice').length===0`));
check("beginning shows the story", await evalJs(`(document.querySelector('.look-listen-story')?.textContent||'').includes('长城长')`));
await shot("08-step2");
await click(".look-listen-continue");
await waitFor(`document.querySelector('.workbench-next')`, "beginning heard");
await sleep(300);
await nextVisible("step2");
await overflow("step2");
await click(".workbench-next");

// 6. step journey: slide-fit — partial wrong drag, then keyboard align
await waitFor(`document.querySelector('[data-step-id="journey"]')`, "step journey");
await sleep(400);
await shot("09-step3-drag");
await dragMovable(-0.09, "partial");
await sleep(300);
const retryBubble = await evalJs(`(()=>{const h=document.querySelector('.trip-speech h1');return h?h.textContent:'';})()`);
check("misaligned drop retries", retryBubble.includes("还错开一点"), retryBubble);
await pressArrow("ArrowLeft", 9);
await waitFor(`document.querySelector('.workbench-next')`, "journey solved by keyboard");
await sleep(300);
await shot("10-step3-joined");
const joined = await evalJs(`(()=>{const m=document.querySelector('.alignment-movable');return m?m.getAttribute('aria-valuetext'):null;})()`);
check("keyboard align solves", joined === "墙段接上了", `aria=${joined}`);
await nextVisible("step3");
await overflow("step3");
await click(".workbench-next");

// 7. step change: look-listen with weathered-site photo
await waitFor(`document.querySelector('[data-step-id="change"]')`, "step change");
await sleep(400);
check("change shows weathered site photo", await evalJs(`Boolean(document.querySelector('.quest-artifact-picture img'))`));
await shot("11-step4");
await click(".look-listen-continue");
await waitFor(`document.querySelector('.workbench-next')`, "change heard");
await sleep(300);
await nextVisible("step4");
await click(".workbench-next");

// 8. step takeaway: reunion
await waitFor(`document.querySelector('[data-step-id="takeaway"]')`, "step takeaway");
await sleep(400);
check("reunion image", await evalJs(`(()=>{const img=document.querySelector('.workbench-art');return img&&img.src.includes('qin-wall-friends-reunion-v1');})()`));
check("takeaway has no quiz cards", await evalJs(`document.querySelectorAll('.bench-choice').length===0`));
await click(".look-listen-continue");
await waitFor(`document.querySelector('.workbench-next')`, "takeaway heard");
await sleep(300);
await shot("12-step5");
await nextVisible("step5");
await click(".workbench-next");

// 9. finish page
await waitFor(`document.querySelector('.quest-finish')`, "finish page");
await sleep(500);
await shot("13-finish");
check("finish navigation buttons", await evalJs(`Boolean(document.querySelector('.finish-navigation-home'))&&Boolean(document.querySelector('.finish-navigation-replay'))`));
await click(".family-extra > summary");
await sleep(400);
await shot("14-family");
await evalJs(`(()=>{const d=document.querySelector('.family-extra');d.open=true;return true;})()`);
const famBox = await evalJs(`(()=>{const m=document.querySelector('.workbench-family .alignment-movable');if(!m)return null;const mr=m.getBoundingClientRect();return JSON.stringify({x:mr.x+mr.width/2,y:mr.y+mr.height/2});})()`).then((r) => (r ? JSON.parse(r) : null));
if (famBox) {
  const track = await evalJs(`(()=>{const t=document.querySelector('.workbench-family .alignment-track');const r=t.getBoundingClientRect();return JSON.stringify({x:r.x,w:r.width});})()`).then(JSON.parse);
  const dx = -0.18 * track.w;
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: famBox.x, y: famBox.y, button: "left", clickCount: 1, pointerType: "mouse" });
  for (let i = 1; i <= 8; i++) await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: famBox.x + (dx * i) / 8, y: famBox.y, button: "left", pointerType: "mouse" });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: famBox.x + dx, y: famBox.y, button: "left", clickCount: 1, pointerType: "mouse" });
  await sleep(400);
}
const famState1 = await evalJs(`(()=>{const m=document.querySelector('.workbench-family .alignment-movable');return m?m.getAttribute('aria-valuetext'):null;})()`);
check("family practice drag moves the segment", famState1 === "墙段还没接上", `after drag: ${famState1}`);
for (let i = 0; i < 6; i++) {
  await evalJs(`(()=>{const el=document.querySelector('.workbench-family .alignment-movable');el.focus();el.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));return true;})()`);
  await sleep(80);
}
const famState2 = await evalJs(`(()=>{const m=document.querySelector('.workbench-family .alignment-movable');return m?m.getAttribute('aria-valuetext'):null;})()`);
check("family practice realigns with arrows", famState2 === "墙段接上了", `after arrows: ${famState2}`);
await click(".finish-navigation-home");
await waitFor(`document.querySelector('.river-path')`, "back home");
await sleep(400);
await shot("15-back-home");
check("home button returns to river", await evalJs(`Boolean(document.querySelector('.river-path'))`));

// 10. desktop pass
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
await click('[data-period-id="qin"]');
await waitFor(`document.querySelector('[data-chapter-id="${CHAPTER}"]')`, "station desktop");
await click(`[data-chapter-id="${CHAPTER}"]`);
await waitFor(`document.querySelector('.quest-start-actions .next-button')`, "cover desktop");
await click('.quest-start-actions .next-button');
await waitFor(`document.querySelector('.quest-artifact-intro')`, "desktop step1");
await sleep(500);
await shot("16-desktop-step1");
await click(`[data-option-id="${optionId("time", 1)}"]`);
await waitFor(`document.querySelector('.workbench-next')`, "desktop step1 solved");
await click(".workbench-next");
await waitFor(`document.querySelector('[data-step-id="beginning"]')`, "desktop step2");
await click(".look-listen-continue");
await waitFor(`document.querySelector('.workbench-next')`, "desktop step2 heard");
await click(".workbench-next");
await waitFor(`document.querySelector('[data-step-id="journey"]')`, "desktop step3");
await sleep(400);
await shot("17-desktop-step3");

check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
writeFileSync("docs/qa/2026-09-14-qin-han-wall/browser-check-cdp.json", JSON.stringify(report, null, 2));
console.log("done", report.checks.filter((c) => c.pass).length + "/" + report.checks.length);
ws.close();
chrome.kill("SIGKILL");
process.exit(report.checks.every((c) => c.pass) ? 0 : 1);
