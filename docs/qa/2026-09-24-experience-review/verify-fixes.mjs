import { chromium } from 'playwright-core';
import {readPrimaryActions, primaryActionFailures} from '../../../scripts/lib/viewport-audit.mjs';

const D = 'docs/qa/2026-09-24-experience-review/shots';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 340, height: 785 } });
const bad = [];
page.on('response', r => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().replace('http://127.0.0.1:4173', '')}`); });

const report = [];
function log(name, ok, detail = '') { const line = `${ok ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`; report.push(line); console.log(line); if (!ok) process.exitCode = 1; }

async function choiceUntilRight(p) {
  for (const b of await p.$$('button.bench-choice-action:not([disabled])')) {
    await b.click(); await p.waitForTimeout(400);
    const failures = primaryActionFailures(await p.evaluate(readPrimaryActions));
    if (failures.length) throw new Error(failures.join(' | '));
    if (await p.evaluate(() => !!document.querySelector('.bench-choice.right'))) return;
  }
}
async function advance(p) {
  const failures = primaryActionFailures(await p.evaluate(readPrimaryActions), {required:true});
  if (failures.length) throw new Error(failures.join(' | '));
  await p.click('.workbench-next'); await p.waitForTimeout(750);
}

// ===== 1. 秦章:s1 朝代卡新布局、s2/s4/s5 徽标 =====
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
await shotHome();
async function shotHome() {
  // 首页 H2 断行检查
  const h2 = await page.evaluate(() => {
    const el = document.querySelector('.river-map-heading h2');
    const span = el.querySelector('.keep-together');
    const er = el.getBoundingClientRect(), sr = span.getBoundingClientRect();
    return { h: Math.round(er.height), spanTop: Math.round(sr.top - er.top), lines: er.height / 32 };
  });
  await page.evaluate(() => document.querySelector('.river-map-heading')?.scrollIntoView());
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${D}/fix-home-h2.png`, clip: await page.locator('.river-map-heading').boundingBox() });
  log('首页H2整体换行', h2.spanTop > 20, `span下移${h2.spanTop}px(“谁在河边等你？”为一整行)`);
}

await page.click('button[data-period-id="qin"]');
// 站点面板头部
await page.waitForSelector('.station-panel');
const ph = await page.evaluate(() => {
  const y = document.querySelector('.panel-years'); const l = document.querySelector('.panel-line');
  if (!y || !l) return null;
  const yr = y.getBoundingClientRect(), lr = l.getBoundingClientRect();
  return { sameLine: Math.abs(yr.top - lr.top) < 5, yearsText: y.textContent, lineText: l.textContent };
});
log('站点面板年份/线索分两行', ph && !ph.sameLine, ph ? `${ph.yearsText} ⏎ ${ph.lineText}` : '元素缺失');
await page.screenshot({ path: `${D}/fix-panel-head.png`, clip: await page.locator('.panel-head').boundingBox() });

await page.click('button[data-chapter-id="cn-ancient-04-01-qin-unification"]');
await page.click('.quest-start-actions .next-button');
await page.waitForSelector('.object-quest');
await page.waitForTimeout(500);

// s1 era 卡:声音按钮在卡片外右下,文字与按钮无重叠
async function eraCheck(tag, p = page) {
  const r = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('.bench-choice').forEach(ch => {
      const sound = ch.querySelector('.bench-option-sound');
      const strong = ch.querySelector('.era-object strong');
      if (!sound || !strong) return;
      const s = sound.getBoundingClientRect();
      const range = document.createRange(); range.selectNodeContents(strong);
      const tr = range.getBoundingClientRect();
      const date = ch.querySelector('.era-object span');
      const dr = date ? date.getBoundingClientRect() : null;
      out.push({
        name: strong.textContent.trim(),
        glyphOverlap: !(tr.right < s.left || tr.left > s.right || tr.bottom < s.top || tr.top > s.bottom),
        dateOverlap: dr ? !(dr.right < s.left || dr.left > s.right || dr.bottom < s.top || dr.top > s.bottom) : false,
        btnBelowCard: s.top >= ch.querySelector('.bench-choice-action').getBoundingClientRect().bottom - 1,
      });
    });
    return out;
  });
  const ok = r.length > 0 && r.every(x => !x.glyphOverlap && !x.dateOverlap && x.btnBelowCard);
  log(`${tag} 朝代卡声音按钮不压字`, ok, JSON.stringify(r));
  return ok;
}
await eraCheck('秦s1(340px)');
await page.screenshot({ path: `${D}/fix-era-cards-s1.png`, clip: await page.locator('.workbench-choices').boundingBox() });

