import type { ImgHTMLAttributes } from "react";

type Props = ImgHTMLAttributes<HTMLImageElement> & {unoptimized?:boolean;priority?:boolean};
// Tauri loads the same already-sized local assets, with no Next image server.
export default function OfflineImage({unoptimized,priority,loading,alt='',...props}:Props) {
  void unoptimized;
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={alt} loading={loading??(priority?'eager':'lazy')} decoding="async"/>;
}
