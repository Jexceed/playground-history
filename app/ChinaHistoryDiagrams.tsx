import {BRIDGE_ART,BRIDGE_OPENINGS,bridgeWaterSnapshot,weavingCrossings} from './history-lab-model';
import {LabPaints,LabBackdrop,useLabPaints} from './LabIllustration';

const BRIDGE_IMAGE='/images/history-labs/zhaozhou-bridge-study-v2.png';
export function BridgeWaterDiagram({stage}:{stage:number}){
 const s=bridgeWaterSnapshot(stage),p=useLabPaints(),scale=BRIDGE_ART.width/BRIDGE_ART.sourceWidth;
 const waterY=BRIDGE_ART.y+s.waterY*scale,clipId=`${p.id}-bridge-openings`;
 return <svg className="history-lab-diagram bridge-water-diagram" viewBox="0 0 540 320" role="img" aria-label={stage===0?'低水位，水从中央大拱下流过':'高水位，水也能从两侧小拱流过'}>
  <LabPaints id={p.id}/>
  <defs>
   <linearGradient id={`${p.id}-river`} x2="0" y2="1"><stop stopColor="#a9d8d4"/><stop offset=".55" stopColor="#76b6b2"/><stop offset="1" stopColor="#528f91"/></linearGradient>
   <linearGradient id={`${p.id}-submerged`} x2="0" y2="1"><stop stopColor="#91cac7" stopOpacity=".12"/><stop offset="1" stopColor="#528f91" stopOpacity=".6"/></linearGradient>
   <clipPath id={`${p.id}-scene`}><rect width="540" height="320" rx="22"/></clipPath>
   <clipPath id={clipId}>{BRIDGE_OPENINGS.map(o=><path key={o.id} d={o.path}/>)}</clipPath>
  </defs>
  <g clipPath={`url(#${p.id}-scene)`}>
   <LabBackdrop id={p.id} cool/>
   <path d="M0 127Q47 98 101 120T218 115Q281 93 337 115T457 108Q505 104 540 116V226H0Z" fill="#cadaca"/>
   <path d="M0 164Q52 133 105 158T231 152Q318 137 398 153T540 143V239H0Z" fill="#b1cbb9" opacity=".65"/>
   <g fill="#8aaa91" opacity=".45"><path d="M0 164Q-3 135 20 130Q8 108 28 104Q49 91 57 120Q81 116 75 142Q92 157 70 173Z"/><path d="M465 163Q455 140 474 133Q467 114 488 109Q511 102 518 125Q541 123 540 153V183Z"/></g>
   <path d="M0 207Q53 191 112 210Q162 216 192 231L101 270H0ZM540 204Q488 190 431 214L374 238 453 271H540Z" fill="#c2c3a1"/>
   <rect className="bridge-water-level" x="0" y={waterY} width="540" height={320-waterY} fill={p.paint('river')} data-water-y={s.waterY}/>
   <g stroke="#e2f4e5" strokeWidth="1.5" fill="none" opacity=".55"><path d="M46 266q32-6 63-1m57 16q30-6 59-1m62-18q35-5 71 1m57 14q27-5 54-1M117 303q29-5 58-1m166-7q27-4 50 1"/></g>
   <g transform={`translate(${BRIDGE_ART.x} ${BRIDGE_ART.y}) scale(${scale})`}>
    {/* Aperture paths and water thresholds use the same source-image coordinates. */}
    <g clipPath={`url(#${clipId})`} fill="none" stroke="#edfff4" strokeWidth="7" strokeLinecap="round">
     {s.showPaths&&BRIDGE_OPENINGS.filter(o=>s.flowing.includes(o.id)).map(o=>{
      const [cx,y,width]=o.ripple,half=width/2;
      return <path key={o.id} data-flow-opening={o.id} d={`M${cx-half} ${y}q${half/2} -7 ${half} 0t${half} 0`}/>;
     })}
    </g>
    <image href={BRIDGE_IMAGE} width={BRIDGE_ART.sourceWidth} height={BRIDGE_ART.sourceHeight}/>
   </g>
   {/* A light foreground wash shows the submerged masonry without hiding its shape. */}
   <rect className="bridge-water-level" x="0" y={waterY} width="540" height={320-waterY} fill={p.paint('submerged')} pointerEvents="none"/>
   <g fill="#9bb08b"><path d="M0 256Q18 239 44 250L73 282Q37 273 0 290Z"/><path d="M540 254Q520 237 495 253L477 285Q512 270 540 291Z"/></g>
   <g stroke="#6f9277" strokeWidth="1.8" strokeLinecap="round" fill="none"><path d="M18 265l-3-24m4 25 10-21m-9 21-14-13M521 265l6-26m-7 26-10-18m11 19 14-14"/></g>
   <g fill="#e1d8b6"><ellipse cx="44" cy="273" rx="12" ry="5"/><ellipse cx="504" cy="277" rx="10" ry="4"/></g>
   <rect x="99" y="287" width="342" height="28" rx="14" fill="#f6faf0" fillOpacity=".9"/>
   <text x="270" y="306" textAnchor="middle" fill="#4f7568" fontSize="14">桥面通人车，桥洞留水路</text>
  </g>
  <text x="270" y="31" textAnchor="middle" fill="#315e55" fontSize="19">{stage===0?'水低的时候，先看大拱':'水涨到这里，小拱也能过水'}</text>
 </svg>;
}

