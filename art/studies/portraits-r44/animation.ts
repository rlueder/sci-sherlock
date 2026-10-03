/** Expression-local, character-specific apertures. Never regenerate a master here. */
import {Pixels,clone,crop,oldMouth,oldEyes,loadIndexed,palette,cast,assert,inRect} from './common.ts';
import type {Rect,Edit} from './common.ts';
export function mouths(name:string,expression:string,master:Pixels,mark:any):Pixels[]{
 const region=mark.mouthRegion as Rect,closed=crop(master,[region]),spec=oldMouth[name],out=[closed];
 for(let c=1;c<4;c++){
  const p=clone(closed),edits=(c===1?spec.parted:spec.open) as Edit[];
  for(const [x,y,colour] of edits)p.dot(x,y,colour);
  // Keep the expression's corners; central aperture grows beneath the actual lip seam.
  if(expression!=='neutral')for(const [x,y] of mark.lipCorners as [number,number][]){for(let yy=y-1;yy<=y+1;yy++)if(inRect(x,yy,region))p.dot(x,yy,master.data[yy*56+x]!);}
  if(c===3){
   if(name==='watson'){p.dot(36,41,15);p.dot(37,41,9);p.dot(38,41,9);p.dot(39,41,15);p.dot(37,42,35);p.dot(38,42,45);}
   if(name==='holmes'){p.dot(37,41,15);p.dot(38,41,9);p.dot(39,41,9);p.dot(40,41,15);p.dot(38,42,35);p.dot(39,42,45);}
   if(name==='hudson'){p.dot(36,41,23);p.dot(37,41,9);p.dot(38,41,9);p.dot(39,41,23);p.dot(37,42,35);p.dot(38,42,45);}
   if(name==='toby'){p.dot(35,43,23);p.dot(36,43,9);p.dot(37,43,9);p.dot(38,43,23);p.dot(36,44,35);p.dot(37,44,45);}
  }
  out.push(p);
 }
 return out;
}
export function eyes(name:string,expression:string,master:Pixels,mark:any):Pixels[]{
 const regions=mark.eyeRegions as Rect[],open=crop(master,regions),out=[open];
 // Neutral blink pixels already reviewed in r23, including Toby's irregular mask.
 for(let c=1;c<3;c++){
  const p=clone(open);
  if(expression==='neutral'){
   const old=loadIndexed(`art/studies/portraits-r23/export/${name}-2-${c}.png`,palette);
   for(let y=0;y<64;y++)for(let x=0;x<56;x++)if(regions.some(r=>inRect(x,y,r))&&old.data[y*56+x]!>=0)p.dot(x,y,old.data[y*56+x]!);
  }else{
   regions.forEach(([x,y,w,h],side)=>{
    const base=cast[name]!.eyes[side]!,[px,py]=mark.pupils[side] as [number,number];
    const original=oldEyes[name];
    if(original[c===1?'half':'closed']){
     for(const [xx,yy,colour] of original[c===1?'half':'closed'] as Edit[])if(inRect(xx,yy,[x,y,w,h]))p.dot(xx,yy,colour);
    }else{
     // Toby's eyes are uneven: fit the near lid to y31 and the far lid to y30.
     for(let k=1;k<w-1;k++){
      p.dot(x+k,y, k<w/2?55:50);
      p.dot(x+k,y+1,c===1?(x+k===px?15:x+k===px-1?58:45):23);
      for(let yy=y+2;yy<y+h;yy++)p.dot(x+k,yy,k<w/2?55:50);
     }
    }
    if(mark.eyeShape==='wide'){
     // Added upper row is skin when descending, not a leftover white halo.
     for(let k=1;k<w-1;k++)p.dot(x+k,y,k<w/2?55:50);
     if(c===1){for(let k=1;k<w-1;k++)p.dot(x+k,base[1],39);p.dot(px,Math.min(y+h-1,py),15);}
    }
    if(mark.eyeShape==='narrow'&&c===1){p.dot(px,py,23);if(px-1>x)p.dot(px-1,py,51);}
   });
  }
  out.push(p);
 }
 // Glances move irises only. Recover the exposed sclera from a small fitted aperture,
 // never translate an entire rectangular eye/brow patch.
 for(const direction of ['toward','away','down']){
  const p=clone(open);
  regions.forEach(([x,y,w,h],side)=>{
   const [originalX,originalY]=mark.pupils[side] as [number,number];
   const py=Math.min(y+h-1,originalY),left=x+1,right=x+w-2;
   for(let xx=Math.max(left,originalX-1);xx<=Math.min(right,originalX+1);xx++)p.dot(xx,py,xx===left?51:58);
   const xx=Math.max(left,Math.min(right,originalX+(direction==='toward'?1:direction==='away'?-2:0)));
   p.dot(xx,py,15);
   if(direction==='down'){p.dot(xx,Math.min(y+h-1,py+1),9);p.dot(Math.max(left,xx-1),py,45);}
   else {p.dot(xx,py,9);if(h>2&&mark.eyeShape==='wide')p.dot(xx,py-1,15);}
  });out.push(p);
 }
 assert.equal(out.length,6);return out;
}
