import { chromium } from 'playwright-core';
import fs from 'node:fs';

const OUT = '/tmp/history-walk';
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'http://127.0.0.1:4173/';
const W = 340, H = 785; // 2026-09-22 实测用户窗口;当前无打开的浏览器窗口可重读

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: W, height: H } });

const issues = [];
const consoleErrors = [];
const failedReqs = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); });
page.on('requestfailed', r => failedReqs.push(`${r.url().split('?')[0]} :: ${r.failure()?.errorText}`));
page.on('response', r => { if (r.status() >= 400) failedReqs.push(`${r.status()} ${r.url().split('?')[0]}`); });

async function shot(name) {
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot:', name);
}
async function layoutCheck(name) {
  const m = await page.evaluate(() => {
    const de = document.documentElement;
    const els = [...document.querySelectorAll('button, h1, h2, .next-button, .workbench-next')];
    const off = els.filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.right > window.innerWidth + 1 || r.left < -1);
    }).map(el => `${el.className?.toString().slice(0, 40)}: "${(el.textContent || '').trim().slice(0, 20)}" right=${Math.round(el.getBoundingClientRect().right)}`);
    const belowFoldPrimary = [...document.querySelectorAll('.next-button.ready, .workbench-next, .finish-navigation button')]
      .filter(el => { const r = el.getBoundingClientRect(); return r.height > 0 && r.top > window.innerHeight; })
      .map(el => `"${(el.textContent || '').trim().slice(0, 24)}" top=${Math.round(el.getBoundingClientRect().top)}`);
    return { scrollW: de.scrollWidth, innerW: window.innerWidth, scrollH: de.scrollHeight, off, belowFoldPrimary };
  });
  const flag = m.scrollW > m.innerW + 1 || m.off.length || m.belowFoldPrimary.length;
  console.log(`layout[${name}] scrollW=${m.scrollW} innerW=${m.innerW} scrollH=${m.scrollH}${flag ? ' ⚠️' : ' ok'}`);
  if (m.scrollW > m.innerW + 1) issues.push(`${name}: 横向溢出 scrollW=${m.scrollW}`);
  if (m.off.length) { issues.push(`${name}: 元素越界 ${m.off.join(' | ')}`); console.log('  ⚠️ 越界:', m.off.join(' | ')); }
  if (m.belowFoldPrimary.length) { issues.push(`${name}: 主按钮首屏外 ${m.belowFoldPrimary.join(' | ')}`); console.log('  ⚠️ 主按钮首屏外:', m.belowFoldPrimary.join(' | ')); }
  return m;
}

async function clickNext() {
  const n = await page.$('.workbench-next');
  if (n) { await n.click(); await page.waitForTimeout(800); return true; }
  console.log('  (no .workbench-next found)');
  return false;
}

// ---------- 1. 主页 ----------
await page.goto(BASE, { waitUntil: 'networkidle' });
await shot('01-home-top');
await layoutCheck('01-home');
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await shot('02-home-bottom');
await page.evaluate(() => window.scrollTo(0, 0));

// ---------- 2. 秦站面板 ----------
await page.click('button[data-period-id="qin"]');
await page.waitForSelector('.station-panel');
await shot('03-station-qin');
await layoutCheck('03-station-qin');

// ---------- 3. 秦统一度量衡：封面 ----------
await page.click('button[data-chapter-id="cn-ancient-04-01-qin-unification"]');
await page.waitForSelector('.quest-cover');
await shot('04-qin-cover');
await layoutCheck('04-qin-cover');

// 家长折叠说明
await page.click('.focus-parent-note summary');
await shot('05-qin-cover-parent');

// ---------- 4. 开始任务,走 5 步 ----------
await page.click('.quest-start-actions .next-button');
await page.waitForSelector('.object-quest');

async function walkStep(stepName, { wrongFirst = true, action = null } = {}) {
  await page.waitForTimeout(700);
  const kind = await page.locator('.object-quest').getAttribute('data-interaction-kind');
  const stepId = await page.locator('.object-quest').getAttribute('data-step-id');
  console.log(`--- ${stepName}: kind=${kind} stepId=${stepId}`);
  await shot(`${stepName}-a-enter`);
  await layoutCheck(`${stepName}`);

  if (action) { await action(); await shot(`${stepName}-b-action`); await layoutCheck(`${stepName}-b`); await clickNext(); return; }

  // 普通选择:先错后对
  const options = await page.$$('button.bench-choice-action');
  if (options.length) {
    if (wrongFirst && options.length > 1) {
      // 找一个错误项
      // 无法从属性判断对错，先点第一个再看点后状态。
      const wrongBtn = options[0];
      await wrongBtn.click();
      await page.waitForTimeout(600);
      const state = await page.locator('.bench-choice').first().getAttribute('class');
      if (state.includes('right')) {
        console.log('  (first option was correct, no wrong-feedback demo)');
      } else {
        console.log('  wrong-pick state:', state);
        await shot(`${stepName}-wrong`);
        // 听提示后再选对
        for (const b of options.slice(1)) { await b.click().catch(()=>{}); await page.waitForTimeout(600); const cls = await page.evaluate(() => { const r = document.querySelector('.bench-choice.right'); return !!r; }); if (cls) break; }
      }
      await shot(`${stepName}-b-correct`);
    } else {
      // 点正确项:逐个尝试直到 .right
      for (const b of options) {
        await b.click().catch(()=>{}); await page.waitForTimeout(600);
        const ok = await page.evaluate(() => !!document.querySelector('.bench-choice.right'));
        if (ok) break;
      }
      await shot(`${stepName}-b-correct`);
    }
    await layoutCheck(`${stepName}-b`);
  }
  await clickNext();
}

