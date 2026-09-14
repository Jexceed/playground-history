import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {alignedRuler,clampRulerOffset,pointerRulerOffset} from '../app/workbench-model.ts';

test('the same proportional drag aligns the ruler on phone and desktop boards',()=>{
  for(const width of [260,360,700]){
    assert.equal(alignedRuler(pointerRulerOffset(18,-width*.18,width)),true);
    assert.equal(alignedRuler(pointerRulerOffset(18,-width*.05,width)),false);
  }
  assert.equal(clampRulerOffset(-100),-24);assert.equal(clampRulerOffset(100),24);
  assert.equal(alignedRuler(2),true);assert.equal(alignedRuler(3),false);
});

test('only the Qin measurement task enables the new workbench and keeps its real artifact',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../public/content/preview-manifest.json',import.meta.url)));
  const chapters=manifest.tracks.flatMap(t=>t.chapters);
  const enabled=chapters.filter(c=>c.gameplay.presentation);
  assert.equal(enabled.length,1);assert.equal(enabled[0].id,'cn-ancient-04-01-qin-unification');
  const game=enabled[0].gameplay;
  assert.equal(game.coverAsset.id,'qin-han-qin-standard-weight');
  assert.equal(game.evidence[0].id,'qin-han-qin-standard-weight');
  assert.equal(game.steps[3].interaction.kind,'align-rulers');
  assert.notEqual(game.steps[3].rightNote,game.steps[3].wrongNote);
  assert.ok(game.steps[3].audio.wrong.text.includes(game.steps[3].wrongNote));
  assert.equal(game.steps[3].options.filter(o=>o.correct).length,1);
  assert.ok(!game.coverImage.includes('study-scenes'));
  assert.equal(game.steps[0].assetId,'qin-han-qin-standard-weight');
  assert.equal(game.steps[0].inspection.image,game.evidence[0].image);
  assert.ok(game.steps[0].inspection.sourceLinks.some(link=>link.url.startsWith('https://www.chnmus.net/')));
  const source=JSON.parse(readFileSync(new URL('../public/audio/voice-lines.json',import.meta.url))).lines;
  for(const voice of [game.presentation.evidenceAudio,game.presentation.guideAudio])assert.ok(source.some(line=>line.id===voice.id&&line.text===voice.text));
});


test('the Qin story has departure, discovery and reunion without dropping the artifact',()=>{
  const source=JSON.parse(readFileSync(new URL('../content/focused-quests.json',import.meta.url)));
  const manifest=JSON.parse(readFileSync(new URL('../public/content/preview-manifest.json',import.meta.url)));
  const chapter=manifest.tracks.flatMap(t=>t.chapters).find(c=>c.id==='cn-ancient-04-01-qin-unification');
  const game=chapter.gameplay;
  assert.deepEqual(game.steps.map(s=>s.narrative.scene),['artifact','workshop','workshop','workshop','reunion']);
  assert.ok(!JSON.stringify(game.presentation).includes('homepage-history-travel-river'));
  assert.ok(game.coverAudio.text.startsWith('秦统一度量衡'));
  assert.notEqual(game.presentation.story.reunionImage,game.presentation.sceneImage);
  for(const step of game.steps){
    assert.ok(step.narrative.caption&&step.narrative.speaker&&step.narrative.response&&step.narrative.retry);
    assert.equal(step.audio.question.text,step.prompt);
    assert.ok(step.audio.lead.text.length<=45);
    assert.ok(step.audio.right.text.length<=30);
    assert.ok(step.audio.wrong.text.length<=30);
    assert.ok(step.audio.right.text.includes(step.narrative.response));
    assert.ok(step.audio.wrong.text.includes(step.narrative.retry));
  }
  assert.ok(game.coverAudio.text.includes('旅行团'));
  assert.deepEqual(game.finish.introAudio,game.presentation.story.closingAudio);
  assert.equal(game.evidence[0].id,'qin-han-qin-standard-weight');
  assert.equal(source.chapters.filter(c=>c.presentation?.story).length,1);
});
