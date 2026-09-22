import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {alignedRuler,clampRulerOffset,pointerRulerOffset} from '../app/workbench-model.ts';

test('pointer displacement maps proportionally to the ruler model',()=>{
  for(const width of [260,360,700]){
    assert.equal(alignedRuler(pointerRulerOffset(18,-width*.18,width)),true);
    assert.equal(alignedRuler(pointerRulerOffset(18,-width*.05,width)),false);
  }
  assert.equal(clampRulerOffset(-100),-24);assert.equal(clampRulerOffset(100),24);
  assert.equal(alignedRuler(2),true);assert.equal(alignedRuler(3),false);
});

test('the Qin measurement task keeps its real artifact and ruler workbench',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../public/content/preview-manifest.json',import.meta.url)));
  const chapters=manifest.tracks.flatMap(t=>t.chapters);
  const enabled=chapters.filter(c=>c.gameplay.presentation);
  assert.deepEqual(enabled.filter(c=>/^cn-ancient-0[45]-/.test(c.id)).map(c=>c.id).sort(),['cn-ancient-04-01-qin-unification','cn-ancient-04-02-han-governance','cn-ancient-04-03-silk-road','cn-ancient-04-04-han-knowledge','cn-ancient-04-05-qin-great-wall','cn-ancient-05-01-division-migration','cn-ancient-05-02-jiangnan-development','cn-ancient-05-03-ethnic-interaction','cn-ancient-05-04-science-art','cn-ancient-05-05-dunhuang-story']);
  const game=enabled.find(c=>c.id==='cn-ancient-04-01-qin-unification').gameplay;
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
  assert.equal(source.chapters.filter(c=>/^cn-ancient-0[45]-/.test(c.id)&&c.presentation?.story).length,10);
});

test('the Great Wall task connects wall-joining, finding guards and choosing a lookout plan',()=>{
  const source=JSON.parse(readFileSync(new URL('../content/focused-quests.json',import.meta.url)));
  const manifest=JSON.parse(readFileSync(new URL('../public/content/preview-manifest.json',import.meta.url)));
  const chapter=manifest.tracks.flatMap(t=>t.chapters).find(c=>c.id==='cn-ancient-04-05-qin-great-wall');
  const game=chapter.gameplay;
  assert.deepEqual(game.steps.map(s=>s.narrative.scene),['artifact','workshop','workshop','detail','reunion']);
  assert.deepEqual(game.steps.map(s=>s.interaction.kind),['timeline','look-listen','slide-fit','scene-find','pick']);
  assert.deepEqual(game.steps.map(s=>s.options.length),[2,0,2,0,2]);
  assert.equal(game.steps[2].interaction.scene,'wall-join');
  assert.ok(game.steps[2].interaction.ariaLabel);
  assert.ok(game.steps[1].interaction.continueLabel);
  assert.ok(game.steps[1].audio.intro.text.includes('长城长'));
  assert.ok(game.steps[1].story.displayText.length < game.steps[1].audio.intro.text.length);
  assert.ok(chapter.textbookConnection?.featured?.title?.includes('神州谣'));
  assert.ok(!game.steps[0].story.displayText.includes('临洮'));
  assert.ok(game.finish.parent.includes('临洮')&&game.finish.parent.includes('辽东'));
  assert.equal(game.steps[3].assetId,'qin-wall-guard-story-v1');
  assert.match(game.coverAudio.text,/抵御外敌/);
  assert.match(game.steps[0].audio.lead.text,/抵御外来进攻/);
  assert.match(game.steps[1].audio.intro.text,/抵御来自北方的进攻/);
  for(const functionWord of ['关口','守卫','传递消息'])assert.ok(game.steps[3].audio.intro.text.includes(functionWord));
  assert.deepEqual(game.steps[3].interaction.rounds.map(r=>r.targetId),['lookout','gate']);
  for(const round of game.steps[3].interaction.rounds){assert.ok(game.steps[3].interaction.hotspots.some(spot=>spot.id===round.targetId));assert.equal(round.question,round.audio.question.text);assert.notEqual(round.audio.right.id,round.audio.wrong.id);}
  assert.ok(game.steps[4].options.every(option=>option.objectView.kind==='scene-card'));
  assert.notEqual(game.steps[4].options[0].objectView.image,game.steps[4].options[1].objectView.image);
  assert.ok(game.narrativeAssets.some(asset=>asset.id==='qin-wall-teamwork-story-v1'));
  assert.match(game.finish.introAudio.text,/抵御外来的进攻/);
  assert.equal(game.steps[0].inspection.id,'qin-han-jinshanling-panorama');
  assert.ok(game.steps[0].inspection.title.includes('明代'));
  assert.ok(game.steps[0].inspection.sourceLinks.some(link=>link.url.startsWith('https://whc.unesco.org/')));
  assert.equal(game.steps[3].inspection.id,'qin-han-jinshanling-tower-detail');
  assert.equal(game.steps[3].inspection.openAlbum,true);
  const yumen=game.photoAlbum.photos.find(photo=>photo.assetId==='qin-han-yumen-pass');
  assert.match(yumen.period,/汉代.*秦之后/);
  assert.match(yumen.audio.text,/汉代.*比秦朝晚/);
  assert.equal(game.steps[4].inspection.placement,'supporting');
  assert.ok(!game.steps.map(s=>s.story.narration).join('').includes('来抢东西'));
  assert.equal(game.steps[2].interaction.placement,'panel');
  assert.equal(game.presentation.practice.scene,'wall-join');
  assert.notEqual(game.presentation.story.reunionImage,game.presentation.sceneImage);
  for(const step of game.steps){
    assert.ok(step.narrative.caption&&step.narrative.speaker&&step.narrative.response&&step.narrative.retry);
    assert.equal(step.audio.question.text,step.prompt);
    assert.ok(step.audio.lead.text.length<=48);
    assert.ok(step.audio.right.text.length<=32);
    assert.ok(step.audio.right.text.includes(step.narrative.response));
  }
  const authored=source.chapters.find(c=>c.id==='cn-ancient-04-05-qin-great-wall');
  assert.ok(authored.steps.every(s=>s.sourceIds.length>0));
});