// step1 time
await walkStep('06-qin-s1-time');
// step2 beginning
await walkStep('07-qin-s2-beginning');
// step3 journey (tool-pick)
await walkStep('08-qin-s3-journey');
// step4 change (align-rulers):用箭头替代
await walkStep('09-qin-s4-change', {
  action: async () => {
    for (let i = 0; i < 40; i++) {
      const done = await page.evaluate(() => !!document.querySelector('.workbench-next'));
      if (done) { console.log('  aligned after', i, 'nudges'); break; }
      await page.click('button[aria-label="向左移动青尺"]').catch(() => {});
      await page.waitForTimeout(120);
    }
  }
});
// step5 takeaway
await walkStep('10-qin-s5-takeaway');

// 结束页
await page.waitForSelector('.quest-finish', { timeout: 8000 });
await shot('11-qin-finish');
await layoutCheck('11-qin-finish');
// 展开亲子练习
const fam = await page.$('.family-extra summary');
if (fam) { await fam.click(); await shot('12-qin-finish-family'); await layoutCheck('12-qin-finish-family'); }
// 完整回答
const listenFinish = await page.$('.quest-finish-listen');
if (listenFinish) { await listenFinish.click(); await page.waitForTimeout(600); await shot('13-qin-finish-answer'); await layoutCheck('13-qin-finish-answer'); }

// 返回时间河
await page.click('.finish-navigation button >> nth=0');
await page.waitForSelector('.river-screen');
await shot('14-back-river');

// ---------- 5. 长城章(scene-find + 相册) ----------
await page.click('button[data-period-id="qin"]');
await page.waitForSelector('.station-panel');
await page.click('button[data-chapter-id="cn-ancient-04-05-qin-great-wall"]');
await page.waitForSelector('.quest-cover');
await shot('15-wall-cover');
// 封面相册入口
const albumBtn = await page.$('.quest-cover .photo-album-button, .quest-cover [class*="album"]');
if (albumBtn) {
  await albumBtn.click();
  await page.waitForSelector('.image-lightbox');
  await shot('16-wall-album');
  // 翻一张
  const nextPhoto = await page.$('.image-lightbox [aria-label*="下一"], .image-lightbox .album-next');
  if (nextPhoto) { await nextPhoto.click(); await page.waitForTimeout(400); await shot('17-wall-album-2'); }
  await layoutCheck('16-wall-album');
  await page.click('.image-lightbox .lightbox-close, .image-lightbox [aria-label="关闭"]').catch(() => page.keyboard.press('Escape'));
  await page.waitForTimeout(400);
}
await page.click('.quest-start-actions .next-button');
await page.waitForSelector('.object-quest');