// 步骤整体:下一步按钮/主操作仍在视口内
async function viewportCheck(tag) {
  const r = await page.evaluate(() => {
    const de = document.documentElement;
    return { overflowX: de.scrollWidth > window.innerWidth + 1 };
  });
  log(`${tag} 无横向溢出`, !r.overflowX);
  const failures = primaryActionFailures(await page.evaluate(readPrimaryActions));
  log(`${tag} 主按钮完整可见`, !failures.length, failures.join(' | '));
  return r;
}

// badge 多点覆盖检查
async function badgeCheck(tag) {
  const r = await page.evaluate(() => {
    const badge = document.querySelector('.object-quest .scene-find-label, .object-quest .story-art-label');
    if (!badge) return null;
    const rc = badge.getBoundingClientRect();
    if (rc.width === 0) return { hidden: true };
    const pts = [0.1, 0.3, 0.5, 0.7, 0.9].map(fx => badge.contains(document.elementFromPoint(rc.left + rc.width * fx, rc.top + rc.height / 2)));
    return { rect: [Math.round(rc.left), Math.round(rc.top)], allVisible: pts.every(Boolean), pts };
  });
  log(`${tag} 身份标签完整可见`, r?.allVisible === true, JSON.stringify(r));
  return r;
}

// 走完秦章,逐步检查
await choiceUntilRight(page); await advance(page);
console.log('on step:', await page.locator('.object-quest').getAttribute('data-step-id'));
await badgeCheck('秦s2(ruler-pairs)');
await page.screenshot({ path: `${D}/fix-badge-s2.png`, clip: await page.locator('.workbench-scene').first().boundingBox() });
await choiceUntilRight(page); await advance(page);
await choiceUntilRight(page); await advance(page); // s3 tool-pick
console.log('on step:', await page.locator('.object-quest').getAttribute('data-step-id'));
// s4 align-rulers:起点与对齐两态都查徽标
await badgeCheck('秦s4(align初始)');
for (let i = 0; i < 40; i++) { if (await page.$('.workbench-next')) break; await page.click('button[aria-label="向左移动青尺"]').catch(() => {}); await page.waitForTimeout(100); }
await badgeCheck('秦s4(align对齐后)');
await advance(page);
console.log('on step:', await page.locator('.object-quest').getAttribute('data-step-id'));
await badgeCheck('秦s5(ruler-pairs)');
await page.screenshot({ path: `${D}/fix-badge-s5.png`, clip: await page.locator('.workbench-scene').first().boundingBox() });

// ===== 2. 开元通宝 s4 长名朝代卡(340px) =====
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
await page.click('button[data-period-id="tang"]');
await page.click('button[data-chapter-id="cn-ancient-06-02-tang-governance"]');
await page.click('.quest-start-actions .next-button');
await page.waitForSelector('.object-quest');
for (let g = 0; g < 100; g++) {
  const stepId = await page.locator('.object-quest').getAttribute('data-step-id').catch(() => null);
  const kind = await page.locator('.object-quest').getAttribute('data-interaction-kind').catch(() => null);
  if (kind === 'timeline' && stepId === 'change') break;
  if (await page.$('button.scene-find-target:not([disabled])')) {
    for (const s of await page.$$('button.scene-find-target:not([disabled])')) { await s.click().catch(() => {}); await page.waitForTimeout(350); if (await page.evaluate(() => !!document.querySelector('.scene-find-target.right'))) break; }
    continue;
  }
  if (await page.$('.scene-find-actions .workbench-next')) { await page.click('.scene-find-actions .workbench-next'); await page.waitForTimeout(600); continue; }
  await choiceUntilRight(page);
  if (await page.$('.workbench-next')) { await advance(page); continue; }
  await page.waitForTimeout(300);
}
await eraCheck('开元s4(340px)');
await viewportCheck('开元s4');
await page.screenshot({ path: `${D}/fix-kaiyuan-s4.png` });