export function WeavingDiagram({stage}:{stage:number}){
 const points=weavingCrossings(stage),p=useLabPaints();
 return <svg className="history-lab-diagram" viewBox="0 0 540 320" role="img" aria-label={`已经织入${stage}排纬线，邻排交错方向相反`}>
  <LabPaints id={p.id}/><LabBackdrop id={p.id}/>
  <text x="270" y="32" textAnchor="middle" fontSize="19" fill="#3b6656">{stage===0?'把竖线固定好，横线从中间穿过':stage===1?'第一排，一上一下地穿过':'这一排，与上一排交错'}</text>
  <ellipse cx="272" cy="280" rx="160" ry="13" fill="#916b3d" opacity=".1"/>
  <g filter={p.paint('shadow')}><rect x="115" y="62" width="30" height="207" rx="8" fill={p.paint('wood')} stroke="#93683f" strokeWidth="2"/><rect x="395" y="62" width="30" height="207" rx="8" fill={p.paint('wood')} stroke="#93683f" strokeWidth="2"/><rect x="124" y="65" width="291" height="24" rx="7" fill={p.paint('wood')} stroke="#a97b45" strokeWidth="1.5"/><rect x="124" y="235" width="291" height="26" rx="7" fill={p.paint('wood')} stroke="#93683f" strokeWidth="1.5"/><path d="M124 94v137M403 94v137M148 71h239M148 241h239" stroke="#ffe0ac" strokeWidth="2" opacity=".5"/></g>
  {Array.from({length:6},(_,col)=><g key={col}><path d={`M${170+col*40} 78V247`} stroke="#765d37" opacity=".16" strokeWidth="14"/><path d={`M${170+col*40} 74V244`} stroke="#cf9f5b" strokeWidth="10"/><path d={`M${168+col*40} 76V243`} stroke="#f5d494" strokeWidth="2"/><path d={`M${173+col*40} 76V243`} stroke="#ad803c" strokeWidth="1"/></g>)}
  {Array.from({length:stage},(_,row)=><g key={row}><path d={`M143 ${130+row*35+2}H397`} stroke="#385b50" strokeWidth="13" opacity=".12"/><path d={`M143 ${130+row*35}H397`} stroke="#488e8d" strokeWidth="10" strokeLinecap="round"/><path d={`M145 ${128+row*35}H395`} stroke="#a6d7c5" strokeWidth="2"/></g>)}
  {points.filter(point=>!point.weftOnTop).map(point=><g key={`${point.row}-${point.column}`}><path d={`M${point.x} ${point.y-8}v16`} stroke="#cf9f5b" strokeWidth="10" data-weft-under={`${point.row}-${point.column}`}/><path d={`M${point.x-2} ${point.y-8}v16`} stroke="#f5d494" strokeWidth="2"/></g>)}
  <g transform="translate(440 177)" filter={p.paint('shadow')}><ellipse rx="31" ry="30" fill="#5b9997" stroke="#407b79" strokeWidth="2"/><path d="M-17-22q-16 23 0 45M-5-28q-16 28 0 56M7-27q-16 27 0 55M18-22q-15 23 0 45" fill="none" stroke="#acd2c4" strokeWidth="2"/><path d="M-28 8q-25 29-34 48" fill="none" stroke="#488e8d" strokeWidth="3"/></g>
  <path d="M49 209q24-14 55 0-24 24-55 0Z" fill={p.paint('wood')} stroke="#926b3f" strokeWidth="2"/><path d="M58 208H93" stroke="#527d73" strokeWidth="6" strokeLinecap="round"/>
  <text x="270" y="306" textAnchor="middle" fontSize="14" fill="#7b775b">一上一下，纱线慢慢织成布</text>
 </svg>;
}

export function LampDiagram({stage}:{stage:number}){
 const narrowed=stage>0,p=useLabPaints();
 return <svg className="history-lab-diagram" viewBox="0 0 540 320" role="img" aria-label={stage===0?'宫女造型与灯具连在一起，灯罩开口较宽':stage===1?'灯罩开口收小，光照范围变小':'袖管把部分烟尘导向空心灯体；是功能示意，仍需要清理'}>
  <LabPaints id={p.id}/><LabBackdrop id={p.id} cool/>
  <path d="M0 194Q104 181 206 198T540 190V320H0Z" fill="#d0d5b8" opacity=".6"/>
  <path className="lamp-light" d={narrowed?'M301 135L32 115V186Z':'M301 135L32 63V237Z'} fill={p.paint('light')}/>
  <path d="M64 260h400" stroke="#b1bfa1" strokeWidth="2"/>
  <image href="/images/history-labs/palace-lamp-study-v1.png" x="205" y="43" width="275" height="235" preserveAspectRatio="xMidYMid meet" opacity={stage===2?.72:1}/>
  {narrowed&&<path d="M307 119H320V150Q314 153 307 150Z" fill={p.paint('gold')}/>}
  {stage===2&&<><path d="M303 128V101Q312 68 330 67Q345 82 351 119L372 213" fill="none" stroke="#fbf4c9" strokeWidth="8" strokeLinecap="round" opacity=".8"/><path d="M303 128V101Q312 68 330 67Q345 82 351 119L372 213m-7-9 7 9 7-9" fill="none" stroke="#568d86" strokeWidth="3" strokeDasharray="5 6"/><rect x="392" y="182" width="95" height="34" rx="17" fill="#fffdf4"/><text x="439" y="204" textAnchor="middle" fill="#497e71" fontSize="15">烟的去向</text></>}
  <text x="270" y="30" textAnchor="middle" fill="#385e51" fontSize="19">{stage===2?'再看袖管，烟往哪里走':narrowed?'开口收小，光的范围也收小':'先看灯罩，光照到哪里'}</text>
  <text x="92" y="160" textAnchor="middle" fill="#9a864d" fontSize="19">光</text>
  <text x="270" y="309" textAnchor="middle" fill="#687b65" fontSize="14">教学新画 · 用光与线说明两种不同作用</text>
 </svg>;
}
