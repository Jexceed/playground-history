import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {stepVoiceIds} from '../app/step-flow.ts';
const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));

test('the Wu-Yue endpoint is not collapsed into the end of the northern Five Dynasties',()=>{
 const detail=read('public/content/chapters/cn-ancient-06-05-tang-decline.json');
 const facts=detail.facts.map(fact=>fact.text).join(' ');
 assert.match(facts,/北方五代.*部分十国.*978/);
 assert.doesNotMatch(facts,/五代十国位于这两个时间点之间/);
 const source=fs.readFileSync('content/chapters/tang-decline.md','utf8');
 assert.doesNotMatch(source,/中间是五代十国|把907年、五代十国、960年按顺序排好/);
 const catalog=read('content/catalog.json').chapters.find(chapter=>chapter.id.endsWith('tang-decline'));
 assert.match(catalog.throughline,/北方五代.*部分十国延续至北宋/);
});

test('Roman road purposes are compared without claiming early grain transport was impossible',()=>{
 const detail=read('public/content/chapters/world-ancient-01-05-rome-empire.json');
 const step=detail.gameplay.steps[1];
 assert.match(step.prompt,/军事用途/);
 assert.doesNotMatch(step.wrongNote,/运粮.*(?:只|后来)|最初.*(?:没有|不能).*运粮/);
 const lines=new Map(read('public/audio/voice-lines.json').lines.map(line=>[line.id,line.text]));
 const heard=stepVoiceIds(step).map(id=>lines.get(id)).join(' ');
 assert.match(heard,/军队.*道路也.*不同工作/);
 for(const [id,clue] of [['world-ancient-01-02-river-civilizations','四千多年前'],['world-ancient-01-05-rome-empire','两千多年前']]){
  const time=read(`public/content/chapters/${id}.json`).gameplay.steps[0];
  assert.ok(stepVoiceIds(time).some(id=>lines.get(id).includes(clue)));
  assert.ok(time.options.find(option=>option.correct).audio.text.includes(clue));
 }
});