// ===== 3. 李白找图步徽标 =====
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
await page.click('button[data-period-id="tang"]');
await page.click('button[data-chapter-id="cn-ancient-06-07-li-bai-jingyesi"]');
await page.click('.quest-start-actions .next-button');
await page.waitForSelector('.object-quest');
for (let g = 0; g < 100; g++) {
  const kind = await page.locator('.object-quest').getAttribute('data-interaction-kind').catch(() => null);
  if (kind === 'scene-find') break;
  await choiceUntilRight(page);
  if (await page.$('.workbench-next')) { await advance(page); continue; }
  await page.waitForTimeout(300);
}
await badgeCheck('李白s3(scene-find)');
await page.screenshot({ path: `${D}/fix-badge-libai.png`, clip: await page.locator('.workbench-scene').first().boundingBox() });

// ===== 4. 太和殿实物照片找图(标签 bottom-right + z-index) =====
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
await page.click('button[data-period-id="ming"]');
await page.click('button[data-chapter-id="cn-ancient-08-06-forbidden-city-roof-beasts"]');
await page.click('.quest-start-actions .next-button');
await page.waitForSelector('.object-quest');
for (let g = 0; g < 100; g++) {
  const kind = await page.locator('.object-quest').getAttribute('data-interaction-kind').catch(() => null);
  if (kind === 'scene-find') break;
  await choiceUntilRight(page);
  if (await page.$('.workbench-next')) { await advance(page); continue; }
  await page.waitForTimeout(300);
}
await badgeCheck('太和殿s3(实物照片)');
await page.screenshot({ path: `${D}/fix-badge-photo.png`, clip: await page.locator('.workbench-scene').first().boundingBox() });

// ===== 5. 1280×720 复验开元 s4 =====
const w = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await w.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
await w.click('button[data-period-id="tang"]');
await w.click('button[data-chapter-id="cn-ancient-06-02-tang-governance"]');
await w.click('.quest-start-actions .next-button');
await w.waitForSelector('.object-quest');
for (let g = 0; g < 100; g++) {
  const stepId = await w.locator('.object-quest').getAttribute('data-step-id').catch(() => null);
  const kind = await w.locator('.object-quest').getAttribute('data-interaction-kind').catch(() => null);
  if (kind === 'timeline' && stepId === 'change') break;
  if (await w.$('button.scene-find-target:not([disabled])')) {
    for (const s of await w.$$('button.scene-find-target:not([disabled])')) { await s.click().catch(() => {}); await w.waitForTimeout(350); if (await w.evaluate(() => !!document.querySelector('.scene-find-target.right'))) break; }
    continue;
  }
  if (await w.$('.scene-find-actions .workbench-next')) { await w.click('.scene-find-actions .workbench-next'); await w.waitForTimeout(600); continue; }
  for (const b of await w.$$('button.bench-choice-action:not([disabled])')) { await b.click().catch(() => {}); await w.waitForTimeout(400); if (await w.evaluate(() => !!document.querySelector('.bench-choice.right'))) break; }
  if (await w.$('.workbench-next')) { await w.click('.workbench-next'); await w.waitForTimeout(700); continue; }
  await w.waitForTimeout(300);
}
await eraCheck('开元s4(1280px)', w);
await w.screenshot({ path: `${D}/fix-kaiyuan-wide.png`, clip: await w.locator('.workbench-choices').boundingBox() });
await w.close();

// ===== 6. favicon =====
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
const linkHrefs = await page.evaluate(() => [...document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')].map(l => l.getAttribute('href')));
console.log('icon links:', linkHrefs.join(' | '));
const fav = [];
for (const h of linkHrefs) { const r = await fetch(h); fav.push(`${r.status} ${h}`); }
{ const r = await fetch('http://127.0.0.1:4173/favicon.ico'); fav.push(`${r.status} /favicon.ico(直接)`); }
log('favicon 全部 200 且指向本机', fav.length > 0 && fav.every(f => f.startsWith('200') && !f.includes('chatgpt.site')), fav.join(' | '));

// ===== 7. 秦 s1 与工具题页整页截图回归 =====
console.log('\n===== 验证报告 =====');
report.forEach(r => console.log(r));
console.log('\n坏响应:', bad.length ? [...new Set(bad)].join('; ') : '无');
if (bad.length) process.exitCode = 1;
await browser.close();
