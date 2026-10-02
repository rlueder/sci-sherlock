/** Registered rendered keys over a locked body. No procedural replacement limbs. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {decodePng} from 'sci2-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {clone,enlarged} from '../../source/study-tools.ts';
const h='art/studies/221b-r30/';
export function pageTurn(master:Pixels,pal:string[]){
 const raw=decodePng(readFileSync(h+'generated/watson-page-keys.png'));
 const rgb=pal.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));
 const mask=new Pixels(72,120);
 mask.poly([[20,73],[24,73],[24,71],[48,71],[48,68],[54,71],[58,77],[57,85],[50,87],[23,87],[17,84],[17,77]],0);
 const frames=[clone(master)];const registration=[];
 for(let k=0;k<4;k++){
  const ox=(k%2)*raw.width/2,oy=k<2?0:744,cw=raw.width/2,ch=k<2?744:raw.height-744;
  let t=ch,b=0;
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(raw.data[((oy+y)*raw.width+ox+x)*4+3]!>=240){t=Math.min(t,y);b=Math.max(b,y)}
  let l=cw,r=0;for(let y=t;y<t+(b-t)*.17;y++)for(let x=0;x<cw;x++)if(raw.data[((oy+y)*raw.width+ox+x)*4+3]!>=240){l=Math.min(l,x);r=Math.max(r,x)}
  const cx=(l+r)/2,sy=64/(b-t+1),sx=sy*1.2,p=clone(master),converted=new Pixels(72,120);
  for(let y=0;y<120;y++)for(let x=0;x<72;x++){
   const px=Math.floor((x+.5-36)/sx+cx),py=Math.floor((y+.5-113)/sy+b+1);if(px<0||px>=cw||py<0||py>=ch)continue;
   const a=((oy+py)*raw.width+ox+px)*4;if(raw.data[a+3]!<240)continue;let best=Infinity,idx=0;
   rgb.forEach((c,i)=>{const d=2*(c[0]!-raw.data[a]!)**2+4*(c[1]!-raw.data[a+1]!)**2+(c[2]!-raw.data[a+2]!)**2;if(d<best){best=d;idx=i}});converted.dot(x,y,idx);
  }
  for(let i=0;i<p.data.length;i++)if(mask.data[i]!>=0)p.data[i]=converted.data[i]!;
  for(let i=0;i<p.data.length;i++)if(mask.data[i]!<0)assert.equal(p.data[i],master.data[i],'body drift outside motion mask');
  frames.push(p);registration.push({key:k+1,cell:[ox,oy,cw,ch],crown:t,sole:b,headCentre:cx,nativeHeight:64});
 }
 const board=new Pixels(360,88,18);frames.forEach((p,i)=>{board.paste(p,i*72,-40);board.text(['READ','PINCH','LIFT','CROSS','SETTLE'][i]!,i*72+5,80,61)});
 enlarged(h+'review/watson-page-keys.png',board,pal,3);
 const guide=clone(master);guide.paste(mask,0,0);enlarged(h+'guides/page-motion-mask.png',guide,pal,4);
 // 100ms samples: quiet reading, pinch, lift, cross, settle, original neutral.
 const timeline=[...Array(28).fill(0),1,1,2,2,3,3,4,4,0,0,0,0];
 writeFileSync(h+'guides/page-turn.json',JSON.stringify({view:205,loop:1,canvas:[72,120],anchor:[36,113],at:[94,146],registration,maskPolygon:[[20,73],[24,73],[24,71],[48,71],[48,68],[54,71],[58,77],[57,85],[50,87],[23,87],[17,84],[17,77]],keyDurationsMs:[2800,200,200,200,200,400],timeline,stepMs:100,totalMs:4000,bodyOutsideMaskIdentical:true,playback:'Loop 0 is neutral. Trigger loop 1 occasionally; play cels 1–4 at 200ms each, then return to loop 0. Review repeats after a reading hold; production may wait 6–10 seconds.'},null,2)+'\n');
 return {frames,timeline};
}
