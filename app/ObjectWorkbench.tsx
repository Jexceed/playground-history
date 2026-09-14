"use client";

import Image from "next/image";
import { useId, useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import { listenOptions } from "./quest-progress";
import { alignedRuler, clampRulerOffset, pointerRulerOffset } from "./workbench-model";

type Voice = { id: string; text: string };
export type ObjectView = { kind: "era" | "ruler-pair" | "ruler" | "weight"; match?: boolean; name?: string; date?: string; stationImage?: string };
export type WorkbenchInteraction = { kind: "timeline" | "ruler-pairs" | "tool-pick" | "align-rulers"; hint: string };
export type StoryScene = {
  scene:"artifact"|"timeline"|"workshop"|"reunion"; caption:string; speaker:string;
  responseSpeaker:string; response:string; retry:string; nextLabel:string;
};
export type TravelStory = {
  kind:"travel-story"; reunionImage:string; reunionAlt:string;
  coverCaption:string; stationLine:string; stationAudio:Voice; closingCaption:string; closingLine:string; closingAudio:Voice;
};
export type WorkbenchPresentation = {
  story?:TravelStory|null;
  kind: "object-workbench"; sceneImage: string; sceneAlt: string; title: string;
  evidenceTitle: string; evidenceLine: string; evidenceAudio: Voice; guideAudio: Voice;
  alignHint: string; familyHint: string; nextLabel: string; lastLabel: string;
};
type Option = { id: string; label: string; correct: boolean; audio: Voice; objectView?: ObjectView };
type Step = {
  id: string; title: string; prompt: string; rightNote: string; wrongNote: string;
  narrative?:StoryScene|null;
  inspection?: (Evidence & {label:string;audio:Voice}) | null;
  concepts?:Array<{term:string;meaning:string}>|null;
  story: { displayText: string }; interaction?: WorkbenchInteraction;
  audio: { lead?: Voice|null; transition: Voice; intro: Voice; question: Voice; right: Voice; wrong: Voice };
  options: Option[];
};
type Evidence = { image: string; title: string; caption: string; boundary: string };
type Props = {
  step: Step; seed: string; presentation: WorkbenchPresentation;
  periodLabel: string; solved: boolean; isLast: boolean;
  speak: (ids: string[]) => Promise<unknown>; listen: (ids: string[]) => void;
  onSolved: () => void; onNext: () => void; onInspect: () => void;
};

export function stepVoiceIds(step: Pick<Step, "audio">) {
  return step.audio.lead ? [step.audio.lead.id] : [step.audio.transition.id, step.audio.intro.id, step.audio.question.id];
}

export function SoundIcon() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4zM15 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14" /></svg>;
}
function ArrowIcon() {
  return <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>;
}
export function WoodenRuler({ teal = false, small = false }: { teal?: boolean; small?: boolean }) {
  const id = useId().replace(/:/g, "");
  return <svg className="wooden-ruler" viewBox="0 0 366 57" preserveAspectRatio="none" role="img" aria-label={teal ? "青色三格尺" : "黄色三格尺"}>
    <defs><linearGradient id={id} x2="0" y2="1"><stop stopColor={teal ? "#61b5a2" : "#f4d18c"}/><stop offset="1" stopColor={teal ? "#317a6c" : "#ce9a52"}/></linearGradient></defs>
    <rect x="3" y="7" width="360" height="47" rx="7" fill={teal ? "#205b51" : "#976736"} opacity=".3"/>
    <rect x="3" y="3" width="360" height="47" rx="7" fill={`url(#${id})`} stroke={teal ? "#245f54" : "#ac743d"} strokeWidth="2"/>
    <path d="M12 8H354M13 45H353" stroke={teal ? "#b4dfc4" : "#ffe3af"} strokeOpacity=".5"/>
    <g stroke={teal ? "#f4edc9" : "#775634"} strokeWidth="2.4">
      {[3,123,243,363].map(x=><path key={x} d={`M${x} 5V32`}/>)}
      {!small && Array.from({length:9},(_,i)=>13+i*38).map(x=><path key={x} d={`M${x} 41h17`} opacity=".1"/>)}
    </g>
    {[0,1,2,3].map((n)=><text key={n} x={n*120+3} y="41" dx={n===0?10:n===3?-10:0} fontFamily="sans-serif" fontSize="15" fontWeight="700" fill={teal ? "#fff5d8" : "#775634"} textAnchor="middle">{n}</text>)}
  </svg>;
}
function Cloth({ marks = false }: { marks?: boolean }) {
  const id=useId().replace(/:/g, "");
  return <svg className="bench-cloth" viewBox="0 0 370 90" preserveAspectRatio="none" aria-label="同一块蓝色布" role="img"><defs><pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 0H6M0 0V6" stroke="#fff" strokeOpacity=".16"/></pattern></defs>
    <path d="M5 10H365V76Q350 69 338 76T305 76T272 76T239 76T206 76T173 76T140 76T107 76T74 76T41 76T5 76Z" fill="#397f92"/>
    <path d="M5 10H365V76Q350 69 338 76T305 76T272 76T239 76T206 76T173 76T140 76T107 76T74 76T41 76T5 76Z" fill={`url(#${id})`}/>
    <path d="M12 20H357M12 63H357" stroke="#d2e7d6" strokeWidth="2" strokeDasharray="4 4"/>
    {marks && [5,125,245,365].map(x=><path key={x} d={`M${x} 4V84`} stroke="#ffdf8a" strokeWidth="3" strokeDasharray="5 3"/>)}
  </svg>;
}
function RulerPair({ match, cloth = false }: { match: boolean; cloth?: boolean }) {
  return <div className={`ruler-pair ${match ? "matching" : "different"}`}>
    {cloth && <Cloth marks={match}/>}
    <div className="ruler-pair-top"><WoodenRuler /></div>
    <div className="ruler-pair-bottom"><WoodenRuler teal /></div>
    {match && cloth && <span className="ruler-check" aria-hidden="true">✓</span>}
  </div>;
}

