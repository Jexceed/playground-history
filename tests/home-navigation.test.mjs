import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {selectFocusedCover} from '../scripts/lib/focused-gameplay.mjs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const focused=read('content/focused-quests.json');
const assets=fs.readdirSync('content/assets').filter(p=>p.endsWith('.json')).flatMap(p=>read(`content/assets/${p}`).assets??[]);

test('all visible task cards use registered historical materials with explicit identity labels',()=>{
  for(const chapter of focused.chapters){
    const cover=selectFocusedCover(chapter,assets);
    const detail=read(`public/content/chapters/${chapter.id}.json`);
    assert.equal(detail.gameplay.coverAsset.id,cover.id);
    assert.equal(detail.childEntry.preferredAssetId,cover.id);
    assert.deepEqual(detail.gameplay.coverDisplay,chapter.coverDisplay);
    assert.equal(detail.gameplay.coverImage,`/content/step-images/${cover.id}.jpg`);
    assert.ok(detail.gameplay.evidence.some(e=>e.id===cover.id));
  }
  assert.match(focused.chapters.find(c=>c.id.endsWith('song-inventions')).coverDisplay.label,/后世/);
  assert.match(focused.chapters.find(c=>c.id.endsWith('roof-beasts')).coverDisplay.label,/清代重建/);
});

test('a raster extension or photo-like title cannot qualify a generated or uncleared image as a historical cover',()=>{
  const chapter=focused.chapters[0];
  const asset=structuredClone(selectFocusedCover(chapter,assets));
  for(const patch of [{clearance:'cleared-project-created'},{clearance:'pending'},{childVisibility:'editor-only'},{sourcePage:null}]){
    assert.throws(()=>selectFocusedCover(chapter,[{...asset,...patch,title:'真实照片',localPath:'photo.jpg'}]));
  }
  assert.throws(()=>selectFocusedCover({...chapter,coverAssetId:'missing'},assets));
  assert.throws(()=>selectFocusedCover({...chapter,coverDisplay:{label:'历史材料',fit:'contain',crop:{x:5,y:0,width:10,height:10,sourceWidth:10,sourceHeight:10}}},assets));
});

test('the departure invitation offers a station choice and matches the generated voice text',()=>{
  const invitation=read('content/voice-interface-lines.json').lines.find(v=>v.id==='river-intro').text;
  assert.match(invitation,/你想先去哪一站/);
  assert.doesNotMatch(invitation,/第一站[，、：]?秦朝/);
  assert.equal(read('public/audio/voice-lines.json').lines.find(v=>v.id==='river-intro').text,invitation);
  assert.equal(read('public/audio/voice/manifest.json').entries.find(v=>v.id==='river-intro').text,invitation);
});
