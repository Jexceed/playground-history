import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,existsSync} from 'node:fs';
import {polygonPoints,radialGap,CIRCLE_STAGES} from '../app/circle-geometry.ts';
import {canContinueStep} from '../app/step-flow.ts';

test('circle refinement holds its radius while increasing vertices and reducing the gap',()=>{
  assert.deepEqual([...CIRCLE_STAGES],[6,12,24]);
  let previous=Infinity;
  for(const sides of CIRCLE_STAGES){
    const points=polygonPoints(sides).split(' ').map(p=>p.split(',').map(Number));
    assert.equal(points.length,sides);
    for(const [x,y] of points)assert.ok(Math.abs(Math.hypot(x-60,y-60)-42)<.000002);
    const gap=radialGap(sides);assert.ok(gap>0&&gap<previous);previous=gap;
  }
  assert.throws(()=>polygonPoints(2),RangeError);
  assert.equal(canContinueStep({interaction:{kind:'circle-refine'}},false),false);
  assert.equal(canContinueStep({interaction:{kind:'circle-refine'}},true),true);
});

test('five new chapters keep real evidence, distinctive history and the shared five steps',()=>{
  const m=JSON.parse(readFileSync('public/content/preview-manifest.json'));
  const chapters=m.tracks.flatMap(t=>t.chapters).filter(c=>c.id.startsWith('cn-ancient-05'));
  assert.equal(chapters.length,5);
  for(const c of chapters){
    const g=c.gameplay;
    assert.deepEqual(g.steps.map(s=>s.id),['time','beginning','journey','change','takeaway']);
    assert.ok(g.steps[0].inspection?.sourceLinks.length>=2);
    assert.ok(existsSync('public'+g.steps[0].inspection.image));
    assert.ok(!g.steps[0].inspection.title.includes('故事插画'));
    assert.ok(g.presentation.story&&g.presentation.sceneImage!==g.presentation.story.reunionImage);
    assert.equal(g.finish.actions.length,2);
    for(const step of g.steps){
      assert.equal(step.audio.question.text,step.prompt);
      assert.ok(step.audio.lead.text.length<=48);
      if(step.interaction.kind==='scene-find')for(const r of step.interaction.rounds)assert.equal(r.question,r.audio.question.text);
    }
  }
  const [migration,jiangnan,wei,math,deer]=chapters.map(c=>c.gameplay);
  assert.match(migration.steps[1].audio.intro.text,/同时存在.*短暂统一.*并立/);
  assert.match(migration.steps[1].audio.intro.text,/分批.*当地原有/);
  assert.match(jiangnan.coverAudio.text,/人做哪些事/);
  assert.match(jiangnan.steps[1].audio.intro.text,/劳动力.*修渠种田.*选料制瓷/);
  assert.match(wei.steps[1].audio.intro.text,/加强统治.*语言|加强统治.*汉语/);
  assert.match(wei.finish.introAudio.text,/长期.*互相影响/);
  assert.equal(math.steps[2].interaction.kind,'circle-refine');
  assert.deepEqual(math.steps[2].interaction.refinements.map(s=>s.sides),[12,24]);
  assert.match(math.steps[0].inspection.caption,/1936/);
  assert.match(math.steps[0].inspection.boundary,/不是.*手稿/);
  assert.equal(math.presentation.practice.scene,'circle-refine');
  assert.ok(math.steps[3].options.every(o=>o.objectView.kind==='circle-model'));
  assert.deepEqual(math.steps[3].options.map(o=>o.objectView.sides).sort((a,b)=>a-b),[6,24]);
  assert.match(deer.steps[0].inspection.caption,/原壁画局部/);
  assert.match(deer.steps[3].audio.intro.text,/两头.*中间/);
  assert.match(deer.steps[4].options.find(o=>o.correct).label,/告诉国王/);
});
