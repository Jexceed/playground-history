import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildStationGroups} from '../app/station-groups.ts';

const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));

test('visible and hidden chapters partition the full source library without dropping progress records',()=>{
  const product=read('content/product-map.json');
  const sourceIds=product.tracks.flatMap(track=>read(track.catalogPath).chapters.map(chapter=>chapter.id));
  const scope=read('content/preview-scope.json');
  const full=read('content/runtime/content-manifest.json');
  const preview=read('content/runtime/preview-manifest.json');
  const visibleIds=preview.tracks.flatMap(track=>track.chapters.map(chapter=>chapter.id));
  const visible=new Set(scope.chapterIds),source=new Set(sourceIds);
  const hidden=sourceIds.filter(id=>!visible.has(id));
  assert.equal(source.size,sourceIds.length,'Chapter IDs are unique across every catalog');
  assert.equal(visible.size,scope.chapterIds.length,'Visible IDs are unique');
  assert.ok(scope.chapterIds.every(id=>source.has(id)),'Every visible chapter has an authoritative catalog entry');
  assert.deepEqual(new Set(full.tracks.flatMap(track=>track.chapters.map(chapter=>chapter.id))),source);
  assert.deepEqual(new Set(visibleIds),visible);
  assert.equal(preview.totals.chapters,visible.size);
  assert.equal(full.totals.chapters,visible.size+hidden.length);
  assert.equal(full.totals.coreQuestSteps,source.size*5);
  assert.equal(preview.totals.coreQuestSteps,visible.size*5);
  assert.deepEqual(new Set(read('content/runtime/progress-index.json').map(chapter=>chapter.id)),source);
  const groups=buildStationGroups(preview.tracks);
  assert.deepEqual(new Set(groups.flatMap(group=>group.stations.flatMap(station=>station.chapterIds))),visible);
  assert.deepEqual(new Set(groups.flatMap(group=>group.stations.map(station=>station.periodId))),new Set(scope.periodIds));
  for(const group of groups){
    const track=preview.tracks.find(track=>track.id===group.id);
    const chapterIds=new Set(track.chapters.map(chapter=>chapter.id));
    assert.ok(group.stations.every(station=>station.trackId===track.id&&station.chapterIds.every(id=>chapterIds.has(id))));
  }
});

test('theme routes reuse visible chapter IDs and the same spoken introductions',()=>{
  const scope=new Set(read('content/preview-scope.json').chapterIds);
  const routes=read('content/play-routes.json').routes;
  const voices=new Map(read('content/voice-interface-lines.json').lines.map(line=>[line.id,line.text]));
  assert.equal(new Set(routes.map(route=>route.id)).size,routes.length);
  for(const route of routes){
    assert.equal(new Set(route.chapterIds).size,route.chapterIds.length,route.id);
    assert.ok(route.chapterIds.every(id=>scope.has(id)),route.id);
    assert.equal(voices.get(route.voiceId),route.intro,route.id);
    assert.ok(route.kicker&&route.years,route.id);
  }
  const world=routes.find(route=>route.id==='world');
  assert.ok(world.chapterIds.every(id=>id.startsWith('world-')));
  assert.match(world.kicker,/世界/);
  assert.doesNotMatch(world.years,/朝代/);
});
