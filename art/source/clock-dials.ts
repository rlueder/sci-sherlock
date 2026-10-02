/** Shared native 3:17 handset correction for room, closed case and reveal exports. */
import {Pixels} from './pixels.ts';
export function setDial(p:Pixels,cx:number,cy:number,length:number){
 // Local restoration of only the old hand cluster; retain rim and minute marks.
 for(let y=cy-2;y<=cy+3;y++)for(let x=cx-2;x<=cx+length;x++){
  if((x-cx)**2/((length+1)**2)+(y-cy)**2/25<=1)p.dot(x,y,58);
 }
 const minute=17/60*Math.PI*2,hour=(3+17/60)/12*Math.PI*2;
 const endpoint=(a:number,n:number):[number,number]=>[Math.round(cx+Math.sin(a)*n),Math.round(cy-Math.cos(a)*n/1.2)];
 const m=endpoint(minute,length),h=endpoint(hour,Math.max(3,length-3));
 p.line(cx,cy,...m,5);p.line(cx,cy,...h,3);p.dot(cx,cy,3);
 return{center:[cx,cy],hour:3,minute:17,minuteTip:m,hourTip:h};
}
