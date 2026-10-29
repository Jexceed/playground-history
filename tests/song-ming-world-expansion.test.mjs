import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {stepVoiceIds} from '../app/step-flow.ts';
import {buildStationGroups} from '../app/station-groups.ts';

const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const newIds=[
 'cn-ancient-07-10-wang-anshi-yuanri',
 'cn-ancient-07-11-su-shi-xilin',
 'cn-ancient-07-12-yang-wanli-xiaochi',
 'cn-ancient-07-13-fan-chengda-tianyuan',
 'cn-ancient-08-10-tang-yin-rooster',
 'cn-ancient-08-11-wen-zhengming-garden',
 'cn-ancient-08-12-yu-qian-lime',
 'world-ancient-01-03-ancient-india',
 'world-ancient-01-04-greek-city-states',
 'world-ancient-02-01-medieval-europe',
 'world-ancient-02-05-africa-americas',
];

test('Song station uses the Song dates while the parallel polity lesson retains its own chronology',()=>{
 const catalog=read('content/catalog.json');
 const period=catalog.periods.find(period=>period.id==='song');
 const station=buildStationGroups([{id:'china-ancient',label:'中国古代史',periods:[period],chapters:catalog.chapters}],
  [{id:'song',periodId:'song',title:'宋朝与辽·西夏·金',years:'916—1279年',childLine:'旧说明',iconSrc:'test'}])[0].stations[0];
 assert.equal(station.title,'宋朝');
 assert.equal(station.years,'960—1279年');
 assert.match(period.learningContext.chronology,/辽.*西夏.*金.*独立政权/);
 assert.ok(station.chapterIds.includes('cn-ancient-07-01-parallel-regimes'));
});

test('every new playable question supplies its premise in the real entry audio',()=>{
 const chapters=new Map(read('content/focused-quests.json').chapters.map(chapter=>[chapter.id,chapter]));
 const lines=new Map(read('public/audio/voice-lines.json').lines.map(line=>[line.id,line.text]));
 for(const id of newIds){
  const chapter=chapters.get(id);
  assert.ok(chapter,id);
  const detail=read(`public/content/chapters/${id}.json`);
  assert.deepEqual(detail.gameplay.steps.map(step=>step.id),['time','beginning','journey','change','takeaway']);
  for(const [index,step] of chapter.steps.entries()){
   const heard=stepVoiceIds(detail.gameplay.steps[index]).map(id=>lines.get(id)).join(' ');
   assert.ok(heard.includes(step.story),`${id}/${index}: missing audible story premise`);
   if(step.interaction.kind==='scene-find')assert.ok(heard.includes(step.interaction.rounds[0].question));
   else if(step.interaction.kind!=='look-listen')assert.ok(heard.includes(step.question),`${id}/${index}: missing question`);
  }
 }
});

test('new poem interpretation follows a complete listening step and parents can inspect text and translation',()=>{
 for(const id of newIds.filter(id=>id.startsWith('cn-'))){
  const detail=read(`public/content/chapters/${id}.json`);
  const reading=detail.gameplay.steps[1];
  assert.equal(reading.interaction.kind,'look-listen',id);
  assert.deepEqual(stepVoiceIds(reading),[reading.audio.intro.id]);
  const parent=detail.textbookConnection.companions.map(item=>`${item.type} ${item.label} ${item.note}`).join(' ');
  assert.match(parent,/原文/,id);
  assert.match(parent,/意译/,id);
 }
});
