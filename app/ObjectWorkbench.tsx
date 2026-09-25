"use client";

import Image from "next/image";
import { useId, useRef, useState, type PointerEvent, type KeyboardEvent, type CSSProperties } from "react";
import { listenOptions } from "./quest-progress";
import { alignedRuler, clampRulerOffset, pointerRulerOffset } from "./workbench-model";
import { stepVoiceIds, usesChoiceCards } from "./step-flow";
import { PhotoAlbumButton } from "./PhotoAlbumButton";
import type { PhotoAlbum } from "./photo-album";
import "./scene-interactions.css";
import {CircleStudy, CircleDiagram} from "./CircleStudy";
import {HistoryLab, PolityDiagram, PrintingDiagram, type HistoryLabConfig, type LabStage} from "./HistoryLab";
export { stepVoiceIds } from "./step-flow";

type Voice = { id: string; text: string };
type SceneCrop = { x:number; y:number; width:number; height:number; sourceWidth:number; sourceHeight:number };
export type ObjectView = { kind: "era" | "ruler-pair" | "ruler" | "weight" | "prop" | "scene-card" | "circle-model" | "polity-panel" | "printing-panel"; windowIndex?:number; connected?:boolean; sides?:number; match?: boolean; name?: string; date?: string; stationImage?: string; marker?: "coin" | "calendar"; icon?: string; image?:string; imageAlt?:string; crop?:SceneCrop };
export type SceneFindRound = { id:string; question:string; targetId:string; feedback:string; retry:string; nextLabel?:string; audio:{question:Voice;right:Voice;wrong:Voice} };
export type SceneHotspot = { id:string; label:string; x:number; y:number; width:number; height:number };
export type WorkbenchInteraction = { kind: "timeline" | "ruler-pairs" | "tool-pick" | "align-rulers" | "pick" | "slide-fit" | "look-listen" | "scene-find" | "circle-refine" | "history-lab"; lab?:HistoryLabConfig; refinements?:Array<{sides:number;narration:string;audio:Voice}>; hint: string; context?: string; scene?: string; copy?: string; ariaLabel?: string; continueLabel?: string; placement?: "panel"; modelLabel?: string; selectionFraming?: "detail"; imageLabel?: "实物照片" | "文物图像" | "故事插画"; imageCrop?:SceneCrop; sceneAspectRatio?:number; hotspots?:SceneHotspot[]; rounds?:SceneFindRound[] };
export type StoryScene = {
  scene:"artifact"|"timeline"|"workshop"|"reunion"|"detail"; caption:string; speaker:string;
  responseSpeaker:string; response:string; retry:string; nextLabel:string;
};
export type TravelStory = {
  kind:"travel-story"; reunionImage:string; reunionAlt:string;
  reunionAspectRatio?:number; reunionFit?:"contain"|"cover";
  coverCaption:string; stationLine:string; stationAudio:Voice; closingCaption:string; closingLine:string; closingAudio:Voice;
};
export type WorkbenchPresentation = {
  story?:TravelStory|null;
  kind: "object-workbench"; sceneImage: string; sceneAlt: string; title: string;
  evidenceTitle: string; evidenceLine: string; evidenceAudio: Voice; guideAudio: Voice;
  alignHint: string; familyHint: string; nextLabel: string; lastLabel: string;
  coverProp?: string; familyLabel?: string; practice?: { scene: string } | null;
  sceneFraming?: "story";
  sceneAspectRatio?: number;
  familyMode?: "actions";
};
type Option = { id: string; label: string; correct: boolean; audio: Voice; objectView?: ObjectView };
type Step = {
  id: string; title: string; prompt: string; rightNote: string; wrongNote: string;
  narrative?:StoryScene|null;
  inspection?: (Evidence & {label:string;audio:Voice;placement?:"main"|"supporting";framing?:"landscape"|"panorama"|"object";openAlbum?:boolean;displayHeight?:number}) | null;
  concepts?:Array<{term:string;meaning:string}>|null;
  image:string; imageAlt:string;
  story: { displayText: string }; interaction?: WorkbenchInteraction;
  audio: { lead?: Voice|null; transition: Voice; intro: Voice; question: Voice; right: Voice; wrong: Voice };
  options: Option[];
};
type Evidence = { image: string; title: string; caption: string; boundary: string };
type Props = {
  step: Step; seed: string; presentation: WorkbenchPresentation;
  photoAlbum?: PhotoAlbum | null;
  periodLabel: string; solved: boolean; isLast: boolean;
  speak: (ids: string[]) => Promise<unknown>; listen: (ids: string[]) => void;
  onSolved: () => void; onNext: () => void; onInspect: () => void;
  onNarrationChange?: (ids:string[]) => void;
};

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
  return <div style={{"--story-aspect":presentation.sceneAspectRatio} as CSSProperties} className={`workbench-cover-scene workbench-scene ${presentation.sceneFraming==='story'?'story-framed-cover':''}`}><Image className="workbench-art" src={presentation.sceneImage} alt={presentation.sceneAlt} width={1536} height={1024} loading="eager" unoptimized/><span className="story-art-label">故事插画</span>{presentation.sceneFraming!=='story'&&<div className="bench-toys">{presentation.coverProp?<div className="cover-prop"><PropArt icon={presentation.coverProp}/></div>:<RulerPair match={false} cloth/>}</div>}</div>;
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