test('Han travel and paper chapters connect their own historical evidence and actions',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../public/content/preview-manifest.json',import.meta.url)));
  const all=manifest.tracks.flatMap(t=>t.chapters);
  const silk=all.find(c=>c.id==='cn-ancient-04-03-silk-road').gameplay;
  const paper=all.find(c=>c.id==='cn-ancient-04-04-han-knowledge').gameplay;
  assert.match(silk.steps[1].audio.intro.text,/联合大月氏.*没结成联盟.*见闻/);
  assert.match(silk.steps[0].inspection.audio.text,/首次出使之后/);
  assert.ok(!silk.steps.some(s=>s.audio.intro.text.includes('要从这里')));
  assert.equal(silk.steps[3].inspection.id,'qin-han-xuanquan-seal-tag');
  assert.match(silk.steps[3].inspection.audio.text,/封缄和标记文书/);
  assert.deepEqual(silk.steps[3].interaction.rounds.map(r=>r.targetId),['food','clerk']);
  assert.match(silk.steps[4].prompt,/回信/);
  assert.match(paper.steps[0].inspection.audio.text,/蔡伦以前已经有纸/);
  assert.match(paper.steps[1].audio.intro.text,/树皮.*破布.*旧渔网/);
  assert.deepEqual(paper.steps[2].interaction.rounds.map(r=>r.targetId),['bark','net']);
  assert.match(paper.steps[3].prompt,/同样多的话/);
  assert.match(paper.finish.introAudio.text,/西汉已有纸.*蔡伦改进/);
  for(const game of [silk,paper]){
    assert.equal(game.photoAlbum.photos.length,2);
    assert.equal(game.presentation.familyMode,'actions');
    assert.ok(!game.presentation.practice);
    for(const step of game.steps){
      assert.ok(step.audio.lead.text.length<=48);
      assert.ok(step.audio.right.text.length<=32);
      if(step.interaction.kind==='pick'){
        assert.equal(step.interaction.selectionFraming,'detail');
        assert.ok(step.options.every(o=>o.objectView.kind==='scene-card'));
        assert.notDeepEqual(step.options[0].objectView,step.options[1].objectView);
      }
      for(const round of step.interaction.rounds??[]){assert.equal(round.audio.question.text,round.question);assert.notEqual(round.audio.right.id,round.audio.wrong.id);}
    }
    assert.ok(game.steps.slice(2).filter(s=>s.interaction.kind!=='look-listen').length>=2);
  }
});

test('Han minting joins a dated policy, real evidence and distinct tool decisions',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../public/content/preview-manifest.json',import.meta.url)));
  const game=manifest.tracks.flatMap(t=>t.chapters).find(c=>c.id==='cn-ancient-04-02-han-governance').gameplay;
  assert.deepEqual(game.steps.map(s=>s.interaction.kind),['timeline','look-listen','slide-fit','scene-find','pick']);
  assert.match(game.steps[0].options.find(o=>o.correct).label,/汉武帝.*113/);
  assert.ok(!game.steps[0].options.some(o=>o.label.includes('202')));
  assert.match(game.coverAudio.text,/朝廷统一管/);
  assert.match(game.steps[1].audio.intro.text,/汉书/);
  assert.match(game.steps[1].audio.intro.text,/轻重不一/);
  assert.ok(game.steps[1].sourceIds.includes('HANSHU-SHIHUO-MINTING'));
  assert.equal(game.steps[2].interaction.scene,'coin-mould');
  assert.match(game.steps[2].interaction.modelLabel,/学习图/);
  assert.deepEqual(game.steps[3].interaction.rounds.map(r=>r.targetId),['mould','balance']);
  for(const r of game.steps[3].interaction.rounds){
    assert.equal(r.question,r.audio.question.text);
    assert.notEqual(r.audio.right.id,r.audio.wrong.id);
  }
  assert.equal(game.photoAlbum.photos.length,2);
  assert.deepEqual(game.photoAlbum.photos.map(p=>p.assetId),['qin-han-haihun-wuzhu','han-wuzhu-stone-mould']);
  assert.ok(game.photoAlbum.photos.every(p=>p.period.includes('西汉')&&p.sourceLinks.length));
  assert.ok(game.steps[4].options.every(o=>o.objectView.kind==='scene-card'));
  assert.notEqual(game.steps[4].options[0].objectView.image,game.steps[4].options[1].objectView.image);
  assert.match(game.steps[4].options.find(o=>o.correct).label,/核对轻重/);
  assert.match(game.steps[4].wrongNote,/不能检查轻重/);
  assert.match(game.finish.introAudio.text,/朝廷统一管.*共同规格/);
  assert.equal(game.presentation.practice.scene,'coin-mould');
});
