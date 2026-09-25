import { chromium } from 'playwright-core';
import fs from 'node:fs';

const OUT = 'docs/qa/2026-09-24-experience-review/shots';
const report = [];
const bad = [];
const consoleErrs = [];

const STATION = {
  '04-01-qin-unification':'qin','04-05-qin-great-wall':'qin',
  '04-02-han-governance':'han','04-03-silk-road':'han','04-04-han-knowledge':'han',
  '05-01-division-migration':'three-kingdoms-jin-northern-southern','05-02-jiangnan-development':'three-kingdoms-jin-northern-southern','05-03-ethnic-interaction':'three-kingdoms-jin-northern-southern','05-04-science-art':'three-kingdoms-jin-northern-southern','05-05-dunhuang-story':'three-kingdoms-jin-northern-southern',
  '06-01-sui-unification-canal':'sui','06-02-tang-governance':'tang','06-08-zhenguan-governance':'tang','06-03-tang-changan':'tang','06-04-tang-cultural-exchange':'tang','06-06-yan-zhenqing-draft':'tang','06-07-li-bai-jingyesi':'tang','06-05-tang-decline':'five-dynasties-ten-kingdoms',
  '07-01-parallel-regimes':'song','07-02-song-economy-cities':'song','07-03-song-inventions':'song','07-07-song-compass-navigation':'song','07-08-song-gunpowder-records':'song','07-06-su-shi-moon':'song','07-04-yuan-unification':'yuan','07-05-yuan-exchange':'yuan',
  '08-01-ming-governance':'ming','08-02-zheng-he':'ming','08-04-economy-knowledge-culture':'ming','08-06-forbidden-city-roof-beasts':'ming','08-07-journey-west-print':'ming','08-08-xu-xiake-notebook':'ming','08-03-frontiers-unity':'qing','08-05-late-crisis':'qing',
};
const chapters = Object.keys(STATION);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 340, height: 785 } });
page.on('response', r => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().replace('http://127.0.0.1:4173','')}`); });
page.on('console', m => { if (m.type()==='error' && !m.text().includes('favicon')) consoleErrs.push(m.text().slice(0,150)); });

async function stepChecks(tag) {
  const r = await page.evaluate(() => {
    const out = {};
    const de = document.documentElement;
    out.overflowX = de.scrollWidth > window.innerWidth + 1;
    out.brokenImgs = [...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0).map(i => (i.getAttribute('src')||'').slice(-60));
    const badge = document.querySelector('.story-art-label');
    if (badge) {
      const b = badge.getBoundingClientRect();
      if (b.width > 0 && b.height > 0) {  // 折叠details里的不可见标签跳过
        const covered = [0.1, 0.3, 0.5, 0.7, 0.9].some(fx => !badge.contains(document.elementFromPoint(b.left + b.width * fx, b.top + b.height / 2)));
        out.badgeCovered = covered;
      }
    }
    const next = document.querySelector('.workbench-next');
    out.nextTop = next ? Math.round(next.getBoundingClientRect().top) : null;
    return out;
  });
  const flags = [];
  if (r.overflowX) flags.push('横向溢出');
  if (r.brokenImgs?.length) flags.push(`坏图:${r.brokenImgs.join(',')}`);
  if (r.badgeCovered) flags.push(`身份标签被遮挡(遮挡者:${r.badgeCoverer})`);
  if (flags.length) {
    report.push(`⚠️ ${tag}: ${flags.join(' | ')}`);
    await page.screenshot({ path: `${OUT}/flag-${tag}.png` });
  }
  return r;
}

async function playChapter(tag) {
  // 全局循环:直到结束页;data-step-id 变化才算前进一步
  const seen = [];
  let lastKey = '';
  for (let guard = 0; guard < 200; guard++) {
    if (await page.$('.quest-finish')) return seen;
    const stepId = await page.locator('.object-quest').getAttribute('data-step-id').catch(() => null);
    if (!stepId) { await page.waitForTimeout(500); continue; }
    const kind = await page.locator('.object-quest').getAttribute('data-interaction-kind');
    const roundId = await page.locator('.object-quest').getAttribute('data-round-id');
    const key = `${stepId}/${kind}/${roundId ?? ''}`;
    if (key !== lastKey) {
      seen.push(key);
      lastKey = key;
      await page.waitForTimeout(500);
      await stepChecks(`${tag}-${stepId}${roundId ? '-' + roundId : ''}`);
    }
    // scene-find 轮内推进优先(它的 .workbench-next 可能是“再找一位”)
    if (await page.$('button.scene-find-target:not([disabled])')) {
      for (const s of await page.$$('button.scene-find-target:not([disabled])')) {
        await s.click().catch(() => {}); await page.waitForTimeout(400);
        if (await page.evaluate(() => !!document.querySelector('.scene-find-target.right'))) break;
      }
      await page.waitForTimeout(300);
      continue;
    }
    if (await page.$('.scene-find-actions .workbench-next')) { await page.click('.scene-find-actions .workbench-next'); await page.waitForTimeout(700); continue; }
    if (await page.$('button.bench-choice-action:not([disabled])')) {
      for (const b of await page.$$('button.bench-choice-action:not([disabled])')) {
        await b.click().catch(() => {}); await page.waitForTimeout(450);
        if (await page.evaluate(() => !!document.querySelector('.bench-choice.right'))) break;
      }
      await page.waitForTimeout(300);
      continue;
    }
    const arrow = await page.$('.alignment-controls button:not([disabled])');
    if (arrow) { await arrow.click().catch(() => {}); await page.waitForTimeout(120); continue; }
    const labBtn = await page.$('.history-lab button:not([disabled]), [class*="circle"] button:not([disabled])');
    if (labBtn) { await labBtn.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(2500); continue; }
    if (await page.$('.workbench-next')) { await page.click('.workbench-next'); await page.waitForTimeout(700); continue; }
    const anyBtn = await page.$('.object-quest button:not([disabled])');
    if (anyBtn) { await anyBtn.click().catch(() => {}); await page.waitForTimeout(500); continue; }
    await page.waitForTimeout(400);
  }
  report.push(`❌ ${tag}: 200次动作内未到达结束页`);
  await page.screenshot({ path: `${OUT}/stuck-${tag}.png` });
  return seen;
}

await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });

for (const shortId of chapters) {
  const id = `cn-ancient-${shortId}`;
  try {
    await page.click('.app-header .brand').catch(()=>{});
    await page.waitForTimeout(400);
    // 若停在面板或任务页,回到主页
    if (await page.$('.station-panel')) { await page.click('.panel-close').catch(()=>{}); await page.waitForTimeout(300); }
    if (await page.$('.quest-cover, .object-quest, .quest-finish')) { await page.click('.back-link').catch(()=>{}); await page.waitForTimeout(500); }
    if (await page.$('.station-panel')) { await page.click('.panel-close').catch(()=>{}); await page.waitForTimeout(300); }
    await page.click(`button[data-period-id="${STATION[shortId]}"]`);
    await page.waitForSelector('.station-panel');
    await page.click(`button[data-chapter-id="${id}"]`);
    await page.waitForSelector('.quest-cover');
    await page.click('.quest-start-actions .next-button');
    await page.waitForSelector('.object-quest');
    const steps = await playChapter(shortId);
    const finished = await page.waitForSelector('.quest-finish', { timeout: 6000 }).then(()=>true).catch(()=>false);
    if (!finished) { report.push(`❌ ${shortId}: 未到达结束页`); await page.screenshot({ path: `${OUT}/stuck-${shortId}-finish.png` }); }
    else {
      await stepChecks(`${shortId}-finish`);
      // 结束页必须有返回与重玩
      const nav = await page.evaluate(() => [...document.querySelectorAll('.finish-navigation button')].map(b => b.textContent.trim()));
      if (nav.length < 2) report.push(`⚠️ ${shortId}-finish: FinishNavigation按钮=${nav.length}`);
    }
    console.log(`${shortId}: ${steps.join(' > ')} ${finished ? '✓finish' : '✗'}`);
  } catch (e) {
    report.push(`❌ ${shortId}: ${e.message.split('\n')[0]}`);
    await page.screenshot({ path: `${OUT}/err-${shortId}.png` }).catch(()=>{});
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' }).catch(()=>{});
  }
}

console.log('\n===== 逐章报告 =====');
report.forEach(r => console.log(r));
console.log('\n===== 坏响应 =====');
[...new Set(bad)].forEach(r => console.log(r));
console.log('\n===== 控制台错误(除favicon) =====');
[...new Set(consoleErrs)].forEach(r => console.log(r));
console.log('\nDONE');
await browser.close();
