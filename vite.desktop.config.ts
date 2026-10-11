import {defineConfig,type Plugin} from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

function verifyDesktopRuntime():Plugin {
  return {
    name:'verify-desktop-runtime',
    generateBundle(_options,bundle){
      const modules=Object.values(bundle).flatMap(item=>item.type==='chunk'?Object.keys(item.modules):[]);
      const forbidden=modules.filter(id=>/\/node_modules\/(next|vinext|react-server-dom-webpack|drizzle-orm|wrangler)\//.test(id));
      if(forbidden.length)this.error(`Server runtime leaked into the desktop bundle: ${forbidden.join(', ')}`);
      const packages=[...new Set(modules.map(id=>id.match(/\/node_modules\/((?:@[^/]+\/)?[^/]+)/)?.[1]).filter(Boolean))].sort();
      this.emitFile({type:'asset',fileName:'desktop-build.json',source:JSON.stringify({runtime:'Tauri/WebKit client-only',serverRuntimeIncluded:false,runtimePackages:packages},null,2)+'\n'});
    },
  };
}

export default defineConfig({
  root:path.resolve('desktop'),
  base:'./',
  publicDir:path.resolve('desktop-public'),
  plugins:[react(),verifyDesktopRuntime()],
  resolve:{alias:{'next/image':path.resolve('desktop/Image.tsx')}},
  server:{host:'127.0.0.1',port:1420,strictPort:true},
  build:{outDir:path.resolve('desktop-dist'),emptyOutDir:true,target:'safari17',sourcemap:false},
  clearScreen:false,
});
