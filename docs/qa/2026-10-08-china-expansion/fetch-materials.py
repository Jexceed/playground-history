"""One-off research downloader. All identities/licenses require review before registry use."""
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'reference-assets/china-expansion'
OUT.mkdir(exist_ok=True)
FILES={
 'analects-ming-commentary':'File:Commentaries of the Analects of Confucius.jpg',
 'qin-kneeling-archer':'File:2011 Qin Terracotta Kneeling Archer.jpg',
 'qin-painted-archer':'File:2009 Qin State- Terracotta Kneeling Archer, Painted.jpg',
 'zhaozhou-bridge-now':'File:Zhaozhou Bridge.jpg',
 'han-changxin-lamp':'File:长信宫灯4.png',
 'huang-daopo-memorial':'File:Huangdaopo Memorial inner.jpg',
 'zheng-bamboo-rocks':'File:Zheng Xie - Bamboo and Rocks - 95.54.2 - Minneapolis Institute of Art.jpg',
 'shiji-ming-edition':'File:NCL-01308 01 史記.pdf',
 'li-qingzhao-shuyu':'File:NLC892-312002087162-387332 漱玉詞.pdf',
 'dufu-poems-volume2':'File:杜工部集(二).djvu',
}
def get(url):
 for attempt in range(3):
  try:
   return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'HistoryProject/1.0 (local educational research)'}),timeout=35).read()
  except urllib.error.HTTPError as error:
   if error.code != 429 or attempt == 2: raise
   time.sleep(min(30,int(error.headers.get('Retry-After','15'))))
saved=Path(__file__).parent/'material-metadata.json'
metadata=json.loads(saved.read_text()) if saved.exists() else {}
for name,title in FILES.items():
 if name in metadata and (ROOT/metadata[name]['localPath']).exists():continue
 params={'action':'query','titles':title,'prop':'imageinfo','iiprop':'url|extmetadata|size','iiurlwidth':1600,'format':'json'}
 data=json.loads(get('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(params)))
 page=next(iter(data['query']['pages'].values())); info=page['imageinfo'][0]
 metadata[name]={'fileTitle':title,**info}
 url=info['url'] if title.lower().endswith(('.jpg','.png')) else info['thumburl']
 extension='.png' if title.lower().endswith('.png') else '.jpg'
 target=OUT/(name+extension)
 if not target.exists():target.write_bytes(get(url))
 metadata[name]['localPath']=str(target.relative_to(ROOT))
 (Path(__file__).parent/'material-metadata.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
 print(name,info['extmetadata'].get('LicenseShortName',{}).get('value'),target.stat().st_size,flush=True)