/* Chapter learning props: same flat illustration language as the rulers and weight. */
const earth="#c9b183", earthDark="#9c8156", brick="#cf9d7c", brickDark="#a96b4e", brickLight="#e9c3a4";
function OldWall({x=0,s=1}:{x?:number;s?:number}) {
  return <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M8 54Q24 45 40 49T74 50T92 52V64H8Z" fill={earth} stroke={earthDark} strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M14 57H34M44 58H62M70 56H86" stroke={earthDark} strokeWidth="1.6" opacity=".55"/>
    <path d="M20 49l3-6M60 48l2-5M82 50l4-5" stroke="#7f9c63" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="30" cy="60" r="1.8" fill={earthDark} opacity=".5"/><circle cx="56" cy="61" r="1.5" fill={earthDark} opacity=".5"/><circle cx="78" cy="59" r="1.7" fill={earthDark} opacity=".5"/>
  </g>;
}
function BrickWall({x=0,s=1}:{x?:number;s?:number}) {
  return <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M26 64V22h8v-6h8v6h8v-6h8v6h8v42Z" fill={brick} stroke={brickDark} strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M26 32H66M26 42H66M26 53H66M36 22V32M52 22V32M42 32V42M58 42V53M34 42V53M46 53V64M60 53V64M36 53V64M30 22V64" stroke={brickDark} strokeWidth="1.4" opacity=".5" fill="none"/>
    <path d="M30 26h10" stroke={brickLight} strokeWidth="2" strokeLinecap="round" opacity=".8"/>
  </g>;
}
function PropArt({ icon, label }: { icon: string; label?: string }) {
  const body = (() => {
    switch (icon) {
      case "hills": return <>
        <path d="M2 58L28 24L46 46L62 18L98 58Z" fill="#bccbaa" stroke="#8fa37c" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M62 18L74 34L66 32ZM28 24L38 36L30 34Z" fill="#eef3e2"/>
        <circle cx="82" cy="14" r="7" fill="#f2cc72"/>
      </>;
      case "wall-old": return <OldWall/>;
      case "wall-brick": return <BrickWall x={8} s={1.05}/>;
      case "wall-ages": return <><OldWall x={-6} s={.62}/><BrickWall x={42} s={.8}/></>;
      case "wall-joined": return <>
        <path d="M4 54Q24 45 46 49T92 51V64H4Z" fill={earth} stroke={earthDark} strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M40 48.5Q50 46.5 60 48.5V64H40Z" fill="#a8c9b4" stroke="#6f9c82" strokeWidth="2"/>
        <path d="M12 57H30M68 58H86" stroke={earthDark} strokeWidth="1.6" opacity=".55"/>
      </>;
      case "wall-gap": return <>
        <OldWall x={-12} s={.68}/><OldWall x={56} s={.68}/>
        <path d="M46 56H58" stroke="#b94c3c" strokeWidth="2.5" strokeDasharray="4 3" strokeLinecap="round"/>
      </>;
      case "gate": return <>
        <path d="M6 64V30Q30 22 50 26T94 32V64H64V48Q64 38 50 38Q36 38 36 48V64Z" fill={earth} stroke={earthDark} strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M36 64V48Q36 38 50 38Q64 38 64 48V64" fill="#fff6df" stroke={earthDark} strokeWidth="2"/>
        <path d="M12 36H30M72 38H88" stroke={earthDark} strokeWidth="1.6" opacity=".55"/>
      </>;
      case "beacon": return <>
        <path d="M14 64Q30 48 46 46T86 60V64Z" fill={earth} stroke={earthDark} strokeWidth="2.2"/>
        <path d="M40 46V20h20v26Z" fill={brick} stroke={brickDark} strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M40 28H60M40 37H60" stroke={brickDark} strokeWidth="1.4" opacity=".5"/>
        <path d="M44 20v-5h5v5M51 20v-5h5v5" fill={brick} stroke={brickDark} strokeWidth="2"/>
        <path d="M50 12Q46 6 50 2M56 12Q60 7 55 3" stroke="#c98a5a" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
      </>;
      case "wall-long": return <>
        <path d="M2 64L24 30Q34 20 44 32L60 48Q70 40 82 46L98 56V64Z" fill="#bccbaa" stroke="#8fa37c" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M8 52Q22 34 34 34T56 52Q70 44 92 52" fill="none" stroke={earthDark} strokeWidth="5" strokeLinecap="round"/>
        <path d="M8 52Q22 34 34 34T56 52Q70 44 92 52" fill="none" stroke={earth} strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M20 44v-6M34 34v-5M48 42v-6M62 48v-6M78 48v-5" stroke={earthDark} strokeWidth="2"/>
      </>;
      case "wall-short": return <>
        <rect x="24" y="40" width="52" height="22" rx="3" fill={brick} stroke={brickDark} strokeWidth="2.5"/>
        <path d="M28 40v-7h9v7M45 40v-7h9v7M62 40v-7h9v7" fill={brick} stroke={brickDark} strokeWidth="2"/>
        <path d="M24 51H76" stroke={brickDark} strokeWidth="1.4" opacity=".5"/>
      </>;
      case "rammed": return <>
        <path d="M14 62V26h44v36Z" fill={earth} stroke={earthDark} strokeWidth="2.5"/>
        <path d="M14 34H58M14 43H58M14 52H58" stroke={earthDark} strokeWidth="2"/>
        <path d="M10 22H62" stroke="#8a6b42" strokeWidth="5" strokeLinecap="round"/>
        <path d="M70 12v34" stroke="#8a6b42" strokeWidth="5" strokeLinecap="round"/>
        <path d="M64 46h12v7H64Z" fill="#8a6b42"/>
        <path d="M20 29h12M22 38h14M18 47h12M26 56h14" stroke={earthDark} strokeWidth="1.3" opacity=".5"/>
      </>;
      case "blocks": return <>
        <rect x="18" y="44" width="22" height="18" rx="3" fill="#d8a461" stroke="#a5754a" strokeWidth="2.4"/>
        <rect x="44" y="46" width="22" height="18" rx="3" fill="#8fb9ad" stroke="#5f8a7e" strokeWidth="2.4"/>
        <rect x="30" y="24" width="22" height="18" rx="3" fill="#cf9d7c" stroke={brickDark} strokeWidth="2.4" transform="rotate(-7 41 33)"/>
        <circle cx="70" cy="56" r="8" fill="#e9c3a4" stroke={brickDark} strokeWidth="2.2"/>
      </>;
      case "coins-strung": return <>
        <path d="M50 6V64" stroke="#8a6b42" strokeWidth="3.4"/>
        {[16,28,40,52].map(y=><g key={y}><circle cx="50" cy={y} r="11" fill="#c5ad64" stroke="#8f7c46" strokeWidth="2.4"/><rect x="45" y={y-5} width="10" height="10" rx="1.5" fill="#fdf6e0" stroke="#8f7c46" strokeWidth="1.6"/></g>)}
      </>;
      case "coins-loose": return <>
        <circle cx="34" cy="30" r="13" fill="#c5ad64" stroke="#8f7c46" strokeWidth="2.4"/><rect x="29" y="25" width="10" height="10" rx="1.5" fill="#fdf6e0" stroke="#8f7c46" strokeWidth="1.6"/>
        <circle cx="62" cy="46" r="13" fill="#c5ad64" stroke="#8f7c46" strokeWidth="2.4"/><rect x="57" y="41" width="10" height="10" rx="1.5" fill="#fdf6e0" stroke="#8f7c46" strokeWidth="1.6"/>
        <path d="M22 58l8-4M66 20l8 3" stroke="#b0a078" strokeWidth="2" strokeLinecap="round" opacity=".8"/>
      </>;
      case "bag-camel": return <>
        <path d="M12 58Q20 34 38 38Q48 22 66 34L84 38Q92 24 100 28L94 40Q98 48 94 58Z" fill="#d9b380" stroke="#a5764a" strokeWidth="2.6"/>
        <path d="M40 34V26M62 34V26" stroke="#8a6b42" strokeWidth="3"/>
        <path d="M40 26H62" stroke="#8a6b42" strokeWidth="3"/>
        <path d="M44 18H58L54 26Q64 32 58 40H40Q34 32 44 26Z" fill="#e0b87e" stroke="#a5764a" strokeWidth="2.2"/>
        <path d="M22 58V50M36 58V50M76 58V50M88 58V52" stroke="#a5764a" strokeWidth="3.4" strokeLinecap="round"/>
      </>;
      case "bag-ground": return <>
        <path d="M34 24H62L56 34Q74 46 66 58H30Q22 46 40 34Z" fill="#e0b87e" stroke="#a5764a" strokeWidth="2.6"/>
        <path d="M34 24Q48 17 62 24" fill="none" stroke="#a5764a" strokeWidth="2.6"/>
        <path d="M12 62H88" stroke="#b39a66" strokeWidth="3" strokeLinecap="round"/>
      </>;
      case "paper-rack": return <>
        <path d="M26 64L44 14H56L74 64" fill="none" stroke="#8a6b42" strokeWidth="3.4" strokeLinecap="round"/>
        <rect x="34" y="18" width="32" height="38" rx="3" fill="#fbf3d8" stroke="#c9b183" strokeWidth="2.6"/>
        <path d="M40 28H60M40 36H60" stroke="#d9c69a" strokeWidth="2.2"/>
      </>;
      case "paper-water": return <>
        <path d="M10 26Q25 18 40 26T70 26T96 26" fill="none" stroke="#7db8c4" strokeWidth="3" strokeLinecap="round"/>
        <rect x="30" y="30" width="40" height="26" rx="3" fill="#fbf3d8" stroke="#c9b183" strokeWidth="2.4" opacity=".85" transform="rotate(-6 50 43)"/>
        <path d="M10 46Q25 38 40 46T70 46T96 46M10 60Q25 54 40 60T70 60T96 60" fill="none" stroke="#7db8c4" strokeWidth="2.6" strokeLinecap="round"/>
      </>;
      default: return null;
    }
  })();
  return <svg className="prop-art" viewBox="0 0 100 70" role="img" aria-label={label ?? icon}>{body}</svg>;
}

