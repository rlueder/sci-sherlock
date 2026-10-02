/** Register complete drawings with a single scale per sheet, then native cleanup. */
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';import {join} from 'node:path';
import {decodePng} from 'sci2-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,enlarged} from '../../source/study-tools.ts';
const here=fileURLToPath(new URL('.',import.meta.url)),ref=join(here,'../../reference/holmes-master-v2');
const palette=JSON.parse(readFileSync(join(ref,'palette.json'),'utf8')) as string[],master=loadIndexed(join(ref,'master.png'),palette);
const used=[...new Set(Array.from(master.data).filter(c=>c>=0))],rgb=palette.map(h=>[1,3,5].map(n=>parseInt(h.slice(n,n+2),16)));
function nearest(r:number,g:number,b:number){let best=Infinity,found=0;for(const c of used){const v=rgb[c]!,d=2*(v[0]!-r)**2+4*(v[1]!-g)**2+(v[2]!-b)**2;if(d<best){best=d;found=c;}}return found;}
const contact=new Pixels(288,240,18),registrations:Record<string,unknown>={};
for(const [row,name]of ['kneel','reach'].entries()){
 const raw=decodePng(readFileSync(join(here,'generated',name+'.png'))),cw=raw.width/4;
 const boxes=Array.from({length:4},(_,key)=>{const ox=Math.floor(key*cw),w=Math.floor(cw);let l=w,r=0,t=raw.height,b=0;
  for(let y=0;y<raw.height;y++)for(let x=0;x<w;x++)if(raw.data[(y*raw.width+x+ox)*4+3]!>=240){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  return{ox,w,l,r,t,b};});
 const first=boxes[0]!,sy=106/(first.b-first.t+1),sx=sy*1.2;
 // Restoring the 1:1.2 display aspect avoids thin figures after conversion.
 // Baseline is registered for each drawing; there is no per-pose size fitting.
 const capCentre=(box:typeof first)=>{let l=box.w,r=0;for(let y=box.t;y<box.t+10/sy;y++)for(let x=box.l;x<=box.r;x++)if(raw.data[(y*raw.width+x+box.ox)*4+3]!>=240){l=Math.min(l,x);r=Math.max(r,x);}return(l+r)/2;};
 const origin=36-capCentre(first)*sx,alignments=[];
 for(const [key,box]of boxes.entries()){
  const dx=name==='reach'?36-capCentre(box)*sx:origin+(key?4:0),dy=113-(box.b+1)*sy,p=new Pixels(72,120);
  for(let y=0;y<120;y++)for(let x=0;x<72;x++){
   const px=Math.floor((x+.5-dx)/sx),py=Math.floor((y+.5-dy)/sy);
   if(px<0||px>=box.w||py<0||py>=raw.height)continue;
   const at=(py*raw.width+px+box.ox)*4;
   if(raw.data[at+3]!>=240)p.dot(x,y,nearest(raw.data[at]!,raw.data[at+1]!,raw.data[at+2]!));
  }
  writeFileSync(join(here,'source',name+'-registered-'+key+'.png'),p.png(palette));
  contact.paste(p,key*72,row*120);alignments.push({key,dx,dy});
 }
 registrations[name]={sourceSize:[raw.width,raw.height],scale:[sx,sy],boxes,alignments};
}
writeFileSync(join(here,'registration.json'),JSON.stringify(registrations,null,2)+'\n');
enlarged(join(here,'review/registered-contact.png'),contact,palette,4);
