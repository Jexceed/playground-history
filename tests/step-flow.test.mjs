import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {canContinueStep,stepVoiceIds} from '../app/step-flow.ts';

const chapters=JSON.parse(readFileSync(new URL('../public/content/preview-manifest.json',import.meta.url))).tracks.flatMap(t=>t.chapters);
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