export function WorkbenchCover({ presentation }: { presentation: WorkbenchPresentation }) {
  return <div className="workbench-cover-scene workbench-scene"><Image className="workbench-art" src={presentation.sceneImage} alt={presentation.sceneAlt} width={1536} height={1024} loading="eager" unoptimized/><span className="story-art-label">故事插画</span><div className="bench-toys"><RulerPair match={false} cloth/></div></div>;
}

export function AlignRulers({ onJudge, locked = false, practice = false, hint }: { onJudge?: (match:boolean)=>void; locked?:boolean; practice?:boolean; hint:string }) {
  const [offset,setOffset]=useState(practice ? 0 : 18), [dragging,setDragging]=useState(false);
  const offsetRef=useRef(practice ? 0 : 18), drag=useRef<{x:number;offset:number; width:number}|null>(null), track=useRef<HTMLDivElement>(null);
  const move=(value:number)=>{const next=clampRulerOffset(value);offsetRef.current=next;setOffset(next);return next;};
  const judge=(value:number, reportWrong=true)=>{
    if(alignedRuler(value)){move(0);onJudge?.(true);} else if(reportWrong)onJudge?.(false);
  };
  const start=(e:PointerEvent<HTMLDivElement>)=>{
    if(locked&&!practice)return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current={x:e.clientX,offset:offsetRef.current,width:track.current?.getBoundingClientRect().width??1};setDragging(true);
  };
  const change=(e:PointerEvent<HTMLDivElement>)=>{if(drag.current)move(pointerRulerOffset(drag.current.offset,e.clientX-drag.current.x,drag.current.width));};
  const end=()=>{if(!drag.current)return;drag.current=null;setDragging(false);judge(offsetRef.current);};
  const key=(e:KeyboardEvent<HTMLDivElement>)=>{
    if(locked&&!practice)return;
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();judge(move(offsetRef.current+(e.key==='ArrowLeft'?-3:3)),false);}
    if(e.key==='Enter'||e.key===' '){e.preventDefault();judge(offsetRef.current);}
  };
  const nudge=(direction:number)=>judge(move(offsetRef.current+direction*3),false);
  return <div className={`alignment-game ${dragging?'dragging':''} ${offset===0?'aligned':''}`}>
    <p className="alignment-hint">{hint}</p>
    <div className="alignment-track" ref={track}>
      <div className="alignment-origin" aria-hidden="true"/>
      <div className="alignment-target"><WoodenRuler /></div>
      <div className="alignment-movable" role="slider" tabIndex={locked&&!practice?-1:0} aria-label="移动青尺，让它和黄尺对齐" aria-valuemin={-24} aria-valuemax={24} aria-valuenow={offset} aria-valuetext={offset===0?'刻度已对齐':'刻度还没对齐'} aria-disabled={locked&&!practice}
        style={{transform:`translateX(${offset/0.7}%)`}} onPointerDown={start} onPointerMove={change} onPointerUp={end} onPointerCancel={()=>{drag.current=null;setDragging(false);}} onKeyDown={key}>
        <WoodenRuler teal /><span className="ruler-grip" aria-hidden="true">⋮⋮</span>
      </div>
    </div>
    <div className="alignment-controls"><button onClick={()=>nudge(-1)} disabled={locked&&!practice} aria-label="向左移动青尺">←</button><span>{offset===0?'刻度对齐了！':'也可以点箭头挪一挪'}</span><button onClick={()=>nudge(1)} disabled={locked&&!practice} aria-label="向右移动青尺">→</button></div>
  </div>;
}
function LearningWeight() {
  const id=useId().replace(/:/g, "");
  return <svg className="learning-weight" viewBox="0 0 180 132" role="img" aria-label="砝码学习示意">
    <defs><linearGradient id={id} x2=".3" y2="1"><stop stopColor="#b8b7a5"/><stop offset="1" stopColor="#68776e"/></linearGradient></defs>
    <ellipse cx="90" cy="119" rx="67" ry="8" fill="#5b5d4e" opacity=".14"/>
    <path d="M67 47V32a23 23 0 0 1 46 0v15h-13V32a10 10 0 0 0-20 0v15Z" fill={`url(#${id})`} stroke="#53675e" strokeWidth="2.5"/>
    <path d="M21 106C25 68 45 40 90 40S155 68 159 106Q155 122 90 122T21 106Z" fill={`url(#${id})`} stroke="#53675e" strokeWidth="2.5"/>
    <path d="M37 84Q48 53 85 52M38 106Q89 119 141 106" fill="none" stroke="#e0dcc4" strokeWidth="3" strokeLinecap="round" opacity=".65"/>
  </svg>;
}
function OptionObject({ option }: { option: Option }) {
  const view=option.objectView;
  if(view?.kind==='ruler-pair')return <RulerPair match={Boolean(view.match)}/>;
  if(view?.kind==='ruler')return <div className="tool-illustration ruler-tool"><WoodenRuler/></div>;
  if(view?.kind==='weight')return <div className="tool-illustration"><LearningWeight/></div>;
  if(view?.kind==='era')return <div className="era-object">{view.stationImage&&<Image src={view.stationImage} alt="" width={105} height={110} unoptimized/>}<strong>{view.name}</strong><span>{view.date}</span></div>;
  return null;
}
export function ObjectWorkbench({step,seed,presentation,periodLabel,solved,isLast,speak,listen,onSolved,onNext,onInspect}:Props){
  const [picked,setPicked]=useState<Option|null>(null), [tried,setTried]=useState(false);
  const options=listenOptions(step.options,seed), kind=step.interaction?.kind;
  const choose=(option:Option)=>{
    if(solved)return;
    setPicked(option);setTried(true);
    if(option.correct){onSolved();void speak([step.audio.right.id]);}else void speak([step.audio.wrong.id]);
  };
  const judge=(match:boolean)=>{const option=step.options.find(o=>o.correct===match);if(option)choose(option);};
  const sequence=stepVoiceIds(step);
  const episode=step.narrative,trip=presentation.story;
  const sceneImage=trip&&episode?.scene==='reunion'?trip.reunionImage:presentation.sceneImage;
  const sceneAlt=trip&&episode?.scene==='reunion'?trip.reunionAlt:presentation.sceneAlt;
  const bubbleVoices=episode&&solved?[step.audio.right.id]:episode&&tried?[step.audio.wrong.id]:sequence;
  const spokenQuestion=episode?(solved?episode.response:tried?episode.retry:step.prompt):step.prompt;
  return <section className={`object-quest ${episode?"trip-episode":""}`} data-story-scene={episode?.scene} data-step-id={step.id} data-interaction-kind={kind} data-voice-id={sequence.join(',')}>
    <div className="workbench-scene-column">
      {kind==='timeline'&&step.inspection?<div className="quest-artifact-intro">
        <button className="quest-artifact-picture" onClick={onInspect} aria-label={step.inspection.label}><Image src={step.inspection.image} alt={step.inspection.title} width={1200} height={700} loading="eager" unoptimized/><span>{step.inspection.caption}</span></button>
        <h2>{step.inspection.title}</h2>
        <div className="measure-concepts" aria-label="度量衡的意思">{step.concepts?.map(concept=><div key={concept.term}><strong>{concept.term}</strong><span>{concept.meaning}</span></div>)}</div>
      </div>:kind==='timeline'?<div className="quest-date-map" aria-label="时间顺序：秦在前，汉在后">
        <p>{episode?.caption}</p><div className="quest-date-stops">{step.options.map(option=><div className={`quest-date-stop ${picked?.id===option.id&&option.correct?'arrived':''}`} key={option.id}>{option.objectView?.stationImage&&<Image src={option.objectView.stationImage} alt="" width={120} height={130} unoptimized/>}<strong>{option.objectView?.name}</strong><span>{option.objectView?.date}</span></div>)}</div><span className="quest-date-direction">时间向前走 →</span>
      </div>:<div className="workbench-scene">
        <Image className="workbench-art" src={sceneImage} alt={sceneAlt} width={1536} height={1024} loading="eager" unoptimized/>
        <span className="story-art-label">故事插画</span>
        <div className={`bench-toys toys-${kind}`} aria-live="polite">
          {kind==='ruler-pairs'&&<RulerPair match={Boolean(picked?.correct)} cloth/>}
          {kind==='tool-pick'&&<div className="bench-tool-demo"><Cloth marks={solved}/>{picked?.objectView?.kind==='weight'?<div className="bench-weight"><LearningWeight/></div>:<div className={solved?'tool-landed':'tool-waiting'}><WoodenRuler/></div>}</div>}
          {kind==='align-rulers'&&<AlignRulers onJudge={judge} locked={solved} hint={presentation.alignHint}/>}
        </div>
      </div>}
      {step.inspection&&kind!=='timeline'&&<button className="real-object-link" onClick={onInspect}><Image src={step.inspection.image} alt={step.inspection.title} width={150} height={95} unoptimized/><span><small>真实文物 · 点开看一看</small><strong>{step.inspection.label}</strong></span><span className="object-magnify" aria-hidden="true">⌕</span></button>}
    </div>
    <div className="workbench-task">
      <p className="workbench-kicker">{periodLabel} · {step.title}</p>
      <div className={`workbench-question ${episode?"trip-speech":""}`} aria-live="polite"><div>{episode&&<span className="trip-speaker">{solved?episode.responseSpeaker:episode.speaker}</span>}<h1>{spokenQuestion}</h1></div><button className="workbench-sound" onClick={()=>listen(bubbleVoices)} aria-label={episode?(solved||tried?"再听这句回应":"再听这一幕"):"重听这个问题"}><SoundIcon/></button></div>
      {!episode&&<p className="workbench-story">{step.story.displayText}</p>}
      {kind!=='align-rulers'?<div className="workbench-choices" role="group" aria-label={step.prompt}>{options.map(option=><div key={option.id} className={`bench-choice ${picked?.id===option.id?(option.correct?'right':'try-again'):''}`}>
        <button className="bench-choice-action" data-option-id={option.id} onClick={()=>choose(option)} disabled={solved} aria-label={`选择${option.label}`} aria-pressed={picked?.id===option.id}><OptionObject option={option}/><span>{option.objectView?.kind==='era'?'就去这一站':option.label}</span>{picked?.id===option.id&&<i><b aria-hidden="true">{option.correct?'✓':'×'}</b>{option.correct?'选对啦':'再试试'}</i>}</button>
        <button className="bench-option-sound" aria-label={`听${option.label}`} onClick={()=>listen([option.audio.id])}><SoundIcon/></button>
      </div>)}</div>:<div className="alignment-copy"><span aria-hidden="true">↔</span><p>把青尺往黄尺的起点挪一挪。<br/>每一格都要对上。</p></div>}
      {episode&&(solved||tried)?<div className="workbench-response-spacer" data-feedback={solved?'right':'wrong'}/>:<div className={`workbench-response ${solved?'done':tried?'retry':''}`} role="status" data-feedback={solved?'right':tried?'wrong':'hint'}><span aria-hidden="true">{solved?'✓':tried?'×':'☝'}</span><p>{solved?step.rightNote:tried?step.wrongNote:step.interaction?.hint}</p></div>}
      {solved?<button className="workbench-next" onClick={onNext}>{episode?.nextLabel??(isLast?presentation.lastLabel:presentation.nextLabel)}<ArrowIcon/></button>:<button className="workbench-help" onClick={()=>listen(kind==='align-rulers'?sequence:[presentation.guideAudio.id])}><SoundIcon/>听听怎么玩</button>}
    </div>
  </section>;
}

export function WorkbenchFamily({presentation,children}: {presentation:WorkbenchPresentation;children:React.ReactNode}){
  return <div className="workbench-family"><AlignRulers practice hint={presentation.familyHint}/>{children}</div>;
}
