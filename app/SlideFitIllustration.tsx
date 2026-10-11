"use client";

import {useRef,useState,type KeyboardEvent,type PointerEvent} from 'react';
import {alignedRuler,clampRulerOffset,pointerRulerOffset} from './workbench-model';
import {LabPaints,useLabPaints} from './LabIllustration';
import {COIN_MOULD,SLIDE_BOARD,WALL_JOIN,WALL_PIECE_PATH,coinCardGeometry,coinOutlinePath,wallPieceBounds} from './slide-fit-model';
import './slide-fit-illustration.css';

export function isIllustratedSlide(scene:string){return scene==='wall-join'||scene==='coin-mould';}

/** Both the legacy workbench and the large illustrations use this one drag model. */
export function useSlideFit({onJudge,locked=false,practice=false}:{onJudge?:(match:boolean)=>void;locked?:boolean;practice?:boolean}){
 const initial=practice||locked?0:18;
 const [offset,setOffset]=useState(initial),[dragging,setDragging]=useState(false);
 const offsetRef=useRef(initial),track=useRef<HTMLDivElement>(null),drag=useRef<{x:number;offset:number;width:number}|null>(null);
 const disabled=locked&&!practice;
 const move=(value:number)=>{const next=clampRulerOffset(value);offsetRef.current=next;setOffset(next);return next;};
 const judge=(value:number,reportWrong=true)=>{if(alignedRuler(value)){move(0);onJudge?.(true);}else if(reportWrong)onJudge?.(false);};
 const start=(e:PointerEvent<Element>)=>{if(disabled)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,offset:offsetRef.current,width:track.current?.getBoundingClientRect().width??1};setDragging(true);};
 const change=(e:PointerEvent<Element>)=>{if(drag.current&&!disabled)move(pointerRulerOffset(drag.current.offset,e.clientX-drag.current.x,drag.current.width));};
 const cancel=()=>{drag.current=null;setDragging(false);};
 const end=()=>{if(!drag.current)return;cancel();if(!disabled)judge(offsetRef.current);};
 const key=(e:KeyboardEvent<Element>)=>{if(disabled)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();judge(move(offsetRef.current+(e.key==='ArrowLeft'?-3:3)),false);}else if(e.key==='Enter'||e.key===' '){e.preventDefault();judge(offsetRef.current);}};
 const nudge=(direction:number)=>{if(!disabled)judge(move(offsetRef.current+direction*3),false);};
 return {offset,dragging,disabled,track,start,change,end,cancel,key,nudge};
}
type SlideController=ReturnType<typeof useSlideFit>;