/* Slide-to-fit drag scenes; same pointer/arrow-key/keyboard model as the ruler alignment. */
const SLIDE_FIT_SCENES: Record<string, {
  aligned: string; misaligned: string; done: string;
  pieceRatio?: number;
  target: () => React.ReactNode; movable: () => React.ReactNode;
}> = {
  "wall-join": {
    aligned: "模型两端接上了", misaligned: "模型两端还没接上", done: "模型接好啦！", pieceRatio: 86/366*.9,
    target: () => <svg className="slide-art" viewBox="0 0 366 70" preserveAspectRatio="none">
      <path d="M4 26Q50 15 95 22T140 24V66H4Z" fill={earth} stroke={earthDark} strokeWidth="2.5"/>
      <path d="M226 24Q270 18 306 22T362 26V66H226Z" fill={earth} stroke={earthDark} strokeWidth="2.5"/>
      <path d="M140 24H226V66H140Z" fill="#e4f0dc" stroke="#63927a" strokeWidth="2" strokeDasharray="5 4"/>
      <path d="M5 44H139M227 44H361M35 26V44M78 44V65M105 25V44M250 24V44M295 44V65M329 26V44" stroke={earthDark} strokeWidth="1.8" opacity=".55"/>
    </svg>,
    movable: () => <svg className="slide-art" viewBox="0 0 86 70" preserveAspectRatio="none">
      <path d="M0 24Q21 19 43 22T86 24V66H0Z" fill="#a8c9b4" stroke="#5f9478" strokeWidth="3"/>
      <path d="M1 44H85M27 24V44M58 44V65" stroke="#4e7f68" strokeWidth="2" opacity=".55"/>
    </svg>,
  },
  "load-camel": {
    aligned: "粮袋驮好了", misaligned: "粮袋还没驮上", done: "粮袋驮好了！",
    target: () => <svg className="slide-art" viewBox="0 0 366 70" preserveAspectRatio="none">
      <path d="M70 62Q80 30 108 34Q122 12 150 30L236 34Q252 14 268 16L292 22L288 34L270 34Q276 48 272 62Z" fill="#d9b380" stroke="#a5764a" strokeWidth="3"/>
      <path d="M96 62V48M128 62V50M240 62V48M264 62V50" stroke="#a5764a" strokeWidth="5" strokeLinecap="round"/>
      <path d="M288 24L306 14L310 22L296 30" fill="#d9b380" stroke="#a5764a" strokeWidth="3" strokeLinejoin="round"/>
      <circle cx="307" cy="18" r="2" fill="#4b3a26"/>
      <path d="M150 30V20M236 34V22" stroke="#8a6b42" strokeWidth="4" strokeLinecap="round"/>
      <path d="M150 20H236" stroke="#8a6b42" strokeWidth="4" strokeLinecap="round"/>
    </svg>,
    movable: () => <svg className="slide-art" viewBox="0 0 96 70" preserveAspectRatio="none">
      <path d="M30 20H66L60 32Q84 46 74 62H22Q12 46 36 32Z" fill="#e0b87e" stroke="#a5764a" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M30 20Q48 12 66 20" fill="none" stroke="#a5764a" strokeWidth="3"/>
      <path d="M32 44H64" stroke="#c98d54" strokeWidth="2.4" opacity=".7"/>
    </svg>,
  },
  "dry-paper": {
    aligned: "纸页晾上了", misaligned: "纸页还没放上架", done: "纸页晾上了！",
    target: () => <svg className="slide-art" viewBox="0 0 366 70" preserveAspectRatio="none">
      <path d="M60 64L96 12H270L306 64" fill="none" stroke="#8a6b42" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M96 12H270" stroke="#8a6b42" strokeWidth="5" strokeLinecap="round"/>
      <path d="M120 64L150 26M246 64L216 26" stroke="#8a6b42" strokeWidth="3.4" strokeLinecap="round" opacity=".75"/>
      <path d="M170 22V18M196 22V18" stroke="#b98d5f" strokeWidth="3"/>
    </svg>,
    movable: () => <svg className="slide-art" viewBox="0 0 96 70" preserveAspectRatio="none">
      <rect x="16" y="8" width="64" height="52" rx="4" fill="#fbf3d8" stroke="#c9b183" strokeWidth="3"/>
      <path d="M24 20H72M24 30H72M24 40H66" stroke="#d9c69a" strokeWidth="2.6"/>
    </svg>,
  },
  "coin-mould": {
    aligned: "钱形卡片与钱范轮廓对齐", misaligned: "钱形卡片还没有对齐", done: "圆边和方孔对齐啦！", pieceRatio: 70/366*.9,
    target: () => <svg className="slide-art" viewBox="0 0 366 80" preserveAspectRatio="none">
      <rect x="4" y="5" width="358" height="70" rx="10" fill="#64776c" stroke="#40564c" strokeWidth="2.5"/>
      <path d="M9 40H357" stroke="#374f44" strokeWidth="5"/>
      {[65,183,301].map(x=><g key={x}><circle cx={x} cy="40" r="28" fill="#3f574b" stroke={x===183?'#ffda72':'#92aa94'} strokeWidth="2.4" strokeDasharray={x===183?'5 4':undefined}/><rect x={x-10} y="30" width="20" height="20" fill="#8a9984" stroke="#b4be9e" strokeWidth="1.8"/></g>)}
    </svg>,
    movable: () => <svg className="slide-art" viewBox="0 0 70 80" preserveAspectRatio="none">
      <path d="M35 12a28 28 0 1 1 0 56 28 28 0 1 1 0-56ZM25 30v20h20V30Z" fill="#e4c16c" fillRule="evenodd" stroke="#8b703c" strokeWidth="2.5"/>
      <path d="M14 34a22 22 0 0 1 18-16" fill="none" stroke="#fff1b4" strokeWidth="2" strokeLinecap="round"/>
    </svg>,
  },
  "string-coins": {
    aligned: "钱串上了", misaligned: "钱还没串上", done: "钱串上了！",
    target: () => <svg className="slide-art" viewBox="0 0 366 70" preserveAspectRatio="none">
      <path d="M6 35H360" stroke="#8a6b42" strokeWidth="3.6" strokeLinecap="round"/>
      <circle cx="70" cy="35" r="20" fill="#c5ad64" stroke="#8f7c46" strokeWidth="3"/><rect x="62" y="27" width="16" height="16" rx="2" fill="#fdf6e0" stroke="#8f7c46" strokeWidth="2"/>
      <circle cx="296" cy="35" r="20" fill="#c5ad64" stroke="#8f7c46" strokeWidth="3"/><rect x="288" y="27" width="16" height="16" rx="2" fill="#fdf6e0" stroke="#8f7c46" strokeWidth="2"/>
      <circle cx="183" cy="35" r="22" fill="none" stroke="#f8e6b0" strokeWidth="2" strokeDasharray="5 4"/>
    </svg>,
    movable: () => <svg className="slide-art" viewBox="0 0 96 70" preserveAspectRatio="none">
      <circle cx="48" cy="35" r="26" fill="#d5bb72" stroke="#8f7c46" strokeWidth="3"/>
      <rect x="38" y="25" width="20" height="20" rx="2.5" fill="#fdf6e0" stroke="#8f7c46" strokeWidth="2.4"/>
    </svg>,
  },
};

