import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {canContinueStep,stepVoiceIds,usesChoiceCards} from '../app/step-flow.ts';

const chapters=JSON.parse(readFileSync(new URL('../public/content/preview-manifest.json',import.meta.url))).tracks.flatMap(t=>t.chapters);
test('children hear the current question when a choice or hotspot step opens',()=>{
  const lines=JSON.parse(readFileSync(new URL('../public/audio/voice-lines.json',import.meta.url))).lines;
  const textById=new Map(lines.map(line=>[line.id,line.text]));
  for(const chapter of chapters){
    for(const step of chapter.gameplay.steps){
      const kind=step.interaction?.kind;
      if(!usesChoiceCards(kind)&&kind!=='scene-find')continue;
      const spoken=stepVoiceIds(step).map(id=>textById.get(id)).join('');
      const location=`${chapter.id}/${step.id}`;
      assert.match(spoken,/[？?]$/u,location);
      if(kind==='scene-find'){
        const first=step.interaction.rounds[0].question;
        assert.equal(step.prompt,first,location);
        assert.ok(spoken.endsWith(first),location);
      }
      if((chapter.id==='cn-ancient-08-01-ming-governance'&&step.id==='journey')||
        (['world-ancient-01-02-river-civilizations','world-ancient-01-04-greek-city-states'].includes(chapter.id)&&step.id==='takeaway')){
        assert.equal(spoken.match(/[？?]/gu)?.length,1,location);
      }
    }
  }
});
test('every reading page narrates its full story and can advance in one click',()=>{
  const readings=chapters.flatMap(c=>c.gameplay.steps).filter(s=>s.interaction?.kind==='look-listen');
  assert.ok(readings.length>=3);
  for(const step of readings){
    assert.deepEqual(stepVoiceIds(step),[step.audio.intro.id]);
    assert.equal(step.audio.intro.text,step.story.narration);
    assert.equal(canContinueStep(step,false),true);
    assert.equal(step.options.length,0);
  }
});
test('one-click story continuation does not bypass an unanswered quiz or operation',()=>{
  const activities=chapters.flatMap(c=>c.gameplay.steps).filter(s=>s.interaction?.kind!=='look-listen');
  for(const step of activities){
    assert.equal(canContinueStep(step,false),false);
    assert.equal(canContinueStep(step,true),true);
    if(step.interaction?.kind==='scene-find')assert.deepEqual(stepVoiceIds(step),[step.audio.intro.id,step.interaction.rounds[0].audio.question.id]);
    else if(step.interaction?.kind==='history-lab')assert.deepEqual(stepVoiceIds(step),[step.audio.intro.id]);
    else if(step.audio.lead)assert.deepEqual(stepVoiceIds(step),[step.audio.lead.id]);
  }
  assert.equal(canContinueStep(null,true),false);
});
