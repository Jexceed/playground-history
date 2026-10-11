import { createRoot } from "react-dom/client";
import Home from "../app/page";
import {registerDesktopHost} from "../app/desktop-host";
import "../app/globals.css";
import "./native.css";

declare global {
  interface Window {__TAURI__?:{core:{invoke:<T>(command:string,args?:Record<string,unknown>)=>Promise<T>}}}
}
const invoke=window.__TAURI__?.core.invoke;
if(invoke){
  registerDesktopHost({
    exportProgress:data=>invoke<boolean>('export_progress',{data}),
    importProgress:()=>invoke<string|null>('import_progress'),
    openSource:url=>invoke<void>('open_source',{url}),
  });
  document.addEventListener('click',event=>{
    const anchor=(event.target as Element)?.closest?.('a[href]') as HTMLAnchorElement|null;
    if(!anchor||!/^https?:\/\//i.test(anchor.href))return;
    event.preventDefault();
    void invoke('open_source',{url:anchor.href}).catch(()=>{
      window.alert('暂时无法打开资料链接，请稍后再试。');
    });
  },true);
}
createRoot(document.getElementById('root')!).render(<Home/>);
