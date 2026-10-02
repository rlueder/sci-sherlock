/** Register complete pose drawings to one pinned model before local cel cleanup. */
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {decodePng} from 'sci2-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,enlarged} from '../../source/study-tools.ts';
const here=fileURLToPath(new URL('.',import.meta.url)),ref=join(here,'../../reference/holmes-master-v1');
const palette=JSON.parse(readFileSync(join(ref,'palette.json'),'utf8')) as string[],master=loadIndexed(join(ref,'master.png'),palette);
const used=[...new Set(Array.from(master.data).filter(c=>c>=0))],rgb=palette.map(h=>[1,3,5].map(n=>parseInt(h.slice(n,n+2),16)));
const nearest=(r:number,g:number,b:number)=>{let best=Infinity,found=0;for(const c of used){const v=rgb[c]!,d=2*(v[0]!-r)**2+4*(v[1]!-g)**2+(v[2]!-b)**2;if(d<best){best=d;found=c;}}return found;};
const contact=new Pixels(72*4,120*3,18),registrations:Record<string,unknown>={};
for(const [row,name]of ['thinking','cap','watch'].entries()){
 const raw=decodePng(readFileSync(join(here,'generated',name+'.png'))),cols=name==='watch'?4:2,rows=name==='watch'?1:2;
 const boxes=Array.from({length:4},(_,i)=>{const ox=Math.floor(i%cols*raw.width/cols),oy=Math.floor(Math.floor(i/cols)*raw.height/rows),w=Math.floor(raw.width/cols),h=Math.floor(raw.height/rows);let l=w,r=0,t=h,b=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=raw.data[((oy+y)*raw.width+ox+x)*4+3]!;if(a>=240){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}}return{ox,oy,w,h,l,r,t,b};});
 const scale=106/(boxes[0]!.b-boxes[0]!.t+1),alignments=[];
 for(const [key,box]of boxes.entries()){
  // Align the immutable cap/face first. Fit translation only; one scale per sheet.
  let capL=box.w,capR=0;for(let y=box.t;y<box.t+12/scale;y++)for(let x=box.l;x<=box.r;x++)if(raw.data[((y+box.oy)*raw.width+x+box.ox)*4+3]!>=240){capL=Math.min(capL,x);capR=Math.max(capR,x);}
  const cx=(capL+capR)/2;
  const sample=(dx:number,dy:number)=>{const p=new Pixels(72,120);for(let y=0;y<120;y++)for(let x=0;x<72;x++){const sx=Math.floor((x+.5-36-dx)/scale+cx),sy=Math.floor((y+.5-7-dy)/scale+box.t);if(sx<0||sy<0||sx>=box.w||sy>=box.h)continue;const at=((sy+box.oy)*raw.width+sx+box.ox)*4;if(raw.data[at+3]!>=240)p.dot(x,y,nearest(raw.data[at]!,raw.data[at+1]!,raw.data[at+2]!));}return p;};
  let score=Infinity,best=sample(0,0),offset=[0,0];for(let dy=-2;dy<=2;dy++)for(let dx=-3;dx<=3;dx++){const p=sample(dx,dy);let d=0;for(let y=8;y<27;y++)for(let x=25;x<45;x++){const a=master.data[y*72+x]!,b=p.data[y*72+x]!;if(a<0||b<0)d+=(a!==b?6:0);else if(a!==b){const aa=rgb[a]!,bb=rgb[b]!;d+=Math.min(5,Math.sqrt(aa.reduce((n,v,k)=>n+(v-bb[k]!)**2,0))/40);}}if(d<score){score=d;best=p;offset=[dx,dy];}}
  writeFileSync(join(here,'source',name+'-registered-'+key+'.png'),best.png(palette));contact.paste(best,key*72,row*120);alignments.push({key,offset,headColourDistance:score,capCentre:cx});
 }
 registrations[name]={scale,boxes,alignments};
}
writeFileSync(join(here,'registration.json'),JSON.stringify(registrations,null,2)+'\n');
enlarged(join(here,'review/registered-contact.png'),contact,palette,3);
