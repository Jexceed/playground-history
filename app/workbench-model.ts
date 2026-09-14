/** Offsets are percentages of the whole board; ruler width is 70% of that board. */
export function clampRulerOffset(value:number){return Math.max(-24,Math.min(24,value));}
export function pointerRulerOffset(initial:number,deltaPixels:number,boardWidth:number){return clampRulerOffset(initial+deltaPixels/Math.max(1,boardWidth)*100);}
export function alignedRuler(offset:number){return Math.abs(offset)<=2.5;}
