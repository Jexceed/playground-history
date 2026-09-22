import fs from 'node:fs';
import {LAB_STAGE_COUNTS} from '../app/history-lab-model.ts';
import {renderVisual, visualId} from './lib/study-visuals.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,d)=>fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');
const focused=read('content/focused-quests.json');
const sources=new Set(read('content/sources.json').sources.map(s=>s.id));
const scope=read('content/preview-scope.json');
if(focused.chapters.length!==34||new Set(focused.chapters.map(c=>c.id)).size!==34||scope.chapterIds.some(id=>!focused.chapters.some(c=>c.id===id)))throw new Error('Focused scope must match 34 authored chapters');
const registry={schemaVersion:1,scope:'秦至清逐题自制学习图；由 focused-quests.json 生成',generatedFrom:'content/focused-quests.json',assets:[]};
const seen=new Map();
fs.mkdirSync('reference-assets/focused-quests',{recursive:true});
fs.mkdirSync('public/content/study-scenes',{recursive:true});
for(const chapter of focused.chapters){
 if(chapter.presentation?.story?.reunionFit&&!['contain','cover'].includes(chapter.presentation.story.reunionFit))throw new Error(`${chapter.id}: invalid reunion fit`);
 if(chapter.steps.length!==5||chapter.finish.actions.length!==2)throw new Error(`${chapter.id}: needs 5 steps and 2 concrete ending actions`);
 for(const [i,step] of chapter.steps.entries()){
  if([...step.story].length>90||[...step.question].length>28)throw new Error(`${chapter.id}/${i}: child text too long`);
  if(step.options.length!==2||step.options.filter(o=>o.correct).length!==1){
   if(!(['look-listen','scene-find','history-lab'].includes(step.interaction?.kind)&&step.options.length===0))throw new Error(`${chapter.id}/${i}: invalid options`);
  }
  if(step.interaction?.kind==='history-lab'){
   const lab=step.interaction.lab;
   if(!lab||!Object.hasOwn(LAB_STAGE_COUNTS,lab.kind)||lab.stages?.length!==LAB_STAGE_COUNTS[lab.kind]||lab.stages.some(s=>!s.label||!s.narration||s.narration.length>60))throw new Error(`${chapter.id}/${i}: invalid history lab`);
  }
  if(step.interaction?.kind==='circle-refine'){
   const stages=step.interaction.refinements??[];
   if(JSON.stringify(stages.map(r=>r.sides))!=='[12,24]'||stages.some(r=>typeof r.narration!=='string'||!r.narration||r.narration.length>45))throw new Error(`${chapter.id}/${i}: invalid circle refinement`);
  }
  for(const option of step.options)if(option.objectView?.kind==='polity-panel'&&![0,1].includes(option.objectView.windowIndex))throw new Error('Invalid polity window');
  for(const option of step.options)if(option.objectView?.marker&&!['coin','calendar'].includes(option.objectView.marker))throw new Error(`${chapter.id}/${i}: unknown time marker`);
  if(step.interaction?.imageLabel&&!['实物照片','文物图像','故事插画'].includes(step.interaction.imageLabel))throw new Error(`${chapter.id}/${i}: unknown scene image label`);
  for(const option of step.options)if(option.objectView?.kind==='circle-model'&&(![6,12,24].includes(option.objectView.sides)||option.visual.kind!=='circle-study'||option.visual.sides!==option.objectView.sides))throw new Error(`${chapter.id}/${i}: inconsistent circle drawing`);
  if(step.interaction?.sceneAspectRatio!==undefined&&(!Number.isFinite(step.interaction.sceneAspectRatio)||step.interaction.sceneAspectRatio<.5||step.interaction.sceneAspectRatio>4))throw new Error(`${chapter.id}/${i}: invalid scene aspect ratio`);
  if(step.interaction?.imageCrop){
   const c=step.interaction.imageCrop;
   if(step.interaction.kind!=='scene-find'||!step.visualAssetId||!['x','y','width','height','sourceWidth','sourceHeight'].every(k=>Number.isFinite(c[k]))||c.x<0||c.y<0||c.width<=0||c.height<=0||c.x+c.width>c.sourceWidth||c.y+c.height>c.sourceHeight||Math.abs(c.width/c.height-step.interaction.sceneAspectRatio)>.001)throw new Error(`${chapter.id}/${i}: invalid scene image crop or aspect ratio`);
  }
  if(step.inspection?.displayHeight!==undefined&&(!Number.isFinite(step.inspection.displayHeight)||step.inspection.displayHeight<120||step.inspection.displayHeight>400))throw new Error(`${chapter.id}/${i}: invalid evidence display height`);
  if(step.interaction?.kind==='scene-find'){
   const {hotspots=[],rounds=[]}=step.interaction,targets=new Set(hotspots.map(spot=>spot.id));
   if(hotspots.length<2||targets.size!==hotspots.length||!rounds.length||new Set(rounds.map(round=>round.id)).size!==rounds.length)throw new Error(`${chapter.id}/${i}: invalid scene-find structure`);
   for(const spot of hotspots)if(!spot.label||!['x','y','width','height'].every(key=>Number.isFinite(spot[key]))||spot.x<0||spot.y<0||spot.width<=0||spot.height<=0||spot.x+spot.width>1||spot.y+spot.height>1)throw new Error(`${chapter.id}/${i}: invalid scene hotspot`);
   for(const round of rounds)if(!targets.has(round.targetId)||![round.question,round.feedback,round.retry].every(text=>typeof text==='string'&&text.length>0&&text.length<=32))throw new Error(`${chapter.id}/${i}: invalid scene question`);
  }
  for(const id of step.sourceIds)if(!sources.has(id))throw new Error(`Missing source ${id}`);
  for(const [object,compact] of [[step,false],...step.options.map(o=>[o,true])]){
   const id=visualId(object.visual,compact);let asset=seen.get(id);
   if(!asset){
    const localPath=`reference-assets/focused-quests/${id}.svg`;
    asset={id,title:`学习示意：${object.visual.items.map(x=>x.label).join('、')}`,localPath,sourceFile:'content/focused-quests.json',author:'小小历史旅行团项目自制',license:'项目自制，供本项目使用',licensePath:'reference-assets/focused-quests/ATTRIBUTION.md',clearance:'cleared-project-created',factSourceIds:[],chapterIds:[],caption:object.visual.items.map(x=>x.label).join(' → '),notes:'自制学习示意，用于比较关系、动作或顺序；不是历史现场、古代原稿或精确疆界图。',childVisibility:'child-ok'};
    const svg=renderVisual(object.visual,compact);fs.writeFileSync(localPath,svg);fs.writeFileSync(`public/content/study-scenes/${id}.svg`,svg);seen.set(id,asset);
   }
   asset.chapterIds=[...new Set([...asset.chapterIds,chapter.id])];asset.factSourceIds=[...new Set([...asset.factSourceIds,...step.sourceIds])];
  }
 }
}
// Only this generator owns these directories; remove obsolete generated scene variants.
for(const dir of ['reference-assets/focused-quests','public/content/study-scenes']){
 for(const file of fs.readdirSync(dir))if(/^study-[a-f0-9]{16}\.svg$/.test(file)&&!seen.has(file.slice(0,-4)))fs.unlinkSync(`${dir}/${file}`);
}
registry.assets=[...seen.values()];write('content/assets/focused-quests-assets.json',registry);
fs.writeFileSync('reference-assets/focused-quests/ATTRIBUTION.md',`# 秦至清逐题学习图\n\n由本项目自行绘制的SVG几何示意。内容描述来自 content/focused-quests.json；绘图实现为 scripts/lib/study-visuals.mjs，运行 scripts/prepare-focused-quests.mjs 可重建。\n\n作者：小小历史旅行团项目。使用范围：供本项目本机试玩与后续产品开发使用，未另行授予公共开放许可。没有将外部图片描摹或拼入本批图形。\n\n这些图用来表示形状、动作、先后和协作，不是历史现场复原；人物不声称肖像相似，政权图不绘制真实疆界。原始文物照片仍沿用各自正式登记与署名。\n`);
// These two source indexes are kept in sync with the authored playable mainline.
const entries=read('content/child-entry-points.json'),paths=read('content/quest-story-paths.json'),textbook=read('content/textbook-connections.json');
for(const chapter of focused.chapters){
 const entry=entries.chapters.find(c=>c.id===chapter.id);
 Object.assign(entry,{childTitle:chapter.title,prompt:chapter.hook,takeaway:chapter.outcome,care:chapter.boundary,people:chapter.anchor.split('与'),playableSource:'content/focused-quests.json'});
 if(chapter.coverAssetId)entry.preferredAssetId=chapter.coverAssetId;
 if(chapter.id.endsWith('li-bai-jingyesi')) entry.culture='唐代古诗《静夜思》';
 if(chapter.id.endsWith('su-shi-moon')) entry.culture='宋词《水调歌头》';
 if(chapter.id.endsWith('qin-great-wall')) entry.culture='二年级课文《神州谣》';
 const beats=paths.chapters.find(c=>c.id===chapter.id);
 beats.beats=chapter.steps.slice(1,4).map((s,i)=>({title:s.title,text:['先，','接着，','最后，'][i]+(s.beat??s.story)}));
 const bridge=textbook.chapters.find(c=>c.id===chapter.id);
 bridge.featured.title=chapter.anchor;
 bridge.featured.childBridge=chapter.hook;
 bridge.featured.evidenceBoundary=chapter.boundary.split('。')[0]+'。';
 if(chapter.id.endsWith('qin-great-wall')) Object.assign(bridge.featured,{type:'课文',icon:'📖',title:'《神州谣》（二年级下册识字课文）',childBridge:'课文写“长城长，珠峰耸”。长长的墙为什么要修？去看看它怎样与守卫的人一起守卫边地。',evidenceBoundary:'《神州谣》是识字课文，帮助感受长城；抵御进攻的用途、秦墙文献与遗址年代分别核对，课文不提供军事、施工或测绘记录。'});
 bridge.sourceIds=[...new Set([...bridge.sourceIds,...chapter.sourceIds])];
}
write('content/child-entry-points.json',entries);write('content/quest-story-paths.json',paths);write('content/textbook-connections.json',textbook);
console.log(`逐题学习图：${seen.size} 个；34章儿童入口与连续故事同步。`);
