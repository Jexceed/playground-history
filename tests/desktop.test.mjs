import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {collectDesktopAssets,publicPath} from '../scripts/lib/desktop-assets.mjs';
import {exportProgress,mergeProgressImport} from '../app/quest-progress.ts';

const index=new Map(JSON.parse(fs.readFileSync('content/runtime/progress-index.json','utf8')).map(c=>[c.id,c]));
const version=JSON.parse(fs.readFileSync('content/runtime/preview-manifest.json','utf8')).contentVersion;
const qin='cn-ancient-04-01-qin-unification',han='cn-ancient-04-04-han-knowledge',hidden='world-ancient-01-05-rome-empire';
test('progress files round-trip with compatible resume and hidden completion records',()=>{
 const progress={schemaVersion:2,completed:[qin,hidden],current:{chapterId:qin,stepId:'journey',contentVersion:version}};
 assert.deepEqual(mergeProgressImport(exportProgress(progress,version),{schemaVersion:2,completed:[],current:null},index,version),progress);
});
test('import merges completion flags and never replaces valid progress with an invalid resume',()=>{
 const existing={schemaVersion:2,completed:[qin],current:{chapterId:qin,stepId:'change',contentVersion:version}};
 const incoming={schemaVersion:2,completed:[han,qin,'unknown-id'],current:{chapterId:han,stepId:'wrong-step',contentVersion:version}};
 const merged=mergeProgressImport(JSON.stringify(incoming),existing,index,version);
 assert.deepEqual(merged.completed,[qin,han]);assert.deepEqual(merged.current,existing.current);
 for(const raw of ['broken','{}','{"schemaVersion":2,"completed":[7]}',' '.repeat(262145)])assert.throws(()=>mergeProgressImport(raw,existing,index,version));
 assert.deepEqual(existing.completed,[qin]);
});
test('the desktop package includes every visible asset and voice without hidden chapter files or research originals',()=>{
 const preview=JSON.parse(fs.readFileSync('content/runtime/preview-manifest.json','utf8')),scope=JSON.parse(fs.readFileSync('content/preview-scope.json','utf8'));
 const plan=collectDesktopAssets(process.cwd());assert.equal(plan.chapters,scope.chapterIds.length);assert.equal(plan.stations,scope.periodIds.length);assert.equal(plan.voiceLines,preview.totals.localVoiceLines);
 const chapterFiles=plan.assets.filter(p=>p.startsWith('/content/chapters/'));
 assert.deepEqual(new Set(chapterFiles),new Set(scope.chapterIds.map(id=>`/content/chapters/${id}.json`)));
 assert.deepEqual(new Set(plan.chapterIds),new Set(scope.chapterIds));
 assert.ok(!plan.assets.some(p=>/reference-assets|node_modules|\.env|source\.png/.test(p)));
 assert.ok(plan.assets.includes('/images/brand/history-trip-logo.png'));
 assert.ok(plan.voiceIds.every(id=>plan.assets.includes(`/audio/voice/zh-CN/xiaoxiao/${id}.mp3`)));
 assert.equal(new Set(plan.assets).size,plan.assets.length);
});
test('local asset extraction rejects traversal and excludes external resources',()=>{
 assert.equal(publicPath('/content/study-scenes/'),null);
 assert.equal(publicPath('https://example.com/images/a.png'),null);assert.equal(publicPath('//example.com/images/a.png'),null);
 assert.throws(()=>publicPath('/images/../outside.json'));assert.equal(publicPath('/images/a.png?version=1'),'/images/a.png');
});

test('route-only images are packaged without sweeping unrelated research or hidden chapter files',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'history-desktop-routes-'));
 const write=(name,value)=>{const destination=path.join(root,name);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,typeof value==='string'?value:JSON.stringify(value));};
 try{
  fs.mkdirSync(path.join(root,'app'));fs.mkdirSync(path.join(root,'desktop'));
  write('content/runtime/preview-manifest.json',{contentVersion:'test',tracks:[],totals:{localVoiceLines:0},scope:{periodIds:[]}});
  write('content/runtime/voice-auditions-manifest.json',{});
  write('public/audio/voice-lines.json',{lines:[]});
  write('content/voice-interface-lines.json',{lines:[]});
  write('content/play-routes.json',{routes:[{iconSrc:'/images/route-only.png'}]});
  write('public/images/route-only.png','fixture image');
  write('reference-assets/research-original.png','private research original');
  write('public/content/chapters/hidden.json',{});
  write('public/content/step-images/unused.png','unused hidden asset');
  const plan=collectDesktopAssets(root);
  assert.deepEqual(plan.assets,['/images/route-only.png']);
  assert.deepEqual(plan.chapterIds,[]);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
