import type { PhotoCropRect } from "./photo-album";
import {useId} from "react";

// Display a registered region of the original; never rewrite the evidence image.
export function PhotoCrop({src,alt,crop}:{src:string;alt:string;crop:PhotoCropRect}) {
  const clipId=`photo-crop-${useId().replace(/:/g,"")}`;
  return <svg className="photo-crop" viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`} preserveAspectRatio="xMidYMid meet" role={alt?"img":undefined} aria-label={alt||undefined} aria-hidden={alt?undefined:true}>
    <defs><clipPath id={clipId}><rect x={crop.x} y={crop.y} width={crop.width} height={crop.height}/></clipPath></defs>
    <image href={src} x="0" y="0" width={crop.sourceWidth} height={crop.sourceHeight} clipPath={`url(#${clipId})`}/>
  </svg>;
}
