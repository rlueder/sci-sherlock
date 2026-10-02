/** Whole-frame registration, indexed conversion and timed playback. No limb edits. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {decodePng} from 'sci2-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
import {loadIndexed,enlarged,indexedGif} from '../../source/study-tools.ts';
const here=fileURLToPath(new URL('.',import.meta.url)),root=fileURLToPath(new URL('../../../',import.meta.url));
for(const d of ['export','review','source'])mkdirSync(join(here,d),{recursive:true});
const palette=JSON.parse(readFileSync(join(here,'../holmes-r6/palette.json'),'utf8')) as string[];
const rgb=palette.map(h=>[1,3,5].map(n=>parseInt(h.slice(n,n+2),16)));
const nearest=(r:number,g:number,b:number)=>{let best=Infinity,index=0;rgb.forEach((c,i)=>{const d=2*(c[0]!-r)**2+4*(c[1]!-g)**2+(c[2]!-b)**2;if(d<best){best=d;index=i;}});return index;};
type Box={ox:number;oy:number;w:number;h:number;left:number;right:number;top:number;bottom:number;footX:number};
const registration:Record<string,unknown>={};
function sheet(name:string,cols=2,rows=2){const image=decodePng(readFileSync(join(here,'generated',name+'.png')));
 const boxes:Box[]=Array.from({length:cols*rows},(_,i)=>{const ox=Math.floor(i%cols*image.width/cols),oy=Math.floor(Math.floor(i/cols)*image.height/rows),w=Math.floor((i%cols+1)*image.width/cols)-ox,h=Math.floor((Math.floor(i/cols)+1)*image.height/rows)-oy;let left=w,right=0,top=h,bottom=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(image.data[((oy+y)*image.width+ox+x)*4+3]!>=200){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 let fl=w,fr=0;for(let y=bottom-6;y<=bottom;y++)for(let x=left;x<=right;x++)if(image.data[((oy+y)*image.width+ox+x)*4+3]!>=200){fl=Math.min(fl,x);fr=Math.max(fr,x);}
 return{ox,oy,w,h,left,right,top,bottom,footX:(fl+fr)/2};});
 const scale=106/(boxes[0]!.bottom-boxes[0]!.top+1),walking=name.startsWith('walk-');
 const centres=boxes.map(b=>{const xs:number[]=[];for(let y=Math.round(b.top+(b.bottom-b.top)*.34);y<=b.top+(b.bottom-b.top)*.42;y++){let lo=b.w,hi=0;for(let x=b.left;x<=b.right;x++)if(image.data[((b.oy+y)*image.width+b.ox+x)*4+3]!>=200){lo=Math.min(lo,x);hi=Math.max(hi,x);}xs.push((lo+hi)/2);}return xs.reduce((a,b)=>a+b,0)/xs.length;});
 registration[name]={source:[image.width,image.height],scale,boxes,centres,method:walking?'Uniform scale per sheet. Whole-frame torso registration; no foot locking, limb deformation or per-frame stretch.':'Uniform whole-figure scale for sheet. Whole-frame translation aligns near sole centre to x=29 and baseline to y=113. No body part replacement.'};
 return boxes.map((b,i)=>{const p=new Pixels(72,120);for(let y=0;y<120;y++)for(let x=0;x<72;x++){
 const sx=Math.floor((x+.5-(walking?34:29))/scale+(walking?centres[i]!:b.footX)),sy=walking?Math.floor((y+.5-8-[0,1,0,-1][i%4]!)/scale+b.top):Math.floor((y+.5-114)/scale+b.bottom);if(sx<0||sy<0||sx>=b.w||sy>=b.h)continue;const at=((sy+b.oy)*image.width+sx+b.ox)*4;if(image.data[at+3]!>=200)p.dot(x,y,nearest(image.data[at]!,image.data[at+1]!,image.data[at+2]!));}
 writeFileSync(join(here,'source',name+'-key-'+i+'.png'),p.png(palette));return p;});}
const names=['puff','thinking','cap','watch'];
const sequences:Record<string,number[]>={puff:[0,0,0,0,0,0,0,0,1,1,2,2,2,3,3,3,0,0,0,0],thinking:[0,0,0,0,0,0,1,1,2,2,3,3,3,3,3,3,3,3,2,2,1,1,0,0,0,0],cap:[0,0,0,0,0,0,1,1,2,2,3,3,3,2,2,1,1,0,0,0,0],watch:[0,0,0,0,1,1,2,2,3,3,3,3,3,3,3,3,2,2,1,1,0,0,0,0]};
const base=loadIndexed(join(root,'art/production/workshop-r3/export/workshop.png'),palette),front=loadIndexed(join(root,'art/studies/workshop-r5/export/workshop-front.png'),palette),lamp=loadIndexed(join(root,'art/production/workshop-r3/export/lantern-00.png'),palette),clock=loadIndexed(join(root,'art/production/workshop-r3/export/clock-00.png'),palette);
function room(p:Pixels){const r=new Pixels(320,200);r.paste(base,0,0);r.paste(lamp,203,80);r.paste(clock,238,14);r.paste(p,108,52);r.paste(front,0,0);return r;}
const loops: {name:string;files:string[];sequence:number[];fps:number;notes:string}[]=[];
const idleFrames:Pixels[][]=[];
const contact=new Pixels(72*4,120*4,18);
for(const [row,name] of names.entries()){const keys=sheet(name);keys.forEach((p,i)=>contact.paste(p,i*72,row*120));const sequence=sequences[name]!;const frames=sequence.map(i=>keys[i]!);const files=frames.map((p,i)=>{const file=name+'-'+String(i).padStart(2,'0')+'.png';writeFileSync(join(here,'export',file),p.png(palette));return file;});
writeFileSync(join(here,'source',name+'.pxo'),pixeloramaProject(palette,['complete figure'],frames.map(p=>[p]),[{name,from:1,to:frames.length}]));
idleFrames.push(frames);
indexedGif(join(here,'review',name+'.gif'),frames.map(p=>{const q=new Pixels(72,120,18);q.paste(p,0,0);return q;}),palette,4,13);
indexedGif(join(here,'review',name+'-room.gif'),frames.map(room),palette,2,13);
assert.deepEqual(frames[0]!.data,frames.at(-1)!.data);
loops.push({name,files,sequence,fps:8,notes:name==='watch'?'Inspection loop starts with watch already held low; pocket retrieval remains a separate transition.':'Complete figure key poses with held cels and reverse return; no synthetic limb interpolation.'});}
enlarged(join(here,'review/idle-contact.png'),contact,palette,3);
const gallery=Array.from({length:Math.max(...idleFrames.map(f=>f.length))},(_,i)=>{const p=new Pixels(72*4,120,18);idleFrames.forEach((frames,n)=>p.paste(frames[Math.min(i,frames.length-1)]!,n*72,0));return p;});
indexedGif(join(here,'review/idles.gif'),gallery,palette,3,13);
const walkA=sheet('walk-a'),walkB=sheet('walk-b');
// The fourth drawing on each sheet duplicates the next contact. Keep a six-cel cycle.
const walkFrames=[...walkA.slice(0,3),...walkB.slice(0,3)];
const walkFiles=walkFrames.map((p,i)=>{const file='walk-'+String(i).padStart(2,'0')+'.png';writeFileSync(join(here,'export',file),p.png(palette));return file;});
const walkContact=new Pixels(72*6,120,18);walkFrames.forEach((p,i)=>walkContact.paste(p,i*72,0));enlarged(join(here,'review/walk-contact.png'),walkContact,palette,3);
indexedGif(join(here,'review/walk.gif'),walkFrames.map(p=>{const q=new Pixels(72,120,18);q.paste(p,0,0);return q;}),palette,4,13);
indexedGif(join(here,'review/walk-room.gif'),walkFrames.map(room),palette,2,13);
writeFileSync(join(here,'source/walk.pxo'),pixeloramaProject(palette,['complete figure'],walkFrames.map(p=>[p]),[{name:'walk-east',from:1,to:6}]));
loops.push({name:'walk',files:walkFiles,sequence:[0,1,2,3,4,5],fps:8,notes:'Six-cel study: near contact/support, far swing, far contact/support, near swing. Whole-figure drawings from two guided sheets; travel calibration remains review work.'});
writeFileSync(join(here,'palette.json'),JSON.stringify(palette,null,2)+'\n');
writeFileSync(join(here,'animation.json'),JSON.stringify({status:'Motion study for review, not integrated runtime assets',canvas:[72,120],anchor:[36,113],loops,registration},null,2)+'\n');
writeFileSync(join(here,'art.json'),JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[],views:[{number:206,loops:loops.filter(l=>l.name!=='walk').map(l=>({cels:l.files.map(file=>({png:'export/'+file,anchor:[36,113]}))}))},{number:200,loops:[{cels:[{png:'../holmes-r6/export/neutral.png',anchor:[36,113]},...walkFiles.map(file=>({png:'export/'+file,anchor:[36,113]}))]}]}]},null,2)+'\n');
console.log('Built four complete-figure idle studies; '+loops.reduce((n,l)=>n+l.files.length,0)+' timeline cels.');
