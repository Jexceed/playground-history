"""One-time authoring snapshot; do not rerun over later source refinements."""
from authoring_helpers import *
import shutil
ID='cn-ancient-06-05-tang-decline'; S='NMC-QIANLIU-IRON-CERTIFICATE'; H='HZ-QIANLIU-WATERWORKS'; N='NMC-SUI-TANG-FIVE-DYNASTIES'
ss=read('content/sources.json')['sources'];print([x['id'] for x in ss if x['url'].endswith('detail6.html')])
N=next(x['id'] for x in ss if x['url'].endswith('detail6.html'))
add_source({'id':H,'institution':'杭州市生态环境局','title':'临安钱王陵','url':'https://stb.hangzhou.gov.cn/art/2020/7/23/art_1229052385_52354100.html','type':'government-heritage-record','authorityLevel':'A','factUse':'钱镠治理吴越时修海塘、疏浚湖浦与发展农桑；不把射潮传说当史实','imageUse':'reference-only'})
c=next(c for c in read(F)['chapters'] if c['id']==ID)
c.update(title='跟钱镠看吴越的水与田',cta='去看看海塘和水道',hook='唐朝结束以后，钱镠在吴越经营地方。海潮要挡住，水道要畅通，人们怎样照料水边的生活？',outcome='钱镠先在唐末得到铁券，后来治理吴越。政权发生变化，人们仍要修海塘、疏通水道，靠劳动经营当地生活。',anchor='钱镠与吴越修塘、疏水的人们',sourceIds=[S,N,H],boundary='897年铁券是唐昭宗颁赐钱镠的凭证，不能把它改成吴越颁发或普通钱币。北方五代先后更替，十国有先后也有并立；960不是各地同时结束的年份。修塘疏水由文献支持，新图为教学情境，不复原某处海塘、不把射潮神话当史实、不把钱镠说成独自完成工程。',closingLine='朝代会变，照料水与田还要靠人。')
a='qian-waterworks-v1'; end='qian-reunion-v1'
steps=[
step('一件从唐末传下来的铁券','897年，唐昭宗把这件铁券赐给钱镠。钱镠后来建立吴越，但收到铁券时，唐朝还没有结束。','钱镠收到铁券时，在哪个时期？','是唐末。我们再跟他走到后来的吴越。','五代十国在后，铁券先在唐末颁赐。','从唐末走到吴越',[S],kind='timeline',options=[era('唐末','897年','tang',True),era('五代十国','907年以后','five-dynasties',False)],lead='这件铁券来自唐末。钱镠后来建立吴越。'),
step('唐朝结束，地方各有变化','907年唐朝结束后，北方五个王朝先后更替，各地也有并立的政权。钱镠治理的吴越在东南。他组织修海塘、疏通水道，人们靠这些劳动照料田地与生活。','政权会变，水边的生活还要照料','修塘和疏水，各有要做的事。','可以再听一遍。','去找两种水边工作',[N,H],kind='look-listen',asset=a,display='吴越在东南。\n挡住海潮，也要疏通水道。'),
step('海边和田边，谁在忙','小伙伴来到水边的故事画。海边有人加固海塘，田边有人清走水道里的泥沙。先看他们的工具和动作。','谁在把海塘夯得更结实？','两种工作，都在照料水边生活。','再看看工具和水的位置。','水道堵住了，先做什么',[H],kind='scene-find',asset=a),
step('泥沙堵住水道，怎么办','这段水道积了泥沙，水不容易流向田里。海塘也要维护，但眼前先要让水道畅通。小伙伴去找合适的工作。','让水重新流过去，先做什么？','清走堵处，水道才能更畅通。','海塘挡潮，眼前堵住的是田边水道。','把水与田的发现带回去',[H],options=[card('清走水道里的泥沙',a,[990,130,530,525,1536,1024],True),card('加固海边的海塘',a,[170,45,450,565,1536,1024],False)],asset=a),
step('铁券与田地，留下不同线索','铁券留下了唐朝颁给钱镠的承诺；水利记载让我们知道他怎样经营吴越。还要有人修筑、疏通和维护，田边生活才会慢慢改变。','不同材料，拼出更多历史','把不同线索连起来，就更懂这段历史了。','可以再听一遍。','带着吴越的发现回家',[S,H,N],kind='look-listen',asset=end,display='铁券留下承诺。\n修塘、疏水还要靠大家。')]
steps[0]['inspection']=inspection('qian-liu-iron-certificate-museum-photo','钱镠铁券 · 唐末897年','国博藏品 · 参观照片','看看弯曲的铁面和上面的金字。它是唐朝颁给钱镠的凭证；修水利的事情，要再看历史记载。',[{'title':'中国国家博物馆：钱镠铁券','url':next(x['url'] for x in ss if x['id']==S)},{'title':'照片作者与许可','url':'https://commons.wikimedia.org/wiki/File:Iron_Plaque_for_Quan_Liu,_2016-09-15_01.jpg'}],330)
scene_find(steps[2],[('wall','夯筑海塘的人',.13,.24,.27,.34),('channel','疏通水道的人',.66,.32,.31,.31)],[('wall','谁在把海塘夯得更结实？','wall','他在夯实海塘，帮助抵挡海潮。','他在清水道，再找海边夯土的人。','再找疏通水道的人'),('channel','谁把泥沙从水道里清出来？','channel','清走泥沙，水道才能保持畅通。','他在夯海塘，再找拿铲子清泥的人。','看看水道遇到的问题')])
c['steps']=steps;c['finish']={'title':'水与田，要靠大家照料！','actions':['指一指海塘外的海水，再找通向田地的水道。','家人说“海潮来了”“水道堵了”，你指对应的工程和工作。'],'parent':'先让孩子区分挡潮与疏通的用途，再问铁券能不能代替人们工作。五代与十国不能都排成先后，也不能全放在同一年。工程服务地方生活，但不据此概括各地都一样安定。','sceneStepIndexes':[2,3]};c['evidenceAssetIds']=['qian-liu-iron-certificate-museum-photo'];presentation(c,a,end,'唐朝结束后，北方王朝先后更替，东南的吴越也在经营地方。跟着钱镠的线索去看看。',1.5,1.78)
save_chapter(c)
shutil.copy2('/Users/chiang/.codex/generated_images/01a094d5-be50-7653-a907-8550b7e19f5a/exec-3f7d05b7-0f74-4e9b-92b4-26fe3127a32b.png','reference-assets/sui-tang-five-dynasties/qian-reunion-v1.png')
for aid,title in [(a,'吴越海塘与疏水劳动儿童故事插画'),(end,'小伙伴回看吴越水利故事的结束插画')]:add_art('content/assets/sui-tang-five-dynasties-assets.json',aid,title,ID,[H,N],'sui-tang-five-dynasties',c['boundary'])
update_md('content/chapters/tang-decline.md',c)
