import test from 'node:test';
import assert from 'node:assert/strict';
import {primaryActionFailures} from '../scripts/lib/viewport-audit.mjs';

const visible = () => ({viewport:{width:1280,height:720},scroll:{x:0,y:0},actions:[{
  label:'下一步',rendered:true,rect:{left:754,top:590,right:1250,bottom:647,width:496,height:57},blockers:[],clippedBy:[],
}]});

test('viewport audit accepts visible actions and distinguishes unanswered steps from missing navigation', () => {
  assert.deepEqual(primaryActionFailures(visible(), {required:true}), []);
  const beforeAnswer = {...visible(),actions:[]};
  assert.deepEqual(primaryActionFailures(beforeAnswer), []);
  assert.match(primaryActionFailures(beforeAnswer, {required:true}).join(), /缺失/);
});

test('viewport audit rejects a partially offscreen button even when its top is visible', () => {
  const snapshot = visible();
  snapshot.actions[0].rect = {left:754,top:700,right:1250,bottom:757,width:496,height:57};
  assert.match(primaryActionFailures(snapshot).join(), /越出视口/);
});

test('viewport audit rejects obscured, clipped and non-rendered actions', () => {
  const snapshot = visible();
  snapshot.actions[0].blockers = ['DIV.dialog-backdrop'];
  assert.match(primaryActionFailures(snapshot).join(), /遮挡/);
  snapshot.actions[0].blockers = [];
  snapshot.actions[0].clippedBy = ['DIV.panel'];
  assert.match(primaryActionFailures(snapshot).join(), /裁切/);
  snapshot.actions[0].clippedBy = [];
  snapshot.actions[0].rendered = false;
  assert.match(primaryActionFailures(snapshot).join(), /不可见/);
});

test('viewport audit refuses a passing result obtained after automatic scrolling', () => {
  const snapshot = visible();
  snapshot.scroll.y = 80;
  assert.match(primaryActionFailures(snapshot).join(), /已经滚动/);
});
