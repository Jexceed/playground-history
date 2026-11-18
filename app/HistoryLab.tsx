"use client";
import {useEffect,useRef,useState} from 'react';
import {LabPaints,LabBackdrop,useLabPaints} from './LabIllustration';
import {engineLinkage,labSnapshot,roofCapPosition, type HistoryLabKind} from './history-lab-model';
import {BridgeWaterDiagram,DujiangyanDiagram,WeavingDiagram,LampDiagram} from './ChinaHistoryDiagrams';
import './history-lab.css';
export type LabStage={label:string;narration:string;audio:{id:string;text:string}};
export type HistoryLabConfig={kind:HistoryLabKind;stages:LabStage[]};
export function PolityDiagram({index=0}:{index?:number}){
 const w=labSnapshot('polities',index).window,p=useLabPaints();
 return <svg className="history-lab-diagram" viewBox="0 0 540 300" role="img" aria-label={`${w.year}年，${w.names.join('、')}并立；关系图，不画疆界`}>
 <LabPaints id={p.id}/><LabBackdrop id={p.id}/>
 <rect x="185" y="21" width="170" height="46" rx="23" fill="#fafdf4" stroke="#c8d4b5"/><text x="270" y="52" textAnchor="middle" fill="#345f50" fontSize="26" fontWeight="700">{w.year} 年</text>
 <path d="M89 102H450" stroke="#b79e64" strokeWidth="3" strokeLinecap="round"/>
 {w.names.map((n,i)=><g key={n} transform={`translate(${26+i*170} 86)`} filter={p.paint('shadow')}>
 <rect x="2" y="14" width="146" height="171" rx="15" fill={['#f0cfab','#bcdcd0','#e2dcac'][i]} stroke={['#c79a69','#79a592','#bbb476'][i]} strokeWidth="1.5"/>
 <path d="M15 29H135M15 168H135" stroke="#fffefa" strokeWidth="2" opacity=".7"/>
 <rect x="49" y="0" width="53" height="19" rx="4" fill="#fdf4d3" stroke="#d5bd85"/>
 <text x="75" y="107" textAnchor="middle" fontSize="31" fontWeight="700" fontFamily="Songti SC,serif" fill="#34574b">{n}</text>
 <circle cx="75" cy="147" r="4" fill="#8ba187"/>
 </g>)}
 <text x="270" y="284" textAnchor="middle" fontSize="15" fill="#78816b">同一个年份，几家同时存在</text>
 </svg>;
}
export function PrintingDiagram({stage=0,connected=false}:{stage?:number;connected?:boolean}){
 const s=labSnapshot('printing',stage),p=useLabPaints();
 return <svg className="history-lab-diagram" viewBox="0 0 540 320" role="img" aria-label={connected?'一整块雕版，字在同一块版上':s.printed?'重排后印出的日月山':`分开的学习字块：${s.blocks.map(x=>x||'空位').join('、')}`}>
 <LabPaints id={p.id}/><LabBackdrop id={p.id}/>
 <text x="270" y="36" textAnchor="middle" fill="#4a6957" fontSize="19">{s.printed?'拿起纸，看看印出的字':connected?'字连在一整块版上':'一块一个字，留下两旁，只换中间'}</text>
 <ellipse cx="270" cy="265" rx="226" ry="16" fill="#896431" opacity=".12"/>
 {s.printed?<g filter={p.paint('shadow')}><path d="M46 94Q270 86 493 95L488 250Q270 241 47 252Z" fill="#fffdf4" stroke="#d2c4a2" strokeWidth="2"/><path d="M59 103Q267 96 481 103" fill="none" stroke="#ece4cf" strokeWidth="2"/></g>:<g filter={p.paint('shadow')}><rect x="49" y="108" width="443" height="151" rx="13" fill={p.paint('wood')} stroke="#9b6c3f" strokeWidth="2"/><rect x="62" y="116" width="416" height="126" rx="8" fill="#704f31"/><path d="M63 251H477" stroke="#f4d6a0" strokeWidth="3" opacity=".7"/></g>}
 {connected&&!s.printed&&<rect x="70" y="121" width="400" height="112" rx="8" fill={p.paint('wood')} stroke="#68452b" strokeWidth="2"/>}
 {s.blocks.map((v,i)=><g key={i} data-type-character={v||'empty'} transform={`translate(${76+(s.printed?i:2-i)*140} 127)`}>
 {!connected&&!s.printed&&<><rect y="4" width="109" height="106" rx="8" fill={v?'#8d5e36':'#9c825d'}/><rect width="109" height="103" rx="8" fill={v?p.paint('wood'):'#e9dfbd'} stroke={v?'#a97643':'#bfb18a'} strokeWidth="2" strokeDasharray={v?undefined:'5 5'}/>{v&&<path d="M12 9H95M9 13V89" stroke="#ffdf9d" strokeWidth="2" opacity=".6"/>}</>}
 <text x="55" y="75" textAnchor="middle" fontSize="62" fill="#37382c" fontFamily="Songti SC,serif" transform={s.printed?undefined:'translate(110 0) scale(-1 1)'}>{v}</text>
 </g>)}
 {stage===1&&!connected&&<g transform="translate(235 47)" filter={p.paint('shadow')}><rect width="70" height="57" rx="7" fill={p.paint('wood')} stroke="#99713e"/><text x="35" y="42" textAnchor="middle" fontFamily="Songti SC,serif" fontSize="39" fill="#37382c" transform="translate(70 0) scale(-1 1)">月</text></g>}
 <text x="270" y="298" textAnchor="middle" fill="#8a7856" fontSize="14">版上反着刻，纸上正着读 · 简化学具</text>
 </svg>;
}
function CompassDiagram({stage}:{stage:number}){
 const s=labSnapshot('compass',stage),p=useLabPaints();
 return <svg className="history-lab-diagram" viewBox="0 0 540 320" role="img" aria-label={`船转到${s.boatAngle}度，磁针仍指向南北。红端表示南。`}>
 <LabPaints id={p.id}/><LabBackdrop id={p.id} cool/>
 <path d="M0 78Q92 56 184 78T372 76T540 82V320H0Z" fill="#bce2df" opacity=".72"/>
 {[66,122,198,258].map((y,i)=><g key={y} stroke="#69b1ae" strokeWidth="2" opacity=".45" fill="none"><path d={`M${24+i*12} ${y}q22-7 44 0t44 0M398 ${y+14}q22-7 44 0t44 0`}/></g>)}
 <g><rect x="242" y="8" width="56" height="26" rx="13" fill="#fffdf5" stroke="#b9cfbe"/><text x="270" y="26" textAnchor="middle" fill="#355f53" fontSize="18" fontWeight="700">北</text></g>
 <g><rect x="242" y="286" width="56" height="26" rx="13" fill="#fffdf5" stroke="#dec0b0"/><text x="270" y="304" textAnchor="middle" fill="#b75d44" fontSize="18" fontWeight="700">南</text></g>
 <g transform={`rotate(${s.boatAngle} 270 161)`} data-boat-angle={s.boatAngle} filter={p.paint('shadow')}>
 <path d="M270 30Q292 44 304 62M270 30Q248 44 236 62" fill="none" stroke="#e9fbf9" strokeWidth="3" strokeLinecap="round" opacity=".8"/>
 <path d="M270 38Q336 74 340 198L312 276H228L200 198Q204 74 270 38Z" fill={p.paint('wood')} stroke="#7c5633" strokeWidth="3"/>
 <path d="M270 54Q320 86 323 192L301 256H239L217 192Q220 86 270 54Z" fill="#e8ca94" stroke="#ad834d" strokeWidth="2"/>
 <path d="M254 49L270 38L286 49Z" fill="#a87644" stroke="#7c5633" strokeWidth="1.5"/>
 {[84,108,132,190,214,236].map(y=><path key={y} d={`M223 ${y}H317`} stroke="#b58b55" strokeWidth="1.6"/>)}
 <rect x="239" y="232" width="62" height="24" rx="5" fill="#c7965c" stroke="#855d37" strokeWidth="2"/>
 <path d="M270 276V290" stroke="#6f4c2b" strokeWidth="4" strokeLinecap="round"/>
 </g>
 <circle cx="270" cy="161" r="45" fill={p.paint('gold')} stroke="#8c7243" strokeWidth="3" filter={p.paint('shadow')}/><circle cx="270" cy="161" r="38" fill="#fff7df" stroke="#d9c28f" strokeWidth="2"/>
 {Array.from({length:16},(_,i)=><path key={i} d="M270 125V130" transform={`rotate(${i*22.5} 270 161)`} stroke="#9d8b5e" strokeWidth={i%4===0?2:1}/>)}
 <g transform={`rotate(${s.needleAngle} 270 161)`} data-needle-angle={s.needleAngle}><path d="M270 130L260 161H280Z" fill="#c65d43" stroke="#a64735"/><path d="M260 161L270 192 280 161Z" fill="#568b7a" stroke="#386c60"/></g><circle cx="270" cy="161" r="5" fill="#edc775" stroke="#96703e"/>
 <text x="84" y="294" textAnchor="middle" fill="#45756c" fontSize="14">木船转了 {s.boatAngle}°</text><text x="444" y="294" textAnchor="middle" fill="#45756c" fontSize="14">红端仍指南</text>
 </svg>;
}
function RoofDiagram({stage,phase=stage}:{stage:number;phase?:number}){
 const r={...labSnapshot('roof',stage).roof,...roofCapPosition(phase)},p=useLabPaints(),lifted=stage===1;
 return <svg className="history-lab-diagram" viewBox="0 0 540 320" role="img" aria-label={lifted?'揭开学习模型里的小兽，露出用来固定脊瓦的钉':'小兽落在屋脊上，遮住固定处，也装饰了屋顶'}>
 <LabPaints id={p.id}/><LabBackdrop id={p.id}/>
 <path d="M26 85q24-24 48-7 20-37 49-5 28-11 43 12M375 44q19-18 34-8 18-27 44-3 25-8 45 12" fill="none" stroke="#fffdf4" strokeWidth="13" strokeLinecap="round" opacity=".8"/>
 <ellipse cx="273" cy="292" rx="232" ry="12" fill="#8e633c" opacity=".12"/>
 <g filter={p.paint('shadow')}>
 {/* Recognizable palace wall, painted beam & sloping glazed roof courses under the ridge */}
 <rect x="64" y="268" width="412" height="22" rx="3" fill="#b45342" stroke="#87392b" strokeWidth="2"/>
 <rect x="58" y="258" width="424" height="11" rx="2" fill="#4d7f73" stroke="#355d53" strokeWidth="1.5"/>
 <path d="M68 263H472" stroke="#dfca86" strokeWidth="2" strokeDasharray="14 8"/>
 <path d="M66 215H474L512 258H28Z" fill={p.paint('gold')} stroke="#ab762e" strokeWidth="2"/>
 {[46,88,130,172,214,256,298,340,382,424,466].map((x,i)=><g key={x}>
  <path d={`M${x+14} 226L${x} 256`} stroke="#b58234" strokeWidth="3.2"/>
  <path d={`M${x+22} 226L${x+10} 256`} stroke="#fff0b5" strokeWidth="2" opacity=".68"/>
  {i<10&&<circle cx={x+21} cy="258" r="6.5" fill="#d99f38" stroke="#966823" strokeWidth="1.5"/>}
 </g>)}
 <path d="M55 233Q65 215 89 215H451Q475 215 486 233Z" fill={p.paint('gold')} stroke="#9d722e" strokeWidth="2"/>
 {[108,162,216,325,379,433].map(x=><path key={x} d={`M${x} 216q-9 8-11 17`} fill="none" stroke="#b28032" strokeWidth="2"/>)}
 <path d="M89 219H447" stroke="#fff0b0" strokeWidth="3" opacity=".65"/>
 </g>
 <path d="M265 187H275V215H265Z" fill="#566f68"/><rect x="256" y="181" width="28" height="11" rx="4" fill="#78958a" stroke="#42625b"/>
 {lifted&&<><circle cx="270" cy="187" r="29" fill="none" stroke="#368d7a" strokeWidth="2" strokeDasharray="4 5"/><path d="M247 173L195 129H136" fill="none" stroke="#709981" strokeWidth="1.5"/><rect x="62" y="103" width="137" height="35" rx="17" fill="#fffdf7"/><text x="130" y="126" textAnchor="middle" fontSize="17" fill="#366755">固定脊瓦的钉</text></>}
 <g transform={`translate(${r.capX} ${r.capY})`} data-cap-x={r.capX} data-cap-bottom={r.capY+r.capHeight} className="roof-beast-piece">
 <ellipse cx="0" cy="74" rx="51" ry="7" fill="#7b592c" opacity=".12"/>
 <path d={lifted?'M-45 70V38Q-42 21-26 22H27Q43 22 45 38V70H16V43Q0 36-16 43V70Z':'M-45 70V38Q-42 21-26 22H27Q43 22 45 38V70Z'} fill={p.paint('gold')} stroke="#9d712d" strokeWidth="2"/>
 <path d="M-35 35Q0 23 35 35" fill="none" stroke="#fff0b0" strokeWidth="4" opacity=".75"/>
 <image href="/images/history-labs/roof-beast-glazed-v1.png" x="-70" y="-96" width="140" height="126" preserveAspectRatio="xMidYMax meet"/>
 </g>
 <text x="270" y="310" textAnchor="middle" fill="#7c704e" fontSize="14">{lifted?'把里面与外面放在一起看':'宫殿屋脊与琉璃瓦面 · 一种旧做法的学习模型'}</text>
 </svg>;
}
function EngineDiagram({stage,angle}:{stage:number;angle:number}){
 const e=engineLinkage(angle),moving=angle%180!==0,p=useLabPaints();
 const position=angle===0?'在右边':angle<180?'向左移动':angle===180?'在左边':angle<360?'向右移动':'回到右边';
 return <svg className="history-lab-diagram" viewBox="0 0 540 300" role="img" aria-label={`分步动力学具：活塞${position}，轮子转过${Math.round(e.angle)}度`}>
 <LabPaints id={p.id}/><LabBackdrop id={p.id} height={300}/><ellipse cx="275" cy="247" rx="228" ry="11" fill="#775430" opacity=".1"/>
 <text x="270" y="32" textAnchor="middle" fill="#406658" fontSize="22">蒸汽推活塞来回动 → 连杆带动飞轮转圈</text>
 {/* Recognizable boiler kettle & machine pedestals resting on the workshop base */}
 <g filter={p.paint('shadow')}>
  <rect x="40" y="168" width="76" height="69" rx="10" fill="#b97856" stroke="#855138" strokeWidth="2.5"/>
  <path d="M50 168Q78 144 106 168Z" fill="#789891" stroke="#53716b" strokeWidth="2.5"/>
  <rect x="62" y="204" width="32" height="22" rx="6" fill="#f7c566" stroke="#99612f" strokeWidth="2"/>
  <path d="M72 222q6-12 12 0" fill="#e06b3c"/>
  <rect x="226" y="202" width="22" height="35" rx="3" fill="#7c9289" stroke="#556b63" strokeWidth="2"/>
  <rect x="308" y="202" width="22" height="35" rx="3" fill="#7c9289" stroke="#556b63" strokeWidth="2"/>
  <path d="M382 237L395 162H405L418 237Z" fill="#7c9289" stroke="#556b63" strokeWidth="2"/>
 </g>
 <path d="M78 154V104Q78 80 108 80H277" fill="none" stroke="#6f9c95" strokeWidth="10" strokeLinecap="round"/><path d="M277 80H222V114" fill="none" stroke={stage===2?"#639f93":"#c4cdbf"} strokeWidth="8"/><path d="M277 80H334V114" fill="none" stroke={stage===1?"#639f93":"#c4cdbf"} strokeWidth="8"/><path d="M62 150q-12-10-4-20m34 20q10-11 2-20" fill="none" stroke="#a6c3bf" strokeWidth="3.5" strokeLinecap="round"/>
 <text x="78" y="196" textAnchor="middle" fill="#fff8e8" fontSize="15" fontWeight="700">蒸汽炉</text>
 <rect x="211" y="112" width="135" height="90" rx="9" fill="#edf5e9" stroke="#648478" strokeWidth="4"/>
 <rect x="342" y="145" width="10" height="24" rx="3" fill="#7c9289" stroke="#556b63" strokeWidth="2"/>
 {stage>0&&<rect x={stage===1?e.pistonX+7:216} y="117" width={stage===1?339-e.pistonX-7:e.pistonX-7-216} height="80" fill="#b9d9d0"/>}
 <g transform={`rotate(${e.angle} ${e.cx} ${e.cy})`} data-wheel-angle={e.angle}><circle cx={e.cx} cy={e.cy} r="67" fill={p.paint('gold')} stroke="#997641" strokeWidth="6" filter={p.paint('shadow')}/><circle cx={e.cx} cy={e.cy} r="57" fill="#f6eacb" stroke="#cfa45f" strokeWidth="3"/>{[0,60,120,180,240,300].map(a=><path key={a} d={`M${e.cx} ${e.cy}h62`} transform={`rotate(${a} ${e.cx} ${e.cy})`} stroke="#b08a4e" strokeWidth="7"/>)}<circle cx={e.cx+e.radius} cy={e.cy} r="7" fill="#b8503a"/></g>
 <path d={`M${e.pistonX} ${e.pistonY}L${e.crankX} ${e.crankY}`} fill="none" stroke="#9d7449" strokeWidth="8" strokeLinecap="round" data-connecting-rod="true"/>
 <rect x={e.pistonX-6} y="119" width="12" height="76" rx="3" fill={p.paint('teal')} data-piston-x={e.pistonX}/><circle cx={e.crankX} cy={e.crankY} r="7" fill="#536e5e"/><circle cx={e.cx} cy={e.cy} r="6" fill="#536e5e"/>
 <path d="M32 237H488" stroke="#987748" strokeWidth="8" strokeLinecap="round"/><text x="270" y="279" textAnchor="middle" fill="#687b65" fontSize="19">{moving?'看连杆怎样带动轮子':stage===0?'先看气缸里的活塞与飞轮怎样连着':stage===1?'活塞推到左边，轮子转了半圈':'活塞回到右边，轮子转完一整圈'}</text>
 </svg>;
}
export function HistoryLabDiagram({kind,stage=0,angle=stage*180}:{kind:HistoryLabKind;stage?:number;angle?:number}){
 if(kind==='bridge-water')return <BridgeWaterDiagram stage={stage}/>;
 if(kind==='weaving')return <WeavingDiagram stage={stage}/>;
 if(kind==='lamp')return <LampDiagram stage={stage}/>;
 if(kind==='water-split')return <DujiangyanDiagram stage={stage}/>;
 return kind==='polities'?<PolityDiagram index={stage}/>:kind==='printing'?<PrintingDiagram stage={stage}/>:kind==='compass'?<CompassDiagram stage={stage}/>:kind==='roof'?<RoofDiagram stage={stage} phase={angle/180}/>:<EngineDiagram stage={stage} angle={angle}/>;
}
const LAB_COPY:Record<HistoryLabKind,{initial:string;note:string}>={
 polities:{initial:'先听这三家的名字，再把年份往后看。',note:'同时存在的关系示意，不画疆界'},
 printing:{initial:'中间要换成月字，两旁的字留在原处。',note:'用三个简字体验重排，不复原毕昇原套泥活字'},
 compass:{initial:'看着南北方向，让船转一转。',note:'方向原理学具，不是宋代指南针实物'},
 roof:{initial:'先揭开模型里的小兽，找一找它遮住了什么。',note:'一种旧做法的剖面学习模型；不代表所有屋顶或今天太和殿的内部构造。'},
 engine:{initial:'观察活塞一来一回，轮子怎样继续转。',note:'分步运动学具，省略气门等结构，不复原瓦特整机'},
 'bridge-water':{initial:'水还低，先看大拱下面的水。',note:'过水关系示意，不模拟洪水流量或真实承载'},
 weaving:{initial:'每次穿一排，再看看邻排哪里不同。',note:'经纬交错学具，不是元代织机复原'},
 lamp:{initial:'先看开口，再观察光和烟的不同去处。',note:'功能学习模型，不对文物点火或操作'},
 'water-split':{initial:'先看江水遇到鱼嘴，怎样分成两路。',note:'分水与溢洪关系示意，不按真实河道比例测绘'}
};
export function useHistoryLab(config:HistoryLabConfig|undefined,locked:boolean,onStage:(stage:LabStage|null,complete:boolean)=>void){
 const [stage,setStage]=useState(0),[engineAngle,setEngineAngle]=useState(0),[busy,setBusy]=useState(false);
 const frame=useRef<number|null>(null),running=useRef(false);
 useEffect(()=>()=>{if(frame.current!==null)cancelAnimationFrame(frame.current);},[]);
 const advance=()=>{
  const action=config?.stages[stage];if(!config||!action||locked||running.current)return;
  running.current=true;setBusy(true);const next=stage+1;
  const finish=()=>{setStage(next);setBusy(false);running.current=false;onStage(action,labSnapshot(config.kind,next).complete);};
  const duration=config.kind==='engine'?800:config.kind==='roof'?1000:420;
  const start=performance.now(),from=stage*180,to=next*180;
  const tick=(time:number)=>{const progress=Math.min(1,(time-start)/duration);if(config.kind==='engine'||config.kind==='roof')setEngineAngle(from+(to-from)*progress);if(progress<1)frame.current=requestAnimationFrame(tick);else{frame.current=null;finish();}};
  frame.current=requestAnimationFrame(tick);
 };
 const selectStage=(next:number)=>{
  if(!config||running.current||(!locked&&!labSnapshot(config.kind,stage).complete))return;
  if(next<0||next>config.stages.length)return;
  setStage(next);setEngineAngle(next*180);
  onStage(next===0?null:config.stages[next-1],false);
 };
 return {stage,engineAngle,busy,advance,selectStage};
}
export type HistoryLabController=ReturnType<typeof useHistoryLab>;
export function HistoryLab({config,controller}:{config:HistoryLabConfig;controller:HistoryLabController}){
 const {stage,engineAngle,busy}=controller;
 return <div className="history-lab" data-lab-kind={config.kind} data-lab-stage={stage} data-lab-motion={busy?'running':'still'}>
 <HistoryLabDiagram kind={config.kind} stage={config.kind==='engine'&&busy?stage+1:stage} angle={engineAngle}/>
 <details className="history-lab-note"><summary>学习模型说明</summary><p>{LAB_COPY[config.kind].note}</p></details>
 </div>;
}
export function HistoryLabControls({config,controller,locked}:{config:HistoryLabConfig;controller:HistoryLabController;locked:boolean}){
 const {stage,busy,advance,selectStage}=controller,complete=locked||labSnapshot(config.kind,stage).complete,action=config.stages[stage];
 return <div className="history-lab-controls" data-lab-kind={config.kind}>
 <div className="history-lab-observation"><span>{complete?'点下面的阶段再比一比':'动手看一看'}</span><p className="history-lab-status" role="status">{stage===0?LAB_COPY[config.kind].initial:config.stages[stage-1].narration}</p></div>
 {complete ? <div className="history-lab-compare" role="group" aria-label="再比一比各个阶段">
   <button type="button" aria-pressed={stage===0} className={stage===0?'active':''} onClick={()=>selectStage(0)}>刚开始</button>
   {config.stages.map((s,i)=><button key={s.label} type="button" aria-pressed={stage===i+1} className={stage===i+1?'active':''} onClick={()=>selectStage(i+1)}>{s.label}</button>)}
 </div> : <>
   <div className="history-lab-trail" aria-label={`已经观察${stage}项，共${config.stages.length}项`}>{config.stages.map((s,i)=><i key={s.label} className={i<stage?'done':''} aria-hidden="true"/>)}</div>
   <button className="history-lab-action" disabled={locked||busy} onClick={advance}>{busy?'看看它怎样变……':action.label}<span aria-hidden="true">→</span></button>
 </>}
 </div>;
}
