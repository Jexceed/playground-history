import {BRIDGE_OPENINGS,bridgeWaterSnapshot,weavingCrossings} from './history-lab-model';
import {useId} from 'react';

export function BridgeWaterDiagram({stage}:{stage:number}){
 const s=bridgeWaterSnapshot(stage);
 const clipId=`bridge-openings-${useId().replace(/:/g,'')}`;
 return <svg className="history-lab-diagram" viewBox="0 0 540 300" role="img" aria-label={stage===0?'低水位，水从中央大拱下流过':'高水位，水也能从两侧小拱流过'}>
  <defs><clipPath id={clipId}>{BRIDGE_OPENINGS.map(o=><path key={o.id} d={`M${o.x} ${o.y+o.height}V${o.y+o.width/2}a${o.width/2} ${o.width/2} 0 0 1 ${o.width} 0V${o.y+o.height}Z`}/>)}</clipPath></defs>
  <rect width="540" height="300" rx="20" fill="#eef0dc"/><rect y={s.waterY} width="540" height={278-s.waterY} fill="#9bd3d2"/>
  <path d="M40 245V150Q270 44 500 150V245Z" fill="#bba78b" stroke="#7b7364" strokeWidth="3"/>
  {BRIDGE_OPENINGS.map(o=><path key={o.id} d={`M${o.x} ${o.y+o.height}V${o.y+o.width/2}a${o.width/2} ${o.width/2} 0 0 1 ${o.width} 0V${o.y+o.height}Z`} fill="#eef0dc" stroke="#7b7364" strokeWidth="3" data-opening-id={o.id}/>)}
  <g clipPath={`url(#${clipId})`}><rect y={s.waterY} width="540" height={278-s.waterY} fill="#9bd3d2"/>{s.showPaths&&BRIDGE_OPENINGS.map(o=><path key={o.id} d={`M${o.x+8} ${Math.max(s.waterY+9,o.y+o.height-15)}q${(o.width-16)/4} -5 ${(o.width-16)/2} 0t${(o.width-16)/2} 0`} stroke="#267e83" strokeWidth="3" fill="none"/>)}</g>
  <path d="M40 145Q270 36 500 145" fill="none" stroke="#948870" strokeWidth="9"/>
  <text x="270" y="31" textAnchor="middle" fill="#315e55" fontSize="24">{stage===0?'先看水少的时候':'水涨高了，小拱也能过水'}</text>
  <text x="270" y="289" textAnchor="middle" fill="#657563" fontSize="17">桥面过人车 · 桥洞留水路</text>
 </svg>;
}

export function WeavingDiagram({stage}:{stage:number}){
 const points=weavingCrossings(stage);
 return <svg className="history-lab-diagram" viewBox="0 0 540 300" role="img" aria-label={`已经织入${stage}排纬线，邻排交错方向相反`}>
  <rect width="540" height="300" rx="20" fill="#fbf3de"/><text x="270" y="32" textAnchor="middle" fontSize="23" fill="#3b6656">{stage?'横线与竖线交错起来':'先把竖着的线固定好'}</text>
  <rect x="127" y="66" width="284" height="18" rx="6" fill="#ad8052"/><rect x="127" y="235" width="284" height="18" rx="6" fill="#ad8052"/>
  {Array.from({length:6},(_,col)=><path key={col} d={`M${170+col*40} 74V244`} stroke="#c59b5c" strokeWidth="10"/>)}
  {Array.from({length:stage},(_,row)=><path key={row} d={`M143 ${130+row*35}H397`} stroke="#397f88" strokeWidth="10" strokeLinecap="round"/>)}
  {points.filter(p=>!p.weftOnTop).map(p=><path key={`${p.row}-${p.column}`} d={`M${p.x} ${p.y-8}v16`} stroke="#c59b5c" strokeWidth="10" data-weft-under={`${p.row}-${p.column}`}/>)}
  <path d="M435 104q32 4 30 26t-30 26q-30-2-30-26t30-26Z" fill="#74abb0" stroke="#357a81" strokeWidth="3"/><path d="M425 112q-13 17 0 35m10-36q-13 17 0 35m10-33q-13 15 0 30" fill="none" stroke="#c7e0d8" strokeWidth="3"/>
  <text x="270" y="283" textAnchor="middle" fontSize="18" fill="#64735c">纱线 → 交错织布</text>
 </svg>;
}

export function LampDiagram({stage}:{stage:number}){
 const narrowed=stage>0;
 return <svg className="history-lab-diagram" viewBox="0 0 540 300" role="img" aria-label={stage===0?'灯罩开口较宽，光照范围较宽':stage===1?'灯罩开口变窄，照亮的范围收小':'袖管把部分烟尘导向空心灯体，仍需要清理'}>
  <rect width="540" height="300" rx="20" fill="#e5e9d7"/>
  <path d={narrowed?'M268 150L32 120V189Z':'M268 150L32 71V237Z'} fill="#f9cf6d" opacity=".72"/>
  <path d="M276 121V96Q276 71 329 73H365V140" fill="none" stroke="#a2874d" strokeWidth="30"/>
  <rect x="335" y="124" width="70" height="128" rx="24" fill="#c3ab68" stroke="#8d7747" strokeWidth="3"/>
  <path d="M240 193H304V205H240Z" fill="#a68c50"/><rect x="271" y="199" width="12" height="44" fill="#a68c50"/>
  <path d="M244 113Q291 93 311 128V191H244" fill="none" stroke="#9d8149" strokeWidth={narrowed?24:10}/>
  <ellipse cx="271" cy="182" rx="36" ry="9" fill="#bb9850"/><path d="M270 174q-14-17 0-31q18 19 0 31" fill="#de8f39"/>
  {stage===2&&<path d="M275 134V99Q276 86 323 88H365V182m-7-10 7 10 7-10" fill="none" stroke="#667976" strokeWidth="5" strokeDasharray="7 5"/>}
  <text x="270" y="32" textAnchor="middle" fill="#385e51" fontSize="23">{stage===2?'顺着袖管，看烟的去处':narrowed?'开口收小，光的范围也变了':'看看灯罩怎样遮住一部分光'}</text>
  <text x="270" y="282" textAnchor="middle" fill="#627560" fontSize="16">灯具功能示意 · 省略人物造型</text>
 </svg>;
}
