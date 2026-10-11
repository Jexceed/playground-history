import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync,execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const action=process.argv[2]??'build',skipBuild=process.argv.includes('--skip-build');
if(process.platform!=='darwin'||process.arch!=='arm64')throw new Error('本轮构建针对Apple Silicon Mac。');
if(!['build','install','dev','package'].includes(action))throw new Error('Use build, install, dev, or package');
const cargoBin=path.join(os.homedir(),'.cargo/bin');
const env={...process.env,PATH:[cargoBin,process.env.PATH].filter(Boolean).join(path.delimiter)};
const cli=path.join(root,'node_modules/.bin/tauri');
const run=(command,args,options={})=>{
  const r=spawnSync(command,args,{cwd:root,env,stdio:'inherit',...options});
  if(r.error)throw r.error;if(r.status!==0)throw new Error(`${path.basename(command)} exited with ${r.status}`);
};
const appName='小小历史旅行团.app';
const builtApp=path.join(root,'src-tauri/target/aarch64-apple-darwin/release/bundle/macos',appName);
if(action==='dev'){run(cli,['dev']);process.exit(0);}
if(!skipBuild){
  run(process.execPath,[path.join(root,'scripts/prepare-mac-icon.mjs')]);
  run(cli,['build','--bundles','app','--target','aarch64-apple-darwin']);
}
if(!fs.existsSync(builtApp))throw new Error('Missing built .app; run npm run mac:build');
run('/usr/bin/codesign',['--verify','--deep','--strict',builtApp]);
const release=path.join(root,'release');fs.mkdirSync(release,{recursive:true});
const releaseApp=path.join(release,appName);
fs.rmSync(releaseApp,{recursive:true,force:true});run('/usr/bin/ditto',[builtApp,releaseApp]);
if(action==='install'){
  const destination=path.join('/Applications',appName),temp=path.join('/Applications',`.history-trip-install-${process.pid}.app`);
  if(fs.existsSync(destination)){
    const id=execFileSync('/usr/libexec/PlistBuddy',['-c','Print :CFBundleIdentifier',path.join(destination,'Contents/Info.plist')],{encoding:'utf8'}).trim();
    if(id!=='com.jexceed.historytrip')throw new Error('同名应用不属于本项目；已保留它，新的App位于release目录。');
  }
  try{
    run('/usr/bin/ditto',[releaseApp,temp]);run('/usr/bin/codesign',['--verify','--deep','--strict',temp]);
    const previous=path.join('/Applications',`.history-trip-previous-${process.pid}.app`);
    if(fs.existsSync(previous))throw new Error('Previous installation backup already exists; inspect it before retrying.');
    const replacing=fs.existsSync(destination);
    if(replacing)fs.renameSync(destination,previous);
    try{fs.renameSync(temp,destination);}catch(error){if(replacing)fs.renameSync(previous,destination);throw error;}
    if(replacing){
      const backup=path.join(release,`previous-app-${Date.now()}.app`);
      run('/usr/bin/ditto',[previous,backup]);run('/usr/bin/codesign',['--verify','--deep','--strict',backup]);
      fs.rmSync(previous,{recursive:true});
    }
  }finally{if(fs.existsSync(temp))fs.rmSync(temp,{recursive:true,force:true});}
  run('/usr/bin/touch',[destination]);
  run('/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister',['-f',destination]);
  console.log(`Installed: ${destination}`);
}
if(action==='package'){
  const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
  const zip=path.join(release,`little-history-trip-${version}-macos-arm64.zip`);
  const dmg=path.join(release,`little-history-trip-${version}-macos-arm64.dmg`);
  run('/usr/bin/ditto',['-c','-k','--sequesterRsrc','--keepParent',releaseApp,zip]);
  const staging=path.join(root,'work/macos-dmg');fs.rmSync(staging,{recursive:true,force:true});fs.mkdirSync(staging,{recursive:true});
  run('/usr/bin/ditto',[releaseApp,path.join(staging,appName)]);fs.symlinkSync('/Applications',path.join(staging,'Applications'));
  run('/usr/bin/hdiutil',['create','-volname','小小历史旅行团','-srcfolder',staging,'-ov','-format','UDZO',dmg]);
  run('/usr/bin/hdiutil',['verify',dmg]);fs.rmSync(staging,{recursive:true,force:true});
  console.log(`Packaged: ${zip}\nPackaged: ${dmg}`);
}
console.log(`App: ${releaseApp}`);
