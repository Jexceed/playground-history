export type DesktopHost = {
  exportProgress:(data:string)=>Promise<boolean>;
  importProgress:()=>Promise<string|null>;
  openSource:(url:string)=>Promise<void>;
};
let desktopHost:DesktopHost|null=null;
export function registerDesktopHost(host:DesktopHost){desktopHost=host;}
export function getDesktopHost(){return desktopHost;}
