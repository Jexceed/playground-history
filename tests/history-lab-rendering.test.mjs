import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

// Render the real TSX without a browser or a full product build.
const require=createRequire(import.meta.url),cache=new Map();
function loadComponent(path){
 if(cache.has(path))return cache.get(path);
 const componentModule={exports:{}};
 const {outputText}=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}});
 const localRequire=specifier=>{
  if(specifier.endsWith('.css'))return {};
  if(!specifier.startsWith('.'))return require(specifier);
  const base=resolve(dirname(path),specifier),source=['.tsx','.ts'].map(extension=>base+extension).find(existsSync);
  return source?loadComponent(source):require(base);
 };
 new Function('require','module','exports',outputText)(localRequire,componentModule,componentModule.exports);
 cache.set(path,componentModule.exports);return componentModule.exports;
}
const {PrintingDiagram}=loadComponent(fileURLToPath(new URL('../app/HistoryLab.tsx',import.meta.url)));
const {WeavingDiagram}=loadComponent(fileURLToPath(new URL('../app/ChinaHistoryDiagrams.tsx',import.meta.url)));
const render=(component,props)=>renderToStaticMarkup(React.createElement(component,props));
function renderedTypes(stage){
 const svg=render(PrintingDiagram,{stage});
 return [...svg.matchAll(/<g data-type-character="([^"]+)" transform="translate\(([-\d.]+) 127\)">([\s\S]*?)<\/g>/g)].map(([,character,x,body])=>({character,x:Number(x),mirrored:body.includes('translate(110 0) scale(-1 1)')})).sort((a,b)=>a.x-b.x);
}

test('the type face and printed sheet mirror the whole line, including glyph orientation',()=>{
 const face=renderedTypes(2),paper=renderedTypes(3);
 assert.equal(face.length,3);assert.equal(paper.length,3);
 assert.deepEqual(paper.map(item=>item.character),['日','月','山']);
 assert.deepEqual(face.map(item=>item.character),[...paper].reverse().map(item=>item.character));
 assert.ok(face.every(item=>item.mirrored));assert.ok(paper.every(item=>!item.mirrored));
 for(const item of face){const impression=paper.find(p=>p.character===item.character);assert.equal(item.x+impression.x,432,'all type origins reflect across the same axis');}
});

test('the outer type blocks stay fixed while the middle block is removed and replaced',()=>{
 const frames=[0,1,2].map(renderedTypes);
 for(const edge of [0,2])assert.ok(frames.every(frame=>frame[edge].x===frames[0][edge].x&&frame[edge].character===frames[0][edge].character));
 assert.deepEqual(frames.map(frame=>frame[1].character),['日','empty','月']);
 assert.ok(frames.every(frame=>frame[1].x===216));
});

test('weaving only refers to a previous row after the second row is present',()=>{
 const first=render(WeavingDiagram,{stage:1});
 assert.match(first,/第一排，一上一下地穿过/);assert.doesNotMatch(first,/上一排/);
 for(const stage of [2,3])assert.match(render(WeavingDiagram,{stage}),/这一排，与上一排交错/);
});
