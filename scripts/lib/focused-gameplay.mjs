import {visualId} from './study-visuals.mjs';
const ids=['time','beginning','journey','change','takeaway'];
const kinds=['time-location','evidence-observation','action-sequence','cause-effect','apply-and-explain'];
const icons=['🕰️','🔎','🧭','✨','🗣️'];
const url=(scene,small=false)=>`/content/study-scenes/${visualId(scene,small)}.svg`;
export function selectFocusedCover(focused,assets){
 const asset=assets.find(a=>a.id===focused.coverAssetId),display=focused.coverDisplay;
 if(!asset||asset.childVisibility==='editor-only'||!asset.clearance?.startsWith('cleared-')||asset.clearance==='cleared-project-created'||!asset.sourcePage||!asset.license||!(/\.(jpe?g|png|tif)$/i.test(asset.localPath??'')))throw new Error(`Chapter cover needs registered historical material: ${focused.id}`);
 if(!display?.label?.trim()||display.label.length>32||!['contain','cover'].includes(display.fit))throw new Error(`Invalid chapter cover display: ${focused.id}`);
 if(display.crop){const r=display.crop;if(!['x','y','width','height','sourceWidth','sourceHeight'].every(k=>Number.isFinite(r[k]))||r.x<0||r.y<0||r.width<=0||r.height<=0||r.x+r.width>r.sourceWidth||r.y+r.height>r.sourceHeight)throw new Error(`Invalid chapter cover crop: ${focused.id}`);}
 return asset;
}
export function buildFocusedGameplay({focused,registerVoiceLine,assets,interactions,stationContext}){
 const voice=registerVoiceLine;
 const findEvidence=id=>{
  const asset=assets.find(a=>a.id===id);
  if(!asset||asset.childVisibility==='editor-only'||!asset.clearance.startsWith('cleared-'))throw new Error(`Uncleared evidence ${id}`);
  return {...asset,image:`/content/step-images/${id}.${asset.localPath.endsWith('.svg')?'svg':'jpg'}`};
 };
 const evidence=[...new Set([...(focused.evidenceAssetIds??[]),...(focused.photoAlbum?.photos??[]).map(photo=>photo.assetId)])].map(findEvidence);
 const photoAlbum=focused.photoAlbum?{id:focused.photoAlbum.id,title:focused.photoAlbum.title,label:focused.photoAlbum.label,photos:focused.photoAlbum.photos.map(photo=>{
  const asset=findEvidence(photo.assetId);
  for(const key of ['title','label','period','observation','narration'])if(!photo[key]?.trim())throw new Error(`Missing album ${key}: ${photo.assetId}`);
  if(!photo.sourceIds?.length||!photo.sourceLinks?.length)throw new Error(`Missing album provenance: ${photo.assetId}`);
  if(!/\.(jpe?g|png)$/i.test(asset.localPath))throw new Error(`Album requires a photograph: ${photo.assetId}`);
  if(photo.crop){const r=photo.crop;if(!['x','y','width','height','sourceWidth','sourceHeight'].every(k=>Number.isFinite(r[k]))||r.x<0||r.y<0||r.width<=0||r.height<=0||r.x+r.width>r.sourceWidth||r.y+r.height>r.sourceHeight)throw new Error(`Invalid photo crop: ${photo.assetId}`);}
  return {...photo,image:asset.image,caption:photo.caption??asset.caption,boundary:[...new Set([photo.boundary,asset.boundary??asset.notes].filter(Boolean))].join(' '),audio:voice(photo.narration)};
 })}:null;
 if(photoAlbum&&(photoAlbum.photos.length<2||new Set(photoAlbum.photos.map(p=>p.assetId)).size!==photoAlbum.photos.length))throw new Error(`Invalid photo album: ${focused.id}`);
 const coverSource=selectFocusedCover(focused,assets);
 const coverAsset=findEvidence(coverSource.id);
 const sceneAsset=focused.presentation?findEvidence(focused.presentation.sceneAssetId):null;
 const trip=focused.presentation?.story;
 const narrativeAssets=trip?[findEvidence(trip.reunionAssetId)]:[];
 const optionViews=focused.steps.flatMap(step=>step.options).map(o=>o.objectView).filter(Boolean);
 for(const view of optionViews.filter(v=>v.kind==='scene-strip')){
  if(!Array.isArray(view.panels)||view.panels.length<2||view.panels.length>3||!['sequence','together','pair'].includes(view.relation))throw new Error(`Invalid story strip: ${focused.id}`);
  for(const panel of view.panels)if(!panel.caption?.trim()||panel.caption.length>18||panel.cue&&!['light','smoke'].includes(panel.cue))throw new Error(`Invalid story panel: ${focused.id}`);
 }
 for(const view of optionViews.flatMap(v=>v.kind==='scene-strip'?v.panels:v.kind==='scene-card'?[v]:[])){
  const asset=findEvidence(view.assetId),crop=view.crop;
  if(!crop||!['x','y','width','height','sourceWidth','sourceHeight'].every(key=>Number.isFinite(crop[key]))||crop.x<0||crop.y<0||crop.width<=0||crop.height<=0||crop.x+crop.width>crop.sourceWidth||crop.y+crop.height>crop.sourceHeight)throw new Error(`Invalid scene crop: ${focused.id}`);
  if(!narrativeAssets.some(item=>item.id===asset.id))narrativeAssets.push(asset);
 }
 const projectScene=(view,label)=>{const asset=findEvidence(view.assetId);return {...view,image:asset.image,imageAlt:label,imageLabel:asset.clearance==='cleared-project-created'?'故事插画':'历史材料'};};
 const projectView=(view,label,visual)=>{
  if(view?.kind==='scene-card')return projectScene(view,label);
  if(view?.kind==='scene-strip'){
   const panels=view.panels.map(p=>projectScene(p,p.caption)),labels=new Set(panels.map(p=>p.imageLabel));
   if(labels.size!==1)throw new Error(`Mixed story strip media: ${focused.id}`);
   return {...view,panels,imageLabel:panels[0].imageLabel};
  }
  if(view?.kind==='study-card')return {...view,image:url(visual,true),imageAlt:label};
  return view??null;
 };
 const tripPresentation=trip?{...trip,reunionImage:narrativeAssets[0].image,stationLine:stationContext?.childIntro??trip.stationLine,stationAudio:voice(stationContext?.childIntro??trip.stationNarration),closingAudio:voice(trip.closingNarration)}:null;
 const presentation=focused.presentation?{...focused.presentation,story:tripPresentation,sceneImage:sceneAsset.image,evidenceAudio:voice(focused.presentation.evidenceNarration),guideAudio:voice(focused.presentation.guide)}:null;
 const steps=focused.steps.map((s,i)=>{
  const interaction=s.interaction?.kind==='scene-find'?{...s.interaction,rounds:s.interaction.rounds.map(round=>({...round,audio:{question:voice(round.question),right:voice(round.feedback),wrong:voice(round.retry)}}))}:s.interaction?.kind==='circle-refine'?{...s.interaction,refinements:s.interaction.refinements.map(r=>({...r,audio:voice(r.narration)}))}:s.interaction?.kind==='history-lab'?{...s.interaction,lab:{...s.interaction.lab,stages:s.interaction.lab.stages.map(stage=>({...stage,audio:voice(stage.narration)}))}}:s.interaction??null;
  const inspection=s.inspection?findEvidence(s.inspection.assetId):null;
  if(s.inspection?.openAlbum&&!photoAlbum?.photos.some(photo=>photo.assetId===s.inspection.assetId))throw new Error(`Inspection photo missing from album: ${focused.id}/${ids[i]}`);
  const displayEvidence=s.visualAssetId?findEvidence(s.visualAssetId):(focused.photoSteps??[]).includes(i)?evidence[0]:null;
  const diagramAlt=s.visual.items.map(x=>x.label).join('，');
  const imageAlt=displayEvidence?.title??diagramAlt;
  if(['实物照片','文物图像'].includes(s.interaction?.imageLabel)&&(!displayEvidence||displayEvidence.clearance==='cleared-project-created'))throw new Error(`Photograph label requires external registered evidence: ${focused.id}/${ids[i]}`);
  const imageBoundary=displayEvidence?.boundary??`自制学习示意。${focused.boundary}`;
  const imageNarration=displayEvidence?`这张是${displayEvidence.title}。${s.story}`:`这是学习示意图：${diagramAlt}。${s.question}`;
  return {
   id:ids[i],questionKind:kinds[i],icon:icons[i],phase:s.title,title:s.title,prompt:s.question,rightNote:s.feedback,wrongNote:s.wrongFeedback??s.feedback,
   sourceIds:s.sourceIds,interaction,narrative:s.narrative??null,concepts:s.concepts??null,
   inspection:inspection?{...inspection,title:s.inspection.title??inspection.title,caption:s.inspection.caption??inspection.caption,boundary:[inspection.boundary??inspection.notes,inspection.caption].filter(Boolean).join(' '),label:s.inspection.label,placement:s.inspection.placement??'main',framing:s.inspection.framing,displayHeight:s.inspection.displayHeight,openAlbum:s.inspection.openAlbum??false,sourceLinks:s.inspection.sourceLinks??[],audio:voice(s.inspection.narration)}:null,
   story:{screenNumber:i+1,title:s.title,screenText:s.story,displayText:s.displayText??s.story,narration:s.story},
   assetId:displayEvidence?.id??visualId(s.visual),image:displayEvidence?.image??url(s.visual),studyImage:url(s.visual),studyImageAlt:diagramAlt,imageAlt,imageCaption:displayEvidence?displayEvidence.title:'学习示意 · '+diagramAlt,imageBoundary,
   audio:{...(s.narration?{lead:voice(s.narration)}:{}),transition:voice(s.title+'。'),intro:voice(s.story),question:voice(s.question),image:voice(imageNarration),right:voice(s.narrative?s.narrative.response:'找到了。'+s.feedback),wrong:voice(s.narrative?s.narrative.retry:'再比较一下。'+(s.wrongFeedback??s.feedback))},
   options:s.options.map((o,j)=>({id:`${focused.id}-${ids[i]}-${j+1}`,label:o.label,correct:o.correct,objectView:projectView(o.objectView,o.label,o.visual),image:url(o.visual,true),imageAlt:o.visual.items.map(x=>x.label).join('，'),audio:voice(o.label)}))
  };
 });
 return {mode:'authored-picture-quest-v4',status:'playable-core',audioStatus:'local-pre-generated',hook:{kind:'具体任务',icon:'🔎',label:focused.title,question:focused.hook},cta:focused.cta,anchor:focused.anchor,boundary:focused.boundary,evidence,photoAlbum,coverAsset,presentation,sceneAsset,narrativeAssets,
  coverImage:coverAsset.image,coverImageAlt:coverAsset.title,coverImageKind:'历史材料',coverDisplay:focused.coverDisplay,
  coverAudio:voice(trip?.coverNarration??`${focused.title}。${focused.hook}准备好就点“${focused.cta}”。`),textbookAudio:null,
  finishAudio:voice(focused.outcome),finish:{...focused.finish,actionAudio:focused.finish.actions.map(t=>voice(t)),introAudio:voice(trip?.closingNarration??focused.finish.title+'。'+focused.finish.actions.join(''))},
  estimatedMinutes:6,badge:{icon:'🌟',label:'小小观察员'},steps,extensionTasks:interactions.map(({number,title,items})=>({number,title,items}))};
}
