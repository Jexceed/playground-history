import test from 'node:test';
import assert from 'node:assert/strict';
import {engineLinkage,labSnapshot,roofCapPosition,POLITY_WINDOWS,LAB_STAGE_COUNTS} from '../app/history-lab-model.ts';
import {canContinueStep,stepVoiceIds} from '../app/step-flow.ts';
test('movable type changes only the middle block and completes after printing',()=>{
 const states=[0,1,2,3].map(n=>labSnapshot('printing',n));
 assert.deepEqual(states.map(s=>s.blocks[1]),['日','','月','月']);
 assert.ok(states.every(s=>s.blocks[0]==='日'&&s.blocks[2]==='山'));
 assert.deepEqual(states.map(s=>s.printed),[false,false,false,true]);
 assert.deepEqual(states.map(s=>s.complete),[false,false,false,true]);
});
test('turning the teaching boat preserves the needle direction',()=>{
 assert.deepEqual([0,1,2].map(n=>labSnapshot('compass',n).boatAngle),[0,90,180]);
 assert.ok([0,1,2].every(n=>labSnapshot('compass',n).needleAngle===180));
});
test('time windows replace the appropriate polities and keep Western Xia in both',()=>{
 assert.deepEqual(POLITY_WINDOWS.map(w=>w.year),[1111,1160]);
 assert.deepEqual(labSnapshot('polities',0).window.names,['辽','北宋','西夏']);
 assert.deepEqual(labSnapshot('polities',1).window.names,['金','南宋','西夏']);
 for(const [kind,n] of Object.entries(LAB_STAGE_COUNTS)){
  assert.throws(()=>labSnapshot(kind,n+1),RangeError);
  assert.equal(canContinueStep({interaction:{kind:'history-lab'}},false),false);
  assert.equal(canContinueStep({interaction:{kind:'history-lab'}},labSnapshot(kind,n).complete),true);
 }
});

test("history labs introduce the full setup before the first action",()=>{assert.deepEqual(stepVoiceIds({interaction:{kind:"history-lab"},audio:{intro:{id:"setup"},lead:{id:"short"},transition:{id:"title"},question:{id:"question"}}}),["setup"]);});

test('steam teaching linkage keeps the rod length while motion changes direction',()=>{
 const states=[0,1,2].map(s=>labSnapshot('engine',s));
 assert.equal(states[0].engine.pistonX,states[2].engine.pistonX);
 assert.ok(states[1].engine.pistonX<states[0].engine.pistonX);
 assert.deepEqual(states.map(s=>s.engine.angle),[0,180,360]);
 for(const s of states){const e=s.engine;assert.ok(Math.abs(Math.hypot(e.crankX-e.pistonX,e.crankY-e.pistonY)-e.rodLength)<1e-8);assert.ok(e.pistonX>211&&e.pistonX<346);}
 assert.deepEqual(states.map(s=>s.complete),[false,false,true]);
});
test('roof model requires uncovering and replacing the cap, with safe movement above the fixture',()=>{
 const [before,lifted,after]=[0,1,2].map(stage=>labSnapshot('roof',stage));
 for(const state of [before,after]){assert.equal(state.roof.capX,state.roof.fixtureX);assert.equal(state.roof.capY+state.roof.capHeight,state.roof.roofY);}
 assert.notEqual(lifted.roof.capX,lifted.roof.fixtureX);
 assert.deepEqual([before,lifted,after].map(state=>state.complete),[false,false,true]);
 for(let phase=0;phase<=2;phase+=.025){const r=roofCapPosition(phase);assert.ok(r.capY<=145);if(r.capX>270.001)assert.equal(r.capY,100);}
 assert.throws(()=>roofCapPosition(2.1),RangeError);
});

test('animated engine samples preserve the physical linkage at intermediate angles',()=>{for(let angle=0;angle<=360;angle+=7.5){const e=engineLinkage(angle);assert.ok(Math.abs(Math.hypot(e.crankX-e.pistonX,e.crankY-e.pistonY)-120)<1e-8);assert.ok(e.pistonX>=239.999&&e.pistonX<=320.001);}assert.throws(()=>engineLinkage(Infinity),RangeError);});
