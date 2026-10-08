"""One-off source update for the 20 narrative picture choices; not a runtime generator."""
import copy,json,sys
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[3]
read=lambda p:json.loads((ROOT/p).read_text())
def write(p,d):(ROOT/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
focused=read('content/focused-quests.json');chapters={c['id']:c for c in focused['chapters']}
ids={k:next(c for c in chapters if c.endswith(s)) for k,s in {'qin':'qin-terracotta','confucius':'hundred-schools','bridge':'zhaozhou-bridge','rain':'du-fu-spring-rain','cotton':'huang-daopo-cotton','lotus':'li-qingzhao-rumengling','lamp':'han-palace-lantern','shiji':'sima-qian-shiji','jianzhen':'jianzhen-eastward','bamboo':'zheng-banqiao-bamboo','inventions':'song-gunpowder-records'}.items()}
grid={'qin':(2,3),'confucius':(2,2),'bridge':(1,2),'rain':(1,2),'cotton':(1,2),'lotus':(2,2),'shiji':(2,2),'jianzhen':(2,3),'bamboo':(2,2),'inventions':(2,2)}
registry=read('content/assets/china-expansion-assets.json');rows=[]
available={key for key in grid if (ROOT/f'reference-assets/choice-art-refinement/{key}-choice-scenes-v2.png').exists()}
assert '--partial' in sys.argv or available==set(grid)
for key in grid:
 if key not in available:continue
 aid=f'{key}-choice-scenes-v2';local=f'reference-assets/choice-art-refinement/{aid}.png';assert (ROOT/local).exists(),local
 c=chapters[ids[key]]
 a={'id':aid,'chapterIds':[c['id']],'title':c['title']+'的情境选择分镜','localPath':local,'runtimeMaxEdge':2400,'sourcePage':'https://openai.com/policies/terms-of-use/','author':'小小历史旅行团项目自制（image_gen）','license':'项目自制；按OpenAI使用条款持有输出使用权','licenseUrl':'https://openai.com/policies/terms-of-use/','licensePath':'reference-assets/choice-art-refinement/ATTRIBUTION.md','clearance':'cleared-project-created','factSourceIds':c['sourceIds'],'caption':'现代教学故事插画，描绘可以比较的动作与情境。','boundary':'这是为选择题绘制的教学分镜，不是历史现场、人物肖像证据或文物照片。不同选项包含供比较的假设，须结合本章提问与反馈理解。','notes':'画风参考原章插画；保留旧图。完整原图及局部取景记录在本项目，实际提示词见docs/qa/2026-10-08-choice-art-refinement/prompts*.json。'}
 rows.append(a)
registry['assets']=[a for a in registry['assets'] if a['id'] not in {r['id'] for r in rows}]+rows

border_cache={}
def borders(key):
 if key in border_cache:return border_cache[key]
 im=Image.open(ROOT/f'reference-assets/choice-art-refinement/{key}-choice-scenes-v2.png').convert('RGB');w,h=im.size;pix=im.load();cols,rs=grid[key]
 def cream(c):return c[0]>235 and c[1]>225 and c[2]>185 and c[0]>=c[1]
 def gaps(axis,n):
  length=w if axis=='x' else h;other=h if axis=='x' else w;out=[0]
  for i in range(1,n):
   scores=[]
   for pos in range(int(length*(i-.20)/n),int(length*(i+.20)/n)):
    sample=[cream(pix[pos,t] if axis=='x' else pix[t,pos]) for t in range(0,other,5)];scores.append((sum(sample)/len(sample),pos))
   score,pos=max(scores);assert score>.70,(key,axis,i,score);out.append(pos)
  return out+[length]
 result={'width':w,'height':h,'x':gaps('x',cols),'y':gaps('y',rs)};border_cache[key]=result;return result

def panel(key,n,caption='',cue=None):
 if key not in available:return {}
 aid=f'{key}-choice-scenes-v2';r=borders(key);w,h=r['width'],r['height'];cols,rs=grid[key];col=n%cols;row=n//cols;assert row<rs
 x=r['x'][col]+8;y=r['y'][row]+8;right=r['x'][col+1]-8;bottom=r['y'][row+1]-8
 d={'assetId':aid,'crop':{'x':x,'y':y,'width':right-x,'height':bottom-y,'sourceWidth':w,'sourceHeight':h}}
 if caption:d['caption']=caption
 if cue:d['cue']=cue
 return d

def card(key,n):return {'kind':'scene-card',**panel(key,n)}
def strip(panels,relation='sequence'):return {'kind':'scene-strip','relation':relation,'panels':panels}
changes=[]
def apply(key,index,views):
 if key not in available and key!='lamp':return
 c=chapters[ids[key]];s=c['steps'][index];assert len(views)==len(s['options'])==2
 for o,v in zip(s['options'],views):
  assert o['objectView']['kind']=='study-card' or o['objectView']==v
  o['objectView']=v
 s['interaction']['choiceArt']='illustrated';s['interaction']['selectionFraming']='detail'
 changes.append({'chapterId':c['id'],'stepIndex':index,'stepId':['time','beginning','journey','change','takeaway'][index],'question':s['question'],'options':[o['label'] for o in s['options']],'views':views})
for key,index,nums in [('qin',1,[0,1]),('qin',3,[2,3]),('qin',4,[4,5]),('confucius',3,[0,1]),('confucius',4,[2,3]),('bridge',4,[0,1]),('rain',3,[0,1]),('cotton',1,[0,1]),('lotus',4,[2,3]),('shiji',4,[2,3]),('jianzhen',1,[0,1]),('jianzhen',3,[0,2]),('bamboo',3,[0,1]),('bamboo',4,[2,3]),('inventions',1,[0,1]),('inventions',4,[2,3])]:apply(key,index,[card(key,n) for n in nums])
apply('lotus',3,[strip([panel('lotus',i,label) for i,label in [(0,'晚回舟'),(1,'入荷丛'),(2,'鸟飞起')]]),strip([panel('lotus',i,label) for i,label in [(2,'鸟飞起'),(0,'晚回舟'),(1,'入荷丛')]])])
apply('shiji',3,[strip([panel('shiji',0,'孔子'),panel('shiji',1,'司马迁')]),strip([panel('shiji',0,'孔子'),panel('shiji',1,'司马迁')],'together')])
apply('jianzhen',4,[strip([panel('jianzhen',3,'受邀前往'),panel('jianzhen',0,'在那里传授')]),strip([panel('jianzhen',4,'出去学习'),panel('jianzhen',5,'带回再翻译')])])
shade={'assetId':'han-changxin-lamp','crop':{'x':180,'y':560,'width':480,'height':340,'sourceWidth':1200,'sourceHeight':1800}}
sleeve={'assetId':'han-lamp-sleeve-side','crop':{'x':85,'y':200,'width':390,'height':270,'sourceWidth':598,'sourceHeight':900}}
apply('lamp',4,[strip([{**shade,'caption':'灯罩 · 遮光','cue':'light'},{**sleeve,'caption':'袖管 · 导烟','cue':'smoke'}],'pair'),strip([{**shade,'caption':'灯罩 · 导烟','cue':'smoke'},{**sleeve,'caption':'袖管 · 遮光','cue':'light'}],'pair')])
# The inventory is counted from source, not copied from a previous estimate.
pending_ids={ids[k] for k in set(grid)-available}
assert all(o.get('objectView',{}).get('kind')!='study-card' or c['id'] in pending_ids for c in focused['chapters'] for s in c['steps'] for o in s['options'])
write('content/focused-quests.json',focused);write('content/assets/china-expansion-assets.json',registry)
write('docs/qa/2026-10-08-choice-art-refinement/choice-art-map.json',{'chapters':len({c['chapterId'] for c in changes}),'steps':len(changes),'options':2*len(changes),'choices':changes,'observedPanelBoundaries':border_cache})
text='# 情境选择分镜素材署名\n\n项目自制故事插画；事实与历史证据仍取原章节登记来源。原PNG不进入普通Git。\n\n'
for a in rows:text+=f"## {a['id']}\n\n- 原图：`{a['localPath']}`\n- 作者：{a['author']}\n- 许可：{a['license']}；{a['licenseUrl']}\n- 身份：{a['boundary']}\n- 提示词：`docs/qa/2026-10-08-choice-art-refinement/prompts*.json`\n\n"
(ROOT/'reference-assets/choice-art-refinement/ATTRIBUTION.md').write_text(text)
print(f'Updated {len(changes)} pairs in {len({c["chapterId"] for c in changes})} chapters; registered {len(rows)} illustration sheets.')
