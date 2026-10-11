import {useRef,useState} from 'react';
import {getDesktopHost} from './desktop-host';
import {exportProgress,type LocalProgress} from './quest-progress';
import './progress-transfer.css';

export function ProgressTransfer({progress,contentVersion,onImport}:{progress:LocalProgress;contentVersion:string;onImport:(raw:string)=>void}) {
  const input=useRef<HTMLInputElement>(null);
  const [busy,setBusy]=useState(false),[notice,setNotice]=useState('');
  const report=(error:unknown)=>setNotice(error instanceof Error?error.message:String(error));
  const accept=(raw:string)=>{onImport(raw);setNotice('记录已合并到这台设备，原有完成标记已保留。');};
  const save=async()=>{
    setBusy(true);setNotice('');
    try{
      const data=exportProgress(progress,contentVersion),host=getDesktopHost();
      if(host){if(await host.exportProgress(data))setNotice('学习记录已导出，可以在另一台设备导入。');}
      else{
        const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
        const a=document.createElement('a');a.href=url;a.download='小小历史旅行团-学习记录.json';a.click();
        window.setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('学习记录已导出，请查看下载文件。');
      }
    }catch(error){report(error);}finally{setBusy(false);}
  };
  const open=async()=>{
    const host=getDesktopHost();setNotice('');
    if(!host){input.current?.click();return;}
    setBusy(true);
    try{const data=await host.importProgress();if(data!==null)accept(data);}catch(error){report(error);}finally{setBusy(false);}
  };
  return <div className="progress-transfer">
    <p>记录只保存在这台设备。换设备时，可以用文件带过去。</p>
    <div className="progress-transfer-actions"><button disabled={busy} onClick={()=>void save()}>导出学习记录</button><button disabled={busy} onClick={()=>void open()}>导入学习记录</button></div>
    <input ref={input} type="file" accept=".json,application/json" hidden onChange={async event=>{
      const file=event.currentTarget.files?.[0];event.currentTarget.value='';if(!file)return;
      setBusy(true);try{if(file.size>262144)throw new Error('学习记录文件过大。');accept(await file.text());}catch(error){report(error);}finally{setBusy(false);}
    }}/>
    {notice&&<p role="status">{notice}</p>}
  </div>;
}
