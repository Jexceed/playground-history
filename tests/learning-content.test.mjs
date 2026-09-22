import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateLearningMap} from '../scripts/lib/learning-map.mjs';
import {stepVoiceIds,usesChoiceCards} from '../app/step-flow.ts';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const map=read('content/learning-map.json'),focused=read('content/focused-quests.json'),sources=new Set(read('content/sources.json').sources.map(s=>s.id)),terms=new Set(read('content/child-language-glossary.json').terms.map(t=>t.term));
test('learning coverage refuses missing, duplicate and self-linked chapters',()=>{
 assert.equal(validateLearningMap(map,focused,sources,terms),34);
 for(const mutate of [m=>m.chapters.pop(),m=>m.chapters[1]=m.chapters[0],m=>m.chapters[0].related[0].chapterId=m.chapters[0].id,m=>m.chapters[0].sourceIds=['UNKNOWN'],m=>m.chapters[0].glossaryTerms=['未登记词']]){
  const bad=structuredClone(map);mutate(bad);assert.throws(()=>validateLearningMap(bad,focused,sources,terms));
 }
});
test('parent review uses current evidence, curated words and matching choice artwork',()=>{
 const previews=read('public/content/preview-manifest.json').tracks.flatMap(t=>t.chapters);
 for(const authored of focused.chapters){
  const detail=read(`public/content/chapters/${authored.id}.json`);
  const guide=map.chapters.find(c=>c.id===authored.id);
  assert.deepEqual(detail.learningGuide,guide);
  assert.deepEqual(detail.glossary.map(t=>t.term),guide.glossaryTerms);
  assert.deepEqual(previews.find(c=>c.id===authored.id).learningGuide,guide);
  assert.equal(detail.childEntry.object,authored.entry.object);
  assert.equal(detail.childEntry.place,authored.entry.place);
  assert.equal(detail.contentReadiness,'authored-playtest-family-validation-pending');
  for(const [i,s] of detail.gameplay.steps.entries()){
   const expected=authored.steps[i];
   for(const [j,o] of s.options.entries())if(o.objectView?.kind==='scene-card'){
    assert.equal(o.objectView.image,`/content/step-images/${expected.options[j].objectView.assetId}.jpg`);
    assert.deepEqual(o.objectView.crop,expected.options[j].objectView.crop);
   }
  }
 }
 const wall=read('public/content/chapters/cn-ancient-04-05-qin-great-wall.json');
 assert.ok(!wall.glossary.some(t=>t.term==='独立'));
 const math=read('public/content/chapters/cn-ancient-05-04-science-art.json');
 assert.doesNotMatch(math.childEntry.object,/兰亭/);
 assert.ok(!math.pronunciations.some(p=>p.text==='王羲之'));
});
test('decision scenes provide the necessary prior state in the voice children actually hear',()=>{
 const cases=[['cn-ancient-04-01-qin-unification','time',/秦.*共同.*标准/],['cn-ancient-06-02-tang-governance','change',/621年.*713年/],['cn-ancient-07-06-su-shi-moon','journey',/婵娟指明月/],['cn-ancient-07-05-yuan-exchange','change',/凭证已经核对.*马也备好/],['cn-ancient-08-07-journey-west-print','change',/图文已经印好/]];
 for(const [id,stepId,meaning] of cases){
  const step=read(`public/content/chapters/${id}.json`).gameplay.steps.find(s=>s.id===stepId);
  const played=stepVoiceIds(step).map(id=>Object.values(step.audio).find(v=>v.id===id)?.text).join('');
  assert.match(played,meaning);
 }
});
test('station introductions preserve overlaps and separate the Qing preview boundary from its end',()=>{
 const full=read('public/content/manifest.json');
 for(const track of full.tracks)for(const c of track.chapters){
  const detail=read(`public/content/chapters/${c.id}.json`);
  assert.equal(c.contentReadiness,detail.contentReadiness);
  if(!map.chapters.some(m=>m.id===c.id)){assert.equal(detail.contentReadiness,'legacy-draft-not-in-preview');continue;}
  const context=track.periods.find(p=>p.id===c.periodId).learningContext;
  assert.equal(c.gameplay.presentation.story.stationAudio.text,context.childIntro);
  assert.ok(context.sources.length);
 }
 const periods=full.tracks.find(t=>t.id==='china-ancient').periods;
 assert.match(periods.find(p=>p.id==='five-dynasties-ten-kingdoms').learningContext.chronology,/978/);
 assert.match(periods.find(p=>p.id==='qing').learningContext.chronology,/1636.*1644.*1912/);
 assert.match(periods.find(p=>p.id==='qing').stationYears,/本站/);
});

test('parent and child share the distinction between answer cards and operation checkpoints',()=>{
 for(const kind of ['align-rulers','slide-fit','circle-refine','history-lab','scene-find','look-listen'])assert.equal(usesChoiceCards(kind),false);
 for(const kind of ['timeline','ruler-pairs','tool-pick','pick'])assert.equal(usesChoiceCards(kind),true);
});

test('project worksheet rules remain available but are not counted as historical facts',()=>{
 const full=read('public/content/manifest.json');let facts=0,methods=0;
 for(const c of full.tracks.flatMap(t=>t.chapters)){const d=read(`public/content/chapters/${c.id}.json`);facts+=d.facts.length;methods+=d.methodNotes.length;}
 assert.equal(full.totals.facts,facts);assert.equal(full.totals.methodNotes,methods);assert.equal(methods,74);
 const money=read('public/content/chapters/cross-02-money-history.json');
 assert.ok(!money.facts.some(f=>f.text.includes('七格')));
 assert.ok(money.methodNotes.some(n=>n.text.includes('七格')&&n.text.includes('成人')));
 const fire=read('public/content/chapters/cn-ancient-07-08-song-gunpowder-records.json');
 assert.equal(fire.methodNotes.length,1);
});

test('active material explanations keep production notes out of the parent reading layer',()=>{
 const chapters=read('public/content/preview-manifest.json').tracks.flatMap(t=>t.chapters);
 for(const c of chapters){
  const d=read(`public/content/chapters/${c.id}.json`),g=d.gameplay;
  const used=new Set([...g.steps.map(s=>s.assetId),...g.evidence.map(a=>a.id),...g.narrativeAssets.map(a=>a.id),g.coverAsset?.id,g.sceneAsset?.id].filter(Boolean));
  for(const asset of d.assets.filter(a=>used.has(a.id)))assert.doesNotMatch(asset.boundary,/提示词|像素|docs\/qa\/|reference-assets\//,asset.id);
  for(const photo of g.photoAlbum?.photos??[])assert.doesNotMatch(photo.boundary,/提示词|像素|docs\/qa\/|reference-assets\//,photo.assetId);
 }
});
