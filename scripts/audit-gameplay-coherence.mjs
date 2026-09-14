import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const manifest=read('public/content/manifest.json'),preview=read('public/content/preview-manifest.json'),focused=read('content/focused-quests.json');
const chapters=manifest.tracks.flatMap(t=>t.chapters),scope=new Set(preview.scope.chapterIds);
const voices=new Map(read('public/audio/voice-lines.json').lines.map(l=>[l.id,l.text]));
const registered=new Map(fs.readdirSync('content/assets').filter(n=>n.endsWith('.json')).flatMap(n=>read(`content/assets/${n}`).assets.map(a=>[a.id,a])));
const sources=new Set(read('content/sources.json').sources.map(s=>s.id));
const originalById=new Map(focused.chapters.map(c=>[c.id,c]));
assert.equal(chapters.length,103);assert.equal(preview.tracks.flatMap(t=>t.chapters).length,34);assert.equal(scope.size,34);
const report=[];
const checkVoice=v=>{assert.equal(voices.get(v.id),v.text,`Missing or stale voice ${v.id}`);assert.ok([...v.text.matchAll(/\p{Script=Han}/gu)].length<=90,`Long voice ${v.id}`);};
// A format mismatch must not become an unintended clue to the correct answer.
const optionMedium=(option)=>{
 if(option.objectView){
  assert.ok(['era','ruler-pair','ruler','weight'].includes(option.objectView.kind),`Unsupported option object: ${option.objectView.kind}`);
  return 'workbench-illustration';
 }
 if(!option.image)return 'symbol-or-text';
 return /\.svg(?:\?|$)/i.test(option.image)?'vector-illustration':'bitmap-image';
};
for(const chapter of chapters){
 const detail=read(`public/content/chapters/${chapter.id}.json`),game=detail.gameplay;
 assert.deepEqual(chapter.gameplay,game);assert.deepEqual(game.steps.map(s=>s.id),['time','beginning','journey','change','takeaway']);
 assert.equal(game.hook.label,detail.childEntry.childTitle);
 [game.coverAudio,game.finishAudio,...(game.textbookAudio?[game.textbookAudio]:[])].forEach(checkVoice);
 for(const step of game.steps){
  assert.equal(step.options.filter(o=>o.correct).length,1);
  assert.equal(new Set(step.options.map(optionMedium)).size,1,`${chapter.id}/${step.id}: mixed choice media; use a consistent presentation and keep evidence photos in inspection`);
  const asset=registered.get(step.assetId);assert.ok(asset?.clearance?.startsWith('cleared-'));assert.notEqual(asset.childVisibility,'editor-only');
  assert.ok(fs.existsSync(`public${step.image}`),`Missing main image ${step.image}`);
  Object.values(step.audio).forEach(checkVoice);step.options.forEach(o=>checkVoice(o.audio));
  assert.ok([...step.story.displayText].length<=90);
 }
 if(!scope.has(chapter.id)){assert.equal(game.mode,'memory-hook-story-quest-v3');continue;}
 const authored=originalById.get(chapter.id);assert.equal(game.mode,'authored-picture-quest-v4');
 assert.equal(game.finish.actions.length,2);assert.ok(game.finish.parent.length>15);
 [game.finish.introAudio,...game.finish.actionAudio].forEach(checkVoice);
 const visualIds=new Set();
 for(const [i,step] of game.steps.entries()){
  assert.equal(step.options.length,2);assert.equal(step.prompt,authored.steps[i].question);assert.equal(step.story.narration,authored.steps[i].story);
  assert.ok(!/哪一件证物能先打开|从.*出发，先找哪个年代|哪句话同时说清了原因和结果/.test(step.prompt));
  assert.ok(step.sourceIds.length);step.sourceIds.forEach(id=>assert.ok(sources.has(id)));
  assert.ok(fs.existsSync(`public${step.studyImage}`));visualIds.add(step.studyImage);
  assert.notEqual(step.options[0].image,step.options[1].image,`${chapter.id}/${step.id} identical visual choices`);
  for(const o of step.options){assert.ok(o.imageAlt);assert.ok(fs.existsSync(`public${o.image}`));assert.ok(!/只是故事地点|只是故事人物|只说了原因|只说了结果/.test(o.label));}
 }
 assert.ok(visualIds.size>=4,`${chapter.id}: insufficient advancing scene content`);
 assert.ok(/\d|世纪|北宋|唐代|明代|北魏|战国/.test(game.steps[0].story.narration+game.steps[0].options.map(o=>o.label).join("")), chapter.id);
 report.push({id:chapter.id,title:authored.title,steps:5,distinctStudyScenes:visualIds.size,optionPictures:10,endingActions:2,sourceIds:[...new Set(game.steps.flatMap(s=>s.sourceIds))],result:'structural-pass',humanChildTest:'pending'});
}
fs.mkdirSync('docs/qa/2026-09-13',{recursive:true});
fs.writeFileSync('docs/qa/2026-09-13/structure-audit.json',JSON.stringify({libraryChapters:103,visibleChapters:34,hiddenChapters:69,focusedSteps:170,status:'automated-structure-only',chapters:report},null,2)+'\n');
console.log('结构审计：完整库103章/515步；本轮34章/170步，340张选项图、68条结束动作。真实儿童审核仍待进行。');
