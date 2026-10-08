"""One-off source authoring record for the China expansion.

The resulting content/*.json and chapters/*.md are the maintained sources.
This is not a second runtime generator. Do not rerun after later editorial edits.
"""
import copy,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def read(p):return json.loads((ROOT/p).read_text())
def write(p,d):(ROOT/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')

def visual(label,icon='book',items=None):
 return {'kind':'sequence','items':items or [{'icon':icon,'label':label}]}
def study(label,correct,items):
 return {'label':label,'correct':correct,'visual':visual(label,items=[{'icon':i,'label':t} for i,t in items]),'objectView':{'kind':'study-card'}}
def crop(asset,x,y,w,h,sw=1536,sh=1024):
 return {'kind':'scene-card','assetId':asset,'crop':{'x':x,'y':y,'width':w,'height':h,'sourceWidth':sw,'sourceHeight':sh}}
def picture(label,correct,view):
 return {'label':label,'correct':correct,'visual':visual(label),'objectView':view}
def era(name,date,correct):
 return {'label':name+' · '+date,'correct':correct,'visual':visual(name,items=[{'icon':'timeline','label':name},{'icon':'book','label':date}]),'objectView':{'kind':'era','name':name,'date':date,'marker':'calendar'}}
def step(title,story,question,feedback,retry,kind='pick',options=None,asset=None,lead=None,inspection=None,interaction=None,next_label='接着看看'):
 r={'title':title,'story':story,'question':question,'feedback':feedback,'wrongFeedback':retry,
    'narration':lead or story,'displayText':story,'beat':story,'sourceIds':[],
    'visual':visual(title),'options':options or [],
    'narrative':{'scene':'detail','caption':title,'speaker':'小伙伴','responseSpeaker':'小伙伴','response':feedback,'retry':retry,'nextLabel':next_label},
    'interaction':{'kind':kind,'hint':'听清故事，再看看眼前的线索。',**(interaction or {})}}
 if asset:r['visualAssetId']=asset
 if inspection:r['inspection']=inspection
 return r
def finding(hotspots,rounds,label='故事插画',ratio=1.5):
 return {'imageLabel':label,'sceneAspectRatio':ratio,'hotspots':[dict(zip(['id','label','x','y','width','height'],s)) for s in hotspots],
         'rounds':[{'id':r[0],'targetId':r[0],'question':r[1],'feedback':r[2],'retry':r[3],'nextLabel':r[4] if len(r)>4 else '继续找线索'} for r in rounds]}
def inspect(asset,title,caption,narration):
 return {'assetId':asset,'title':title,'caption':caption,'label':'看大图，听材料说明','narration':narration,'sourceLinks':[],'framing':'object','displayHeight':290}

CHAPTERS=[]
def chapter(id,period,title,hook,outcome,anchor,cover,cover_label,art,source_ids,boundary,goal,question,observe,related,place,facts,steps,actions,theme='艺术和表达'):
 for s in steps:
  if not s['sourceIds']:s['sourceIds']=source_ids
  if s.get('inspection'):s['inspection']['sourceLinks']=[{'title':SOURCES[x]['title'],'url':SOURCES[x]['url']} for x in source_ids]
  if s['interaction']['kind']=='pick':s['interaction']['selectionFraming']='detail'
  if not s.get('visualAssetId'):s['visualAssetId']=art
 c={'id':id,'title':title,'cta':'一起去找线索','hook':hook,'outcome':outcome,'sourceIds':source_ids,'anchor':anchor,'boundary':boundary,
    'coverAssetId':cover,'coverDisplay':{'label':cover_label,'fit':'contain'},'evidenceAssetIds':[cover],'photoSteps':[],
    'entry':{'object':cover_label,'place':place,'culture':anchor},'steps':steps,
    'finish':{'title':outcome,'actions':actions,'parent':question+' '+observe+' '+boundary,'sceneStepIndexes':[2,4]},
    'presentation':{'kind':'object-workbench','sceneAssetId':art,'sceneAlt':title+'的现代教学故事插画','title':title,'evidenceTitle':cover_label,'evidenceLine':'真材料的年代和身份可以在大图里查看。','evidenceNarration':steps[0]['inspection']['narration'],'guide':'听清故事，点图或动手找线索。','alignHint':'','familyHint':'回看图里的发现，再和家人做一次。','familyLabel':'和家人再试一次','familyMode':'actions','nextLabel':'继续找线索','lastLabel':'带着发现回家','sceneFraming':'story','sceneAspectRatio':1.5,
      'story':{'kind':'travel-story','reunionAssetId':art,'reunionAlt':'三位小伙伴回看'+title+'的线索，现代教学插画','reunionAspectRatio':1.5,'reunionFit':'contain','coverCaption':title,'coverNarration':hook,'closingCaption':'我们带回了一个发现','closingLine':outcome,'closingNarration':outcome,'fictionNote':boundary}}}
 CHAPTERS.append({'quest':c,'period':period,'facts':facts,'learning':{'id':id,'theme':theme,'learningGoal':goal,'parentQuestion':question,'observe':observe,'misconception':boundary,'evidenceStepIds':['time','journey','change','takeaway'],'sourceIds':source_ids,'related':[{'chapterId':related,'relation':'比较两章的材料与用途，留意人物、年代和任务不同。'}],'reviewStatus':'authored-implementation-family-test-pending','glossaryTerms':['文物']}})
 return c

SOURCES={s['id']:s for s in read('content/sources.json')['sources']}
def source(id,title,institution,url,use,kind='museum-or-primary-institution-reference'):
 SOURCES[id]={'id':id,'title':title,'institution':institution,'url':url,'type':kind,'authorityLevel':'A-primary-institution','factUse':use,'imageUse':'reference-only'}
source('EDB-ANALECTS-FOUR','《论语四则》选篇分析，1—2页','香港特别行政区政府教育局','https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/resources/primary/lang/culture/03_001.pdf','孔子及弟子言行的文本、学而时习之、温习与实践含义、三人不是固定数量。')
source('UNESCO-QIN-TERRACOTTA','秦始皇陵及兵马俑遗产记录','UNESCO世界遗产中心','https://whc.unesco.org/en/list/441/','秦始皇陵、陪葬坑、陶人陶马、雕塑与工匠技艺的证据；不用页面的秦朝止年作为全朝代时间范围。')
source('NMC-ZHAOZHOU-BRIDGE','安济桥石栏板','中国国家博物馆','https://www.chnmuseum.cn/zp/zpml/kgfjp/202111/t20211112_252139.shtml','隋代李春、桥面通行、大拱与两肩小拱的过水和减重作用；原构件与历代修桥分开。')
source('ICH-HUANG-DAOPO','乌泥泾手工棉纺织技艺','中国非物质文化遗产网','https://www.ihchina.cn/project_details/14281/','宋末元初黄道婆从崖州带回并传授棉纺织技艺，捍弹纺织不同工序及后世传承。')
source('ECNU-HUANG-DAOPO','衣被天下：黄道婆创新精神与棉纺织文化展','华东师范大学博物馆','https://digitalmuseum.ecnu.edu.cn/huangdaopo/index.html','黄道婆学习海南黎族棉纺织技术、回乡改进传授；现代展览不是元代现场。')
source('EDB-DUFU-SPRING-RAIN','《春夜喜雨》朗读参考，第1页','香港特别行政区政府教育局','https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/resources/pth_lt/19_chun_ye_xi_yu.pdf','杜甫诗的原文、细雨润物、夜与晨景及喜悦表达；不据诗推定整年雨情。')
source('BJWOMEN-LI-RUMENGLING','如梦令：一帘幽梦，千种诗情','北京市妇联学习平台','https://study.bjwomen.gov.cn/thought/knowledge/2022/05/20/3988.shtml','李清照《如梦令·常记溪亭日暮》的全文及追忆、回舟、入荷丛和惊起水鸟的叙事。')
source('EDB-ZHENG-BAMBOO','《竹石》选篇分析，第1页','香港特别行政区政府教育局','https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/resources/primary/lang/culture/03_020.pdf','清代郑板桥与题画诗《竹石》、咬定和坚劲的诗意、借竹喻人，不作抗风数值模型。')
source('MIA-ZHENG-BAMBOO-1760','Bamboo and Rocks，95.54.2','Minneapolis Institute of Art','https://collections.artsmia.org/art/4839/','郑燮竹石画的馆藏身份与年代；画上题款不直接当成本章《竹石》诗原稿。')
source('DPM-CHANGXIN-LAMP','长信宫灯展品条目','故宫博物院展览资料','https://ggzl.dpm.org.cn/pages/exhibit_works/details?id=10933','河北博物院藏西汉长信宫灯、满城汉墓出土、袖管导烟；不声称完全无烟。')
source('HEBEI-CHANGXIN-STRUCTURE','长信宫灯展出介绍：灯罩、灯盘与可拆构件','北京市人民政府门户网站（河北文物展报道）','https://www.beijing.gov.cn/fuwu/bmfw/sy/jrts/202604/t20260420_4595520.html','展品的灯罩可调、灯盘可转、分部铸造和拆洗设计；不采用流转归属的推断作儿童题。','government-museum-exhibition-report')
source('NLC-SHIJI-EDITIONS','《史记》及三家注的流传','国家图书馆/国家古籍保护中心','https://www.nlc.cn/pcab/zx/xw/20200708_192637.shtml','司马迁、西汉、《史记》纪传体与后世注释刊印；古书不等于亲笔。')
source('NMC-JIANZHEN-STORY','中华史诗美术大展：鉴真东渡','中国国家博物馆','https://en.chnmuseum.cn/Portals/0/web/exhibition/exhibitions/161120Chines-Epic/','唐代鉴真受邀东渡、典籍与文化传授、同行协作；出海到达与入奈良分开，不用展览新画作现场照片。')
source('NLC-SHUYU-1881','《漱玉词》清刻本，扫描第3、5、6页','国家图书馆藏本数字扫描','https://commons.wikimedia.org/wiki/File:NLC892-312002087162-387332_漱玉詞.pdf','题页光绪辛巳、作者宋李清照及第6页的如梦令全文；原图按公有领域扫描使用。','national-library-digitized-edition')

# Authored chapters follow. They use the shared five-step flow and registered assets.

chapter('cn-ancient-03-03-hundred-schools','spring-autumn-warring-states','跟孔子学会学与习',
 '孔子说，学过还要温习和练习。小伙伴刚学了一个动作，怎样把学到的真正用起来？',
 '孔子生活在春秋。《论语》留下孔子和弟子的言行；学过还要温习、实践，后来人把这些话传到今天。',
 '孔子与《论语》','analects-ming-commentary','明刊《论语注疏》','confucius-learning-v1',['EDB-ANALECTS-FOUR'],
 '眼前是明代刊本，不是孔子手稿。拍手是现代孩子的生活练习，不是春秋课堂复原；不以背诵或动作快慢评价孩子。',
 '认识孔子与《论语》，把学、温习和实践连起来。','这句话是谁留下的？学过之后还能做什么？','能指出后世书本保存言行，并用动作演出温习和练习。','cn-ancient-04-04-han-knowledge','春秋鲁国与今天的阅读室',[],[
 step('先去孔子生活的时代','孔子生活在春秋，重视学习。眼前是很久以后印的《论语注疏》，把孔子和弟子的言行传下来。','孔子生活在哪个时候？','春秋时期，孔子和学生讨论怎样学习。','秦朝在后面，孔子生活在更早的春秋。','timeline',[era('春秋','约前770—前476年',True),era('秦朝','前221—前207年',False)],inspection=inspect('analects-ming-commentary','明刊《论语注疏》','人物在春秋 · 书是明代刊本','照片里是明代印的《论语注疏》，能看到经文和解释。它不是孔子亲笔。')),
 step('听一句留下来的古话','《论语》记着：“学而时习之，不亦说乎？”意思是学了还温习、实践，会有收获。小伙伴想试一试。','学过了，还可以怎样做？','学与习连起来，才把办法用起来。','再听听，“习”还包括温习和实践。','look-listen',next_label='和小伙伴试一次',interaction={'continueLabel':'和小伙伴试一次'}),
 step('把听过的动作做出来','这是今天的练习：小伙伴听过拍手的示范，要把动作自己做一次。找到正在亲手练习的地方。','哪里在亲手练习？','对，小伙伴正把学到的动作做出来。','书保存了话；这里要找亲手练习的动作。','pick',[
  picture('小伙伴动手练习',True,crop('confucius-learning-v1',0,0,1536,1024)),
  picture('展柜保存书本',False,crop('confucius-learning-v1',975,210,480,270))]),
 step('隔一会儿，再想再试','小伙伴过了一会儿忘了动作。先回想，听不清就再听示范，再自己试试；不用和别人比快。','忘了一步，怎样继续学？','回想、再听、再练，都是学习的办法。','只听熟了还不够，再把办法做出来。','pick',[
  study('再听一次，然后自己做',True,[('ear','再听'),('people','再练')]),
  study('只多听几遍，还没有练',False,[('ear','听'),('ear','再听')])]),
 step('书里的话来到今天','孔子和弟子的言行由后人整理、抄写、刊印，传到今天。我们也能读这句话，在生活里练习。','怎样把这句古话带回家？','和家人再练一次，让学过的办法用起来。','认识书很重要，还可以把学过的办法用起来。','pick',[
  study('选一件学过的事，再练一次',True,[('book','学过'),('people','再练')]),
  study('只记住这本书长什么样',False,[('eye','看外形'),('book','书本')])])
 ],['请家人示范一个短动作，隔一会儿再一起做。','指着书影说或听：孔子在春秋，这本书是后人印的。'],theme='知识和技术')

chapter('cn-ancient-04-08-qin-terracotta','qin','兵马俑留下了哪些线索？',
 '秦始皇陵旁有陶做的人和马。小伙伴发现它们的姿势不一样，哪些细节能让我们认识秦代的工匠和军队？',
 '兵马俑是秦始皇陵的陪葬陶塑。姿态、服饰和制作细节留下秦代的线索，今天的人还在研究和保护它们。',
 '秦代工匠与兵马俑','qin-kneeling-archer','秦代跪射俑 · 文物照片','qin-terracotta-visit-v1',['UNESCO-QIN-TERRACOTTA'],
 '陶俑不是活人变成的，也不能从一张照片认出真实士兵姓名。故事图是博物馆学习情境；不模拟作战、文物拆装或发掘。',
 '从陶塑的姿态与服饰理解陪葬用途和历史证据。','这些陶人为什么在帝陵旁？你从哪里看见姿态和服饰的线索？','指弯曲的腿和铠甲细节，知道是陶塑而不是真人。','cn-ancient-04-01-qin-unification','秦始皇陵与今天的博物馆',[
 ('秦始皇陵位于今天陕西西安临潼，是秦始皇的陵墓。','UNESCO-QIN-TERRACOTTA'),
 ('陵墓周围有陪葬坑，出土陶制士兵形象与陶马等遗物。','UNESCO-QIN-TERRACOTTA'),
 ('兵马俑属于秦代陶塑艺术的重要遗存。','UNESCO-QIN-TERRACOTTA'),
 ('陶俑的服饰和姿态等细节为研究当时军队与工艺提供材料。','UNESCO-QIN-TERRACOTTA'),
 ('遗址的研究、发掘和保护由现代文物工作者持续开展。','UNESCO-QIN-TERRACOTTA')],[
 step('陶俑来自秦代','这些陶人陶马属于秦始皇陵的陪葬遗存，做出来放在陵墓旁。我们先到秦朝，看看留下来的陶塑。','兵马俑来自哪一朝？','来到秦朝，看工匠留下的陶塑。','汉朝在秦之后，这些兵马俑来自秦代。','timeline',[era('秦朝','前221—前207年',True),era('汉朝','前202—220年',False)],inspection=inspect('qin-kneeling-archer','秦代跪射俑','陶塑文物 · 今天拍摄','这是跪射姿势的秦代陶俑，拍于博物馆。它是陶塑，不是活人，也不是现场战斗的照片。')),
 step('先弄清它为什么在这里','秦始皇陵旁安排了陶人、陶马等陪葬物。这些形象让我们看见古人的想法和工匠的工作，不是真士兵变成的。','眼前这些人马是什么？','是工匠制作的陶塑，属于帝陵陪葬遗存。','真人会活动；这里保存的是工匠做出的陶塑。','pick',[
  study('工匠做的陶人陶马',True,[('tools','制作'),('person','陶人'),('horse','陶马')]),
  study('今天站在展厅里的参观者',False,[('people','参观'),('eye','观察')])]),
 step('从姿势和服饰找线索','这件真陶俑弯着一条腿，身上有一片片铠甲。先找弯曲的腿，再找铠甲，看工匠留下的细节。','弯曲的腿在哪里？','姿势和服饰都能留下历史线索。','再看腿的弯曲和身上一片片的铠甲。','scene-find',asset='qin-kneeling-archer',interaction=finding([
  ('leg','弯曲的腿',.34,.54,.43,.24),('armor','身上的铠甲',.27,.26,.4,.25)],
  [('leg','弯曲的腿在哪里？','这条腿弯起来，留下跪姿的线索。','这里是上身，找找下面弯着的腿。','再看看衣服上的细节'),('armor','哪里是一片片的铠甲？','小片铠甲的排列，也是工匠做出的细节。','这里是腿，再看看上身的铠甲。')],label='实物照片',ratio=2/3)),
 step('姿态相同，细节仍要看原物','姿态和衣服可以帮助观察，不能凭想象补出士兵的姓名。想知道一个细节，应该回看实物和资料。','怎样判断铠甲的样子？','看清实物与资料，再留下观察记录。','故事画可以帮助想象，实物细节还要回到真图。','pick',[
  study('放大真图，核对细节',True,[('eye','看原物'),('book','查资料')]),
  study('只照故事插画来判断',False,[('paint','故事画'),('eye','猜细节')])]),
 step('把陶塑的发现带回家','今天我们看了弯曲的腿和片片铠甲。它们是陶塑留下的线索；保护好原物，后来的人还能继续研究。','我们能从陶俑知道什么？','姿势与服饰留下线索，不能凭脸编姓名。','外形不能告诉我们一个真实士兵的姓名。','pick',[
  study('观察姿势、衣服和工艺',True,[('person','姿态'),('tools','工艺')]),
  study('只凭脸猜出士兵的姓名',False,[('eye','看脸'),('speech','猜名字')])])
 ],['指一指陶俑弯曲的腿和铠甲，任选一处说出发现。','和家人区分真文物照片与旅行故事插画。'],theme='史料和时间')

chapter('cn-ancient-06-09-zhaozhou-bridge','sui','赵州桥的小桥洞有什么用？',
 '隋朝李春和工匠造的赵州桥，让人车跨过河。大桥洞旁还有小桥洞，小伙伴想知道它们能帮什么忙。',
 '赵州桥让人车跨河通行。大拱两肩的小拱减少用料，水涨到那里时也能过水；桥还靠历代维护保存。',
 '李春与赵州桥','zhaozhou-bridge-now','赵州桥 · 今日照片','sui-bridge-discovery-v1',['NMC-ZHAOZHOU-BRIDGE'],
 '照片是今天的赵州桥，经过历代维修；教学图只演示过水关系，不计算洪水流量，不说洞越多越牢。',
 '理解跨河通行与敞肩小拱的作用。','桥面和桥洞分别给谁用？水涨高时哪里还能过水？','能指出桥面通行、水从大小拱下经过，并留意水位。','cn-ancient-06-01-sui-unification-canal','河北赵县洨河',[
 ('安济桥又称赵州桥，位于河北赵县，横跨洨河。','NMC-ZHAOZHOU-BRIDGE'),('唐代《石桥铭序》将桥的营造与隋匠李春联系。','NMC-ZHAOZHOU-BRIDGE'),('桥的大拱两端各有两个小拱。','NMC-ZHAOZHOU-BRIDGE'),('小拱可增加高水位时的过水空间，并节省石料、减轻桥重。','NMC-ZHAOZHOU-BRIDGE'),('桥体经历多次修缮；出水构件包含不同年代的遗存。','NMC-ZHAOZHOU-BRIDGE')],[
 step('从今天的桥回到隋朝','赵州桥始建于隋朝，李春和工匠用石头造桥。眼前是真实的今日照片，桥经过了历代维修。','赵州桥最早建于哪一朝？','从隋朝开始，认识这座石桥。','唐朝在隋以后，建桥的线索指向隋代。','timeline',[era('隋朝','581—618年',True),era('唐朝','618—907年',False)],inspection=inspect('zhaozhou-bridge-now','赵州桥今日照片','隋代始建 · 历代修缮','这是今天的赵州桥。桥面让人车过河，桥下有一大四小的开口。今天看到的桥经过维修。')),
 step('人车和河水各走哪里','小伙伴看见车从桥上经过，河水从桥下流过。建桥要让人车过河，也要给河水留下路。','车应该从哪里过河？','桥面连接两岸，水路留在下面。','桥洞留给水，人车从桥面上走。','scene-find',interaction=finding([
  ('deck','桥上的车和通路',.60,.11,.12,.10),('water','中央桥洞下的水',.51,.40,.19,.10)],
  [('deck','车应该从哪里过河？','车走桥面，能够到达对岸。','这边是水，再找桥上的车。','再找河水走的地方'),('water','河水从哪里经过？','大桥洞下面，给水留出了通路。','这里是桥面，再看桥洞下面。')])),
 step('大拱两边还有小拱','真实照片里，大桥洞两边还有小洞。它们让桥少用一些石料，水涨高到那里时也能从中流过。','先找一个小桥洞','小拱有用途，不只是花纹。','大的在中间，小的在两旁。','scene-find',asset='zhaozhou-bridge-now',interaction=finding([
  ('small','近处的小拱',.56,.36,.085,.15),('main','中央大拱',.70,.40,.15,.15)],
  [('small','先找一个小桥洞','小拱在大拱旁边。','这是大拱，再看两旁的小洞。','再找中央的大拱'),('main','哪一个是中间的大桥洞？','中央大拱跨过河道。','小拱在旁边，大拱在中央。')],label='实物照片',ratio=4/3)),
 step('水涨高了，再看一看','学习图里的水原来很低，只经过大拱。把水位提高到小拱那里，看看河水是不是多了通路。','看看水位改变以后','水涨到小拱处，小拱也能过水。','先看看水面到了哪个高度。','history-lab',interaction={'lab':{'kind':'bridge-water','stages':[{'label':'让水位升高','narration':'水面升到小拱这里，小拱也有了过水的空间。'},{'label':'找找多出来的水路','narration':'大拱和小拱一起留出水路；桥面仍让人车通行。'}]}}),
 step('把桥的两种路分清楚','小伙伴现在知道，上面的人车路和下面的水路要一起考虑。水涨到小拱时，小洞也能帮忙。','小桥洞能帮什么忙？','减少用料，水位高时也增加水路。','人车主要走桥面，小洞留出的是水的空间。','pick',[
  study('水涨高时，多留一条水路',True,[('water','高水位'),('gate','过水')]),
  study('让桥面的车道变得更宽',False,[('cart','车道'),('road','更宽')])])
 ],['在桥照片上，分别指一遍人车的路和河水的路。','用手指指出小拱的位置，说说水要涨到哪里它才能过水。'],theme='生活和劳动')

chapter('cn-ancient-06-11-du-fu-spring-rain','tang','杜甫为什么把春雨叫好雨？',
 '唐朝诗人杜甫写过一场春夜的雨，还把它叫作好雨。小伙伴听见雨轻轻落下，想看看它给花草带来了什么。',
 '杜甫在《春夜喜雨》中写细雨滋润万物。诗里的雨、夜色和花，带着诗人的喜悦，不是一张天气记录表。',
 '杜甫与《春夜喜雨》','dufu-collection-cover','《杜工部集》后世刊本封面','tang-dufu-rain-v1',['EDB-DUFU-SPRING-RAIN'],
 '古籍是后世刊本，不是杜甫手稿；雨夜图是诗意想象，不是写诗当晚的照片。花不会因一场雨瞬间长大，孩子的个人感受不判对错。',
 '把细雨润物的画面与诗人的喜悦连起来。','诗人为什么说是好雨？你能指出诗里的一处景物吗？','指润湿的花叶或夜里的船灯，用轻轻的动作表现细雨。','cn-ancient-06-07-li-bai-jingyesi','唐代成都与诗里的春夜',[
 ('《春夜喜雨》的作者是杜甫。','EDB-DUFU-SPRING-RAIN'),('作品写春天夜里的雨，并以好雨作开篇称呼。','EDB-DUFU-SPRING-RAIN'),('随风潜入夜、润物细无声表现细雨在夜间滋润万物。','EDB-DUFU-SPRING-RAIN'),('诗中同时写夜色和江船的灯火。','EDB-DUFU-SPRING-RAIN'),('诗的结尾将视线转向清晨湿润的花与锦官城。','EDB-DUFU-SPRING-RAIN')],[
 step('到唐朝听杜甫的诗','杜甫是唐朝诗人。这本后世留下的杜诗刊本，帮助诗句传到今天。今天听他写的一场春夜细雨。','杜甫是哪一朝的诗人？','来到唐朝，听杜甫怎样写春雨。','宋朝在后，杜甫生活在唐朝。','timeline',[era('唐朝','618—907年',True),era('宋朝','960—1279年',False)],inspection=inspect('dufu-collection-cover','杜工部集后世刊本封面','唐代诗人 · 后世文集封面','这是后世杜工部集的封面，说明诗集的流传，不是杜甫亲笔。本章诗文另据教育局参考文本。')),
 step('听细雨轻轻来到夜里','“好雨知时节，当春乃发生。随风潜入夜，润物细无声。”雨细细地来，滋润花草，诗人因此感到喜悦。','听诗里的春夜细雨','细雨润物，诗里藏着喜悦。','再听听诗中怎样说这场雨。','look-listen',interaction={'continueLabel':'去雨夜里找两处景物'}),
 step('雨夜里有花，也有灯','这幅故事图把诗句变成想象的画面。雨滴挂在花叶上，远处小船有一点灯光。先找雨滴，再找船灯。','哪里能看见湿润的花叶？','雨滴与灯光，让诗里的夜有了画面。','听清当前要找的是雨滴，还是船灯。','scene-find',interaction=finding([
  ('leaves','右边湿润的花叶',.87,.60,.12,.28),('lamp','远处小船的灯',.79,.47,.06,.09)],
  [('leaves','哪里能看见湿润的花叶？','雨落在花叶上，留下湿润的痕迹。','这是灯光，再看看右边的花叶。','再找夜里的小船灯'),('lamp','哪里亮着小船的灯？','夜色里，一点船灯很醒目。','这边是花叶，灯在远处的小船上。')])),
 step('诗中的细雨是哪一种','杜甫说雨细细的，轻轻地润湿万物。下面两幅都是雨的学习图，找更接近这句诗的一幅。','哪幅更接近细雨无声？','细细的雨，贴近诗里的安静。','这幅雨更急，再找轻轻的细雨。','pick',[
  study('轻轻的细雨',True,[('rain','细雨')]),study('密密的急雨',False,[('rain-heavy','急雨')])]),
 step('为什么把它叫好雨','小伙伴再看花上的水珠：诗人喜欢这场雨，是因为它来得及时，滋润万物。我们也能指图说出这一层意思。','哪处更能解释好雨的好？','雨让花叶湿润，诗人把喜悦写进诗。','船灯写出了夜色，润物还要看看花叶。','pick',[
  picture('被雨润湿的花叶',True,crop('tang-dufu-rain-v1',1300,645,236,320)),picture('江船上亮着的灯',False,crop('tang-dufu-rain-v1',1090,420,280,200))])
 ],['家长轻声读两句诗，孩子用手指轻点桌面表示细雨。','在故事图里找一处雨滴，再说说或指指为什么叫好雨。'])

chapter('cn-ancient-07-10-huang-daopo-cotton','yuan','黄道婆把手艺带给了谁？',
 '棉花软软的，还不是布。元朝的黄道婆把在海南学到的手艺带回家乡，教给更多人。小伙伴也来试试棉花怎样变成布。',
 '黄道婆学习、改进并传授棉纺织手艺。棉花要经过处理，纺成纱再织成布，许多人的学习与合作让手艺传开。',
 '黄道婆与学习纺织的人们','huang-daopo-memorial','黄道婆纪念馆 · 今日照片','yuan-cotton-sharing-v1',['ICH-HUANG-DAOPO','ECNU-HUANG-DAOPO'],
 '纪念馆和人物雕像是后世纪念，不是元代现场。故事里的传承者不是黄道婆肖像，经纬模型不复原整台古织机；黄道婆不是棉花或所有织布方法的发明者。',
 '理解学来、改进、传授的历史关系，并区分棉花、纱和布。','从棉花到布少了哪一步？一个人的手艺怎样传给更多人？','指出先纺纱再织布，能向家人示范一次交错。','cn-ancient-08-04-economy-knowledge-culture','海南崖州与松江乌泥泾',[
 ('黄道婆生活于宋末元初，与松江乌泥泾地区棉纺织发展相关。','ICH-HUANG-DAOPO'),('她从崖州带回纺织技术并向故乡人们传授。','ICH-HUANG-DAOPO'),('相关手艺包括捍、弹、纺、织等不同环节。','ICH-HUANG-DAOPO'),('其技术实践结合了海南学习的经验与江南当地的生产。','ECNU-HUANG-DAOPO'),('乌泥泾手工棉纺织技艺列入2006年第一批国家级非物质文化遗产名录。','ICH-HUANG-DAOPO')],[
 step('从纪念馆走进元朝故事','这是今天的黄道婆纪念馆。她把在海南学到的棉纺织手艺带回家乡、继续改进和传授，这段故事来到元朝。','黄道婆回乡传艺，来到哪一朝？','来到元朝，看手艺怎样被学会、传开。','明朝在后，这段传艺故事先到元朝。','timeline',[era('元朝','1271—1368年',True),era('明朝','1368—1644年',False)],inspection=inspect('huang-daopo-memorial','黄道婆纪念馆','今日纪念场所 · 不是元代现场','这是今天纪念黄道婆的场所。中间的雕像是后人塑造的，不是她当时的照片。')),
 step('从学习走到传授','黄道婆学习海南黎族的棉纺织手艺，回乡后改进方法、教给别人。学会的人再实践，手艺才能传给更多人。','怎样让手艺传给更多人？','学会、改进，再教给别人。','布会被用掉，方法还要靠传授与实践留下。','pick',[
  study('示范方法，让别人也来练',True,[('people','学方法'),('exchange','再传授')]),study('只带回一块已经做好的布',False,[('cloth','成品布'),('bag','带回')])]),
 step('棉花、纱线与布不一样','这是今天的小伙伴体验纺织。桌上有棉花、纱线和织好的布。先找到细长的纱，再看看它怎样变成布。','哪一份已经纺成纱？','先纺成纱，再交错织成布。','棉花还没纺成纱；布已经织好了。','scene-find',interaction=finding([
  ('yarn','桌上的线团',.36,.61,.15,.21),('cloth','织架上的布',.70,.62,.27,.17),('cotton','左边的棉花',.06,.58,.21,.17)],
  [('yarn','哪一份已经纺成纱？','细长的纱线绕成线团。','再找桌子中间一圈圈的线。','再找已经织成的布'),('cloth','哪里已经织成了一片布？','纱线交错起来，织出了布。','这里还是棉花或纱，再看看织架。')])),
 step('让两组线交错起来','这块学具先固定竖线。另一组线一上一下穿过去，下一排换过来。我们只体验交错关系，不复原整台织机。','试着织进三排线','邻排换过来，两组线交错成片。','再看看线在哪些地方从上面经过。','history-lab',interaction={'lab':{'kind':'weaving','stages':[{'label':'织进第一排','narration':'这一排一上一下穿过竖线。'},{'label':'下一排换过来','narration':'邻排的上下位置换过来，两排交错。'},{'label':'再织一排看看','narration':'一排排交错，纱线逐渐连成布。'}]}}),
 step('让下一位伙伴也能开始','下一位伙伴想织布。她先要把棉花处理、纺成纱，再来织；我们可以把刚才的办法教给她。','到织架前，需要先准备什么？','准备纺好的纱，再把交错方法教给伙伴。','这一团还是棉花，先处理并纺成纱。','pick',[
  picture('已经纺好的纱线',True,crop('yuan-cotton-sharing-v1',565,618,394,280)),picture('还没纺成纱的棉花',False,crop('yuan-cotton-sharing-v1',0,570,540,320))])
 ],['指棉花、纱和布，和家人一起说或听它们的先后。','用两组宽纸条做交错示意，孩子示范，家人跟着做。'],theme='生活和劳动')

chapter('cn-ancient-07-09-li-qingzhao-rumengling','song','跟李清照的小船听一段回忆',
 '宋代词人李清照记起一次乘舟游玩：天色晚了，小船误入荷花深处，惊起水鸟。听着词，跟小伙伴把画面接起来。',
 '李清照用《如梦令》写下一段乘舟回忆。回舟、误入荷花、惊起水鸟连成画面，让后来的人也能读到她的感受。',
 '李清照与《如梦令》','li-qingzhao-rumengling-page','清刻《漱玉词》· 宋代词作','song-liqingzhao-lotus-v1',['BJWOMEN-LI-RUMENGLING','NLC-SHUYU-1881'],
 '所用清刻书页不是李清照手稿；插画是词意想象，不确定为某处真实溪亭，也不虚构准确作词年或同游者身份。',
 '听懂词中连续的动作，认识宋代词人的生活表达。','小船先发生了什么，水鸟后来怎样了？','按回舟、入荷丛、鸟飞起的顺序指图，不要求背词。','cn-ancient-07-06-su-shi-moon','宋代词中的溪亭与荷塘',[
 ('李清照是宋代词人，传世作品包含《如梦令·常记溪亭日暮》。','BJWOMEN-LI-RUMENGLING'),('这首词以常记起笔，组织对往昔的回忆。','BJWOMEN-LI-RUMENGLING'),('词中有回舟、误入藕花和惊起鸥鹭的叙事。','BJWOMEN-LI-RUMENGLING'),('藕花指荷花，鸥鹭为词中的水鸟形象。','BJWOMEN-LI-RUMENGLING'),('本章书影取《漱玉词》清刻本扫描第6页，可见所读词作。','NLC-SHUYU-1881')],[
 step('先认识宋代的词人','李清照生活在宋代。她的词后来被收集、刻印。眼前这本是清代的《漱玉词》，里面留下宋代词人的话。','李清照生活在哪一朝？','来到宋代，听李清照写下的词。','清代是眼前书本的刊印时期，词人生活在宋代。','timeline',[era('宋朝','960—1279年',True),era('清朝','1644年入关以后',False)],inspection=inspect('li-qingzhao-rumengling-page','《漱玉词》中的《如梦令》','宋代词作 · 清刻本扫描第6页','这页有常记溪亭日暮这一首如梦令。作者李清照在宋代，眼前的书是清代刻印的。')),
 step('听小船误入荷花深处','李清照记起往昔：“兴尽晚回舟，误入藕花深处。争渡，争渡，惊起一滩鸥鹭。”天色晚了，小船的动静惊起了水鸟。','听一听这段回忆','词句把小船、荷花和水鸟连成画面。','再听听小船与水鸟的先后。','look-listen',interaction={'continueLabel':'去画里找小船和水鸟'}),
 step('在词意画面里找一找','这幅是根据词意画的故事插画。小船在荷花之间，另一边有飞起的水鸟。先找小船，再找鸥鹭。','小船在哪里？','回舟与惊鸟，是词里相连的动作。','当前找小船，再看荷花之间。','scene-find',interaction=finding([
  ('boat','荷花里的小船',.41,.35,.30,.14),('birds','右边飞起的水鸟',.78,.10,.20,.26)],
  [('boat','小船在哪里？','船在荷花之间，词里说误入藕花深处。','那边是水鸟，小船在荷花之间。','再找飞起的鸥鹭'),('birds','哪些是被惊起的鸥鹭？','张开翅膀的水鸟飞起来了。','这是小船，再看右边飞起的水鸟。')])),
 step('把三个画面接起来','词先说晚回舟，再说误入荷花深处，最后水鸟惊起。用图卡把这一段回忆接起来。','哪一组顺序接住了词意？','小船回来，进了荷丛，惊起水鸟。','再听先回舟、再入荷丛、最后鸟飞起。','pick',[
  study('回舟 → 荷丛 → 鸟飞起',True,[('boat','回舟'),('flower','荷丛'),('bird','鸟飞')]),study('鸟飞起 → 回舟 → 荷丛',False,[('bird','鸟飞'),('boat','回舟'),('flower','荷丛')])]),
 step('这首词留下怎样的回忆','有的词写望月思亲，这首如梦令写乘舟误入荷花、惊起水鸟。给没听过的小伙伴选出这段回忆。','哪一幅更接近这首词？','小船与水鸟，留住这次乘舟的回忆。','月亮思亲是另一种表达，这次听的是小船与水鸟。','pick',[
  study('荷塘的小船与飞起的水鸟',True,[('boat','荷塘小船'),('bird','水鸟')]),study('望着月亮思念远方亲人',False,[('moon','望月'),('home','思亲')])])
 ],['家长念回舟、荷丛、鸟飞，孩子按顺序指图。','轻轻做划船和展开翅膀的动作，回想它们谁先谁后。'])

chapter('cn-ancient-04-06-han-palace-lantern','han','长信宫灯的袖子为什么连着灯？',
 '西汉留下了一盏长信宫灯：灯罩能遮光，宽袖子还连着灯。小伙伴想看看，光和烟是不是走同一条路。',
 '长信宫灯用灯罩改变照光范围，袖管把部分烟尘导入空心灯体。汉代工匠把照明与清洁需要放进了器物设计。',
 '汉代工匠与长信宫灯','han-changxin-lamp','西汉长信宫灯 · 文物照片','han-lamp-observation-v1',['DPM-CHANGXIN-LAMP','HEBEI-CHANGXIN-STRUCTURE'],
 '宫女造型不对应可确认姓名的真人；导烟不等于完全无烟。学习图省略人物造型，不拆文物、不点火，也不复原完整内部构造。',
 '分别理解灯罩遮光与袖管导烟的作用。','想少照亮一边看哪个部件？烟又沿哪里走？','能分开指出灯罩开口和相连袖管，不把它们当同一功能。','cn-ancient-04-01-qin-unification','西汉与今天的河北博物院',[
 ('长信宫灯是西汉青铜鎏金灯具，藏于河北博物院。','DPM-CHANGXIN-LAMP'),('长信宫灯出土于满城中山靖王刘胜妻窦绾墓。','DPM-CHANGXIN-LAMP'),('灯具以跪坐持灯的宫女为造型。','DPM-CHANGXIN-LAMP'),('宫女右袖形成与灯相连的导烟通道。','DPM-CHANGXIN-LAMP'),('灯罩可开合、灯盘可转动，部分构件可以拆卸清理。','HEBEI-CHANGXIN-STRUCTURE')],[
 step('看一盏西汉的灯','西汉工匠做的长信宫灯，把持灯的人形和灯具连在一起。它既要照亮，也想办法收集一部分烟尘。','这盏长信宫灯属于哪一朝？','来到汉朝，看工匠怎样安排照明。','秦朝更早，这件灯是西汉文物。','timeline',[era('汉朝','前202—220年',True),era('秦朝','前221—前207年',False)],inspection=inspect('han-changxin-lamp','长信宫灯','西汉灯具 · 河北博物院藏','这是长信宫灯实物照片。灯罩、灯盘与相连的宽袖，都有具体用途。')),
 step('灯盘和袖管各在哪里','真照片里，灯盘托着照明的部分，宽袖连到上方。先找灯盘，再沿相连的袖子看看它通向哪里。','哪里是托住灯的灯盘？','灯盘和相连的袖子承担不同作用。','先看前方的灯，再找上方相连的袖子。','scene-find',asset='han-changxin-lamp',interaction=finding([
  ('tray','前方的灯盘',.13,.31,.34,.16),('sleeve','弯曲相连的袖管',.31,.08,.32,.19)],
  [('tray','哪里是托住灯的灯盘？','前方的盘托住照明部分。','再看前方较宽的圆盘。','再看与灯相连的袖子'),('sleeve','哪一段袖子和灯相连？','宽袖形成通向空心灯体的烟道。','再看上方弯过来的袖子。')],label='实物照片',ratio=1280/1707)),
 step('分开看光与烟的路','学具先演示灯罩开口收小，照光范围也变小。再看烟沿袖管进入空心灯体；它仍需要清理。','看看灯罩，再看看袖管','灯罩遮光，袖管导烟，作用不同。','先听完本阶段，再看下一种作用。','history-lab',interaction={'lab':{'kind':'lamp','stages':[{'label':'把灯罩开口收小','narration':'开口小了，光照到的范围也收小。'},{'label':'沿袖管找烟的去处','narration':'部分烟尘沿袖管进入灯体，器物还需要清理。'}]}}),
 step('想少照一边，看哪个部件','小伙伴想让光少照到旁边。灯罩能挡住一部分光；把袖管当开关，不能替代灯罩的作用。','少照一边，要看哪里？','看灯罩开口怎样遮住光。','袖管主要导烟，遮光要看灯罩。','pick',[
  picture('灯罩与开口',True,crop('han-changxin-lamp',130,300,400,430,1280,1707)),picture('相连的宽袖管',False,crop('han-changxin-lamp',370,80,520,300,1280,1707))]),
 step('一个器物照顾不同需要','汉代工匠让灯照明，也想办法减少烟尘散到室内。小伙伴现在要把灯罩和袖管的作用分清楚。','哪一组把两种作用配对了？','灯罩遮光，袖管导烟，还要注意清理。','再想想光从开口出去，烟沿袖管走。','pick',[
  study('灯罩遮光，袖管导烟',True,[('moonlight','光的范围'),('road','烟的通路')]),study('灯罩导烟，袖管遮光',False,[('road','烟的通路'),('moonlight','光的范围')])])
 ],['指灯罩和袖管，家长分别说用途，孩子选择对应部件。','用台灯和纸卡观察遮光范围，由成人操作，不使用火。'],theme='知识和技术')

chapter('cn-ancient-04-07-sima-qian-shiji','han','司马迁怎样把过去的事留下来？',
 '孔子、秦始皇生活在不同的时代。汉代司马迁把过去的人和事写进《史记》，后来人怎样找到这些故事？',
 '司马迁在西汉编写《史记》，记述过去的人和事。后人注释、抄写和刊印，让历史记录传下来；书里的人不都与作者同时。',
 '司马迁与《史记》','shiji-ming-edition','明刊《史记》· 后世书影','han-shiji-reading-v1',['NLC-SHIJI-EDITIONS','SCIO-SIMA-QIAN-SHIJI','EDB-ANALECTS-FOUR'],
 '明刊书影不是司马迁手稿，插画中的人物卡是今天的学习道具，不是古代肖像。史书记载仍需研究核对，不把作者当所有事件的目击者。',
 '区分记录者与被记录的人，理解史书怎样保存过去。','孔子与写史记的司马迁是同一时代吗？书怎样传到今天？','能分开被记录的人与写书的人，并知道现存刊本可能晚于作者。','cn-ancient-03-03-hundred-schools','西汉与后世的书坊、图书馆',[
 ('司马迁是西汉时期的史学家。','NLC-SHIJI-EDITIONS'),('《史记》是纪传体通史，记述不同时代的人和事。','NLC-SHIJI-EDITIONS'),('《史记》包含本纪、表、书、世家与列传等部分。','SCIO-SIMA-QIAN-SHIJI'),('后人对《史记》作了不同注释，三家注有重要影响。','NLC-SHIJI-EDITIONS'),('现存《史记》刊本是历代流传过程中的材料，不等同于司马迁亲笔原稿。','NLC-SHIJI-EDITIONS')],[
 step('先找到写书的人所在的时代','司马迁在西汉编写《史记》。眼前是很久以后刊印的书页，里面还保留后人的注释，不是司马迁亲笔。','司马迁编写史记，在哪一朝？','在汉朝，司马迁整理过去的人和事。','明代是眼前刊本的年代，作者在更早的汉朝。','timeline',[era('汉朝','前202—220年',True),era('明朝','1368—1644年',False)],inspection=inspect('shiji-ming-edition','明刊《史记》书影','西汉著作 · 明刊本卷前书页','这是后世刊本中的史记索隐序，序文来自后人的整理与注释，不是司马迁原稿。')),
 step('一本史书里住着不同时代的人','孔子生活在春秋，秦始皇生活在秦代，司马迁在更后的汉代。《史记》记录他们，不表示他们坐在同一间屋里。','先听清三个人的时代','书可以记过去，作者不必和书里的人同时。','人物的时代要分别核对。','look-listen',interaction={'continueLabel':'为两位人物找对应的图卡'}),
 step('想查谁，就先找对人物','桌上的图卡是今天的学具。左边用师生表示孔子，右边用君主与侍从表示秦始皇。先为讲学的孔子找一张。','哪张卡表示讲学的孔子？','先分清人物，再去读他的历史记录。','君主卡表示秦始皇，孔子卡画着师生。','pick',[
  picture('师生学习的孔子卡',True,crop('han-shiji-reading-v1',190,615,490,300)),picture('君主与侍从的秦始皇卡',False,crop('han-shiji-reading-v1',760,660,575,324))]),
 step('书里的人与写书的人分开','孔子比司马迁早。司马迁研究前人的材料和故事，再编写历史。先后关系需要保留，不能让书里的人都变成同龄伙伴。','哪一组保留了先后关系？','孔子在前，司马迁后来把历史写下来。','写书不表示作者亲眼见过所有被记的人。','pick',[
  study('先有孔子，后来司马迁写史',True,[('person','春秋孔子'),('book','汉代写史')]),study('孔子和司马迁同时生活',False,[('people','同一时代')])]),
 step('后人继续让记录传下来','司马迁留下著作，后人注释、抄写、刻印。今天读到的书，可以保存很早的内容，却是后来制作的实物。','眼前明刊本怎样解释？','内容源于更早的著作，眼前书本是后世刊印。','作者时代和这本书的制作年代要分开。','pick',[
  study('后人刊印，保存早先著作',True,[('book','西汉著作'),('types','后世刊印')]),study('这就是司马迁亲手写的原稿',False,[('person','司马迁'),('brush','亲笔原稿')])])
 ],['家长说孔子、秦始皇、司马迁，孩子用前后位置表示时代。','找一本家里的书，区分作者是谁与这一本何时出版。'],theme='史料和时间')

chapter('cn-ancient-06-10-jianzhen-eastward','tang','鉴真向东出发以后做什么？',
 '唐朝的鉴真受到邀请，准备跨海去讲授佛学。他带着典籍，与同行的人反复努力。小伙伴想知道，到了以后还要做什么。',
 '鉴真应邀东渡，带着典籍，与同行者一起传播佛学和文化。交流既要走到远方，也要讲授、学习和长期合作。',
 '鉴真与同行的僧人和船员','toshodaiji-current-golden-hall-view','唐招提寺金堂 · 今日照片','tang-jianzhen-departure-v1',['NMC-JIANZHEN-STORY','TOSHODAIJI-HISTORY'],
 '这是中国唐代文化交流故事，不新增世界史站。寺院照片是保存现状，不是抵达现场；故事里的船与书束是教学表现，不复原船型或唐代装帧。',
 '理解受邀前往与抵达后传授相连，交流需要多人合作。','鉴真为何出发？到了以后，书和人还要一起做什么？','能指出带书、同行协作和讲授用途，不把到岸当结束。','cn-ancient-06-04-tang-cultural-exchange','唐代扬州出发的东渡交流',[
 ('鉴真是唐代僧人，曾在扬州讲授佛学。','NMC-JIANZHEN-STORY'),('鉴真受到邀请，曾多次尝试东渡。','NMC-JIANZHEN-STORY'),('鉴真与同行者最终渡海到达日本，随后在当地传授佛教戒律等文化。','NMC-JIANZHEN-STORY'),('东渡携带了典籍等物品，文化传播需要知识与人的共同参与。','NMC-JIANZHEN-STORY'),('唐招提寺与鉴真到达后的活动有关，现存建筑还包含弟子和后人营建维护的成果。','TOSHODAIJI-HISTORY')],[
 step('从遗存回到唐朝的出发','这座寺院与鉴真东渡后的活动有关，照片拍的是今天保存的建筑。鉴真生活在唐朝，从中国出发，应邀跨海传授。','鉴真的故事属于哪一朝？','来到唐朝，先听为什么要出发。','宋朝在后，鉴真生活在唐朝。','timeline',[era('唐朝','618—907年',True),era('宋朝','960—1279年',False)],inspection=inspect('toshodaiji-current-golden-hall-view','唐招提寺金堂今日照片','唐代交流的遗存 · 后世保存现状','唐招提寺与鉴真东渡有关。今天的建筑经过营建维护，照片不是他刚到达时的现场。')),
 step('有人来请教，才有这段远行','日本僧人来到中国，请鉴真前去讲授佛学。鉴真与同行的人做准备，遇到困难后继续调整，终于向东渡海。','鉴真主要应邀去做什么？','去讲授，让交流中的人们能够学习。','运东西是路上的工作，这次邀请主要是讲授。','pick',[
  study('前往讲授佛学与文化',True,[('book','典籍'),('speech','讲授')]),study('只把货物运到码头',False,[('box','货物'),('boat','运输')])]),
 step('典籍怎样一起上路','故事画里，僧人带着典籍，船员接过书束。一个人带着书还不够，装船和渡海需要大家合作。','哪里是准备带走的典籍？','书与同行者一起，才能把知识带去。','先找包好的书束，再找接送的人。','scene-find',interaction=finding([
  ('books','前景包好的书束',.74,.72,.18,.14),('help','船员与僧人接书的手',.85,.29,.14,.15)],
  [('books','哪里是准备带走的典籍？','书束里装着要带去的典籍。','绳子帮助航行，典籍在包好的书束里。','再找合作把书送上船的人'),('help','哪里有人合作把书递上船？','岸上和船上的人一起配合。','再看船边伸手接送书束的地方。')])),
 step('到了以后，知识还要传授','跨海到达以后，鉴真讲授佛学，与当地人一起学习。知识不是把书卸下就自动传开，还要有人解释和实践。','让人学会，接下来需要什么？','有人讲授、有人学习，知识才继续传开。','保存书很重要，但受邀的讲授还要继续。','pick',[
  study('打开典籍，一起讲授学习',True,[('book','打开书'),('people','一起学')]),study('只把书放入库房收好',False,[('book','书束'),('box','保存')])]),
 step('与玄奘的故事对照','玄奘去学习、带回后组织翻译；鉴真受邀前往、在那里传授。同在唐朝，两段交流的方向和任务并不一样。','哪一组说的是鉴真？','受邀前往，再在那里传授。','带回再译书，是之前玄奘章讲的任务。','pick',[
  study('受邀前往 → 在那里传授',True,[('letter','邀请'),('boat','前往'),('speech','传授')]),study('出去学习 → 带回再翻译',False,[('book','求学'),('road','带回'),('brush','翻译')])])
 ],['家长说邀请、前往、传授，孩子依次指相应图卡。','和玄奘章对照：哪一段讲带回，哪一段讲受邀前往。'],theme='交通和交往')

chapter('cn-ancient-08-09-zheng-banqiao-bamboo','qing','郑板桥怎样把竹子写进诗里？',
 '清代的郑板桥画竹子，也写竹子。小伙伴听到咬定青山，想看看诗人怎样借竹子表达心意。',
 '郑板桥用画和《竹石》写竹子，借扎根岩缝、迎风挺立的形象表达坚韧。诗画能传达心意，不是风力实验记录。',
 '郑板桥与《竹石》','zheng-bamboo-rocks','清代郑燮竹石画 · 馆藏图像','qing-bamboo-poetry-v1',['EDB-ZHENG-BAMBOO','MIA-ZHENG-BAMBOO-1760'],
 '郑板桥即郑燮；所用画作不声称就是《竹石》的原题诗画。根部示意是今天的学具，不补造古画细节，也不把遇险硬撑当品德答案。',
 '用画中竹石与诗句理解借物表达心意。','竹子真的在咬山吗？诗人借竹子想表达怎样的样子？','能指竹与石，借动作表达迎风挺立，不把比喻当生物事实。','cn-ancient-06-11-du-fu-spring-rain','清代诗画与今天的博物馆',[
 ('郑板桥是清代诗人、画家和书法家，名郑燮。','EDB-ZHENG-BAMBOO'),('《竹石》是一首借竹子表达心意的题画诗。','EDB-ZHENG-BAMBOO'),('诗中的咬定比喻竹子扎根紧，不指竹子有牙齿。','EDB-ZHENG-BAMBOO'),('东西南北风与坚劲共同构成诗中的坚韧形象。','EDB-ZHENG-BAMBOO'),('本章馆藏画由郑燮绘制，可观察墨竹与石的艺术组织。','MIA-ZHENG-BAMBOO-1760')],[
 step('先看清代的一幅竹石画','郑板桥又叫郑燮，生活在清朝，会画画也会写诗。先看他画的竹与石，再听《竹石》里的话。','郑板桥生活在哪一朝？','来到清朝，看看诗与画怎样相遇。','明朝更早，郑板桥生活在清朝。','timeline',[era('清朝','1644年入关以后',True),era('明朝','1368—1644年',False)],inspection=inspect('zheng-bamboo-rocks','郑燮的竹石画','清代馆藏画作 · 数字图像','这是郑燮画的竹与石。它与我们听的竹石诗可以对照，不说这幅画就是那首诗的原稿。')),
 step('听竹子怎样咬定青山','“咬定青山不放松，立根原在破岩中。”这里把扎根写得像紧紧抓住，竹子并不真的长着牙齿。','听听诗里的竹子','扎根很紧，是诗人写出的形象。','原句和今天的解释要分开听。','look-listen',interaction={'continueLabel':'去画里找竹与石'}),
 step('竹与石在画里怎样相遇','原画用墨画出竹竿、竹叶和石头。先找竹叶，再找到石头；我们观察画里的样子，不给古画补上看不见的根。','哪里是竹叶？','墨色、线条和石头一起组成画面。','先听清要找竹叶还是石头。','scene-find',asset='zheng-bamboo-rocks',interaction=finding([
  ('bamboo','画里的竹叶',.62,.42,.30,.22),('rock','画里的石头',.16,.44,.20,.24)],
  [('bamboo','哪里是竹叶？','细长的一簇簇叶子属于墨竹。','这是石头，再往上找竹叶。','再找竹旁的石头'),('rock','哪里是竹旁的石头？','石头与竹子一起，进入诗画的形象。','这里是竹叶，再找下面的石头。')],label='文物图像',ratio=3822/6534)),
 step('风来了，诗里的竹子怎样','接着听：“千磨万击还坚劲，任尔东西南北风。”诗人写竹子迎风挺立，借它表达坚韧。下面是两种学习示意。','哪幅更接近诗里的坚劲？','挺立的样子接住了这句诗。','折断的样子不是这里的坚劲形象。','pick',[
  study('在岩石旁挺立的竹子',True,[('bamboo-plant','挺立')]),study('已经折断的竹子',False,[('bamboo-broken','折断')])]),
 step('诗画可以传达人的心意','郑板桥借竹子表达坚韧。我们可以喜欢不同的画面，但解释诗句时，要回到诗里写下的线索。','这首诗主要在做什么？','借竹子的形象，表达诗人的心意。','诗中没有测量风速，不能当风力报告。','pick',[
  study('借竹子表达心意',True,[('bamboo-plant','竹子'),('heart','心意')]),study('测出当天的风有几级',False,[('cloud','天气'),('ruler','测量')])])
 ],['指原画中的竹与石，再听家长读两句诗。','用手臂轻轻做竹子迎风的样子，说说这和真实测风有什么不同。'])

def apply():
 focused=read('content/focused-quests.json'); catalog=read('content/catalog.json'); scope=read('content/preview-scope.json')
 entries=read('content/child-entry-points.json'); paths=read('content/quest-story-paths.json'); textbooks=read('content/textbook-connections.json'); learning=read('content/learning-map.json')
 ctas=['跟孔子学一次再试一次','看陶俑的姿势和衣服','到桥边找水路','去听春夜的雨','把纺织手艺教给伙伴','跟着小船听一段词','看看光和烟的路','为过去的人找记录','跟着典籍去交流','在诗画里找竹与石']
 for row,cta in zip(CHAPTERS,ctas):
  c=row['quest'];c['cta']=cta
  for i,s in enumerate(c['steps']):s['narrative']['nextLabel']=c['steps'][i+1]['title'] if i<4 else '带着发现回家'
  old=next((x for x in focused['chapters'] if x['id']==c['id']),None)
  if old:focused['chapters'][focused['chapters'].index(old)]=c
  else:focused['chapters'].append(c)
  oldcat=next((x for x in catalog['chapters'] if x['id']==c['id']),None)
  if not oldcat:
   detail='content/chapters/'+c['id'].split('-',4)[-1]+'.md'
   new={'id':c['id'],'periodId':row['period'],'order':len(catalog['chapters'])+1,'title':c['title'],'coreQuestion':c['hook'],'throughline':c['outcome'],'curriculumRefs':['MOE-HISTORY-CURRICULUM-2022',*c['sourceIds']],'evidencePlan':['historical-material','primary-text'],'worldLink':{'topic':'本轮中国历史主题，不新增世界史任务','status':'not-in-current-scope'},'targets':{'durationMinutes':6,'screens':5,'audioClips':5,'interactions':2},'detailPath':detail,'status':{'outline':'verified','research':'in-review','script':'first-draft','assets':'cleared','audio':'not-started','review':'pending'}}
   catalog['chapters'].append(new)
   md=f"# {c['title']}\n\n- 章节 ID：`{c['id']}`\n- 适龄：4—6岁亲子共学\n- 状态：本机逐题实现稿；事实终审、人工校听和儿童共玩待完成。\n\n## 本章结论\n\n{c['outcome']}\n\n## 事实卡\n\n"
   md+='\n'.join(f'{i+1}. {t} [{sid}]' for i,(t,sid) in enumerate(row['facts']))+'\n\n## 儿童页面与语音稿\n\n'
   for i,s in enumerate(c['steps']):md+=f"### {i+1}. {'时间定位：' if i==0 else ''}{s['title']}\n\n屏幕文字：\n\n> {s['story']}\n\n语音 `H{i+1:02}`：\n\n> {s['story']}\n\n"
   md+='## 互动设计\n\n'+'\n'.join(f'{i+1}. {t}' for i,t in enumerate(c['finish']['actions']))+'\n\n## 学习设计与史料阅读方法\n\n'
   md+=row['learning']['observe']+'这属于活动设计，不计为历史事实。\n\n## 图片与素材边界\n\n'+c['boundary']+'\n\n真实材料、故事插画与学习示意分开登记在 `content/assets/china-expansion-assets.json`。当前每步的可听引导、选项和回应以 `content/focused-quests.json` 为准。\n'
   (ROOT/detail).write_text(md)
  for obj,new in [(entries,{'id':c['id'],'childTitle':c['title'],'prompt':c['hook'],'takeaway':c['outcome'],'object':c['entry']['object'],'people':[c['anchor']],'place':c['entry']['place'],'culture':c['anchor'],'care':c['boundary'],'preferredAssetId':c['coverAssetId'],'playableSource':'content/focused-quests.json'}),
                  (paths,{'id':c['id'],'beats':[]}),
                  (textbooks,{'id':c['id'],'featured':{'type':'人物与材料','icon':'📖','title':c['anchor'],'childBridge':c['hook'],'evidenceBoundary':c['boundary']},'companions':[{'type':'地点','label':c['entry']['place'],'note':'地点与时代分别核对。'},{'type':'材料','label':c['coverDisplay']['label'],'note':'实物或书影用于观察，文献用于解释。'}],'sourceIds':c['sourceIds']}),
                  (learning,row['learning'])]:
   prev=next((x for x in obj['chapters'] if x['id']==c['id']),None)
   if prev:
    if obj in [learning,entries]:obj['chapters'][obj['chapters'].index(prev)]=new
   else:obj['chapters'].append(new)
  if c['id'] not in scope['chapterIds']:scope['chapterIds'].append(c['id'])

 # The old 34 retain their text except for the explicitly strengthened gunpowder chapter.
 fire=next(c for c in focused['chapters'] if c['id']=='cn-ancient-07-08-song-gunpowder-records')
 fire['title']='火药用在哪里，古书留下什么？';fire['hook']='古代人逐渐探索火药，把它用于一些兵器。小伙伴在古书中寻找线索：火药的用途，和指南针、印刷一样吗？';fire['outcome']='火药经过长期探索，用于一些军事技术。北宋《武经总要》留下记载，后世继续刻印保存；编书年份不是火药发明年份。'
 fs=['CAS-FOUR-GREAT-INVENTIONS','JJ-ZENG-WUJING-HISTORY','NLC-WUJING-MING-SCAN']
 fire['sourceIds']=list(dict.fromkeys(fire['sourceIds']+fs))
 fire['steps'][1]=step('先弄清火药的用途','古代人探索火药，并借助燃烧把它用于一些兵器。《武经总要》是北宋编写的军事书，留下相关记载，不是一本造纸书。','这条火药记录涉及哪种用途？','它留下古代军事技术的线索。','制作纸页属于造纸，火药在这里用于军事技术。','pick',[
  study('古代的一些军事技术',True,[('fire','燃烧作用'),('wall','军事用途')]),study('把纤维做成书写的纸',False,[('fiber','纤维'),('paper','纸页')])],asset=fire['presentation']['sceneAssetId']);fire['steps'][1]['sourceIds']=fs
 fire['steps'][4]=step('把几项发明的用途分清楚','指南针提供方向线索，印刷帮助复制文字，火药则参与古代一些军事技术。它们用途不同，都经过了长期发展。','想复制书页，该找哪项技术？','印刷帮助复制文字，火药有另一种用途。','这里要复制文字，应该找印刷方法。','pick',[
  study('用印刷把文字印到纸上',True,[('types','印版'),('paper','书页')]),study('利用火药的燃烧作用',False,[('fire','火药'),('wall','军事用途')])],asset=fire['presentation']['sceneAssetId']);fire['steps'][4]['sourceIds']=fs
 fire['presentation']['title']=fire['title'];fire['presentation']['story'].update(coverNarration=fire['hook'],closingLine=fire['outcome'],closingNarration=fire['outcome'])
 for s in fire['steps']:s['narration']=s.get('narration') or s['story']
 for i in [1,4]:fire['steps'][i]['interaction']['selectionFraming']='detail'
 fire['finish'].update(title=fire['outcome'],actions=['用图卡分别指出造纸、印刷、指南针和火药的一种用途。','看书影的身份说明，区分北宋编书与后世刊印。'])
 frow=next(r for r in learning['chapters'] if r['id']==fire['id']);frow.update(learningGoal='火药在古代有军事用途，文献保留其长期发展的线索。',parentQuestion='火药、指南针和印刷帮助人们做的事一样吗？',observe='能按用途指认技术，并分清编书与发明不是同一件事。',sourceIds=fs)

 if 'spring-autumn-warring-states' not in scope['periodIds']:scope['periodIds'].insert(0,'spring-autumn-warring-states')
 scope['label']='春秋至明清';scope['note']='本机仅开放中国历史44章；国外遗产不在本轮，其余源稿与兼容完成记录保留。'
 period=next(p for p in catalog['periods'] if p['id']=='spring-autumn-warring-states');period['learningContext']={'childIntro':'先到春秋认识孔子，听一句论语，再跟今天的小伙伴学一学、练一练。','chronology':'本站范围为春秋战国；当前只开放孔子与论语任务，人物生活在春秋。','covered':'孔子、论语、学与习以及文本流传。','scopeBoundary':'不把整个诸子百家压成一句话；其他旧稿暂不开放。','sourceIds':['EDB-ANALECTS-FOUR','MOE-HISTORY-CURRICULUM-2022']}
 for period_id,ids in [('qin',['UNESCO-QIN-TERRACOTTA']),('han',['DPM-CHANGXIN-LAMP','NLC-SHIJI-EDITIONS']),('sui',['NMC-ZHAOZHOU-BRIDGE']),('tang',['EDB-DUFU-SPRING-RAIN','NMC-JIANZHEN-STORY']),('song',['BJWOMEN-LI-RUMENGLING']),('yuan',['ICH-HUANG-DAOPO']),('qing',['EDB-ZHENG-BAMBOO'])]:
  p=next(p for p in catalog['periods'] if p['id']==period_id);p['learningContext']['sourceIds']=list(dict.fromkeys(p['learningContext']['sourceIds']+ids));p['learningContext']['covered']+=' 本轮补充：'+ '、'.join(r['quest']['title'] for r in CHAPTERS if r['period']==period_id)+'。'
 learning['scope']='春秋至明清44章；中国历史本机试玩，其他68章保留旧稿。';learning['reviewedAt']='2026-10-08';focused['updatedAt']='2026-10-08'
 source_registry=read('content/sources.json');source_registry['sources']=list(SOURCES.values())
 for path,obj in [('content/focused-quests.json',focused),('content/catalog.json',catalog),('content/preview-scope.json',scope),('content/child-entry-points.json',entries),('content/quest-story-paths.json',paths),('content/textbook-connections.json',textbooks),('content/learning-map.json',learning),('content/sources.json',source_registry)]:write(path,obj)
 interface=read('content/voice-interface-lines.json')
 for line in interface['lines']:
  if line['id']=='river-intro':line['text']='小小旅行团集合啦！从春秋认识孔子，再到秦汉、唐宋和明清。你想先去哪一站？也可以挑人物、发明或古迹的主题，找一个故事出发吧！'
 additions=[{'id':'route-picker-intro','text':'挑一个喜欢的主题：认识人物与经典，探索四大发明，或者去看中国古迹。每个故事也能从原来的朝代入口找到。'}]+[{'id':r['voiceId'],'text':r['intro']} for r in read('content/play-routes.json')['routes']]
 interface['lines']=[l for l in interface['lines'] if l['id'] not in {x['id'] for x in additions}]+additions;write('content/voice-interface-lines.json',interface)
 print('Authored China expansion:',len(CHAPTERS),'chapters; visible',len(scope['chapterIds']),'ancient library',len(catalog['chapters']))

if __name__=='__main__':apply()
