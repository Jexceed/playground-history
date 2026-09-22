import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,existsSync} from 'node:fs';
import {focusAlbumPhoto} from '../app/photo-album.ts';
import {buildFocusedGameplay} from '../scripts/lib/focused-gameplay.mjs';

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url)));
const chapterId='cn-ancient-04-05-qin-great-wall';
const source=read('../content/focused-quests.json').chapters.find(c=>c.id===chapterId);

test('album paging keeps each real photo with its own era, narration and sources',()=>{
  const game=read('../public/content/preview-manifest.json').tracks.flatMap(t=>t.chapters).find(c=>c.id===chapterId).gameplay;
  const album=game.photoAlbum;
  assert.equal(album.photos.length,6);
  assert.equal(new Set(album.photos.map(p=>p.image)).size,6);
  assert.deepEqual(album.photos.map(p=>p.period.slice(0,2)),['明代','明代','明代','汉代','汉代','汉代']);
  for(const [index,photo] of album.photos.entries()){
    const focused=focusAlbumPhoto(album,index);
    assert.equal(focused.images[0].src,photo.image);
    assert.equal(focused.period,photo.period);
    assert.equal(focused.observation,photo.observation);
    assert.equal(focused.voice,photo.audio);
    assert.equal(focused.sourceLinks,photo.sourceLinks);
    assert.equal(focused.boundary,photo.boundary);
    assert.ok(photo.audio.text.includes(photo.period.slice(0,2)));
    assert.ok(photo.sourceIds.length>0);
    assert.ok(photo.sourceLinks.some(s=>s.url.includes('creativecommons.org')));
    assert.ok(existsSync(new URL(`../public${photo.image}`,import.meta.url)));
  }
  assert.throws(()=>focusAlbumPhoto(album,album.photos.length),RangeError);
});

test('the pack rejects an album with missing era or unregistered photo instead of falling back',()=>{
  const assets=read('../content/assets/qin-han-assets.json').assets;
  const build=focused=>buildFocusedGameplay({focused,assets,interactions:[],childEntry:{preferredAssetId:source.coverAssetId},registerVoiceLine:text=>({id:text,text})});
  const missingEra=structuredClone(source);delete missingEra.photoAlbum.photos[0].period;
  assert.throws(()=>build(missingEra),/Missing album period/);
  const wrongPhoto=structuredClone(source);wrongPhoto.photoAlbum.photos[0].assetId='unregistered-photo';
  assert.throws(()=>build(wrongPhoto),/Uncleared evidence unregistered-photo/);
});

test('a scene cannot describe a project illustration as an artifact photograph',()=>{
  const sources=read('../content/focused-quests.json').chapters;
  const focused=structuredClone(sources.find(c=>c.id==='cn-ancient-06-02-tang-governance'));
  const assets=[...read('../content/assets/sui-tang-five-dynasties-assets.json').assets,...read('../content/assets/cross-money-history-assets.json').assets];
  focused.steps[2].visualAssetId=focused.presentation.sceneAssetId;
  assert.throws(()=>buildFocusedGameplay({focused,assets,interactions:[],childEntry:{preferredAssetId:focused.coverAssetId},registerVoiceLine:text=>({id:text,text})}),/Photograph label requires external registered evidence/);
});

test('artifact detail keeps the original photo and rejects a crop outside it',()=>{
  const original=read('../content/focused-quests.json').chapters.find(c=>c.id==='cn-ancient-06-02-tang-governance');
  const assets=[...read('../content/assets/sui-tang-five-dynasties-assets.json').assets,...read('../content/assets/cross-money-history-assets.json').assets];
  const build=focused=>buildFocusedGameplay({focused,assets,interactions:[],childEntry:{preferredAssetId:focused.coverAssetId},registerVoiceLine:text=>({id:text,text})});
  const game=build(original),photo=game.photoAlbum.photos[1],detail=focusAlbumPhoto(game.photoAlbum,1);
  assert.equal(detail.images[0].src,photo.image);
  assert.deepEqual(detail.images[0].crop,photo.crop);
  assert.equal(detail.voice.text,photo.narration);
  assert.match(detail.images[0].caption,/原图局部/);
  const invalid=structuredClone(original);invalid.photoAlbum.photos[1].crop.x=1920;
  assert.throws(()=>build(invalid),/Invalid photo crop/);
});
