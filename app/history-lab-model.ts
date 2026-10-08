export type HistoryLabKind = 'polities'|'printing'|'compass'|'roof'|'engine'|'bridge-water'|'weaving'|'lamp';
export const LAB_STAGE_COUNTS:Record<HistoryLabKind,number>={polities:1,printing:3,compass:2,roof:1,engine:2,'bridge-water':2,weaving:3,lamp:2};
export const POLITY_WINDOWS=[{year:1111,names:['辽','北宋','西夏']},{year:1160,names:['金','南宋','西夏']}] as const;
export function labSnapshot(kind:HistoryLabKind,stage:number){
 if(!Object.hasOwn(LAB_STAGE_COUNTS,kind)||!Number.isInteger(stage)||stage<0||stage>LAB_STAGE_COUNTS[kind])throw new RangeError('Invalid history lab stage');
 return {complete:stage===LAB_STAGE_COUNTS[kind],window:POLITY_WINDOWS[stage>0?1:0],blocks:stage===0?['日','日','山']:stage===1?['日','','山']:['日','月','山'],printed:kind==='printing'&&stage===3,boatAngle:stage*90,needleAngle:180,roof:{fixtureX:270,roofY:215,capX:stage?270:435,capY:stage?145:62,capHeight:70},engine:engineLinkage(stage*180)};
}

// Diagram coordinates are shared by water, bridge openings and observation tests.
export const BRIDGE_OPENINGS=[
 {id:'main',x:180,y:139,width:180,height:106},
 {id:'left-outer',x:68,y:155,width:38,height:44},
 {id:'left-inner',x:119,y:137,width:39,height:42},
 {id:'right-inner',x:382,y:137,width:39,height:42},
 {id:'right-outer',x:434,y:155,width:38,height:44},
] as const;
export function bridgeWaterSnapshot(stage:number){
 if(!Number.isInteger(stage)||stage<0||stage>2)throw new RangeError('Invalid bridge water stage');
 const waterY=stage===0?218:166;
 return {waterY,flowing:BRIDGE_OPENINGS.filter(o=>waterY<o.y+o.height).map(o=>o.id),showPaths:stage===2};
}
export function weavingCrossings(rows:number){
 if(!Number.isInteger(rows)||rows<0||rows>3)throw new RangeError('Invalid weaving rows');
 return Array.from({length:rows},(_,row)=>Array.from({length:6},(_,column)=>({row,column,x:170+column*40,y:130+row*35,weftOnTop:(row+column)%2===0}))).flat();
}

// Every rendered joint uses this same constrained slider-crank geometry.
export function engineLinkage(angle:number){
 if(!Number.isFinite(angle))throw new RangeError('Invalid engine angle');
 const cx=400,cy=157,radius=40,rodLength=120,t=angle*Math.PI/180;
 const crankX=cx+radius*Math.cos(t),crankY=cy+radius*Math.sin(t);
 const pistonX=crankX-Math.sqrt(rodLength**2-(crankY-cy)**2);
 return {angle,cx,cy,radius,rodLength,crankX,crankY,pistonX,pistonY:cy};
}
