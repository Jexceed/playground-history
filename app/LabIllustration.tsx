import {useId} from 'react';

export function useLabPaints(){
 const id=`lab-${useId().replace(/:/g,'')}`;
 return {id,paint:(name:string)=>`url(#${id}-${name})`};
}

export function LabPaints({id}:{id:string}){
 return <defs>
  <linearGradient id={`${id}-paper`} x2="0" y2="1"><stop stopColor="#fffdf3"/><stop offset="1" stopColor="#f4e5c5"/></linearGradient>
  <linearGradient id={`${id}-wood`} x2="0" y2="1"><stop stopColor="#efc88d"/><stop offset=".5" stopColor="#c58c50"/><stop offset="1" stopColor="#935e35"/></linearGradient>
  <linearGradient id={`${id}-gold`} x1="0" y1="0" x2=".7" y2="1"><stop stopColor="#ffe4a1"/><stop offset=".32" stopColor="#e6b44e"/><stop offset=".65" stopColor="#c78b29"/><stop offset="1" stopColor="#966025"/></linearGradient>
  <linearGradient id={`${id}-stone`} x2="0" y2="1"><stop stopColor="#f0e4c9"/><stop offset=".55" stopColor="#cdbc9a"/><stop offset="1" stopColor="#9d927b"/></linearGradient>
  <linearGradient id={`${id}-water`} x2="0" y2="1"><stop stopColor="#83d6d5"/><stop offset="1" stopColor="#409fa6"/></linearGradient>
  <linearGradient id={`${id}-teal`} x2="0" y2="1"><stop stopColor="#94c7b3"/><stop offset="1" stopColor="#397b6d"/></linearGradient>
  <radialGradient id={`${id}-light`}><stop stopColor="#ffecaf" stopOpacity=".95"/><stop offset="1" stopColor="#f3c45f" stopOpacity=".12"/></radialGradient>
  <pattern id={`${id}-grain`} width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="2" r=".6" fill="#a07739" opacity=".075"/><circle cx="5" cy="6" r=".4" fill="#fff" opacity=".5"/></pattern>
  <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="175%"><feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#62471f" floodOpacity=".2"/></filter>
 </defs>;
}

export function LabBackdrop({id,height=320,cool=false}:{id:string;height?:number;cool?:boolean}){
 return <>
  <rect width="540" height={height} rx="22" fill={cool?'#e7f1e7':`url(#${id}-paper)`}/>
  <path d={`M0 ${height-54}Q105 ${height-75} 237 ${height-46}T540 ${height-63}V${height}H0Z`} fill={cool?'#caddcd':'#e5d1a7'} opacity=".38"/>
  <rect width="540" height={height} rx="22" fill={`url(#${id}-grain)`}/>
 </>;
}
