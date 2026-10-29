import test from 'node:test';
import assert from 'node:assert/strict';
import {sceneContextBox,sceneDetailFraming} from '../app/scene-image-model.ts';

const frame={width:686,height:457};
test('a tiny moon and letter retain the source scene even if the full image is large',()=>{
 const moon={x:750,y:42,width:145,height:148,sourceWidth:1536,sourceHeight:1024};
 const letter={x:170,y:374,width:210,height:74,sourceWidth:1536,sourceHeight:1024};
 for(const crop of [moon,letter])for(const raster of [{width:900,height:600},{width:1536,height:1024}])assert.equal(sceneDetailFraming(crop,raster,frame),'context');
});
test('large matching scenes remain detailed; resolution is evaluated for the actual frame',()=>{
 const crop={x:8,y:8,width:1070,height:707,sourceWidth:1086,sourceHeight:1448};
 assert.equal(sceneDetailFraming(crop,{width:1086,height:1448},frame),'detail');
 const small={x:100,y:100,width:200,height:200,sourceWidth:1536,sourceHeight:1024};
 assert.equal(sceneDetailFraming(small,{width:1536,height:1024},{width:150,height:150}),'detail');
 assert.equal(sceneDetailFraming(small,{width:1536,height:1024},frame),'context');
});
test('missing or invalid image and viewport sizes never enlarge an unchecked crop',()=>{
 const crop={x:0,y:0,width:200,height:200,sourceWidth:1000,sourceHeight:1000};
 assert.equal(sceneDetailFraming(crop,undefined,frame),'context');
 for(const size of [{width:0,height:900},{width:NaN,height:900},{width:900,height:Infinity}])assert.equal(sceneDetailFraming(crop,size,frame),'context');
 assert.equal(sceneDetailFraming(crop,{width:1000,height:1000},{width:0,height:0}),'context');
});

test('context retains the object and surrounding action without the empty workshop table',()=>{
 const bag={x:695,y:325,width:345,height:175,sourceWidth:1536,sourceHeight:1024};
 const box=sceneContextBox(bag,{width:686,height:312});
 assert.equal(box.x,0);assert.equal(box.y,0);assert.equal(box.width,1536);
 assert.ok(box.height>=500&&box.height<750);
 assert.ok(box.x<=bag.x&&box.y<=bag.y&&box.x+box.width>=bag.x+bag.width&&box.y+box.height>=bag.y+bag.height);
});
test('context moves only as far as needed for an edge object and never goes outside its source',()=>{
 const crop={x:1300,y:900,width:200,height:100,sourceWidth:1536,sourceHeight:1024};
 const box=sceneContextBox(crop,{width:686,height:312});
 assert.ok(box.y>0&&box.y+box.height<=1024);
 assert.ok(box.y+box.height>=crop.y+crop.height);
 assert.deepEqual(sceneContextBox({...crop,x:0,y:0,width:1500,height:1000},{width:700,height:300}),{x:0,y:0,width:1536,height:1024});
});
