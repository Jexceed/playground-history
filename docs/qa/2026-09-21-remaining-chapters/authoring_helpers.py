"""One-time source-authoring helpers; runtime remains owned by npm scripts."""
import json,pathlib
F=pathlib.Path('content/focused-quests.json')
def read(p):return json.loads(pathlib.Path(p).read_text())
def write(p,x):pathlib.Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def visual(*labels):return {'kind':'sequence','items':[{'icon':'book','label':x} for x in labels]}
def era(name,date,station,correct,marker=None):
 o={'kind':'era','name':name,'date':date,'stationImage':f'/images/history-stations/{station}.webp'}
 if marker:o['marker']=marker
 return {'label':f'{name} · {date}','correct':correct,'visual':visual(name,date),'objectView':o}
def card(label,asset,box,correct):return {'label':label,'correct':correct,'visual':visual(label),'objectView':{'kind':'scene-card','assetId':asset,'crop':dict(zip(['x','y','width','height','sourceWidth','sourceHeight'],box))}}
def step(title,story,question,right,wrong,nextlabel,sources,kind='pick',options=None,asset=None,display=None,lead=None):
 x={'title':title,'story':story,'question':question,'feedback':right,'wrongFeedback':wrong,'narration':lead or question,'displayText':display or story,'beat':story.split('。')[0]+'。','sourceIds':sources,'visual':visual(title),'options':options or [],'narrative':{'scene':'workshop','caption':title,'speaker':'小伙伴','responseSpeaker':'小伙伴','response':right,'retry':wrong,'nextLabel':nextlabel,'kind':'fictional-guide-scene'},'interaction':{'kind':kind,'hint':'听听问题，看看图里的线索。'}}
 if kind=='look-listen':x['interaction']['continueLabel']=nextlabel
 if kind=='pick':x['interaction']['selectionFraming']='detail'
 if asset:x['visualAssetId']=asset;x['narrative']['scene']='detail'
 return x
def inspection(asset,title,caption,narration,links,height=330,framing='object'):
 return {'assetId':asset,'title':title,'caption':caption,'label':'点开真材料，听听说明','narration':narration,'sourceLinks':links,'framing':framing,'displayHeight':height}
def scene_find(x,hotspots,rounds,label='故事插画',ratio=1.5):
 x['options']=[];x['interaction'].update(kind='scene-find',hotspots=[dict(zip(['id','label','x','y','width','height'],h)) for h in hotspots],rounds=[dict(zip(['id','question','targetId','feedback','retry','nextLabel'],r)) for r in rounds],imageLabel=label,sceneAspectRatio=ratio)
 return x
def presentation(c,scene,reunion,station,ratio=1.5,endratio=1.85):
 c['presentation']={'kind':'object-workbench','sceneAssetId':scene,'sceneAlt':c['title']+'的儿童故事插画','title':c['title'],'evidenceTitle':c['steps'][0]['inspection']['title'],'evidenceLine':'真实材料与故事插画分别看。','evidenceNarration':c['steps'][0]['inspection']['narration'],'guide':'听听问题，点图回答。','alignHint':'','familyHint':'回看图里的线索，再和家人说说发现。','familyLabel':'和家人回看今天的发现','familyMode':'actions','nextLabel':'继续看故事','lastLabel':'把发现带回家','sceneFraming':'story','sceneAspectRatio':ratio,'story':{'kind':'travel-story','reunionAssetId':reunion,'reunionAlt':'三位现代小伙伴与向导回看本章图画，教学插画','reunionAspectRatio':endratio,'coverCaption':c['title'],'coverNarration':c['hook'],'stationLine':station,'stationNarration':station,'closingCaption':'带着发现回家','closingNarration':c['outcome'],'closingLine':c['closingLine'],'fictionNote':c['boundary']}}
 c.pop('closingLine',None);c['photoSteps']=[];c['coverAssetId']=scene
 return c
def save_chapter(c):
 f=read(F);i=next(i for i,x in enumerate(f['chapters']) if x['id']==c['id']);f['chapters'][i]=c;write(F,f)
def add_source(s):
 p='content/sources.json';d=read(p);d['sources']=[x for x in d['sources'] if x['id']!=s['id']]+[s];write(p,d)
def add_art(registry,id,title,chapter,sourceids,dir,notes):
 d=read(registry);a={'id':id,'title':title,'localPath':f'reference-assets/{dir}/{id}.png','sourcePage':'https://openai.com/policies/terms-of-use/','author':'小小历史旅行团项目（内置image_gen辅助生成）','license':'项目自制，供本项目使用','licenseUrl':'https://openai.com/policies/terms-of-use/','clearance':'cleared-project-created','childVisibility':'child-ok','chapterIds':[chapter],'factSourceIds':sourceids,'caption':'现代教学故事插画，不是历史照片。','boundary':notes,'notes':notes+f' 实际提示词见docs/qa/2026-09-21-remaining-chapters/{id}-prompt.txt。'}
 old=next((x for x in d['assets'] if x['id']==id),None)
 if old:a['chapterIds']=list(dict.fromkeys(old.get('chapterIds',[])+a['chapterIds']));a['factSourceIds']=list(dict.fromkeys(old.get('factSourceIds',[])+a['factSourceIds']))
 d['assets']=[x for x in d['assets'] if x['id']!=id]+[a];write(registry,d)
def update_md(path,c):
 p=pathlib.Path(path);t=p.read_text();mark='## 当前五步试玩'
 if mark in t:t=t[:t.index(mark)]
 t+='## 当前五步试玩（2026-09-21）\n\n'+c['title']+'\n\n'+c['hook']+'\n\n核心历史关系：'+c['outcome']+' ['+'; '.join(c['sourceIds'])+']\n\n'
 t+='| 步骤 | 故事与儿童动作 | 依据 |\n| --- | --- | --- |\n'
 for k,s in zip(['time','beginning','journey','change','takeaway'],c['steps']):t+=f"| {k} | {s['story']} 孩子：{s['question']} | [{'; '.join(s['sourceIds'])}] |\n"
 t+='\n材料边界：'+c['boundary']+'\n\n亲子动作：'+' '.join(c['finish']['actions'])+'\n\n当前实现以focused-quests.json为准；上文保留研究与编辑稿，不直接塞入儿童页。真实儿童理解与人工校听待复核。\n';p.write_text(t)
