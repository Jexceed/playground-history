import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p));
const chapters=()=>read('public/content/preview-manifest.json').tracks.flatMap(t=>t.chapters);
const game=id=>chapters().find(c=>c.id===id).gameplay;

test('Tang music uses one museum object and ties observation to cultural contact',()=>{
 const g=game('cn-ancient-06-03-tang-changan');
 assert.deepEqual(g.photoAlbum.photos.map(p=>p.assetId),['tang-sancai-music-camel-front','tang-sancai-music-camel-side']);
 assert.match(g.finish.introAudio.text,/不同地方.*来往传播/);
 assert.match(g.boundary,/八人.*五人.*不同|八人.*不混作.*五人/);
 assert.equal(g.steps[2].interaction.imageLabel,'实物照片');
 assert.equal(g.steps[2].interaction.rounds[0].targetId,'musicians');
 assert.match(g.steps[3].options.find(o=>o.correct).label,/举笛/);
 assert.match(g.boundary,/现代学习道具/);
});
test('Xuanzang has distinct dates, translation roles and a later novel',()=>{
 const g=game('cn-ancient-06-04-tang-cultural-exchange');
 assert.match(g.steps[0].audio.intro.text,/645.*652/);
 assert.match(g.steps[0].inspection.caption,/后世改修/);
 assert.match(g.steps[1].audio.intro.text,/学习佛教.*不同语言.*合作/);
 assert.deepEqual(g.steps[2].interaction.rounds.map(r=>r.targetId),['explain','write']);
 assert.match(g.steps[3].options.find(o=>o.correct).label,/对照原文与译文/);
 assert.match(g.steps[4].audio.intro.text,/明代.*西游记/);
 assert.match(g.boundary,/记录与译经工作分开/);
 assert.ok(g.steps[1].sourceIds.includes('CSSN-TANG-TRANSLATION'));
});
test('Yan separates original writing traces from an attributed Qing addition',()=>{
 const g=game('cn-ancient-06-06-yan-zhenqing-draft');
 assert.match(g.steps[0].audio.intro.text,/758.*纪念亲人/);
 assert.match(g.steps[1].audio.intro.text,/去世的侄子/);
 assert.equal(g.steps[2].interaction.imageLabel,'文物图像');
 assert.equal(g.steps[2].interaction.rounds[0].targetId,'revision');
 assert.match(g.photoAlbum.photos[0].period,/758/);
 assert.match(g.photoAlbum.photos[1].period,/1786/);
 assert.match(g.steps[3].audio.intro.text,/不能只看颜色/);
 assert.match(g.steps[4].options.find(o=>o.correct).label,/改痕的草稿/);
 assert.match(g.steps[2].inspection.boundary,/CC BY 4.0/);
});
test('Li Bai keeps whole-poem listening and a later painting distinct from the poet',()=>{
 const g=game('cn-ancient-06-07-li-bai-jingyesi');
 assert.match(g.steps[0].audio.lead.text,/唐代诗人李白.*后人/);
 assert.match(g.steps[0].inspection.caption,/南宋13世纪.*唐代/);
 for(const phrase of ['床前明月光','疑是地上霜','举头望明月','低头思故乡'])assert.ok(g.steps[1].audio.intro.text.includes(phrase));
 assert.equal(g.steps[2].interaction.rounds.length,1);
 assert.match(g.steps[3].options.find(o=>o.correct).label,/家乡/);
 assert.equal(g.steps[4].interaction.kind,'look-listen');
 assert.match(g.finish.parent,/完整诵读.*不机械/);
});
test('four Tang chapters retain the shared story and local material/voice contract',()=>{
 for(const id of ['cn-ancient-06-03-tang-changan','cn-ancient-06-04-tang-cultural-exchange','cn-ancient-06-06-yan-zhenqing-draft','cn-ancient-06-07-li-bai-jingyesi']){
  const g=game(id);assert.deepEqual(g.steps.map(s=>s.id),['time','beginning','journey','change','takeaway']);
  assert.ok(g.steps[0].inspection?.sourceLinks.length>=2);assert.equal(g.finish.actions.length,2);
  assert.notEqual(g.presentation.sceneImage,g.presentation.story.reunionImage);
  for(const s of g.steps){assert.equal(s.audio.question.text,s.prompt);assert.ok(existsSync('public'+s.image));assert.ok(s.audio.lead.text.length<=48);}
 }
});
