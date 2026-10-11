/** All positions are in the illustration's coordinates, including pointer travel. */
export const SLIDE_BOARD={width:600,height:360};
export const WALL_JOIN={left:30,right:570,top:151,bottom:309,gapLeft:210,gapRight:390};
/** Follows the wall's top and foot in the registered 600 × 360 scene, not a texture rectangle. */
export const WALL_PIECE_PATH='M210 151L226 153L240 154L254 154L270 157L285 157L300 159L316 162L330 163L345 162L360 165L375 167L390 171L390 309L375 304L360 300L345 297L330 294L315 291L300 288L285 284L270 280L255 277L240 272L225 267L210 263Z';
export const COIN_MOULD={centerX:300,centerY:204,radius:50,hole:32};

export function slideDisplacement(offset:number){return offset*SLIDE_BOARD.width/100;}
export function wallPieceBounds(offset:number){
 const displacement=slideDisplacement(offset);
 // The loose model piece rests slightly forward; it returns to the exact scene footprint at zero.
 const foreground=Math.min(40,Math.abs(offset)*2);
 return {left:WALL_JOIN.gapLeft+displacement,right:WALL_JOIN.gapRight+displacement,top:WALL_JOIN.top+foreground,bottom:WALL_JOIN.bottom+foreground};
}
export function coinCardGeometry(offset:number){
 return {...COIN_MOULD,centerX:COIN_MOULD.centerX+slideDisplacement(offset)};
}
/** The target and card call the same path builder; the square is a true opening. */
export function coinOutlinePath(cx:number,cy:number,radius:number,hole:number){
 return `M${cx} ${cy-radius}a${radius} ${radius} 0 1 1 0 ${radius*2}a${radius} ${radius} 0 1 1 0 ${-radius*2}Z M${cx-hole/2} ${cy-hole/2}h${hole}v${hole}h${-hole}Z`;
}
