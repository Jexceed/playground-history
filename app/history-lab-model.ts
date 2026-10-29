export type HistoryLabKind = 'polities'|'printing'|'compass'|'roof'|'engine'|'bridge-water'|'weaving'|'lamp';
export const LAB_STAGE_COUNTS:Record<HistoryLabKind,number>={polities:1,printing:3,compass:2,roof:2,engine:2,'bridge-water':2,weaving:3,lamp:2};
export const POLITY_WINDOWS=[{year:1111,names:['辽','北宋','西夏']},{year:1160,names:['金','南宋','西夏']}] as const;
export function labSnapshot(kind:HistoryLabKind,stage:number){
 if(!Object.hasOwn(LAB_STAGE_COUNTS,kind)||!Number.isInteger(stage)||stage<0||stage>LAB_STAGE_COUNTS[kind])throw new RangeError('Invalid history lab stage');
 return {complete:stage===LAB_STAGE_COUNTS[kind],window:POLITY_WINDOWS[stage>0?1:0],blocks:stage===0?['日','日','山']:stage===1?['日','','山']:['日','月','山'],printed:kind==='printing'&&stage===3,boatAngle:stage*90,needleAngle:180,roof:{fixtureX:270,roofY:215,...roofCapPosition(kind==='roof'?stage:0),capHeight:70},engine:engineLinkage(stage*180)};
}

export function roofCapPosition(phase:number){
 if(!Number.isFinite(phase)||phase<0||phase>2)throw new RangeError('Invalid roof phase');
 const amount=phase<=1?phase:2-phase;
 const smooth=(v:number)=>v*v*(3-2*v);
 return {capX:270+160*smooth(Math.max(0,(amount-.5)*2)),capY:145-45*smooth(Math.min(1,amount*2))};
}

// Coordinates in zhaozhou-bridge-study-v2.png (1642 × 958). The four small
// apertures were checked against the transparent openings, not the arch rings.
export const BRIDGE_ART={x:6,y:18,width:528,sourceWidth:1642,sourceHeight:958} as const;
export const BRIDGE_OPENINGS=[
 {id:'main',x:411,y:410,width:810,height:270,ripple:[820,560,128],path:'M411 680V628Q571 409 820 410Q1060 411 1221 628V680Z'},
 {id:'left-outer',x:222,y:484,width:88,height:84,ripple:[266,535,36],path:'M222 566Q223 505 262 486Q291 474 310 519L303 554Q271 568 222 566Z'},
 {id:'left-inner',x:392,y:438,width:59,height:63,ripple:[413,475,24],path:'M392 500Q397 453 420 441Q441 432 451 448L445 471Z'},
 {id:'right-inner',x:1183,y:438,width:56,height:62,ripple:[1219,475,24],path:'M1183 448Q1195 431 1213 441Q1234 454 1239 500L1188 470Z'},
 {id:'right-outer',x:1323,y:484,width:84,height:85,ripple:[1365,535,36],path:'M1323 519Q1339 477 1368 486Q1405 502 1407 568Q1360 569 1330 555Z'},
] as const;
export function bridgeWaterSnapshot(stage:number){
 if(!Number.isInteger(stage)||stage<0||stage>2)throw new RangeError('Invalid bridge water stage');
 const waterY=stage===0?635:465;
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
