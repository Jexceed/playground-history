import {visualId} from './study-visuals.mjs';
const ids=['time','beginning','journey','change','takeaway'];
const kinds=['time-location','evidence-observation','action-sequence','cause-effect','apply-and-explain'];
const icons=['🕰️','🔎','🧭','✨','🗣️'];
const url=(scene,small=false)=>`/content/study-scenes/${visualId(scene,small)}.svg`;
export function buildFocusedGameplay({focused,registerVoiceLine,assets,interactions,childEntry}){
 const voice=registerVoiceLine;
 const findEvidence=id=>{
  const asset=assets.find(a=>a.id===id);
  if(!asset||asset.childVisibility==='editor-only'||!asset.clearance.startsWith('cleared-'))throw new Error(`Uncleared evidence ${id}`);
  return {...asset,image:`/content/step-images/${id}.${asset.localPath.endsWith('.svg')?'svg':'jpg'}`};
 };
 const evidence=(focused.evidenceAssetIds??[]).map(findEvidence);
 const visiblePhotos=assets.filter(a=>a.childVisibility!=='editor-only'&&a.clearance?.startsWith('cleared-')&&/\.(jpe?g|png|tif)$/i.test(a.localPath??'')&&!a.id.startsWith('study-'));
 const coverSource=visiblePhotos.find(a=>a.id===childEntry?.preferredAssetId)??visiblePhotos.find(a=>!a.title.includes('儿童'))??visiblePhotos[0];
 const coverAsset=coverSource?findEvidence(coverSource.id):null;
 const sceneAsset=focused.presentation?findEvidence(focused.presentation.sceneAssetId):null;
 const trip=focused.presentation?.story;
 const narrativeAssets=trip?[findEvidence(trip.reunionAssetId)]:[];
 const tripPresentation=trip?{...trip,reunionImage:narrativeAssets[0].image,stationAudio:voice(trip.stationNarration),closingAudio:voice(trip.closingNarration)}:null;
 const presentation=focused.presentation?{...focused.presentation,story:tripPresentation,sceneImage:sceneAsset.image,evidenceAudio:voice(focused.presentation.evidenceNarration),guideAudio:voice(focused.presentation.guide)}:null;
 const steps=focused.steps.map((s,i)=>{
  const inspection=s.inspection?findEvidence(s.inspection.assetId):null;
  const displayEvidence=(focused.photoSteps??[]).includes(i)?evidence[0]:null;
  const diagramAlt=s.visual.items.map(x=>x.label).join('，');
  const imageAlt=displayEvidence?.title??diagramAlt;
  const imageBoundary=displayEvidence?.boundary??`自制学习示意。${focused.boundary}`;
  const imageNarration=displayEvidence?`这张是${displayEvidence.title}。${s.story}`:`这是学习示意图：${diagramAlt}。${s.question}`;
  return {
   id:ids[i],questionKind:kinds[i],icon:icons[i],phase:s.title,title:s.title,prompt:s.question,rightNote:s.feedback,wrongNote:s.wrongFeedback??s.feedback,
   sourceIds:s.sourceIds,interaction:s.interaction??null,narrative:s.narrative??null,concepts:s.concepts??null,
   inspection:inspection?{...inspection,title:s.inspection.title??inspection.title,caption:s.inspection.caption??inspection.caption,boundary:[inspection.boundary,inspection.caption].filter(Boolean).join(' '),label:s.inspection.label,sourceLinks:s.inspection.sourceLinks??[],audio:voice(s.inspection.narration)}:null,
   story:{screenNumber:i+1,title:s.title,screenText:s.story,displayText:s.story,narration:s.story},
   assetId:displayEvidence?.id??visualId(s.visual),image:displayEvidence?.image??url(s.visual),studyImage:url(s.visual),studyImageAlt:diagramAlt,imageAlt,imageCaption:displayEvidence?displayEvidence.title:'学习示意 · '+diagramAlt,imageBoundary,
   audio:{...(s.narration?{lead:voice(s.narration)}:{}),transition:voice(s.title+'。'),intro:voice(s.story),question:voice(s.question),image:voice(imageNarration),right:voice(s.narrative?s.narrative.response:'找到了。'+s.feedback),wrong:voice(s.narrative?s.narrative.retry:'再比较一下。'+(s.wrongFeedback??s.feedback))},
   options:s.options.map((o,j)=>({id:`${focused.id}-${ids[i]}-${j+1}`,label:o.label,correct:o.correct,objectView:o.objectView??null,image:url(o.visual,true),imageAlt:o.visual.items.map(x=>x.label).join('，'),audio:voice(o.label)}))
  };
 });
 return {mode:'authored-picture-quest-v4',status:'playable-core',audioStatus:'local-pre-generated',hook:{kind:'具体任务',icon:'🔎',label:focused.title,question:focused.hook},cta:focused.cta,anchor:focused.anchor,boundary:focused.boundary,evidence,coverAsset,presentation,sceneAsset,narrativeAssets,
  coverImage:coverAsset?.image??steps[1].image,coverImageAlt:coverAsset?.title??steps[1].imageAlt,coverImageKind:coverAsset?(/儿童|示意|故事插画/.test(coverAsset.title)?'故事插画':'历史材料'):'学习示意',
  coverAudio:voice(trip?.coverNarration??`${focused.title}。${focused.hook}准备好就点“${focused.cta}”。`),textbookAudio:null,
  finishAudio:voice(focused.outcome),finish:{...focused.finish,actionAudio:focused.finish.actions.map(t=>voice(t)),introAudio:voice(trip?.closingNarration??focused.finish.title+'。'+focused.finish.actions.join(''))},
  estimatedMinutes:6,badge:{icon:'🌟',label:'小小观察员'},steps,extensionTasks:interactions.map(({number,title,items})=>({number,title,items}))};
}
