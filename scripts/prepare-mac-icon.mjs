import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=process.cwd(),source=path.join(root,'reference-assets/branding/history-trip-logo-v3.png');
if(!fs.existsSync(source))throw new Error('Missing project logo source');
const publicDir=path.join(root,'public/images/brand'),icons=path.join(root,'src-tauri/icons');
const iconset=path.join(root,'work/history-trip.iconset');
for(const p of [publicDir,icons,iconset])fs.mkdirSync(p,{recursive:true});
const resize=(size,output)=>execFileSync('/usr/bin/sips',['-z',String(size),String(size),source,'--out',output],{stdio:'ignore'});
resize(1024,path.join(publicDir,'history-trip-logo.png'));
resize(32,path.join(publicDir,'history-trip-icon-32.png'));
resize(180,path.join(publicDir,'history-trip-icon-180.png'));
for(const size of [16,32,128,256,512]){
  resize(size,path.join(iconset,`icon_${size}x${size}.png`));
  resize(size*2,path.join(iconset,`icon_${size}x${size}@2x.png`));
}
for(const [size,name] of [[32,'32x32.png'],[128,'128x128.png'],[256,'128x128@2x.png'],[1024,'icon.png']])resize(size,path.join(icons,name));
execFileSync('/usr/bin/iconutil',['-c','icns',iconset,'-o',path.join(icons,'icon.icns')]);
// A new bundle icon filename prevents macOS from retaining the previous mark.
fs.copyFileSync(path.join(icons,'icon.icns'),path.join(icons,'history-trip-v3.icns'));
console.log('Logo PNG and macOS ICNS generated.');
