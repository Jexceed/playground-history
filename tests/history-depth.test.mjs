import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {stepVoiceIds} from '../app/step-flow.ts';

const read=path=>JSON.parse(readFileSync(path,'utf8'));
const game=suffix=>read('public/content/preview-manifest.json').tracks.flatMap(track=>track.chapters).find(chapter=>chapter.id.endsWith(suffix)).gameplay;
const voices=new Map(read('public/audio/voice-lines.json').lines.map(line=>[line.id,line.text]));
const actuallyHeard=step=>stepVoiceIds(step).map(id=>voices.get(id)).join(' ');

test('historical evidence and the comparison premise reach the actual playback sequence',()=>{
  assert.match(actuallyHeard(game('qin-terracotta').steps[3]),/秦代工匠.*颜色.*彩绘脱落.*真照片.*红色/);
  assert.match(actuallyHeard(game('sima-qian-shiji').steps[2]),/旧书.*访问记录.*已有材料.*想象/);
  assert.match(actuallyHeard(game('xu-xiake-notebook').steps[3]),/旧图.*河与桥.*准不准.*回头比较/);
  assert.match(actuallyHeard(game('zhenguan-governance').steps[3]),/春天.*播种.*人手不够.*不急用.*农时/);
  assert.match(actuallyHeard(game('jianzhen-eastward').steps[1]),/戒律.*修行生活.*规矩/);
});

test('the new colour observation uses a cleared photograph and non-overlapping crop-relative targets',()=>{
  const g=game('qin-terracotta'),step=g.steps[3];
  const asset=read('content/assets/history-depth-assets.json').assets.find(asset=>asset.id===step.assetId);
  assert.equal(asset.clearance,'cleared-open-license');
  assert.match(asset.license,/CC0/);
  assert.ok(asset.factSourceIds.includes('BMY-QIN-COLOR-PROTECTION'));
  assert.equal(step.interaction.imageLabel,'实物照片');
  assert.equal(step.inspection.id,asset.id);
  assert.ok(step.inspection.sourceLinks.some(link=>link.url.includes('commons.wikimedia.org')));
  const {imageCrop:crop,hotspots,rounds}=step.interaction;
  assert.ok(crop.x+crop.width<=crop.sourceWidth&&crop.y+crop.height<=crop.sourceHeight);
  for(const spot of hotspots)assert.ok(spot.x>=0&&spot.y>=0&&spot.width>0&&spot.height>0&&spot.x+spot.width<=1&&spot.y+spot.height<=1);
  for(let i=0;i<hotspots.length;i++)for(const b of hotspots.slice(i+1)){
    const a=hotspots[i];assert.ok(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y);
  }
  assert.equal(rounds.length,2);assert.equal(new Set(rounds.map(round=>round.targetId)).size,2);
  assert.match(rounds[1].feedback,/不能说.*从来没有彩绘/);
});
