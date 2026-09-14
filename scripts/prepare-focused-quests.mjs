import fs from 'node:fs';
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
 if(chapter.steps.length!==5||chapter.finish.actions.length!==2)throw new Error(`${chapter.id}: needs 5 steps and 2 concrete ending actions`);
 for(const [i,step] of chapter.steps.entries()){
  if([...step.story].length>90||[...step.question].length>28)throw new Error(`${chapter.id}/${i}: child text too long`);
  if(step.options.length!==2||step.options.filter(o=>o.correct).length!==1)throw new Error(`${chapter.id}/${i}: invalid options`);
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
 if(chapter.id.endsWith('li-bai-jingyesi')) entry.culture='唐代古诗《静夜思》';
 if(chapter.id.endsWith('su-shi-moon')) entry.culture='宋词《水调歌头》';
 const beats=paths.chapters.find(c=>c.id===chapter.id);
 beats.beats=chapter.steps.slice(1,4).map((s,i)=>({title:s.title,text:['先，','接着，','最后，'][i]+s.story}));
 const bridge=textbook.chapters.find(c=>c.id===chapter.id);
 bridge.featured.title=chapter.anchor;
 bridge.featured.childBridge=chapter.hook;
 bridge.featured.evidenceBoundary=chapter.boundary.split('。')[0]+'。';
 bridge.sourceIds=[...new Set([...bridge.sourceIds,...chapter.sourceIds])];
}
write('content/child-entry-points.json',entries);write('content/quest-story-paths.json',paths);write('content/textbook-connections.json',textbook);
console.log(`逐题学习图：${seen.size} 个；34章儿童入口与连续故事同步。`);
