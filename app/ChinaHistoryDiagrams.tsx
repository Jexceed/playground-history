import {BRIDGE_ART,BRIDGE_OPENINGS,bridgeWaterSnapshot,waterSplitSnapshot,weavingCrossings} from './history-lab-model';
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
  <ellipse cx="272" cy="282" rx="176" ry="13" fill="#916b3d" opacity=".11"/>
  <g filter={p.paint('shadow')}>
   <rect x="112" y="56" width="28" height="218" rx="8" fill={p.paint('wood')} stroke="#93683f" strokeWidth="2"/>
   <rect x="400" y="56" width="28" height="218" rx="8" fill={p.paint('wood')} stroke="#93683f" strokeWidth="2"/>
   <rect x="122" y="58" width="296" height="24" rx="7" fill={p.paint('wood')} stroke="#a97b45" strokeWidth="1.5"/>
   <rect x="122" y="242" width="296" height="26" rx="7" fill={p.paint('wood')} stroke="#93683f" strokeWidth="1.5"/>
   <path d="M124 88v149M414 88v149M146 65h248M146 249h248" stroke="#ffe0ac" strokeWidth="2" opacity=".5"/>
  </g>
  {/* Woven cloth header on the upper roller shows how crossing threads become real fabric. */}
  <g>
   <rect x="148" y="82" width="244" height="28" rx="4" fill="#e9d8b4" stroke="#bfa26e" strokeWidth="1.5"/>
   {[89,96,103].map(y=><path key={y} d={`M152 ${y}H388`} stroke="#4f9390" strokeWidth="3.2" strokeDasharray="8 4" opacity=".82"/>)}
   {Array.from({length:19},(_,i)=><path key={i} d={`M${156+i*12.5} 83v26`} stroke="#cf9f5b" strokeWidth="2.4" opacity=".75"/>)}
   <rect x="35" y="84" width="68" height="24" rx="12" fill="#fffdf5" stroke="#d8ceb2"/>
   <text x="69" y="100" textAnchor="middle" fontSize="12" fill="#547362">已织好的布</text>
   <path d="M104 96h40" stroke="#9ab09b" strokeWidth="1.5" strokeDasharray="3 3"/>
  </g>
  {Array.from({length:6},(_,col)=><g key={col}><path d={`M${170+col*40} 108V250`} stroke="#765d37" opacity=".16" strokeWidth="14"/><path d={`M${170+col*40} 106V247`} stroke="#cf9f5b" strokeWidth="10"/><path d={`M${168+col*40} 107V246`} stroke="#f5d494" strokeWidth="2"/><path d={`M${173+col*40} 107V246`} stroke="#ad803c" strokeWidth="1"/></g>)}
  {Array.from({length:stage},(_,row)=><g key={row}><path d={`M143 ${130+row*35+2}H397`} stroke="#385b50" strokeWidth="13" opacity=".12"/><path d={`M143 ${130+row*35}H397`} stroke="#488e8d" strokeWidth="10" strokeLinecap="round"/><path d={`M145 ${128+row*35}H395`} stroke="#a6d7c5" strokeWidth="2"/></g>)}
  {points.filter(point=>!point.weftOnTop).map(point=><g key={`${point.row}-${point.column}`}><path d={`M${point.x} ${point.y-8}v16`} stroke="#cf9f5b" strokeWidth="10" data-weft-under={`${point.row}-${point.column}`}/><path d={`M${point.x-2} ${point.y-8}v16`} stroke="#f5d494" strokeWidth="2"/></g>)}
  <g transform="translate(466 177)" filter={p.paint('shadow')}><ellipse rx="28" ry="27" fill="#5b9997" stroke="#407b79" strokeWidth="2"/><path d="M-15-20q-14 20 0 40M-4-25q-14 25 0 50M7-24q-14 24 0 48M16-20q-13 20 0 40" fill="none" stroke="#acd2c4" strokeWidth="2"/><path d="M-25 8q-28 24-68 22" fill="none" stroke="#488e8d" strokeWidth="3"/></g>
  <g transform={`translate(34 ${stage===0?126:126+(stage-1)*35})`} filter={p.paint('shadow')}>
   <path d="M6 16Q36 2 68 16Q36 30 6 16Z" fill={p.paint('wood')} stroke="#926b3f" strokeWidth="2"/>
   <rect x="22" y="11" width="30" height="10" rx="5" fill="#488e8d" stroke="#336c6b" strokeWidth="1.2"/>
   <path d="M52 16H108" stroke="#488e8d" strokeWidth="3.2" strokeDasharray="4 3"/>
  </g>
  <text x="270" y="306" textAnchor="middle" fontSize="14" fill="#7b775b">竖线与横线一上一下交错，慢慢织成结实的棉布</text>
 </svg>;
}