function SlideFit({ scene, hint, ariaLabel, onJudge, locked = false, practice = false }: {
  scene: string; hint: string; ariaLabel: string;
  onJudge?: (match:boolean)=>void; locked?:boolean; practice?:boolean;
}) {
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
  const config=SLIDE_FIT_SCENES[scene];
  if(!config)return <p className="alignment-hint">{hint}</p>;
  const pieceRatio=config.pieceRatio??.19;
  return <div className={`alignment-game slide-fit ${dragging?'dragging':''} ${offset===0?'aligned':''}`} data-slide-scene={scene}>
    <p className="alignment-hint">{hint}</p>
    <div className="alignment-track slide-track" ref={track}>
      <div className="alignment-origin" aria-hidden="true"/>
      <div className="alignment-target slide-target" aria-hidden="true">{config.target()}</div>
      <div className="alignment-movable slide-movable" role="slider" tabIndex={locked&&!practice?-1:0} aria-label={ariaLabel} aria-valuemin={-24} aria-valuemax={24} aria-valuenow={offset} aria-valuetext={offset===0?config.aligned:config.misaligned} aria-disabled={locked&&!practice}
        style={{width:`${pieceRatio*100}%`,left:`${config.pieceRatio===undefined?39.5:(1-pieceRatio)*50}%`,transform:`translateX(${offset/pieceRatio}%)`}} onPointerDown={start} onPointerMove={change} onPointerUp={end} onPointerCancel={()=>{drag.current=null;setDragging(false);}} onKeyDown={key}>
        {config.movable()}<span className="ruler-grip" aria-hidden="true">⋮⋮</span>
      </div>
    </div>
    <div className="alignment-controls"><button onClick={()=>nudge(-1)} disabled={locked&&!practice} aria-label="向左移动">←</button><span>{offset===0?config.done:'也可以点箭头挪一挪'}</span><button onClick={()=>nudge(1)} disabled={locked&&!practice} aria-label="向右移动">→</button></div>
  </div>;
}

