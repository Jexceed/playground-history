import fs from 'node:fs';
import path from 'node:path';
import {collectDesktopAssets} from './lib/desktop-assets.mjs';

const root=process.cwd(),dest=path.join(root,'desktop-public');
const manifest=collectDesktopAssets(root);
fs.rmSync(dest,{recursive:true,force:true});fs.mkdirSync(dest,{recursive:true});
for(const asset of manifest.assets){
  const output=path.join(dest,asset.slice(1));fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.copyFileSync(path.join(root,'public',asset.slice(1)),output);
}
fs.writeFileSync(path.join(dest,'desktop-assets.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Desktop assets: ${manifest.chapters} chapters, ${manifest.stations} stations, ${manifest.voiceLines} voice clips, ${manifest.assets.length} files.`);
