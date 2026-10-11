import {BRIDGE_OPENINGS,bridgeWaterSnapshot,weavingCrossings} from './history-lab-model';
import {LabPaints,LabBackdrop,useLabPaints} from './LabIllustration';

export function BridgeWaterDiagram({stage}:{stage:number}){
 const s=bridgeWaterSnapshot(stage),p=useLabPaints(),clipId=`${p.id}-openings`;
 return <svg className="history-lab-diagram" viewBox="0 0 540 320" role="img" aria-label={stage===0?'低水位，水从中央大拱下流过':'高水位，水也能从两侧小拱流过'}>
  <LabPaints id={p.id}/><defs><clipPath id={clipId}>{BRIDGE_OPENINGS.map(o=><path key={o.id} d={`M${o.x} ${o.y+o.height}V${o.y+o.width/2}a${o.width/2} ${o.width/2} 0 0 1 ${o.width} 0V${o.y+o.height}Z`}/>)}</clipPath></defs>
  <LabBackdrop id={p.id} cool/>
  <path d="M0 132Q31 114 69 138L130 107 187 135 275 98 365 123 437 99 540 138V263H0Z" fill="#afc9ad" opacity=".35"/>
  <rect className="water-surface" y={s.waterY} width="540" height={293-s.waterY} fill={p.paint('water')}/>
  <path d="M40 245V150Q270 44 500 150V245Z" fill={p.paint('stone')} stroke="#948975" strokeWidth="2" filter={p.paint('shadow')}/>
  <g stroke="#ae9e81" fill="none" strokeWidth="1.3" opacity=".7"><path d="M41 173H499M41 207H179M361 207H499M67 229V245M103 209V239M399 209V241M468 209V242M184 109V133M247 94V134M315 101V133M365 117V143"/></g>
  {BRIDGE_OPENINGS.map(o=><g key={o.id}><path d={`M${o.x} ${o.y+o.height}V${o.y+o.width/2}a${o.width/2} ${o.width/2} 0 0 1 ${o.width} 0V${o.y+o.height}Z`} fill="#dbe9d9" stroke="#948a78" strokeWidth="3" data-opening-id={o.id}/><path d={`M${o.x-4} ${o.y+o.height-3}V${o.y+o.width/2}a${o.width/2+4} ${o.width/2+4} 0 0 1 ${o.width+8} 0V${o.y+o.height-3}`} fill="none" stroke="#f7ead2" strokeWidth="3"/></g>)}
  <g clipPath={`url(#${clipId})`}><rect className="water-surface" y={s.waterY} width="540" height={293-s.waterY} fill={p.paint('water')}/>{s.showPaths&&BRIDGE_OPENINGS.map(o=><path key={o.id} d={`M${o.x+8} ${Math.max(s.waterY+9,o.y+o.height-15)}q${(o.width-16)/4} -5 ${(o.width-16)/2} 0t${(o.width-16)/2} 0`} stroke="#e1fff4" strokeWidth="3" fill="none"/>)}</g>
  <path d="M38 147Q270 35 502 147" fill="none" stroke="#b0a183" strokeWidth="10"/><path d="M38 141Q270 29 502 141" fill="none" stroke="#eee1bf" strokeWidth="5"/>
  {[65,102,141,181,221,262,302,342,382,422,462].map(x=>{const t=(x-38)/464,y=141-224*t*(1-t);return <g key={x}><path d={`M${x} ${y}v-14`} stroke="#bcad91" strokeWidth="4"/><circle cx={x} cy={y-15} r="3.5" fill="#e9dbba"/></g>;})}
  <g transform="translate(252 82)"><circle cx="-15" cy="0" r="5" fill="#73543c"/><circle cx="14" cy="0" r="5" fill="#73543c"/><path d="M-22-16H21L16-3H-17Z" fill="#bb8150" stroke="#8e603c" strokeWidth="1.5"/><path d="M-19-14H18" stroke="#efd29b" strokeWidth="2"/></g>
  <path d="M3 252q24-14 49 0v28H0M488 252q25-14 52-2v28h-52" fill="#a7bc88"/>
  <g stroke="#d5f0e3" strokeWidth="2" opacity=".8" fill="none"><path d="M99 272q21-5 42 0m57-11q21-5 42 0m79 11q25-5 50 0m33-8q17-5 34 0"/></g>
  <text x="270" y="31" textAnchor="middle" fill="#315e55" fontSize="19">{stage===0?'水低的时候，先看大拱':'水涨到这里，小拱也能过水'}</text>
  <text x="270" y="312" textAnchor="middle" fill="#607b68" fontSize="14">桥面通人车，桥洞留水路</text>
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