function PickDemo({ picked, context }: { picked: Option | null; context?: string }) {
  const icon=picked?.objectView?.kind==='prop'?picked.objectView.icon:null;
  return <div className="bench-pick-demo">
    {context&&<div className="pick-context" aria-hidden="true"><PropArt icon={context}/></div>}
    <div className={`pick-object ${picked?'landed':'waiting'}`} aria-live="polite">
      {icon?<PropArt icon={icon} label={picked?.label}/>:<span className="pick-slot" aria-hidden="true">?</span>}
    </div>
  </div>;
}
function SceneCardArt({view,label,detail=false}:{view:ObjectView;label:string;detail?:boolean}) {
  const cropId=`scene-crop-${useId().replace(/:/g,'')}`;
  if(!view.image||!view.crop)return null;
  const crop=view.crop;
  return <svg className={detail?'workbench-art selected-scene-detail':'scene-card-art'} viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`} role="img" aria-label={label}><defs><clipPath id={cropId}><rect x={crop.x} y={crop.y} width={crop.width} height={crop.height}/></clipPath></defs><image href={view.image} width={crop.sourceWidth} height={crop.sourceHeight} clipPath={`url(#${cropId})`}/></svg>;
}
function EraMarker({view}:{view:ObjectView}) {
  if(!view.marker)return view.stationImage?<Image src={view.stationImage} alt="" width={105} height={110} unoptimized/>:null;
  return <svg className="era-marker" viewBox="0 0 100 100" role="img" aria-label={view.marker==='coin'?'圆形方孔钱币学习符号':'年号的日历学习符号'}>
    <rect x="3" y="3" width="94" height="94" rx="22" fill="#f3e8ca"/>
    {view.marker==='coin'?<><path d="M50 13a37 37 0 1 1 0 74 37 37 0 1 1 0-74ZM39 39v22h22V39Z" fill="#c9a756" fillRule="evenodd" stroke="#806735" strokeWidth="3"/><circle cx="50" cy="50" r="31" fill="none" stroke="#e7cf85" strokeWidth="2"/></>:<><rect x="15" y="23" width="70" height="61" rx="7" fill="#fff9e8" stroke="#816f4b" strokeWidth="3"/><path d="M18 38H82V26H18Z" fill="#c4674f"/><path d="M31 16V30M69 16V30" stroke="#596f62" strokeWidth="6" strokeLinecap="round"/><path d="M27 51H73M27 65H73M42 45V77M58 45V77" stroke="#b9ad8f" strokeWidth="2"/></>}
  </svg>;
}

export function WorkbenchChoiceArt({ option }: { option: Pick<Option,"label"|"objectView"> }) {
  const view=option.objectView;
  if(view?.kind==='polity-panel')return <PolityDiagram index={view.windowIndex??0}/>;
  if(view?.kind==='printing-panel')return <PrintingDiagram connected={view.connected}/>;
  if(view?.kind==='circle-model')return <CircleDiagram sides={view.sides??6} label={option.label} className="circle-option"/>;
  if(view?.kind==='scene-card')return <SceneCardArt view={view} label={option.label}/>;
  if(view?.kind==='ruler-pair')return <RulerPair match={Boolean(view.match)}/>;
  if(view?.kind==='ruler')return <div className="tool-illustration ruler-tool"><WoodenRuler/></div>;
  if(view?.kind==='weight')return <div className="tool-illustration"><LearningWeight/></div>;
  if(view?.kind==='prop')return <div className="tool-illustration prop-tool"><PropArt icon={view.icon??''} label={option.label}/></div>;
  if(view?.kind==='era')return <div className={`era-object ${(view.name?.length??0)>4?'era-name-long':''}`}><EraMarker view={view}/><strong>{view.name}</strong><span>{view.date}</span></div>;
  return null;
}
export function ObjectWorkbench({step,seed,presentation,photoAlbum,periodLabel,solved,isLast,speak,listen,onSolved,onNext,onInspect,onNarrationChange}:Props){
  const [picked,setPicked]=useState<Option|null>(null), [tried,setTried]=useState(false);
  const [refineVoice,setRefineVoice]=useState<Voice|null>(null);
  const [roundIndex,setRoundIndex]=useState(0), [sceneResult,setSceneResult]=useState<{id:string;correct:boolean}|null>(null);
  const options=listenOptions(step.options,seed), kind=step.interaction?.kind;
  const sceneFind=kind==='scene-find',rounds=step.interaction?.rounds??[],round=rounds[roundIndex];
  const geometryChoice=kind==='pick'&&options.some(option=>option.objectView?.kind==='circle-model');
  const circleRefine=kind==='circle-refine',historyLab=kind==='history-lab';
  const runLab=(stage:LabStage,complete:boolean)=>{setRefineVoice(stage.audio);if(complete)onSolved();onNarrationChange?.([stage.audio.id]);void speak([stage.audio.id]);};
  const sceneChoice=kind==='pick'&&options.some(option=>['scene-card','circle-model','polity-panel','printing-panel'].includes(option.objectView?.kind??''));
  const refineCircle=(sides:number)=>{const stage=step.interaction?.refinements?.find(r=>r.sides===sides);if(!stage)return;setRefineVoice(stage.audio);if(sides===24)onSolved();onNarrationChange?.([stage.audio.id]);void speak([stage.audio.id]);};
  const chooseSpot=(id:string)=>{
    if(!round||solved||sceneResult?.correct)return;
    const correct=id===round.targetId;setSceneResult({id,correct});
    if(correct&&roundIndex===rounds.length-1)onSolved();
    const ids=[correct?round.audio.right.id:round.audio.wrong.id];onNarrationChange?.(ids);void speak(ids);
  };
  const nextSceneRound=()=>{
    const next=rounds[roundIndex+1];if(!sceneResult?.correct||!next)return;
    setRoundIndex(roundIndex+1);setSceneResult(null);onNarrationChange?.([next.audio.question.id]);void speak([next.audio.question.id]);
  };
  const choose=(option:Option)=>{
    if(solved)return;
    setPicked(option);setTried(true);
    onNarrationChange?.([option.correct?step.audio.right.id:step.audio.wrong.id]);
    if(option.correct){onSolved();void speak([step.audio.right.id]);}else void speak([step.audio.wrong.id]);
  };
  const judge=(match:boolean)=>{const option=step.options.find(o=>o.correct===match);if(option)choose(option);};
  const sequence=stepVoiceIds(step);
  const episode=step.narrative,trip=presentation.story;
  const lookListen=kind==='look-listen';
  const chosenScene=sceneChoice&&picked?.objectView?.kind==='scene-card'?picked.objectView:null;
  const sceneImage=chosenScene?.image??(episode?.scene==='detail'?step.image:trip&&episode?.scene==='reunion'?trip.reunionImage:presentation.sceneImage);
  const sceneAlt=chosenScene?.imageAlt??(episode?.scene==='detail'?step.imageAlt:trip&&episode?.scene==='reunion'?trip.reunionAlt:presentation.sceneAlt);
  const bubbleVoices=(circleRefine||historyLab)&&refineVoice?[refineVoice.id]:sceneFind&&round?[sceneResult?(sceneResult.correct?round.audio.right.id:round.audio.wrong.id):round.audio.question.id]:episode&&solved?[step.audio.right.id]:episode&&tried&&!lookListen?[step.audio.wrong.id]:sequence;
  const spokenQuestion=sceneFind&&round?(sceneResult?(sceneResult.correct?round.feedback:round.retry):round.question):lookListen?step.title:episode?(solved?episode.response:tried?episode.retry:step.prompt):step.prompt;
  return <section style={{"--story-aspect":step.interaction?.sceneAspectRatio??presentation.sceneAspectRatio} as CSSProperties} className={`object-quest ${episode?"trip-episode":""} ${sceneChoice?'scene-choice':''}`} data-scene-framing={presentation.sceneFraming} data-story-scene={episode?.scene} data-step-id={step.id} data-interaction-kind={kind} data-image-label={step.interaction?.imageLabel} data-voice-id={sequence.join(',')} data-round-id={sceneFind?round?.id:undefined} data-question-voice-id={sceneFind?round?.audio.question.id:undefined}>
    <div className="workbench-scene-column">
      {historyLab&&step.interaction?.lab?<HistoryLab config={step.interaction.lab} locked={solved} onStage={runLab}/>:circleRefine?<CircleStudy locked={solved} onRefine={refineCircle}/>:sceneChoice&&picked?.objectView?.kind==='polity-panel'?<div className="workbench-scene"><PolityDiagram index={picked.objectView.windowIndex??0}/></div>:sceneChoice&&picked?.objectView?.kind==='printing-panel'?<div className="workbench-scene"><PrintingDiagram connected={picked.objectView.connected}/></div>:geometryChoice&&picked?.objectView?.kind==='circle-model'?<div className="workbench-scene"><CircleDiagram sides={picked.objectView.sides??6} label={picked.label} className="geometry-selection"/><span className="story-art-label">数学学习图</span></div>:(kind==='timeline'||lookListen)&&step.inspection&&step.inspection.placement!=='supporting'?<div className="quest-artifact-intro">
        <button className="quest-artifact-picture" data-image-framing={step.inspection.framing} onClick={onInspect} aria-label={step.inspection.label}><Image src={step.inspection.image} alt={step.inspection.title} width={1200} height={700} loading="eager" style={step.inspection.displayHeight?{height:step.inspection.displayHeight}:undefined} unoptimized/><span>{step.inspection.caption}</span></button>
        <h2>{step.inspection.title}</h2>
        {step.inspection.openAlbum&&photoAlbum&&<PhotoAlbumButton album={photoAlbum} onOpen={onInspect}/>}
        {step.concepts&&<div className="measure-concepts" aria-label="核心词语">{step.concepts.map(concept=><div key={concept.term}><strong>{concept.term}</strong><span>{concept.meaning}</span></div>)}</div>}
      </div>:kind==='timeline'?<div className="quest-date-map" aria-label={`时间从前到后：${step.options.map(o=>`${o.objectView?.name??o.label} ${o.objectView?.date??""}`).join("，")}`}>
        <p>{episode?.caption}</p><div className="quest-date-stops">{step.options.map(option=><div className={`quest-date-stop ${picked?.id===option.id&&option.correct?'arrived':''}`} key={option.id}>{option.objectView&&<EraMarker view={option.objectView}/>}<strong>{option.objectView?.name}</strong><span>{option.objectView?.date}</span></div>)}</div><span className="quest-date-direction">时间向前走 →</span>
      </div>:<div className="workbench-scene">
        <div className={sceneFind?'scene-find-canvas':undefined}>
        {chosenScene&&step.interaction?.selectionFraming==='detail'?<SceneCardArt view={chosenScene} label={picked?.label??sceneAlt} detail/>:step.interaction?.imageCrop?<SceneCardArt view={{kind:'scene-card',image:sceneImage,crop:step.interaction.imageCrop}} label={sceneAlt} detail/>:<Image className="workbench-art" src={sceneImage} alt={sceneAlt} width={1536} height={1024} loading="eager" unoptimized/>}
        {sceneFind&&<div className="scene-find-hotspots" role="group" aria-label={step.interaction?.ariaLabel??"点图里的线索回答问题"}>{step.interaction?.hotspots?.map(spot=>{const state=sceneResult?.id===spot.id?(sceneResult.correct?'right':'retry'):'';return <button key={spot.id} className={`scene-find-target ${state}`} style={{left:`${spot.x*100}%`,top:`${spot.y*100}%`,width:`${spot.width*100}%`,height:`${spot.height*100}%`}} aria-label={`选择${spot.label}`} data-hotspot-id={spot.id} aria-pressed={sceneResult?.id===spot.id} disabled={solved||sceneResult?.correct} onClick={()=>chooseSpot(spot.id)}>{state&&<span><b aria-hidden="true">{state==='right'?'✓':'×'}</b>{state==='right'?'找到了':'再试试'}</span>}</button>;})}</div>}
        </div>
        {!sceneFind&&<span className="story-art-label">{step.interaction?.imageLabel??"故事插画"}</span>}
        <div className={`bench-toys toys-${kind}`} aria-live="polite">
          {kind==='ruler-pairs'&&<RulerPair match={Boolean(picked?.correct)} cloth/>}
          {kind==='tool-pick'&&<div className="bench-tool-demo"><Cloth marks={solved}/>{picked?.objectView?.kind==='weight'?<div className="bench-weight"><LearningWeight/></div>:<div className={solved?'tool-landed':'tool-waiting'}><WoodenRuler/></div>}</div>}
          {kind==='align-rulers'&&<AlignRulers onJudge={judge} locked={solved} hint={presentation.alignHint}/>}
          {kind==='pick'&&!sceneChoice&&<PickDemo picked={picked} context={step.interaction?.context}/>}
          {kind==='slide-fit'&&step.interaction?.placement!=='panel'&&<SlideFit scene={step.interaction?.scene??''} hint={step.interaction?.hint??''} ariaLabel={step.interaction?.ariaLabel??step.interaction?.hint??'移动道具'} onJudge={judge} locked={solved}/>}
        </div>
      </div>}
      {sceneFind&&<p className="scene-find-label">{step.interaction?.imageLabel??"故事插画"}</p>}
      {step.inspection&&((kind!=='timeline'&&!lookListen)||step.inspection.placement==='supporting')&&<button className="real-object-link" onClick={onInspect}><Image src={step.inspection.image} alt={step.inspection.title} width={150} height={95} unoptimized/><span><small>真实材料 · 点开看一看</small><strong>{step.inspection.label}</strong></span><span className="object-magnify" aria-hidden="true">⌕</span></button>}
    </div>
    <div className="workbench-task">
      <p className="workbench-kicker">{periodLabel} · {step.title}</p>
      <div className={`workbench-question ${episode?"trip-speech":""}`} aria-live="polite"><div>{episode&&<span className="trip-speaker">{solved?episode.responseSpeaker:episode.speaker}</span>}<h1>{spokenQuestion}</h1></div><button className="workbench-sound" onClick={()=>{onNarrationChange?.(bubbleVoices);listen(bubbleVoices);}} aria-label={sceneFind?(sceneResult?'再听这句回应':'再听这个问题'):episode?(solved||tried?"再听这句回应":"再听这一幕"):"重听这个问题"}><SoundIcon/></button></div>
      {!episode&&<p className="workbench-story">{step.story.displayText}</p>}
      {lookListen&&episode&&<p className="workbench-story look-listen-story">{step.story.displayText}</p>}
      {sceneFind&&<div className="scene-find-progress"><span>找一找 · {roundIndex+1}/{rounds.length}</span><p>{step.interaction?.hint}</p></div>}
      {usesChoiceCards(kind)?<div className="workbench-choices" role="group" aria-label={step.prompt}>{options.map(option=><div key={option.id} className={`bench-choice ${picked?.id===option.id?(option.correct?'right':'try-again'):''}`}>
        <button className="bench-choice-action" data-option-id={option.id} onClick={()=>choose(option)} disabled={solved} aria-label={`选择${option.label}`} aria-pressed={picked?.id===option.id}><WorkbenchChoiceArt option={option}/><span>{option.objectView?.kind==='era'?'就去这一站':option.label}</span>{picked?.id===option.id&&<i><b aria-hidden="true">{option.correct?'✓':'×'}</b>{option.correct?'选对啦':'再试试'}</i>}</button>
        <button className="bench-option-sound" aria-label={`听${option.label}`} onClick={()=>listen([option.audio.id])}><SoundIcon/></button>
      </div>)}</div>:circleRefine?<p className="circle-study-caption">直边越分越细，慢慢贴近圆周。</p>:lookListen||sceneFind||historyLab?null:kind==='slide-fit'&&step.interaction?.placement==='panel'?<div className={`story-puzzle ${tried&&!solved?"puzzle-retry":solved?"puzzle-done":""}`}><SlideFit scene={step.interaction.scene??''} hint={step.interaction.hint} ariaLabel={step.interaction.ariaLabel??'移动模型'} onJudge={judge} locked={solved}/><small>{tried&&!solved?"× 再试试 · ":solved?"✓ ":""}{step.interaction.modelLabel??"接墙学习模型"}</small></div>:<div className="alignment-copy"><span aria-hidden="true">↔</span><p>{(kind==='slide-fit'?(step.interaction?.copy??step.interaction?.hint??''):'把青尺往黄尺的起点挪一挪。\n每一格都要对上。').split('\n').map((line,i,all)=><span key={i}>{line}{i<all.length-1&&<br/>}</span>)}</p></div>}
      {!lookListen&&(sceneFind||episode&&(solved||tried||(kind==='slide-fit'&&step.interaction?.placement==='panel'))?<div className="workbench-response-spacer" data-feedback={sceneFind?(sceneResult?.correct?'right':sceneResult?'wrong':'hint'):solved?'right':tried?'wrong':'hint'}/>:<div className={`workbench-response ${solved?'done':tried?'retry':''}`} role="status" data-feedback={solved?'right':tried?'wrong':'hint'}><span aria-hidden="true">{solved?'✓':tried?'×':'☝'}</span><p>{solved?step.rightNote:tried?step.wrongNote:step.interaction?.hint}</p></div>)}
      {sceneFind?<div className="scene-find-actions">{solved?<button className="workbench-next" onClick={onNext}>{episode?.nextLabel??presentation.nextLabel}<ArrowIcon/></button>:sceneResult?.correct&&<button className="workbench-next" onClick={nextSceneRound}>{round?.nextLabel??'再找一位'}<ArrowIcon/></button>}</div>:lookListen?<button className="workbench-next reading-next" onClick={onNext}>{step.interaction?.continueLabel??episode?.nextLabel??'继续走'}<ArrowIcon/></button>:solved?<button className="workbench-next" onClick={onNext}>{episode?.nextLabel??(isLast?presentation.lastLabel:presentation.nextLabel)}<ArrowIcon/></button>:<button className="workbench-help" onClick={()=>listen(kind==='align-rulers'||kind==='slide-fit'||sceneChoice||circleRefine||historyLab?bubbleVoices:[presentation.guideAudio.id])}><SoundIcon/>听听怎么玩</button>}
    </div>
  </section>;
}

export function WorkbenchFamily({presentation,children,onRefine}: {presentation:WorkbenchPresentation;children:React.ReactNode;onRefine?:(sides:number)=>void}){
  return <div className="workbench-family">{presentation.practice?.scene==='circle-refine'?<CircleStudy practice locked={false} onRefine={sides=>onRefine?.(sides)}/>:presentation.familyMode==='actions'?<div className="workbench-family-picture family-recall-scene"><Image src={presentation.sceneImage} alt={presentation.sceneAlt} width={1536} height={1024} unoptimized style={{aspectRatio:presentation.sceneAspectRatio??2.2,objectFit:'cover',objectPosition:'center top'}}/><span className="story-art-label">故事插画</span></div>:presentation.practice?<SlideFit practice scene={presentation.practice.scene} hint={presentation.familyHint} ariaLabel={presentation.familyHint}/>:<AlignRulers practice hint={presentation.familyHint}/>}{children}</div>;
}
