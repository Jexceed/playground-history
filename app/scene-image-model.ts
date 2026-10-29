export type SceneImageCrop={x:number;y:number;width:number;height:number;sourceWidth:number;sourceHeight:number};
export type ImageSize={width:number;height:number};

/** Keep the authored scene's top edge when it already contains the object.
 * Workshop images often reserve an empty lower table for interactive props;
 * do not reintroduce that empty area when retaining context for a small crop.
 */
export function sceneContextBox(crop:SceneImageCrop,frame:ImageSize){
 const full={x:0,y:0,width:crop.sourceWidth,height:crop.sourceHeight};
 if(!Number.isFinite(frame.width)||!Number.isFinite(frame.height)||frame.width<=0||frame.height<=0)return full;
 const ratio=frame.width/frame.height;
 const width=Math.min(crop.sourceWidth,crop.sourceHeight*ratio),height=width/ratio;
 if(width<crop.width||height<crop.height)return full;
 return {x:Math.max(0,Math.min(crop.sourceWidth-width,crop.x+crop.width-width)),y:Math.max(0,Math.min(crop.sourceHeight-height,crop.y+crop.height-height)),width,height};
}

/** Measure the pixels in the selected crop, not those in the whole source image.
 * A small object stays in its scene instead of becoming a blurry full-page image.
 * This is for selected cards only; finding hotspots keeps its authored geometry.
 */
export function sceneDetailFraming(crop:SceneImageCrop,raster:ImageSize|undefined,frame:ImageSize):'detail'|'context'{
 const dimensions=[crop.width,crop.height,crop.sourceWidth,crop.sourceHeight,raster?.width,raster?.height,frame.width,frame.height];
 if(!dimensions.every(n=>typeof n==='number'&&Number.isFinite(n)&&n>0))return 'context';
 const fit=Math.min(frame.width/crop.width,frame.height/crop.height);
 const pixelScale=Math.min(raster!.width/crop.sourceWidth,raster!.height/crop.sourceHeight);
 return fit/pixelScale>1.5?'context':'detail';
}