export function DujiangyanDiagram({stage}:{stage:number}){
 const s=waterSplitSnapshot(stage),p=useLabPaints();
 return <svg className="history-lab-diagram dujiangyan-diagram" viewBox="0 0 540 320" role="img" aria-label={stage===0?'江水到鱼嘴分成外江与内江':stage===1?'涨水时多余江水从飞沙堰排向外江':'稳稳的江水穿过宝瓶口灌溉成都农田'} data-water-stage={s.stage} data-feishayan-spill={s.feishayanSpill} data-baopingkou-irrigating={s.baopingkouIrrigating}>
  <LabPaints id={p.id}/><LabBackdrop id={p.id} cool/>
  {/* Mountain valley & riverbanks */}
  <path d="M0 52Q46 28 88 54L142 86L0 124Z" fill="#8fb391" stroke="#6d9372" strokeWidth="1.5"/>
  <path d="M0 78Q38 58 76 82L116 112L0 148Z" fill="#a8c69f"/>
  <path d="M92 56Q212 46 346 58L540 72V122Q366 106 205 112Z" fill="#c7d6b5"/>
  <path d="M0 198Q114 214 235 236L355 288H0Z" fill="#c6cfa8"/>
  {/* Main incoming Min River + Outer & Inner channels */}
  <path d="M0 112Q78 118 150 132L366 96L540 98V154L356 148L178 164L0 184Z" fill={s.outerFlood?'#5ea9b0':'#7bc0c2'}/>
  <path d="M150 148Q246 168 346 184L426 196V236L328 224Q228 206 138 176Z" fill="#6ab5b8"/>
  {/* Spillway overflow across Feishayan on stage >= 1 */}
  {s.feishayanSpill&&<g data-spill-flow="true">
   <path d="M274 176Q284 152 302 138L336 142Q320 160 310 182Z" fill="#8fd4d6" opacity=".92"/>
   <path d="M284 174Q294 154 310 142M298 177Q308 157 324 145" fill="none" stroke="#effcf9" strokeWidth="3" strokeLinecap="round"/>
  </g>}
  {/* Farmland checkerboard on the right */}
  <g transform="translate(388 158)">
   <path d="M8 10L138 4V116L4 122Z" fill={s.baopingkouIrrigating?'#8ec979':'#cad49f'} stroke="#7d9d6c" strokeWidth="2"/>
   <path d="M12 46L134 40M10 82L134 76M52 8V118M96 6V117" stroke={s.baopingkouIrrigating?'#5aa8b0':'#a8b785'} strokeWidth={s.baopingkouIrrigating?4.5:2.2}/>
   {s.baopingkouIrrigating&&[24,68,110].flatMap(x=>[26,62,98].map(y=><path key={`${x}-${y}`} d={`M${x} ${y}l3-8 3 8`} fill="none" stroke="#477f45" strokeWidth="2" strokeLinecap="round"/>))}
  </g>
  {/* Yuzui fish-snout dividing island */}
  <g filter={p.paint('shadow')}>
   <path d="M148 148L206 132L266 144L258 164L198 162Z" fill="#dfd2b0" stroke="#937c52" strokeWidth="2.2"/>
   <path d="M168 148L206 139L254 148" fill="none" stroke="#9ab587" strokeWidth="4" strokeLinecap="round"/>
  </g>
  {/* Feishayan low spillway weir */}
  <path d="M268 164L332 172L328 183L264 175Z" fill="#cbb991" stroke="#8d784f" strokeWidth="2"/>
  {/* Baopingkou carved rock bottleneck */}
  <g filter={p.paint('shadow')}>
   <path d="M342 146L378 142L386 184L348 186Z" fill="#9c8b70" stroke="#6f5f47" strokeWidth="2"/>
   <path d="M344 224L384 222L390 258L346 260Z" fill="#9c8b70" stroke="#6f5f47" strokeWidth="2"/>
  </g>
  {/* Animated/clear flow arrows */}
  <g fill="none" stroke="#edfffb" strokeWidth="2.8" strokeLinecap="round">
   <path d="M36 148h58m-8-6 8 6-8 6"/>
   <path d={s.outerFlood?'M232 120h128m-9-6 9 6-9 6':'M236 122h76m-7-5 7 5-7 5'} strokeWidth={s.outerFlood?3.8:2.5}/>
   <path d="M214 182l108 18m-9-7 9 7-10 5"/>
   {s.baopingkouIrrigating&&<path d="M352 204h54m-8-6 8 6-8 6" stroke="#fffef2" strokeWidth="3.6"/>}
  </g>
  {/* Clean kid-readable callout pills */}
  <g fontSize="13" fontWeight="700">
   <rect x="164" y="108" width="64" height="24" rx="12" fill="#fffdf5" stroke="#cbb98e"/><text x="196" y="124" textAnchor="middle" fill="#496857">鱼嘴</text>
   <rect x="264" y="188" width="68" height="24" rx="12" fill="#fffdf5" stroke="#cbb98e"/><text x="298" y="204" textAnchor="middle" fill="#496857">飞沙堰</text>
   <rect x="332" y="116" width="68" height="24" rx="12" fill="#fffdf5" stroke="#cbb98e"/><text x="366" y="132" textAnchor="middle" fill="#496857">宝瓶口</text>
   <text x="456" y="90" textAnchor="middle" fill="#3a6b6e" fontSize="14">外江排洪</text>
   <text x="458" y="294" textAnchor="middle" fill="#3f6d48" fontSize="14">{s.baopingkouIrrigating?'农田喝饱水':'成都农田'}</text>
  </g>
  <text x="270" y="30" textAnchor="middle" fill="#315e55" fontSize="18">{stage===0?'江水先到鱼嘴，分成外江与内江':stage===1?'涨水时，多余江水漫过飞沙堰排向外江':'稳稳的江水穿过宝瓶口，流进农田'}</text>
  <text x="192" y="306" textAnchor="middle" fill="#687b65" fontSize="13">不用筑死高坝，顺着水势分流防洪又灌田</text>
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
