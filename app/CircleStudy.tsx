"use client";

import {useState} from "react";
import {CIRCLE_STAGES, polygonPoints} from "./circle-geometry";
import "./circle-study.css";

export function CircleDiagram({sides,label,className=""}:{sides:number;label:string;className?:string}) {
  return <svg className={`circle-diagram ${className}`} viewBox="0 0 120 120" role="img" aria-label={label} data-polygon-sides={sides}>
    <circle cx="60" cy="60" r="42" fill="#f5d68d" stroke="#ae793d" strokeWidth="1.4"/>
    <polygon points={polygonPoints(sides)} fill="#9ccdbc" stroke="#2f7764" strokeWidth="1.1"/>
  </svg>;
}

export function CircleStudy({locked,onRefine,practice=false}:{locked:boolean;onRefine:(sides:number)=>void;practice?:boolean}) {
  const [stage,setStage]=useState(0);
  const sides=CIRCLE_STAGES[stage];
  const refine=()=>{
    if(locked||stage===CIRCLE_STAGES.length-1)return;
    const next=stage+1;setStage(next);onRefine(CIRCLE_STAGES[next]);
  };
  return <div className="circle-study" data-current-sides={sides}>
    <div className="circle-study-pair">
      <figure><CircleDiagram sides={6} label="原来六条直边，与圆之间留有空隙"/><figcaption>原来 · 6条边</figcaption></figure>
      <figure><CircleDiagram sides={sides} label={`现在${sides}条直边，仍在同样大小的圆里`}/><figcaption>现在 · {sides}条边</figcaption></figure>
    </div>
    <p role="status">{sides===6?'看看直边与圆边之间的空隙。':sides===12?'边变多，空隙变小。再试一次。':'空隙更小了，仍然是直边图形。'}</p>
    <button className="circle-refine-button" onClick={refine} disabled={locked||sides===24}>把边分细一点</button>
    {practice&&stage>0&&<button className="circle-reset-button" onClick={()=>{setStage(0);onRefine(6);}}>再看六条边</button>}
    <small>同一个圆的学习示意 · 不复原古人完整计算</small>
  </div>;
}
