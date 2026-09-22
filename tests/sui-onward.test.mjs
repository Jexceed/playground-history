import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';

test('Sui transport links its purpose, dated evidence, distinct work and labour costs',()=>{
  const manifest=JSON.parse(readFileSync('public/content/preview-manifest.json'));
  const game=manifest.tracks.flatMap(t=>t.chapters).find(c=>c.id==='cn-ancient-06-01-sui-unification-canal').gameplay;
  assert.deepEqual(game.steps.map(s=>s.id),['time','beginning','journey','change','takeaway']);
  assert.deepEqual(game.steps.map(s=>s.interaction.kind),['timeline','look-listen','scene-find','pick','look-listen']);
  assert.match(game.steps[0].audio.lead.text,/隋朝.*运粮/);
  assert.match(game.steps[1].audio.intro.text,/589.*统一.*南方.*粮食.*洛阳.*605.*新旧水道/);
  assert.match(game.steps[4].audio.intro.text,/百姓负担很重/);
  assert.match(game.finish.introAudio.text,/连接新旧水道.*南北.*劳役.*负担/);
  const [canal,granary]=game.photoAlbum.photos;
  assert.match(canal.period,/2006/);
  assert.match(canal.boundary,/具体货物.*未核实/);
  assert.match(granary.boundary,/绿篱.*不是.*窖口/);
  assert.equal(granary.boundary.split('可见现代园区道路').length,2);
  assert.match(game.boundary,/废弃不晚于初唐/);
  const roundTargets=game.steps[2].interaction.rounds.map(r=>r.targetId);
  assert.equal(new Set(roundTargets).size,2);
  const [right,wrong]=game.steps[3].options;
  assert.ok(right.correct&&!wrong.correct);
  assert.equal(right.objectView.assetId,wrong.objectView.assetId);
  assert.notDeepEqual(right.objectView.crop,wrong.objectView.crop);
  assert.match(right.label,/清理.*泥沙/);
  assert.match(wrong.label,/粮袋/);
  assert.equal(game.presentation.familyMode,'actions');
});

test('Kaiyuan uses a real two-sided coin and distinguishes the money name from the later era',()=>{
  const all=JSON.parse(readFileSync('public/content/preview-manifest.json')).tracks.flatMap(t=>t.chapters);
  const game=all.find(c=>c.id==='cn-ancient-06-02-tang-governance').gameplay;
  assert.deepEqual(game.steps.map(s=>s.interaction.kind),['timeline','look-listen','scene-find','timeline','look-listen']);
  assert.match(game.steps[0].audio.lead.text,/唐朝初年/);
  assert.match(game.steps[0].inspection.caption,/实物正反面/);
  assert.equal(game.steps[2].interaction.imageLabel,'实物照片');
  assert.equal(game.steps[2].assetId,'tang-kaiyuan-gary-todd-cc0');
  assert.equal(game.steps[2].interaction.rounds[0].targetId,'obverse');
  assert.match(game.steps[2].audio.intro.text,/同一枚钱.*正面.*背面/);
  assert.deepEqual(game.steps[3].options.map(o=>o.objectView.date),['621年','713年']);
  assert.deepEqual(game.steps[3].options.map(o=>o.objectView.marker),['coin','calendar']);
  assert.match(game.steps[4].audio.intro.text,/一类钱的开始.*不是每一枚钱/);
  assert.match(game.boundary,/私人收藏/);
  assert.ok(game.steps[3].sourceIds.includes('DPM-KAIYUAN-ERA'));
  assert.equal(game.presentation.familyMode,'actions');
});

test('Zhenguan connects a later book witness to governance, listening and real work',()=>{
  const game=JSON.parse(readFileSync('public/content/preview-manifest.json')).tracks.flatMap(t=>t.chapters).find(c=>c.id==='cn-ancient-06-08-zhenguan-governance').gameplay;
  assert.deepEqual(game.steps.map(s=>s.interaction.kind),['timeline','look-listen','scene-find','pick','pick']);
  assert.match(game.steps[0].inspection.caption,/后世刊本.*不是唐太宗手稿/);
  assert.match(game.steps[0].inspection.boundary,/1476.*1465/);
  assert.match(game.steps[0].audio.lead.text,/后来才印.*唐朝贞观/);
  assert.match(game.steps[1].audio.intro.text,/唐初.*恢复.*唐太宗.*魏征.*负担/);
  assert.equal(game.steps[2].interaction.rounds.length,2);
  assert.deepEqual(game.steps[2].interaction.rounds.map(r=>r.targetId),['speaker','farmer']);
  assert.match(game.steps[3].options.find(o=>o.correct).label,/听农人/);
  assert.match(game.steps[4].options.find(o=>o.correct).label,/动手耕作/);
  assert.match(game.finish.introAudio.text,/共同作用/);
  assert.match(game.boundary,/教学虚构.*魏征亲访/);
  assert.notEqual(game.presentation.sceneImage,game.presentation.story.reunionImage);
});
