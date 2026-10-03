/** LOOK is a monocle; the carried magnifying lens remains view 250. */
import assert from 'node:assert/strict';
import{readFileSync,writeFileSync}from'node:fs';
import{createHash}from'node:crypto';
import{decodePng}from'sci2-ts/png';
import{Pixels}from'../../source/pixels.ts';
import{clone,loadIndexed,enlarged}from'../../source/study-tools.ts';
import{pixeloramaProject}from'../../source/pixelorama-project.ts';
const h='art/studies/interface-r45/',pal:string[]=JSON.parse(readFileSync('art/studies/interface-r28/palette.json','utf8'));
const rgb=pal.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16))),raw=decodePng(readFileSync(h+'generated/monocle.png')),jobs:any[]=[];
let l=raw.width,t=raw.height,r=0,b=0;for(let y=0;y<raw.height;y++)for(let x=0;x<raw.width;x++)if(raw.data[(y*raw.width+x)*4+3]!>=220){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
function nearest(at:number){let best=Infinity,k=0;rgb.forEach((v,i)=>{const d=2*(v[0]!-raw.data[at]!)**2+4*(v[1]!-raw.data[at+1]!)**2+(v[2]!-raw.data[at+2]!)**2;if(d<best){best=d;k=i}});return k;}
function object(size:number){const scale=(size-(size===16?2:4))/Math.max(r-l+1,b-t+1),w=Math.round((r-l+1)*scale),hh=Math.round((b-t+1)*scale),p=new Pixels(size,size);for(let y=0;y<hh;y++)for(let x=0;x<w;x++){const sx=Math.floor(l+(x+.5)*(r-l+1)/w),sy=Math.floor(t+(y+.5)*(b-t+1)/hh),at=(sy*raw.width+sx)*4;if(raw.data[at+3]!>=180)p.dot(Math.floor((size-w)/2)+x,Math.floor((size-hh)/2)+y,nearest(at));}return p;}
function crop(p:Pixels,x:number,y:number,w:number,hh:number){const q=new Pixels(w,hh);for(let yy=0;yy<hh;yy++)for(let xx=0;xx<w;xx++)q.dot(xx,yy,p.data[(y+yy)*p.width+x+xx]!);return q;}
function resize(p:Pixels,size:number){const q=new Pixels(size,size);for(let y=0;y<size;y++)for(let x=0;x<size;x++)q.dot(x,y,p.data[Math.floor((y+.5)*p.height/size)*p.width+Math.floor((x+.5)*p.width/size)]!);return q;}
function save(n:string,p:Pixels){writeFileSync(h+'export/'+n+'.png',p.png(pal));}
const cse=loadIndexed('art/studies/interface-r28/export/case-empty.png',pal),lining32=resize(crop(cse,16,28,48,38),32),icons:Record<string,Pixels>={};
for(const size of [32,24,16]){
 const p=object(size);
 // Pale silk reads against both normal and highlighted purple velvet. Retain
 // the existing cord silhouette and use only colours from the shared palette.
 for(let y=Math.ceil(size*.56);y<size;y++)for(let x=0;x<size;x++){const at=y*size+x,c=p.data[at]!;if(c>=0&&c<=48)p.data[at]=c<24?51:58;}
 if(size===16){p.rect(9,9,6,6,-1);const cord:[number,number][]=[[10,8],[11,9],[12,10],[13,12],[12,14],[10,13],[10,11]];for(let k=1;k<cord.length;k++)p.line(...cord[k-1]!,...cord[k]!,58);p.dot(12,13,51);}
 icons['monocle-'+size]=p;save('monocle-'+size,p);
 const frames:Pixels[][]=[[p]],paths=['export/monocle-'+size+'.png'];
 if(size>16){const lining=size===32?lining32:resize(lining32,24);for(const state of ['normal','hover','picked']){const cloth=clone(lining),fore=clone(p);if(state==='hover')for(let i=0;i<cloth.data.length;i++)if(cloth.data[i]===63)cloth.data[i]=64;else if(cloth.data[i]===64)cloth.data[i]=65;
 if(state==='picked'){fore.data.fill(-1);fore.paste(p,0,-1);fore.line(size===32?8:6,size-2,size===32?23:17,size-2,61);}
 const full=clone(cloth);full.paste(fore,0,0);save(`look-${size}-${state}`,full);icons[`look-${size}-${state}`]=full;frames.push([full]);paths.push(`export/look-${size}-${state}.png`);}}
 writeFileSync(h+`source/monocle-${size}.pxo`,pixeloramaProject(pal,['Monocle and velvet states'],frames));jobs.push({name:'monocle-'+size,expected:paths});
}
const cursor=icons['monocle-16']!;save('look-cursor',cursor);
// The optical centre of the 16px ring is the target, not the hanging cord.
const hotspot=[7,5];assert.ok(cursor.data[hotspot[1]!*16+hotspot[0]!]!>=0);
const toolbar=loadIndexed('art/studies/interface-r28/export/toolbar-composite.png',pal);toolbar.paste(icons['look-32-normal']!,58,8);save('toolbar',toolbar);
const withLens=clone(toolbar);withLens.paste(loadIndexed('art/studies/interface-r28/export/object-look-32.png',pal),184,8);save('toolbar-with-lens',withLens);enlarged(h+'review/toolbar.png',withLens,pal,3);
const board=new Pixels(268,93,4);const cells=[icons['look-32-normal']!,icons['look-32-hover']!,icons['look-32-picked']!,loadIndexed('art/studies/interface-r28/export/object-look-32.png',pal),cursor];cells.forEach((p,i)=>board.paste(p,10+i*52,18));['LOOK','HOVER','PICKED','LENS','CURSOR'].forEach((s,i)=>board.text(s,8+i*52,59,62));board.text('MONOCLE / LOOK     LENS / INVENTORY',8,78,58);enlarged(h+'review/comparison.png',board,pal,4);
const room=loadIndexed('art/studies/environment-r43/export/221b-background-0.png',pal);room.paste(withLens,0,0);enlarged(h+'review/scene.png',room,pal,3);
const manifest=JSON.parse(readFileSync('art/art.json','utf8')),bar=structuredClone(manifest.views.find((v:any)=>v.number===266));bar.loops.forEach((loop:any,i:number)=>loop.cels.forEach((c:any,j:number)=>c.png=j===1?`export/look-32-${i?'picked':'normal'}.png`:'../../'+c.png));
writeFileSync(h+'art.json',JSON.stringify({version:1,maxColours:68,palette:'palette.json',pictures:[],views:[{number:262,loops:[{cels:[{png:'export/look-cursor.png',anchor:hotspot}]}]},bar]},null,2)+'\n');
writeFileSync(h+'palette.json',JSON.stringify(pal,null,2)+'\n');writeFileSync(h+'native-jobs.json',JSON.stringify(jobs,null,2)+'\n');
const lens=manifest.views.find((v:any)=>v.number===250);writeFileSync(h+'guides/handoff.json',JSON.stringify({look:{toolbarView:266,cel:1,normalLoop:0,pickedLoop:1,cursorView:262,cursorSize:[16,16],hotspot,object:'brass monocle with silk cord'},states:['normal','hover','picked'],inventory:{view:250,unchanged:true,retainedDefinition:lens},sourceBounds:[l,t,r-l+1,b-t+1],sourceSHA256:createHash('sha256').update(readFileSync(h+'generated/monocle.png')).digest('hex'),note:'Do not repoint view 250 or art/lens/build.ts to the monocle. Both web and in-game LOOK use r45; carried lens retains r28 artwork and existing cursor/glass loops.'},null,2)+'\n');
console.log({sizes:[32,24,16],hotspot,projects:jobs.length,inventoryLensUnchanged:true});
