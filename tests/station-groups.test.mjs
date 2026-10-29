import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildStationGroups} from '../app/station-groups.ts';
import {parseProgress} from '../app/quest-progress.ts';

const china = {
  id: 'china-ancient', label: '中国古代史',
  periods: [{id:'tang',label:'唐朝',years:'618年—907年'},{id:'hidden',label:'尚未开放'}],
  chapters: [{id:'poem',periodId:'tang'}],
};
const world = {
  id: 'world-ancient', label: '世界古代史',
  periods: [{id:'ancient-civilizations',label:'古代文明',years:'早期人类—约5世纪'}],
  chapters: [{id:'pyramid',periodId:'ancient-civilizations'},{id:'rome',periodId:'ancient-civilizations'}],
};

test('world history has its own group, numbering and chapters, while empty periods stay hidden',()=>{
  const groups=buildStationGroups([china,world]);
  assert.deepEqual(groups.map(group=>group.label),['中国古代史','世界古代史']);
  assert.deepEqual(groups.map(group=>group.stations.length),[1,1]);
  assert.deepEqual(groups.map(group=>group.stations[0].number),[1,1]);
  assert.deepEqual(groups[1].stations[0].chapterIds,['pyramid','rome']);
  assert.equal(groups[1].stations[0].trackLabel,'世界古代史');
  assert.equal(groups[1].stations[0].iconSrc,'/images/history-stations/world-ancient.webp');
});

test('a period ID shared across tracks cannot pull Chinese artwork or chapters into a world station',()=>{
  const matchingId={...world,periods:[{id:'tang',label:'另一个地区',years:'当地年代'}],chapters:[{id:'world-only',periodId:'tang'}]};
  const appearance={id:'tang',periodId:'tang',title:'唐朝旧标题',years:'旧日期',childLine:'中国故事',iconSrc:'/images/history-stations/tang.webp'};
  const groups=buildStationGroups([china,matchingId],[appearance]);
  assert.equal(groups[0].stations[0].title,'唐朝');
  assert.equal(groups[0].stations[0].years,'618年—907年');
  assert.equal(groups[1].stations[0].title,'另一个地区');
  assert.deepEqual(groups[1].stations[0].chapterIds,['world-only']);
  assert.notEqual(groups[0].stations[0].id,groups[1].stations[0].id);
  assert.equal(groups[1].stations[0].iconSrc,'/images/history-stations/world-ancient.webp');
});

test('catalog short dates and spoken introductions override old static station copy',()=>{
  const updated={...china,periods:[{...china.periods[0],stationYears:'本站学习的年代',learningContext:{childIntro:'听到的新故事'}}]};
  const station=buildStationGroups([updated])[0].stations[0];
  assert.equal(station.years,'本站学习的年代');
  assert.equal(station.childLine,'听到的新故事');
});

test('making a previously hidden world chapter visible preserves its existing record and resume position',()=>{
  const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
  const version=read('content/product-map.json').contentVersion;
  const index=new Map(read('content/runtime/progress-index.json').map(chapter=>[chapter.id,chapter]));
  const chapterId='world-ancient-01-05-rome-empire';
  const saved={schemaVersion:2,completed:['cn-ancient-04-01-qin-unification',chapterId],current:{chapterId,stepId:'journey',contentVersion:version,completedStepIds:['time']}};
  assert.deepEqual(parseProgress(JSON.stringify(saved),null,index,version),saved);
});
