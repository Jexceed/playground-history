import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {stepVoiceIds} from '../app/step-flow.ts';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const ids=['cn-ancient-06-12-meng-haoran-chunxiao','cn-ancient-06-13-wang-zhihuan-tower','world-ancient-01-02-river-civilizations','world-ancient-01-05-rome-empire'];
const chapters=read('content/focused-quests.json').chapters.filter(chapter=>ids.includes(chapter.id));

test('new chapters speak the task premise and question through the real entry voice sequence',()=>{
 assert.equal(chapters.length,ids.length);
 const lines=new Map(read('public/audio/voice-lines.json').lines.map(line=>[line.id,line.text]));
 for(const chapter of chapters){
  const detail=read(`public/content/chapters/${chapter.id}.json`);
  for(const [i,step] of chapter.steps.entries()){
   const spoken=stepVoiceIds(detail.gameplay.steps[i]).map(id=>lines.get(id)).join(' ');
   assert.ok(spoken.includes(step.story),`${chapter.id}/${i}: the story premise must be audible`);
   if(!['look-listen','scene-find'].includes(step.interaction.kind))assert.ok(spoken.includes(step.question),`${chapter.id}/${i}: lead audio must include the actual question`);
   if(step.interaction.kind==='scene-find')assert.ok(spoken.includes(step.interaction.rounds[0].question));
  }
 }
});

test('both poems are heard in full before interpreting them and are available to parents',()=>{
 const texts=[['春眠不觉晓','处处闻啼鸟','夜来风雨声','花落知多少'],['白日依山尽','黄河入海流','欲穷千里目','更上一层楼']];
 for(const [index,id] of ids.slice(0,2).entries()){
  const detail=read(`public/content/chapters/${id}.json`),reading=detail.gameplay.steps[1];
  assert.equal(reading.interaction.kind,'look-listen');
  assert.deepEqual(stepVoiceIds(reading),[reading.audio.intro.id]);
  const parentText=detail.textbookConnection.companions.map(item=>`${item.label} ${item.note}`).join(' ');
  for(const line of texts[index]){assert.ok(reading.audio.intro.text.includes(line));assert.ok(parentText.includes(line));}
  assert.match(parentText,/意译/);
 }
});

test('spring poem final question distinguishes actions instead of rejecting flowers in the bird scene',()=>{
 const step=chapters.find(chapter=>chapter.id===ids[0]).steps[4];
 assert.match(step.question,/查看.*落花/);
 assert.match(step.options.find(option=>option.correct).label,/查看.*花/);
 assert.match(step.options.find(option=>!option.correct).label,/听.*鸟/);
});
