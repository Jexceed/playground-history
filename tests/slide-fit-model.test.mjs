import assert from 'node:assert/strict';
import test from 'node:test';
import {alignedRuler,pointerRulerOffset} from '../app/workbench-model.ts';
import {COIN_MOULD,SLIDE_BOARD,WALL_JOIN,coinCardGeometry,coinOutlinePath,wallPieceBounds} from '../app/slide-fit-model.ts';

test('wall model closes both ends and holds its size throughout the drag range',()=>{
 const joined=wallPieceBounds(0);
 assert.equal(joined.left,WALL_JOIN.gapLeft);
 assert.equal(joined.right,WALL_JOIN.gapRight);
 assert.equal(joined.top,WALL_JOIN.top);assert.equal(joined.bottom,WALL_JOIN.bottom);
 for(let offset=-24;offset<=24;offset+=.5){
  const piece=wallPieceBounds(offset);
  assert.equal(piece.right-piece.left,WALL_JOIN.gapRight-WALL_JOIN.gapLeft);
  assert.equal(piece.bottom-piece.top,WALL_JOIN.bottom-WALL_JOIN.top);
  assert.ok(piece.top>=WALL_JOIN.top&&piece.bottom<=SLIDE_BOARD.height);
  assert.ok(piece.left>=WALL_JOIN.left&&piece.right<=WALL_JOIN.right);
 }
});

test('coin card has the same circular edge and square opening as its target, without clipping',()=>{
 const target=COIN_MOULD,joined=coinCardGeometry(0);
 assert.equal(coinOutlinePath(joined.centerX,joined.centerY,joined.radius,joined.hole),coinOutlinePath(target.centerX,target.centerY,target.radius,target.hole));
 for(let offset=-24;offset<=24;offset+=.5){
  const card=coinCardGeometry(offset);
  assert.equal(card.radius,target.radius);assert.equal(card.hole,target.hole);
  assert.equal(card.centerY,target.centerY);
  assert.ok(card.centerX-card.radius>=0&&card.centerX+card.radius<=SLIDE_BOARD.width);
 }
});

test('pointer movement and arrow nudges reach the same visual alignment',()=>{
 for(const displayedWidth of [600,670]){
  const offset=pointerRulerOffset(18,-displayedWidth*.18,displayedWidth);
  assert.ok(alignedRuler(offset));
  assert.equal(wallPieceBounds(offset).left,WALL_JOIN.gapLeft);
  assert.equal(coinCardGeometry(offset).centerX,COIN_MOULD.centerX);
 }
 let offset=18;
 for(let press=0;press<6;press++)offset-=3;
 assert.ok(alignedRuler(offset));
 assert.equal(coinCardGeometry(offset).centerX,COIN_MOULD.centerX);
});