// s1 time
await walkStep('18-wall-s1');
// s2 look-listen:直接继续
await page.waitForSelector('.workbench-next.reading-next', { timeout: 8000 });
await shot('19-wall-s2-looklisten');
await layoutCheck('19-wall-s2');
await page.click('.workbench-next.reading-next');
// s3 slide-fit 接墙:用箭头
await page.waitForTimeout(700);
console.log('wall s3 kind=', await page.locator('.object-quest').getAttribute('data-interaction-kind'));
await shot('20-wall-s3-slidefit');
for (let i = 0; i < 40; i++) {
  const done = await page.evaluate(() => !!document.querySelector('.workbench-next'));
  if (done) { console.log('  slide aligned after', i, 'nudges'); break; }
  const btn = await page.$('button[aria-label="向左移动"]') || await page.$('button[aria-label="向右移动"]');
  if (!btn) break;
  await btn.click(); await page.waitForTimeout(120);
}
await shot('21-wall-s3-done');
await layoutCheck('21-wall-s3');
const n1 = await page.$('.workbench-next'); if (n1) await n1.click();
// s4 scene-find 两轮
await page.waitForTimeout(800);
console.log('wall s4 kind=', await page.locator('.object-quest').getAttribute('data-interaction-kind'));
await shot('22-wall-s4-scenefind');
// 点错一个热点
const spots = await page.$$('button.scene-find-target');
console.log('  hotspots:', spots.length);
if (spots.length > 1) { await spots[spots.length - 1].click(); await page.waitForTimeout(500); await shot('23-wall-s4-wrong'); }
// 逐轮点对:尝试所有热点直到本轮 right
for (let round = 0; round < 3; round++) {
  const solved = await page.evaluate(() => !!document.querySelector('.scene-find-actions .workbench-next'));
  if (solved) break;
  for (const s of await page.$$('button.scene-find-target:not([disabled])')) {
    await s.click(); await page.waitForTimeout(500);
    const ok = await page.evaluate(() => !!document.querySelector('.scene-find-target.right'));
    if (ok) break;
  }
  const next = await page.$('.scene-find-actions .workbench-next');
  if (next) { await shot(`24-wall-s4-round${round}-done`); await next.click(); await page.waitForTimeout(700); }
}
await layoutCheck('24-wall-s4');
// s5 pick
await page.waitForTimeout(700);
console.log('wall s5 kind=', await page.locator('.object-quest').getAttribute('data-interaction-kind'));
await shot('25-wall-s5-pick');
for (const b of await page.$$('button.bench-choice-action')) {
  await b.click(); await page.waitForTimeout(600);
  if (await page.evaluate(() => !!document.querySelector('.bench-choice.right'))) break;
}
await shot('26-wall-s5-correct');
const nf = await page.$('.workbench-next'); if (nf) await nf.click();
await page.waitForSelector('.quest-finish', { timeout: 8000 });
await shot('27-wall-finish');
await layoutCheck('27-wall-finish');
await page.click('.finish-navigation button >> nth=0');
await page.waitForSelector('.river-screen');

// ---------- 6. 活字 history-lab 章 ----------
await page.click('button[data-period-id="song"]');
await page.waitForSelector('.station-panel');
await shot('28-station-song');
await page.click('button[data-chapter-id="cn-ancient-07-03-song-inventions"]');
await page.waitForSelector('.quest-cover');
await shot('29-print-cover');
await page.click('.quest-start-actions .next-button');
await page.waitForSelector('.object-quest');
await walkStep('30-print-s1');
// s2 look-listen
await page.waitForSelector('.workbench-next.reading-next', { timeout: 8000 });
await page.click('.workbench-next.reading-next');
await page.waitForTimeout(900);
console.log('print s3 kind=', await page.locator('.object-quest').getAttribute('data-interaction-kind'));
await shot('31-print-s3-lab');
await layoutCheck('31-print-s3');
// history-lab 阶段:尝试点击阶段按钮/推进
for (let i = 0; i < 12; i++) {
  const done = await page.evaluate(() => !!document.querySelector('.workbench-next'));
  if (done) break;
  const labBtn = await page.$('.history-lab button:not([disabled])');
  if (!labBtn) break;
  await labBtn.click().catch(() => {});
  await page.waitForTimeout(900);
  await shot(`31-print-s3-lab-${i}`);
}
const nLab = await page.$('.workbench-next'); if (nLab) await nLab.click();
await page.waitForTimeout(700);
console.log('print s4 kind=', await page.locator('.object-quest').getAttribute('data-interaction-kind'));
await shot('32-print-s4');
for (const b of await page.$$('button.bench-choice-action')) {
  await b.click(); await page.waitForTimeout(600);
  if (await page.evaluate(() => !!document.querySelector('.bench-choice.right'))) break;
}
const n4 = await page.$('.workbench-next'); if (n4) await n4.click();
await page.waitForTimeout(900);
await shot('33-print-s5');
const n5 = await page.$('.workbench-next.reading-next'); if (n5) await n5.click();
await page.waitForSelector('.quest-finish', { timeout: 8000 });
await shot('34-print-finish');
await layoutCheck('34-print-finish');
await page.click('.finish-navigation button >> nth=0');
await page.waitForSelector('.river-screen');

// ---------- 7. 家长入口 ----------
await page.click('.parent-entry');
await page.waitForSelector('.overview-screen, .content-overview, main >> text=家长', { timeout: 8000 }).catch(() => {});
await page.waitForTimeout(800);
await shot('35-parent-overview');
await layoutCheck('35-parent-overview');
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await shot('36-parent-bottom');

// ---------- 8. 恢复进度 ----------
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const resume = await page.$('.resume-story');
console.log('resume button after reload:', !!resume);
await shot('37-home-resume');

// ---------- 汇总 ----------
console.log('\n===== ISSUES =====');
issues.forEach(i => console.log('⚠️', i));
console.log('\n===== CONSOLE ERRORS =====');
consoleErrors.slice(0, 20).forEach(e => console.log('❌', e));
console.log('\n===== FAILED REQUESTS =====');
[...new Set(failedReqs)].slice(0, 30).forEach(e => console.log('🚫', e));

await browser.close();
