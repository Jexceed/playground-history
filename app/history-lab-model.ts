export type HistoryLabKind = 'polities'|'printing'|'compass'|'roof'|'engine';
export const LAB_STAGE_COUNTS:Record<HistoryLabKind,number>={polities:1,printing:3,compass:2,roof:1,engine:2};
export const POLITY_WINDOWS=[{year:1111,names:['辽','北宋','西夏']},{year:1160,names:['金','南宋','西夏']}] as const;
export function labSnapshot(kind:HistoryLabKind,stage:number){
 if(!Object.hasOwn(LAB_STAGE_COUNTS,kind)||!Number.isInteger(stage)||stage<0||stage>LAB_STAGE_COUNTS[kind])throw new RangeError('Invalid history lab stage');
 return {complete:stage===LAB_STAGE_COUNTS[kind],window:POLITY_WINDOWS[stage>0?1:0],blocks:stage===0?['日','日','山']:stage===1?['日','','山']:['日','月','山'],printed:kind==='printing'&&stage===3,boatAngle:stage*90,needleAngle:180,roof:{fixtureX:270,roofY:215,capX:stage?270:435,capY:stage?145:62,capHeight:70},engine:engineLinkage(stage*180)};
}

// Every rendered joint uses this same constrained slider-crank geometry.
export function engineLinkage(angle:number){
 if(!Number.isFinite(angle))throw new RangeError('Invalid engine angle');
 const cx=400,cy=157,radius=40,rodLength=120,t=angle*Math.PI/180;
 const crankX=cx+radius*Math.cos(t),crankY=cy+radius*Math.sin(t);
 const pistonX=crankX-Math.sqrt(rodLength**2-(crankY-cy)**2);
 return {angle,cx,cy,radius,rodLength,crankX,crankY,pistonX,pistonY:cy};
}
