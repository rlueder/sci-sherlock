/** Explicit authoring step: register whole-pose drawings, then freeze native keys. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodePng} from 'sci2-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,enlarged,clone} from '../../source/study-tools.ts';
const root=new URL('.',import.meta.url),path=(s:string)=>new URL(s,root).pathname;
const palette=JSON.parse(readFileSync(path('../../reference/holmes-master-v2/palette.json'),'utf8')) as string[];
const rgb=palette.map(h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)));
const names=['watson','hudson','toby'] as const;
const refs={watson:'../watson-r42/source/watson-master.png',hudson:'../baker-street-r13/source/hudson-master.png',toby:'../baker-street-r13/source/toby-master.png'};
const bounds=(p:Pixels)=>{let x0=p.width,y0=p.height,x1=0,y1=0;p.data.forEach((c,i)=>{if(c<0)return;const x=i%p.width,y=Math.floor(i/p.width);x0=Math.min(x,x0);x1=Math.max(x,x1);y0=Math.min(y,y0);y1=Math.max(y,y1);});return[x0,y0,x1,y1];};
const registrations:unknown[]=[];
for(const name of names){
 const master=loadIndexed(path(refs[name]),palette),src=decodePng(readFileSync(path('generated/'+name+'.png'))),cells:Pixels[]=[];
 for(let k=0;k<4;k++){
  const w=Math.floor(src.width/4),p=new Pixels(w,src.height);
  for(let y=0;y<src.height;y++)for(let x=0;x<w;x++){
   const i=(y*src.width+k*w+x)*4;if(src.data[i+3]!<240)continue;
   let best=0,dist=Infinity;rgb.forEach((c,n)=>{const d=2*(src.data[i]!-c[0]!)**2+4*(src.data[i+1]!-c[1]!)**2+(src.data[i+2]!-c[2]!)**2;if(d<dist){dist=d;best=n;}});p.dot(x,y,best);
  }cells.push(p);
 }
 const boxes=cells.map(bounds),mb=bounds(master),height=mb[3]!-mb[1]!+1;
 // One scale per character, shared by all four drawings; no per-cel bbox fitting.
 const sy=height/(boxes.reduce((s,b)=>s+b[3]!-b[1]!+1,0)/4),sx=sy*1.2;
 const sheet=new Pixels(name==='watson'?432:360,120,18);sheet.paste(master,0,0);
 const mask=new Pixels(72,120);
 if(name==='watson')mask.rect(42,26,20,34,0);
 else if(name==='hudson')mask.rect(17,42,37,34,0);
 else mask.rect(18,43,37,32,0);
 // Estimate horizontal registration from the unchanged feet, not the moving arm bounds.
 const footCentre=(p:Pixels,start:number)=>{let sum=0,n=0;for(let y=start;y<p.height;y++)for(let x=0;x<p.width;x++)if(p.data[y*p.width+x]!>=0){sum+=x+.5;n++;}return sum/n;};
 const targetCx=footCentre(master,100);
 const keys=[clone(master)];
 for(let k=0;k<4;k++){
  const cell=cells[k]!,box=boxes[k]!,cx=footCentre(cell,Math.round(box[3]!-(113-100)/sy));
  const registered=new Pixels(72,120);
  for(let y=0;y<120;y++)for(let x=0;x<72;x++){
   const u=Math.floor((x+.5-targetCx)/sx+cx),v=Math.floor((y+.5-113)/sy+box[3]!+1);
   if(u>=0&&u<cell.width&&v>=0&&v<cell.height)registered.dot(x,y,cell.data[v*cell.width+u]!);
  }
  writeFileSync(path('source/'+name+'-registered-'+(k+1)+'.png'),registered.png(palette));
  const p=clone(master);mask.data.forEach((c,i)=>{if(c>=0)p.data[i]=registered.data[i+(name==='watson'&&k===3?2:0)]!;});
  keys.push(p);sheet.paste(p,(k+1)*72,0);
 }
 if(name==='watson'){
  const stroke=loadIndexed(path('source/watson-stroke-registered.png'),palette),p=clone(master);
  // Whole rendered arm alignment brings the fingertip to the fixed moustache.
  mask.data.forEach((c,i)=>{if(c>=0)p.data[i]=stroke.data[i+146]??-1;});
  keys.push(p);sheet.paste(p,360,0);
 }
 writeFileSync(path('source/'+name+'-mask.png'),mask.png(palette));
 keys.forEach((p,k)=>writeFileSync(path('source/'+name+'-key-'+k+'.png'),p.png(palette)));
 enlarged(path('review/'+name+'-keys.png'),sheet,palette,4);
 registrations.push({name,reference:refs[name],referenceSha256:createHash('sha256').update(readFileSync(path(refs[name]))).digest('hex'),scale:[sx,sy],sourceBounds:boxes,keys:keys.map((p,k)=>({file:'source/'+name+'-key-'+k+'.png',sha256:createHash('sha256').update(p.png(palette)).digest('hex')}))});
}
writeFileSync(path('palette.json'),JSON.stringify(palette,null,2)+'\n');
writeFileSync(path('registration.json'),JSON.stringify(registrations,null,2)+'\n');
