"use client";
import {useEffect,useRef,useState} from 'react';
import {engineLinkage,labSnapshot, type HistoryLabKind} from './history-lab-model';
import './history-lab.css';
export type LabStage={label:string;narration:string;audio:{id:string;text:string}};
export type HistoryLabConfig={kind:HistoryLabKind;stages:LabStage[]};
export function PolityDiagram({index=0}:{index?:number}){
 const w=labSnapshot('polities',index).window;
 return <svg className="history-lab-diagram" viewBox="0 0 540 245" role="img" aria-label={`${w.year}年，${w.names.join('、')}并立；关系图，不画疆界`}>
 <rect width="540" height="245" rx="20" fill="#fff9e9"/><text x="270" y="36" textAnchor="middle" fill="#375c50" fontSize="29" fontWeight="bold">{w.year} 年 · 同时存在</text>
 {w.names.map((n,i)=><g key={n} transform={`translate(${15+i*176} 55)`}><rect width="158" height="162" rx="18" fill={i===2?'#d8e3b6':i===0?'#e9c9b5':'#beddd8'} stroke="#8e977f" strokeWidth="2"/><path d="M49 52V30H109V52M43 30L79 10 115 30Z" fill="#8a7860"/><text x="79" y="93" textAnchor="middle" fontSize="27" fontWeight="bold" fill="#344f44">{n}</text></g>)}
 </svg>;
}
export function PrintingDiagram({stage=0,connected=false}:{stage?:number;connected?:boolean}){
 const s=labSnapshot('printing',stage);
 return <svg className="history-lab-diagram" viewBox="0 0 540 260" role="img" aria-label={connected?'一整块雕版，字在同一块版上':s.printed?'重排后印出的日月山':`分开的学习字块：${s.blocks.map(x=>x||'空位').join('、')}`}>
 <rect width="540" height="260" rx="20" fill="#fff9e9"/>
 <text x="270" y="33" textAnchor="middle" fill="#426456" fontSize="22">{s.printed?'印到纸上啦':connected?'一整块版':'一块一个字，可以重排'}</text>
 {s.printed&&<rect x="62" y="60" width="416" height="135" rx="4" fill="#fffef8" stroke="#c9bc9e" strokeWidth="2"/>}
 {connected&&!s.printed&&<rect x="65" y="63" width="410" height="115" rx="12" fill="#b18c58" stroke="#76583b" strokeWidth="3"/>}
 {s.blocks.map((v,i)=><g key={i} transform={`translate(${75+i*140} 70)`}>{!connected&&!s.printed&&<rect width="110" height="105" rx="10" fill={v?'#caab77':'#fff6df'} stroke={v?'#896642':'#afaf97'} strokeWidth="3" strokeDasharray={v?undefined:'7 6'}/>}<text x="55" y="74" textAnchor="middle" fontSize="60" fill="#46382b" fontFamily="serif" transform={s.printed?undefined:'translate(110 0) scale(-1 1)'}>{v}</text></g>)}
 <text x="270" y="247" textAnchor="middle" fill="#847955" fontSize="15">现代简化学具 · 版上反字，纸上正字</text>
 </svg>;
}
function CompassDiagram({stage}:{stage:number}){
 const s=labSnapshot('compass',stage);
 return <svg className="history-lab-diagram" viewBox="0 0 540 300" role="img" aria-label={`船转到${s.boatAngle}度，磁针仍指向南北。红端表示南。`}>
 <rect width="540" height="300" rx="20" fill="#dcebe1"/>
 <g stroke="#bad6cf" fill="none" strokeWidth="3"><path d="M10 120q30-18 60 0t60 0M400 210q30-18 60 0t60 0M15 240q30-18 60 0t60 0"/></g>
 <text x="270" y="30" textAnchor="middle" fill="#3d6659" fontSize="24">北</text><text x="270" y="287" textAnchor="middle" fill="#9c4938" fontSize="24">南</text>
 <g transform={`rotate(${s.boatAngle} 270 153)`} data-boat-angle={s.boatAngle}><path d="M270 48Q316 78 320 180L294 230H246L220 180Q224 78 270 48Z" fill="#bd985d" stroke="#7f623d" strokeWidth="3"/><path d="M232 183H308M240 209H300" stroke="#8c704b" strokeWidth="3"/></g>
 <circle cx="270" cy="153" r="49" fill="#fdf5dc" stroke="#6c8978" strokeWidth="4"/><g transform={`rotate(${s.needleAngle} 270 153)`} data-needle-angle={s.needleAngle}><path d="M270 110L259 153H281Z" fill="#bd573e"/><path d="M259 153L270 196 281 153Z" fill="#417c70"/></g><circle cx="270" cy="153" r="5" fill="#755b3d"/>
 <text x="16" y="32" fill="#647d68" fontSize="17">船转了</text><text x="382" y="274" fill="#647d68" fontSize="17">针仍指南北</text>
 </svg>;
}
function RoofDiagram({stage}:{stage:number}){
 const r=labSnapshot('roof',stage).roof;
 return <svg className="history-lab-diagram" viewBox="0 0 540 300" role="img" aria-label={stage?'小兽罩住一个固定处，底座落在屋脊上':'屋脊的固定处与还没有盖上的小兽模型'}>
 <rect width="540" height="300" rx="20" fill="#fff9e9"/>
 <rect x="65" y="237" width="412" height="19" rx="3" fill="#ad8656"/><path d="M50 237Q67 214 93 215H447Q474 215 487 237Z" fill="#d7b469" stroke="#987039" strokeWidth="3"/>
 {[110,180,350,420].map(x=><path key={x} d={`M${x} 215q-12 10-12 22`} fill="none" stroke="#ae8544" strokeWidth="2"/>)}
 <path d="M265 194H275V245H265Z" fill="#748779"/><rect x="257" y="183" width="26" height="11" rx="4" fill="#596c60"/>
 <g transform={`translate(${r.capX} ${r.capY})`} data-cap-x={r.capX} data-cap-bottom={r.capY+r.capHeight}>
 <path d="M-43 70V35Q-40 21-26 22H27Q42 22 43 36V70H15V39H-15V70Z" fill="#dfb45f" stroke="#957032" strokeWidth="3"/>
 <path d="M-28 23Q-30 3-19-5L-20-31Q-27-48-15-54L0-42 14-46 25-36 13-22 10 5Q33-3 35-19Q49-2 34 16L25 24Z" fill="#e9c36d" stroke="#957032" strokeWidth="3" strokeLinejoin="round"/><circle cx="0" cy="-32" r="3" fill="#5c563a"/>
 </g>
 {!stage&&<><path d="M392 134H480" stroke="#b7aa82" strokeWidth="3"/><text x="184" y="131" fontSize="23" fill="#507065">固定处</text><path d="M253 143l16 30" fill="none" stroke="#73917c" strokeWidth="2"/></>}
 <text x="270" y="282" textAnchor="middle" fill="#6b7359" fontSize="19">{stage?'遮护固定处，也装饰屋脊':'看看小兽怎样像帽子一样盖上去'}</text>
 </svg>;
}
function EngineDiagram({stage,angle}:{stage:number;angle:number}){
 const e=engineLinkage(angle),moving=angle%180!==0;
 const position=angle===0?'在右边':angle<180?'向左移动':angle===180?'在左边':angle<360?'向右移动':'回到右边';
 return <svg className="history-lab-diagram" viewBox="0 0 540 300" role="img" aria-label={`分步动力学具：活塞${position}，轮子转过${Math.round(e.angle)}度`}>
 <rect width="540" height="300" rx="20" fill="#f5f0dd"/>
 <text x="262" y="32" textAnchor="middle" fill="#406658" fontSize="22">来回移动 → 带动转轮</text>
 <path d="M78 162V106Q78 80 108 80H277" fill="none" stroke="#6f9c95" strokeWidth="10" strokeLinecap="round"/><path d="M277 80H222V114" fill="none" stroke={stage===2?"#639f93":"#c4cdbf"} strokeWidth="8"/><path d="M277 80H334V114" fill="none" stroke={stage===1?"#639f93":"#c4cdbf"} strokeWidth="8"/><path d="M77 160q-20-12-10-25m27 16q-18-16-6-26" fill="none" stroke="#a6c3bf" strokeWidth="4"/>
 <text x="65" y="196" fill="#507b70" fontSize="21">蒸汽</text>
 <rect x="211" y="112" width="135" height="90" rx="9" fill="#fffdf2" stroke="#6d8877" strokeWidth="4"/>
 {stage>0&&<rect x={stage===1?e.pistonX+7:216} y="117" width={stage===1?339-e.pistonX-7:e.pistonX-7-216} height="80" fill="#b9d9d0"/>}
 <g transform={`rotate(${e.angle} ${e.cx} ${e.cy})`} data-wheel-angle={e.angle}><circle cx={e.cx} cy={e.cy} r="67" fill="#ead6ac" stroke="#997641" strokeWidth="8"/>{[0,60,120,180,240,300].map(a=><path key={a} d={`M${e.cx} ${e.cy}h62`} transform={`rotate(${a} ${e.cx} ${e.cy})`} stroke="#b08a4e" strokeWidth="7"/>)}<circle cx={e.cx+60} cy={e.cy} r="7" fill="#b8503a"/></g>
 <path d={`M${e.pistonX} ${e.pistonY}L${e.crankX} ${e.crankY}`} fill="none" stroke="#806347" strokeWidth="8" data-connecting-rod="true"/>
 <rect x={e.pistonX-6} y="119" width="12" height="76" rx="3" fill="#658d7e" data-piston-x={e.pistonX}/><circle cx={e.crankX} cy={e.crankY} r="7" fill="#536e5e"/><circle cx={e.cx} cy={e.cy} r="6" fill="#536e5e"/>
 <path d="M196 237H486" stroke="#987748" strokeWidth="8" strokeLinecap="round"/><text x="270" y="279" textAnchor="middle" fill="#687b65" fontSize="19">{moving?'看连杆怎样带动轮子':stage===0?'先看活塞与轮子怎样连着':stage===1?'活塞到另一边，轮子转了半圈':'活塞回来了，轮子继续转完一圈'}</text>
 </svg>;
}
const LAB_COPY:Record<HistoryLabKind,{initial:string;note:string}>={
 polities:{initial:'先听这三家的名字，再把年份往后看。',note:'同时存在的关系示意，不画疆界'},
 printing:{initial:'中间要换成月字，两旁的字留在原处。',note:'用三个简字体验重排，不复原毕昇原套泥活字'},
 compass:{initial:'看着南北方向，让船转一转。',note:'方向原理学具，不是宋代指南针实物'},
 roof:{initial:'小兽放在旁边，试着盖住这一个固定处。',note:'剖面学习模型：一种旧做法，不代表所有屋顶构造'},
 engine:{initial:'观察活塞一来一回，轮子怎样继续转。',note:'分步运动学具，省略气门等结构，不复原瓦特整机'}
};
export function HistoryLab({config,locked,onStage}:{config:HistoryLabConfig;locked:boolean;onStage:(stage:LabStage,complete:boolean)=>void}){
 const [stage,setStage]=useState(0),[engineAngle,setEngineAngle]=useState(0),[busy,setBusy]=useState(false);
 const frame=useRef<number|null>(null);
 useEffect(()=>()=>{if(frame.current!==null)cancelAnimationFrame(frame.current);},[]);
 const snap=labSnapshot(config.kind,stage),action=config.stages[stage];
 const advance=()=>{
  if(!action||locked||busy)return;const next=stage+1;
  const finish=()=>{setStage(next);setBusy(false);onStage(action,labSnapshot(config.kind,next).complete);};
  if(config.kind!=='engine'){finish();return;}
  setBusy(true);const start=performance.now(),from=stage*180,to=next*180;
  const tick=(time:number)=>{const p=Math.min(1,(time-start)/800);setEngineAngle(from+(to-from)*p);if(p<1)frame.current=requestAnimationFrame(tick);else{frame.current=null;finish();}};
  frame.current=requestAnimationFrame(tick);
 };
 return <div className="history-lab" data-lab-kind={config.kind} data-lab-stage={stage} data-lab-motion={busy?"running":"still"}>
 {config.kind==='polities'?<PolityDiagram index={stage}/>:config.kind==='printing'?<PrintingDiagram stage={stage}/>:config.kind==='compass'?<CompassDiagram stage={stage}/>:config.kind==='roof'?<RoofDiagram stage={stage}/>:<EngineDiagram stage={busy?stage+1:stage} angle={engineAngle}/>}
 <p className="history-lab-status" role="status">{stage===0?LAB_COPY[config.kind].initial:config.stages[stage-1].narration}</p>
 <button className="history-lab-action" disabled={locked||snap.complete||busy} onClick={advance}>{busy?'看看它怎样动……':action?.label??'观察完成'}</button>
 <small>{LAB_COPY[config.kind].note}</small>
 </div>;
}
