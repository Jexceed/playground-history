import subprocess,pathlib,re,html
root=pathlib.Path('reference-assets/liao-song-xia-jin-yuan')
pages={'song-quanzhou-ship':'https://commons.wikimedia.org/wiki/File:Song_Dynasty_Ancient_Ship_of_Quanzhou_Bay_20061229.jpg','wujing-ming-volume1':'https://commons.wikimedia.org/wiki/File:NLC892-411999028209-148443_%E6%AD%A6%E7%B6%93%E7%B8%BD%E8%A6%81%E5%89%8D%E9%9B%86_%E7%AC%AC1%E5%86%8A.pdf'}
for key,url in pages.items():
 text=subprocess.check_output(['/usr/bin/curl','--fail','--silent','--show-error','--location','--proxy','http://127.0.0.1:7890','--max-time','50',url]).decode()
 (root/(key+'-filepage.html')).write_text(text)
 m=re.search(r'<div class="fullMedia"[^>]*>.*?<a href="([^"]+)"',text)
 if not m:raise ValueError('No full media link '+key)
 media=html.unescape(m.group(1));ext='.pdf' if '.pdf' in media else '.jpg'
 subprocess.run(['/usr/bin/curl','--fail','--silent','--show-error','--location','--proxy','http://127.0.0.1:7890','--max-time','90',media,'-o',str(root/(key+ext))],check=True)
 print(key,media)
