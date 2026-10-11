import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {completedQuestSteps,recordCompletedStep,nextUnfinishedStep,parseProgress,exportProgress,mergeProgressImport} from '../app/quest-progress.ts';

const chapters=JSON.parse(readFileSync(new URL('../content/runtime/progress-index.json',import.meta.url)));
const index=new Map(chapters.map(chapter=>[chapter.id,chapter]));
const chapter=chapters[0],steps=chapter.gameplay.steps,version='0.68.0';
const saved=(stepId,completedStepIds)=>({chapterId:chapter.id,stepId,contentVersion:version,completedStepIds});

test('jumping straight to the final step never manufactures completed steps after reopening',()=>{
  const progress={schemaVersion:2,completed:[],current:saved('takeaway',[])};
  const reopened=parseProgress(exportProgress(progress,version),null,index,version);
  assert.deepEqual(completedQuestSteps(reopened.current,steps),[]);
  const afterAnswer=recordCompletedStep(steps,[], 'takeaway');
  assert.deepEqual(afterAnswer,['takeaway']);
  assert.equal(nextUnfinishedStep(steps,afterAnswer,4),0);
  assert.deepEqual(reopened.completed,[]);
});

test('legacy sequential saves retain their position and earlier completed steps',()=>{
  const current={chapterId:chapter.id,stepId:'journey',contentVersion:version};
  const reopened=parseProgress(JSON.stringify({schemaVersion:2,completed:[chapter.id],current}),null,index,version);
  assert.deepEqual(reopened.current,current);
  assert.deepEqual(completedQuestSteps(reopened.current,steps),['time','beginning']);
  assert.deepEqual(reopened.completed,[chapter.id]);
});

test('malformed or foreign completion IDs cannot turn a new jump into a legacy sequential save',()=>{
  for(const completedStepIds of [null,'all',['time','time','unknown',3]]){
    const parsed=parseProgress(JSON.stringify({schemaVersion:2,completed:[],current:saved('takeaway',completedStepIds)}),null,index,version);
    assert.deepEqual(completedQuestSteps(parsed.current,steps),Array.isArray(completedStepIds)?['time']:[]);
  }
});

test('all 112 chapters finish only after every required step has actually been recorded',()=>{
  assert.equal(chapters.length,112);
  for(const chapter of chapters){
    const steps=chapter.gameplay.steps;
    let completed=[];
    for(const [order,stepIndex] of [4,2,0,3,1].entries()){
      completed=recordCompletedStep(steps,completed,steps[stepIndex].id);
      const next=nextUnfinishedStep(steps,completed,stepIndex);
      if(order<4)assert.ok(next>=0&&!completed.includes(steps[next].id),chapter.id);
      else assert.equal(next,-1,chapter.id);
    }
    assert.deepEqual(completed,steps.map(step=>step.id));
  }
});

test('an unfinished reading step remains required even after later questions have been solved',()=>{
  const completed=['time','journey','change','takeaway'];
  assert.equal(nextUnfinishedStep(steps,completed,4),1);
  assert.equal(nextUnfinishedStep(steps,recordCompletedStep(steps,completed,'beginning'),1),-1);
});

test('native record transfer merges same-chapter step completions without dropping the chosen position',()=>{
  const existing={schemaVersion:2,completed:[],current:saved('time',['time','takeaway'])};
  const incoming={schemaVersion:2,completed:[],current:saved('change',['journey'])};
  const merged=mergeProgressImport(exportProgress(incoming,version),existing,index,version);
  assert.equal(merged.current.stepId,'change');
  assert.deepEqual(merged.current.completedStepIds,['time','journey','takeaway']);
  assert.deepEqual(merged.completed,[]);
});
