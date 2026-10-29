import fs from 'node:fs';
import path from 'node:path';

const read=(root,p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
export function publicPath(value){
  if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//'))return null;
  const clean=value.split(/[?#]/,1)[0];
  if(!/^\/(images|audio|content)\//.test(clean))return null;
  if(clean.includes('..')||clean.includes('\\')||clean.includes('\0'))throw new Error('Invalid local asset path');
  if(!path.posix.extname(clean))return null; // Metadata may include directory prefixes.
  return clean;
}
export function collectDesktopAssets(root){
  const preview=read(root,'content/runtime/preview-manifest.json'),paths=new Set(),voiceIds=new Set();
  const voiceLines=read(root,'public/audio/voice-lines.json'),voiceIndex=new Set(voiceLines.lines.map(v=>v.id));
  const visitPaths=value=>{
    if(typeof value==='string'){const p=publicPath(value);if(p)paths.add(p);}
    else if(value&&typeof value==='object')Object.values(value).forEach(visitPaths);
  };
  const visitVoices=value=>{
    if(!value||typeof value!=='object')return;
    if(typeof value.id==='string'&&typeof value.text==='string'&&voiceIndex.has(value.id))voiceIds.add(value.id);
    else Object.values(value).forEach(visitVoices);
  };
  const chapters=preview.tracks.flatMap(t=>t.chapters);
  visitPaths(preview);
  visitPaths(read(root,'content/play-routes.json'));
  for(const c of chapters){
    visitVoices(c.gameplay);
    visitPaths(read(root,`public/content/chapters/${c.id}.json`));
    paths.add(`/content/chapters/${c.id}.json`);
  }
  read(root,'content/voice-interface-lines.json').lines.forEach(v=>voiceIds.add(v.id));
  voiceIds.forEach(id=>paths.add(`/audio/voice/zh-CN/xiaoxiao/${id}.mp3`));
  visitPaths(read(root,'content/runtime/voice-auditions-manifest.json'));
  function sourcePaths(dir){
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
      const p=path.join(dir,entry.name);
      if(entry.isDirectory())sourcePaths(p);
      else if(/\.(tsx?|css|html)$/.test(entry.name)){
        const text=fs.readFileSync(p,'utf8');
        for(const m of text.matchAll(/["'`](\/(?:images|audio|content)\/[^"'`\s${}]+)["'`]/g)){
          const local=publicPath(m[1]);if(local)paths.add(local);
        }
      }
    }
  }
  sourcePaths(path.join(root,'app'));sourcePaths(path.join(root,'desktop'));
  if(voiceIds.size!==preview.totals.localVoiceLines)throw new Error(`Desktop voice coverage mismatch: ${voiceIds.size}/${preview.totals.localVoiceLines}`);
  const assets=[...paths].sort();
  for(const p of assets)if(!fs.statSync(path.join(root,'public',p.slice(1)),{throwIfNoEntry:false})?.isFile())throw new Error(`Missing desktop asset ${p}`);
  return {schemaVersion:1,contentVersion:preview.contentVersion,chapterIds:chapters.map(c=>c.id),chapters:chapters.length,stations:preview.scope.periodIds.length,voiceIds:[...voiceIds].sort(),voiceLines:voiceIds.size,assets};
}
