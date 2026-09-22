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
  assert.ok(['era','ruler-pair','ruler','weight','prop','scene-card','circle-model','polity-panel','printing-panel'].includes(option.objectView.kind),`Unsupported option object: ${option.objectView.kind}`);
  if(option.objectView.kind==='scene-card'){assert.ok(fs.existsSync(`public${option.objectView.image}`));return 'story-bitmap';}
  return 'workbench-illustration';
 }
 if(!option.image)return 'symbol-or-text';
 return /\.svg(?:\?|$)/i.test(option.image)?'vector-illustration':'bitmap-image';
};
for(const chapter of chapters){
 const detail=read(`public/content/chapters/${chapter.id}.json`),game=detail.gameplay;
 assert.deepEqual(chapter.gameplay,game);assert.deepEqual(game.steps.map(s=>s.id),['time','beginning','journey','change','takeaway']);
 if(game.photoAlbum){
  const photos=game.photoAlbum.photos;assert.ok(photos.length>=2);assert.equal(new Set(photos.map(p=>p.assetId)).size,photos.length);
  for(const photo of photos){
   const asset=registered.get(photo.assetId);assert.ok(asset?.clearance?.startsWith('cleared-'));assert.notEqual(asset.childVisibility,'editor-only');
   assert.ok(photo.period&&photo.observation&&photo.caption);assert.ok([...photo.observation].length<=90);
   assert.ok(fs.existsSync(`public${photo.image}`),`Missing album photo ${photo.image}`);checkVoice(photo.audio);
   assert.ok(photo.sourceIds.length);photo.sourceIds.forEach(id=>assert.ok(sources.has(id)));
   assert.ok(photo.sourceLinks.length);assert.ok(game.evidence.some(e=>e.id===photo.assetId),`Album photo not packaged: ${photo.assetId}`);
  }
 }
 assert.equal(game.hook.label,detail.childEntry.childTitle);
 [game.coverAudio,game.finishAudio,...(game.textbookAudio?[game.textbookAudio]:[])].forEach(checkVoice);
 for(const step of game.steps){
  const lookListen=step.interaction?.kind==='look-listen',sceneFind=step.interaction?.kind==='scene-find';
  if(lookListen||sceneFind||step.interaction?.kind==='history-lab')assert.equal(step.options.length,0,`${chapter.id}/${step.id}: scene/reading steps do not use option cards`);
  else assert.equal(step.options.filter(o=>o.correct).length,1);
  if(step.options.length)assert.equal(new Set(step.options.map(optionMedium)).size,1,`${chapter.id}/${step.id}: mixed choice media; use a consistent presentation and keep evidence photos in inspection`);
  const asset=registered.get(step.assetId);assert.ok(asset?.clearance?.startsWith('cleared-'));assert.notEqual(asset.childVisibility,'editor-only');
  assert.ok(fs.existsSync(`public${step.image}`),`Missing main image ${step.image}`);
  Object.values(step.audio).forEach(checkVoice);step.options.forEach(o=>checkVoice(o.audio));
  if(step.interaction?.kind==='history-lab'){for(const s of step.interaction.lab.stages){checkVoice(s.audio);assert.equal(s.audio.text,s.narration);}}
  if(step.interaction?.kind==='circle-refine'){assert.deepEqual(step.interaction.refinements.map(r=>r.sides),[12,24]);for(const r of step.interaction.refinements){checkVoice(r.audio);assert.equal(r.audio.text,r.narration);}}
  if(sceneFind){
   const {hotspots,rounds}=step.interaction;assert.ok(hotspots.length>=2&&rounds.length>0);assert.equal(new Set(rounds.map(r=>r.id)).size,rounds.length);
   for(const round of rounds){assert.ok(hotspots.some(s=>s.id===round.targetId));Object.values(round.audio).forEach(checkVoice);assert.equal(round.audio.question.text,round.question);assert.equal(round.audio.right.text,round.feedback);assert.equal(round.audio.wrong.text,round.retry);}
  }
  assert.ok([...step.story.displayText].length<=90);
 }
 if(!scope.has(chapter.id)){assert.equal(game.mode,'memory-hook-story-quest-v3');continue;}
 const authored=originalById.get(chapter.id);assert.equal(game.mode,'authored-picture-quest-v4');
 assert.equal(game.finish.actions.length,2);assert.ok(game.finish.parent.length>15);
 [game.finish.introAudio,...game.finish.actionAudio].forEach(checkVoice);
 const visualIds=new Set();
 for(const [i,step] of game.steps.entries()){
  assert.equal(step.prompt,authored.steps[i].question);assert.equal(step.story.narration,authored.steps[i].story);
  assert.ok(!/哪一件证物能先打开|从.*出发，先找哪个年代|哪句话同时说清了原因和结果/.test(step.prompt));
  assert.ok(step.sourceIds.length);step.sourceIds.forEach(id=>assert.ok(sources.has(id)));
  assert.ok(fs.existsSync(`public${step.studyImage}`));visualIds.add(step.studyImage);
  if(['look-listen','scene-find','history-lab'].includes(step.interaction?.kind))continue;
  assert.equal(step.options.length,2);
  assert.notEqual(step.options[0].image,step.options[1].image,`${chapter.id}/${step.id} identical visual choices`);
  for(const o of step.options){assert.ok(o.imageAlt);assert.ok(fs.existsSync(`public${o.image}`));assert.ok(!/只是故事地点|只是故事人物|只说了原因|只说了结果/.test(o.label));}
 }
 assert.ok(visualIds.size>=4,`${chapter.id}: insufficient advancing scene content`);
 assert.ok(/\d|世纪|北宋|唐代|明代|北魏|战国/.test(game.steps[0].story.narration+game.steps[0].options.map(o=>o.label).join("")), chapter.id);
 report.push({id:chapter.id,title:authored.title,steps:5,distinctStudyScenes:visualIds.size,optionPictures:game.steps.reduce((n,s)=>n+s.options.length,0),readingSteps:game.steps.filter(s=>s.interaction?.kind==='look-listen').length,sceneQuestions:game.steps.reduce((n,s)=>n+(s.interaction?.kind==='scene-find'?s.interaction.rounds.length:0),0),endingActions:game.finish.actions.length,sourceIds:[...new Set(game.steps.flatMap(s=>s.sourceIds))],result:'structural-pass',humanChildTest:'pending'});
}
fs.mkdirSync('docs/qa/2026-09-13',{recursive:true});
fs.writeFileSync('docs/qa/2026-09-13/structure-audit.json',JSON.stringify({libraryChapters:103,visibleChapters:34,hiddenChapters:69,focusedSteps:170,status:'automated-structure-only',chapters:report},null,2)+'\n');
console.log(`结构审计：完整库103章/515步；本轮34章/170步，${report.reduce((n,c)=>n+c.optionPictures,0)}张选项图、${report.reduce((n,c)=>n+c.readingSteps,0)}个阅读步骤、${report.reduce((n,c)=>n+c.sceneQuestions,0)}个图中提问、${report.reduce((n,c)=>n+c.endingActions,0)}条结束动作。真实儿童审核仍待进行。`);