function SlidePaints({id}:{id:string}){
 return <>
  <LabPaints id={id}/>
  <defs>
   <linearGradient id={`${id}-earth`} x2="0" y2="1"><stop stopColor="#e6c283"/><stop offset=".48" stopColor="#c99b62"/><stop offset="1" stopColor="#a57449"/></linearGradient>
   <linearGradient id={`${id}-mould`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#c9c9b3"/><stop offset=".35" stopColor="#a7ad96"/><stop offset="1" stopColor="#7e8b77"/></linearGradient>
   <linearGradient id={`${id}-recess`} x2="0" y2="1"><stop stopColor="#46594c"/><stop offset=".24" stopColor="#637661"/><stop offset="1" stopColor="#93a086"/></linearGradient>
   <pattern id={`${id}-stone-grain`} width="37" height="31" patternUnits="userSpaceOnUse"><path d="m4 7 2-1m19 15 3 1m5-18 1 3" stroke="#344b3e" strokeWidth="1.2" opacity=".2"/><circle cx="12" cy="18" r="1" fill="#f7f3d8" opacity=".6"/><circle cx="32" cy="12" r="1.4" fill="#55634b" opacity=".18"/><path d="m9 29 4-2m7-22 4 2" stroke="#e6e6c9" strokeWidth="1" opacity=".5"/></pattern>
  </defs>
 </>;
}
function Backdrop({id,wall=false}:{id:string;wall?:boolean}){
 return <><rect width="600" height="360" rx="22" fill={`url(#${id}-paper)`}/><rect width="600" height="360" rx="22" fill={`url(#${id}-grain)`}/>
  {wall?<><path d="M0 158Q49 117 104 149T225 143T361 137T480 146T600 123V274H0Z" fill="#dbd9b9" opacity=".52"/><path d="M0 206Q103 164 220 193T403 188T600 171V310H0Z" fill="#c8ceaa" opacity=".37"/><path d="M0 282Q149 258 297 283T600 265V360H0Z" fill="#e4d1a4" opacity=".45"/></>:<><path d="M16 318H584M42 342H562" stroke="#d8c49a" strokeWidth="1.5" opacity=".5"/><path d="M28 304Q113 293 214 306T435 307T574 305" fill="none" stroke="#fff8df" strokeWidth="3" opacity=".8"/></>}
 </>;
}
function WallArt({id,offset,slider}:{id:string;offset:number;slider:React.ReactNode}){
 const joined=offset===0;
 return <>
  <defs>
   <clipPath id={`${id}-wall-piece`}><path d={WALL_PIECE_PATH}/></clipPath>
   <g id={`${id}-wall-scene`}>
    <image href="/images/history-labs/qin-wall-mountain-scene-v2.png" width="600" height="360" preserveAspectRatio="xMidYMid meet"/>
   </g>
  </defs>
  <use href={`#${id}-wall-scene`}/>
  {!joined&&<>
   <image href="/images/history-labs/qin-wall-mountain-gap-v2.png" width="600" height="360" preserveAspectRatio="xMidYMid meet" clipPath={`url(#${id}-wall-piece)`}/>
   <path d={WALL_PIECE_PATH} fill="none" stroke="#f8f8db" strokeWidth="4" strokeDasharray="6 5" strokeLinejoin="round"/>
   <path d={WALL_PIECE_PATH} fill="none" stroke="#397e61" strokeWidth="2" strokeDasharray="6 5" strokeLinejoin="round"/>
  </>}
  {slider}
 </>;
}
function MouldArt({id,slider}:{id:string;slider:React.ReactNode}){
 const c=COIN_MOULD;
 return <>
  <text className="slide-illustration-title" x="300" y="46" textAnchor="middle">把圆边和方孔一起对上</text>
  <ellipse cx="300" cy="302" rx="271" ry="13" fill="#715c39" opacity=".15"/>
  <path d="M29 125H573V285Q573 300 557 303H46Q28 303 26 286V140Z" fill="#70816e" stroke="#667663" strokeWidth="2"/>
  <path d="M45 112H555Q573 114 574 132V275Q574 290 555 290H46Q27 290 26 274V132Q27 114 45 112Z" fill={`url(#${id}-mould)`} stroke="#818d74" strokeWidth="2"/>
  <path d="M45 118H549Q565 119 568 131M33 138V274" fill="none" stroke="#e3e3c9" strokeWidth="2" opacity=".65"/>
  <rect x="28" y="115" width="545" height="173" rx="16" fill={`url(#${id}-stone-grain)`}/>
  <path d="M45 271H553M47 269H551" stroke="#495f4d" strokeWidth="9" strokeLinecap="round"/>
  <path d="M45 274H553" stroke="#c4cbb0" strokeWidth="2" strokeLinecap="round"/>
  {[134,300,466].map(cx=><g key={cx}>
   <path d={`M${cx} 270V252`} stroke="#495f4d" strokeWidth="8"/><path d={`M${cx+3} 269V251`} stroke="#c3cbb0" strokeWidth="1.5"/>
   <path d={coinOutlinePath(cx,c.centerY,c.radius,c.hole)} fill={`url(#${id}-recess)`} fillRule="evenodd" stroke="#546952" strokeWidth="2"/>
   <path d={`M${cx-47} ${c.centerY+4}a47 47 0 0 0 94 0`} fill="none" stroke="#d1d6b9" strokeWidth="2" opacity=".7"/>
   <rect x={cx-c.hole/2} y={c.centerY-c.hole/2} width={c.hole} height={c.hole} fill={`url(#${id}-mould)`} stroke="#d3d8bb" strokeWidth="2"/>
   <path d={`M${cx-14} 189H${cx+14}M${cx-15} 191V218`} fill="none" stroke="#eef0d6" strokeWidth="2" opacity=".65"/>
  </g>)}
  <circle cx={c.centerX} cy={c.centerY} r={c.radius+4} fill="none" stroke="#f3de8d" strokeWidth="3" strokeDasharray="6 5"/>
  <rect x={c.centerX-c.hole/2} y={c.centerY-c.hole/2} width={c.hole} height={c.hole} fill="none" stroke="#f3de8d" strokeWidth="2.5" strokeDasharray="4 3"/>
  <text x="117" y="89" textAnchor="middle" fill="#66745b" fontSize="17">石质钱范学习图</text><path d="M121 95V105" stroke="#8d9a7b" strokeWidth="1.5"/>
  {slider}
  <path d="M204 280V318H171" fill="none" stroke="#82906f" strokeWidth="1.5"/><text x="164" y="329" textAnchor="end" fontSize="15" fill="#6d795c">相连的凹槽</text>
  <text x="398" y="330" textAnchor="middle" fontSize="15" fill="#82764f">移动的是比形卡片</text>
 </>;
}

export function SlideFitIllustration({scene,ariaLabel,controller,modelLabel}:{scene:string;ariaLabel:string;controller:SlideController;modelLabel?:string}){
 const p=useLabPaints(),wall=scene==='wall-join',c=COIN_MOULD;
 const {offset,dragging,disabled,track:trackRef,start,change,end,cancel,key}=controller;
 const joined=offset===0;
 const card=coinCardGeometry(offset),wallBounds=wallPieceBounds(offset);
 const slider=<g className="slide-illustration-movable" role="slider" tabIndex={disabled?-1:0} aria-label={ariaLabel} aria-valuemin={-24} aria-valuemax={24} aria-valuenow={offset} aria-valuetext={joined?(wall?'模型两端接上了':'钱形卡片与钱范轮廓对齐'):(wall?'模型两端还没接上':'钱形卡片还没有对齐')} aria-disabled={disabled} data-piece-left={wall?wallBounds.left:card.centerX-card.radius} data-piece-right={wall?wallBounds.right:card.centerX+card.radius} onPointerDown={start} onPointerMove={change} onPointerUp={end} onPointerCancel={cancel} onLostPointerCapture={cancel} onKeyDown={key} transform={wall?`translate(${wallBounds.left-WALL_JOIN.gapLeft} ${wallBounds.top-WALL_JOIN.top})`:undefined}>
  {wall?<>
   {!joined&&<>
    <use href={`#${p.id}-wall-scene`} clipPath={`url(#${p.id}-wall-piece)`} filter={p.paint('shadow')}/>
    <path d={WALL_PIECE_PATH} fill="none" stroke="#f8f8db" strokeWidth="5" strokeLinejoin="round"/>
    <path d={WALL_PIECE_PATH} fill="none" stroke="#397e61" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M282 217H318M287 212L282 217L287 222M313 212L318 217L313 222" fill="none" stroke="#fffce8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M282 217H318M287 212L282 217L287 222M313 212L318 217L313 222" fill="none" stroke="#397e61" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
   </>}
   <path className="slide-focus-ring" d={WALL_PIECE_PATH}/>
   <path d={WALL_PIECE_PATH} fill="transparent"/>
  </>:<>
   <rect className="slide-focus-ring" x={card.centerX-c.radius-8} y={c.centerY-c.radius-8} width={(c.radius+8)*2} height={(c.radius+8)*2} rx="60"/>
   <path d={coinOutlinePath(card.centerX,c.centerY+4,c.radius,c.hole)} fill="#8b6b38" fillRule="evenodd" stroke="#77592e" strokeWidth="2" opacity=".55"/>
   <path d={coinOutlinePath(card.centerX,c.centerY,c.radius,c.hole)} fill={p.paint('gold')} fillRule="evenodd" stroke="#927038" strokeWidth="2.5"/>
   <circle cx={card.centerX} cy={c.centerY} r={c.radius-6} fill="none" stroke="#f8df99" strokeWidth="2"/>
   <rect x={card.centerX-c.hole/2-3} y={c.centerY-c.hole/2-3} width={c.hole+6} height={c.hole+6} fill="none" stroke="#edcc78" strokeWidth="2"/>
   <path d={`M${card.centerX-40} 194a42 42 0 0 1 33-31`} fill="none" stroke="#fff0b3" strokeWidth="3" strokeLinecap="round" opacity=".85"/>
   {[[-31,6],[-30,15],[30,-4],[31,6]].map(([x,y],i)=><circle key={i} cx={card.centerX+x} cy={c.centerY+y} r="1.1" fill="#8b773f" opacity=".3"/>)}
   <circle cx={card.centerX} cy={c.centerY} r={c.radius+10} fill="transparent"/>
  </>}
 </g>;
 return <div className={`slide-illustration ${dragging?'dragging':''} ${joined?'aligned':''}`} data-slide-scene={scene} data-slide-offset={offset}>
  <div className="slide-illustration-board" ref={trackRef}>
   <svg viewBox={`0 0 ${SLIDE_BOARD.width} ${SLIDE_BOARD.height}`} aria-label={wall?'沿山地延伸的土石城墙接墙学习模型，带绿色边线的墙段可以移动':'石质钱范轮廓与圆形方孔卡片学习模型'}>
    <SlidePaints id={p.id}/><Backdrop id={p.id} wall={wall}/>
    {wall?<WallArt id={p.id} offset={offset} slider={slider}/>:<MouldArt id={p.id} slider={slider}/>}
   </svg>
  </div>
  <p className="slide-illustration-boundary">{modelLabel??(wall?'接墙学习模型 · 古人逐步修墙，不是搬动整块墙':'钱范学习图 · 不是铸钱现场')}</p>
 </div>;
}

export function SlideFitControls({scene,hint,controller,tried=false}:{scene:string;hint:string;controller:SlideController;tried?:boolean}){
 const s=controller,joined=s.offset===0;
 return <div className={`slide-illustration-controls ${tried&&!joined?'retry':''} ${joined?'done':''}`}>
  <p>{hint}</p>
  <div className="slide-illustration-arrows"><button onClick={()=>s.nudge(-1)} disabled={s.disabled} aria-label="向左移动"><span aria-hidden="true">←</span></button><span aria-live="polite">{joined?`✓ ${scene==='wall-join'?'两端接好啦':'圆边和方孔对齐啦'}`:tried?'× 还没对上，再挪一挪':'也可以点箭头挪一挪'}</span><button onClick={()=>s.nudge(1)} disabled={s.disabled} aria-label="向右移动"><span aria-hidden="true">→</span></button></div>
 </div>;
}
