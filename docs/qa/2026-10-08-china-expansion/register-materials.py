"""One-off metadata registration; preserves original photographs and scans."""
import json,re,runpy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
QA=Path(__file__).parent
read=lambda p:json.loads((ROOT/p).read_text())
def write(p,data):(ROOT/p).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
rows=runpy.run_path(str(QA/'author-expansion.py'))['CHAPTERS']
metadata=json.loads((QA/'material-metadata.json').read_text())
metadata['qin-kneeling-archer']=json.loads((QA/'qin-archer-full-metadata.json').read_text())
metadata['han-changxin-lamp']=json.loads((QA/'han-lamp-whole-metadata.json').read_text())
metadata['han-lamp-sleeve-side']=json.loads((QA/'han-lamp-sleeve-side-metadata.json').read_text())
metadata['dufu-collection-cover']={**metadata['dufu-poems-volume2'],'localPath':'reference-assets/china-expansion/dufu-collection-cover.jpg'}
metadata['li-qingzhao-rumengling-page']={**metadata['li-qingzhao-shuyu'],'localPath':'reference-assets/china-expansion/li-qingzhao-rumengling-page.jpg'}
plain=lambda s:re.sub('<[^>]+>','',s).strip()
registry={'schemaVersion':1,'scope':'2026-10-08中国历史新增任务材料','assets':[]}
for row in rows:
 c=row['quest'];id=c['coverAssetId']
 if id in metadata:
  m=metadata[id];e=m['extmetadata'];license=e.get('LicenseShortName',{}).get('value','');assert license
  registry['assets'].append({'id':id,'chapterIds':[c['id']],'title':c['coverDisplay']['label'],'localPath':m['localPath'],'sourcePage':m['descriptionurl'],'author':plain(e.get('Artist',e.get('Credit',{})).get('value','见原始文件页')),'license':license,'licenseUrl':e.get('LicenseUrl',{}).get('value','https://creativecommons.org/publicdomain/mark/1.0/'),'clearance':'cleared-public-domain' if license=='Public domain' else 'cleared-open-license','factSourceIds':c['sourceIds'],'caption':c['coverDisplay']['label'],'boundary':c['boundary'],'notes':'原始文件与授权元数据保存在本轮QA。照片为开放授权参观摄影或古籍数字扫描，不冒称馆方官方摄影；运行缩图不修改文物内容。'})
 else:
  found=False
  for p in (ROOT/'content/assets').glob('*.json'):
   obj=json.loads(p.read_text())
   for a in obj.get('assets',[]):
    if a['id']==id:
     a['chapterIds']=list(dict.fromkeys(a['chapterIds']+[c['id']]));found=True
   if found:p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');break
  assert found,id
 art=c['presentation']['sceneAssetId'];p='reference-assets/china-expansion/'+art+'.png';assert (ROOT/p).exists(),p
 registry['assets'].append({'id':art,'chapterIds':[c['id']],'title':c['title']+'的故事插画','localPath':p,'sourcePage':'https://openai.com/policies/terms-of-use/','sourceFile':'content/focused-quests.json','author':'小小历史旅行团项目自制（image_gen）','license':'项目自制；按OpenAI使用条款持有输出使用权','licenseUrl':'https://openai.com/policies/terms-of-use/','clearance':'cleared-project-created','factSourceIds':c['sourceIds'],'caption':'现代教学故事插画，不是历史现场或文物照片。','boundary':c['boundary'],'notes':'参考既有三位小伙伴生成；实际提示词见docs/qa/2026-10-08-china-expansion/art-prompts*.json，原件保留在本目录。'})

lamp=next(r['quest'] for r in rows if r['quest']['id'].endswith('han-palace-lantern'))
m=metadata['han-lamp-sleeve-side'];e=m['extmetadata']
registry['assets'].append({'id':'han-lamp-sleeve-side','chapterIds':[lamp['id']],'title':'长信宫灯侧后方照片','localPath':m['localPath'],'sourcePage':m['descriptionurl'],'author':plain(e.get('Artist',{}).get('value','见文件页')),'license':e['LicenseShortName']['value'],'licenseUrl':e.get('LicenseUrl',{}).get('value','https://creativecommons.org/publicdomain/mark/1.0/'),'clearance':'cleared-open-license','factSourceIds':lamp['sourceIds'],'caption':'从侧后方看长信宫灯的宽袖与灯盘。','boundary':'这是今日文物照片，可观察相连的袖管；照片本身不显示烟尘在器内的运行。','notes':'完整照片原件保留。'} )
write('content/assets/china-expansion-assets.json',registry)
text='# 中国历史扩充素材署名\n\n事实依据与图像权利分开登记。原图不进入普通Git；运行缩图保留出处。\n\n'
for a in registry['assets']:text+=f"## {a['id']}\n\n- 文件：`{a['localPath']}`\n- 作者：{a['author']}\n- 来源：{a['sourcePage']}\n- 许可：{a['license']}，{a['licenseUrl']}\n- 身份与边界：{a['boundary']}\n\n"
(ROOT/'reference-assets/china-expansion/ATTRIBUTION.md').write_text(text)
print('Registered',len(registry['assets']),'new materials.')
