import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {bridgeWaterSnapshot,weavingCrossings,BRIDGE_OPENINGS} from '../app/history-lab-model.ts';
import {parseProgress} from '../app/quest-progress.ts';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));

test('the current expansion opens China tasks and routes reference the same existing progress IDs',()=>{
 const scope=read('content/preview-scope.json'),focused=read('content/focused-quests.json'),routes=read('content/play-routes.json').routes;
 const ids=new Set(scope.chapterIds);assert.equal(ids.size,44);assert.ok([...ids].every(id=>id.startsWith('cn-ancient-')));
 assert.deepEqual(new Set(focused.chapters.map(c=>c.id)),ids);
 for(const route of routes){assert.equal(new Set(route.chapterIds).size,route.chapterIds.length);assert.ok(route.chapterIds.every(id=>ids.has(id)));assert.ok(fs.existsSync('public'+route.iconSrc));}
 assert.equal(routes.find(r=>r.id==='inventions').chapterIds.length,4);
 assert.ok(ids.has('cn-ancient-03-03-hundred-schools'));assert.ok(ids.has('cn-ancient-04-08-qin-terracotta'));
 const index=new Map(read('content/runtime/progress-index.json').map(c=>[c.id,c])),version=read('content/runtime/preview-manifest.json').contentVersion;
 const current={chapterId:'cn-ancient-06-07-li-bai-jingyesi',stepId:'journey',contentVersion:version};
 const saved={schemaVersion:2,completed:['cn-ancient-04-01-qin-unification','world-ancient-01-05-rome-empire'],current};
 const parsed=parseProgress(JSON.stringify(saved),null,index,version);
 assert.deepEqual(parsed.current,current);assert.deepEqual(new Set(parsed.completed),new Set(saved.completed));
});

test('small bridge openings carry water only when the water level reaches them',()=>{
 assert.deepEqual(bridgeWaterSnapshot(0).flowing,['main']);
 assert.equal(bridgeWaterSnapshot(1).flowing.length,5);
 for(const s of [0,1,2]){const state=bridgeWaterSnapshot(s);for(const o of BRIDGE_OPENINGS)assert.equal(state.flowing.includes(o.id),state.waterY<o.y+o.height);}
 assert.throws(()=>bridgeWaterSnapshot(-1),RangeError);assert.throws(()=>bridgeWaterSnapshot(3),RangeError);
});

test('the woven model alternates over and under in both directions',()=>{
 const points=weavingCrossings(3);assert.equal(points.length,18);
 for(const p of points){
  const nextColumn=points.find(q=>q.row===p.row&&q.column===p.column+1);
  const nextRow=points.find(q=>q.column===p.column&&q.row===p.row+1);
  if(nextColumn)assert.notEqual(p.weftOnTop,nextColumn.weftOnTop);
  if(nextRow)assert.notEqual(p.weftOnTop,nextRow.weftOnTop);
 }
 assert.equal(weavingCrossings(0).length,0);assert.throws(()=>weavingCrossings(4),RangeError);
});

test('narrative choices use concrete picture crops, shared between choices and selected scenes',()=>{
 const source=read('content/focused-quests.json');let pairs=0;
 for(const c of source.chapters){
  const detail=read(`public/content/chapters/${c.id}.json`);
  for(const [i,s] of c.steps.entries()){
   assert.ok(s.options.every(o=>o.objectView?.kind!=='study-card'),'Generic icon strips must not replace narrative scenes');
   if(s.interaction?.choiceArt!=='illustrated')continue;
   pairs++;const projected=detail.gameplay.steps[i].options;
   assert.equal(new Set(s.options.map(o=>o.objectView.kind)).size,1);
   for(const [j,o] of s.options.entries()){
    assert.ok(['scene-card','scene-strip'].includes(o.objectView.kind));
    const originals=o.objectView.panels??[o.objectView],frames=projected[j].objectView.panels??[projected[j].objectView];
    assert.equal(frames.length,originals.length);
    frames.forEach((f,k)=>{assert.deepEqual(f.crop,originals[k].crop);assert.equal(f.assetId,originals[k].assetId);assert.match(f.image,/\.jpg$/);assert.ok(fs.existsSync('public'+f.image));});
   }
  }
 }
 assert.equal(pairs,21);
 const poem=source.chapters.find(c=>c.id.endsWith('li-qingzhao-rumengling')).steps[3].options;
 const identity=o=>o.objectView.panels.map(p=>JSON.stringify({assetId:p.assetId,crop:p.crop}));
 assert.deepEqual(new Set(identity(poem[0])),new Set(identity(poem[1])),'Reordering reuses exactly the same scene crops');
 assert.notDeepEqual(identity(poem[0]),identity(poem[1]));
});
