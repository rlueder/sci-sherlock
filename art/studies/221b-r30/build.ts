/** Export the camera-led room and independent props, and prove y-only actor scale. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodePng} from 'sci2-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,clone,enlarged,indexedGif} from '../../source/study-tools.ts';
import {pageTurn} from './page-turn.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const h='art/studies/221b-r30/',pal:string[]=JSON.parse(readFileSync(h+'palette.json','utf8'));
const room=loadIndexed(h+'source/room-native.png',pal),base=clone(room),fit=JSON.parse(readFileSync(h+'guides/painted-fit.json','utf8')),guide=JSON.parse(readFileSync(h+'guides/perspective.json','utf8'));
const save=(name:string,p:Pixels)=>writeFileSync(h+name,p.png(pal));
const crop=(p:Pixels,x:number,y:number,w:number,hh:number)=>{const q=new Pixels(w,hh);q.paste(p,-x,-y);return q};
const jobs:{name:string;expected:string[]}[]=[];
function project(name:string,frames:Pixels[],paths:string[],fps=8){writeFileSync(h+`source/${name}.pxo`,pixeloramaProject(pal,[name],frames.map(p=>[p]),frames.length>1?[{name,from:1,to:frames.length}]:[],{fps}));jobs.push({name,expected:paths})}
// Foreground is an exact occlusion duplicate; furniture remains in the room base.
const mask=new Pixels(320,200);mask.poly([[0,122],[11,122],[20,145],[42,140],[63,144],[64,149],[98,149],[98,154],[94,169],[94,199],[0,199]],0);
const foreground=new Pixels(320,200);mask.data.forEach((v,i)=>{if(v>=0)foreground.data[i]=room.data[i]!});save('export/foreground-desk.png',foreground);project('foreground-desk',[foreground],['export/foreground-desk.png']);
// Only the measured opening uses the generated landing; all other room pixels stay locked.
const landing=loadIndexed(h+'source/landing-native.png',pal);
base.paste(crop(landing,263,36,50,101),263,36);
const closed=new Pixels(320,200);closed.paste(crop(room,263,36,50,101),263,36);
const origin=[256,24] as const;
const solid=JSON.parse(readFileSync(h+'guides/door-solid.json','utf8'));
const colours=pal.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));
const doors:Pixels[]=solid.frames.map((frame:any,k:number)=>{
 const full=new Pixels(320,200);
 if(k===0)full.paste(closed,0,0); // Preserve the exact painted shut state.
 else {
  const raw=decodePng(readFileSync(h+frame.file));assert.equal(raw.width,320);assert.equal(raw.height,200);
  for(let y=36;y<137;y++)for(let x=263;x<313;x++){
   const at=(y*320+x)*4;if(raw.data[at+3]!<128)continue;let best=Infinity,index=0;
   colours.forEach((c,i)=>{const d=2*(c[0]!-raw.data[at]!)**2+4*(c[1]!-raw.data[at+1]!)**2+(c[2]!-raw.data[at+2]!)**2;if(d<best){best=d;index=i}});full.dot(x,y,index);
  }
 }
 assert.deepEqual(frame.hinge,solid.frames[0].hinge,'hinge drift in Blender');
 const p=crop(full,...origin,64,120);save('export/door-'+k+'.png',p);return p;
});
assert.equal(new Set(doors.map(p=>createHash('sha256').update(p.png(pal)).digest('hex'))).size,6,'door cels must be distinct');
const restored=clone(base);restored.paste(doors[0]!,...origin);assert.deepEqual(restored.data,room.data,'closed leaf must reconstruct room exactly');save('export/background.png',base);save('export/room-closed.png',room);
project('door',doors,doors.map((_,i)=>`export/door-${i}.png`));
writeFileSync(h+'source/room.pxo',pixeloramaProject(pal,['Background with exposed landing','Closed leaf','Foreground occlusion'],[[base,closed,foreground]],[],{userData:'Camera: horizon 0 / fullSize 176. Door leaf is a separate exact extraction; foreground is a duplicate for actor occlusion.'}));jobs.push({name:'room',expected:['export/room-closed.png']});
const fire=Array.from({length:4},(_,k)=>{
 const p=crop(room,138,109,40,33);
 for(const [j,cx]of [8,15,23,29].entries()){
  const height=[17,22,19,24][(j+k)%4]!,dx=[-2,0,2,1][(j+2*k)%4]!,y=24;
  p.poly([[cx-4,y],[cx-3,y-5],[cx+dx,y-height],[cx+2,y-6],[cx+4,y]],47);
  p.poly([[cx-2,y],[cx+dx,y-height+4],[cx+2,y-2]],55);p.line(cx,y-1,cx+dx,y-6,61);
 }
 // Keep the original grate and brass uprights in front of every flame.
 for(let y=0;y<33;y++)for(let x=0;x<40;x++)if((y>=14&&y<=16)||(y>=19&&y<=20)||(y>=24&&y<=25)||x<7||x>36)p.dot(x,y,room.data[(109+y)*320+138+x]!);
 save(`export/fire-${k}.png`,p);return p;
});project('fire',fire,fire.map((_,i)=>`export/fire-${i}.png`),6);
const lens=new Pixels(12,8);lens.oval(4,3,4,2,39);lens.oval(4,3,3,1,61);lens.rect(2,3,5,1,-1);lens.line(7,4,11,7,39);lens.line(7,3,11,6,48);save('export/mantel-lens.png',lens);project('lens',[lens],['export/mantel-lens.png']);
// One complete redraw, converted at a fixed seated height; no limb grafts.
const raw=decodePng(readFileSync(h+'generated/watson-seated.png'));let l=raw.width,r=0,t=raw.height,b=0;
for(let y=0;y<raw.height;y++)for(let x=0;x<raw.width;x++)if(raw.data[(y*raw.width+x)*4+3]!>=240){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}
const sy=fit.watson.exportHeight/(b-t+1),sx=sy*1.2,rgb=pal.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16))),watson=new Pixels(72,120);
for(let y=0;y<120;y++)for(let x=0;x<72;x++){
 const px=Math.floor((x+.5-36)/sx+(l+r)/2),py=Math.floor((y+.5-113)/sy+b+1);if(px<0||px>=raw.width||py<0||py>=raw.height)continue;const at=(py*raw.width+px)*4;if(raw.data[at+3]!<240)continue;let d=Infinity,k=0;
 rgb.forEach((c,i)=>{const e=2*(c[0]!-raw.data[at]!)**2+4*(c[1]!-raw.data[at+1]!)**2+(c[2]!-raw.data[at+2]!)**2;if(e<d){d=e;k=i}});watson.dot(x,y,k);
}save('export/watson-seated.png',watson);save('source/watson-master.png',watson);const page=pageTurn(watson,pal);page.frames.forEach((p,i)=>save(`export/watson-page-${i}.png`,p));project('watson-seated',page.frames,page.frames.map((_,i)=>`export/watson-page-${i}.png`),5);
const holmes=loadIndexed('art/reference/holmes-master-v2/master.png',pal);
function actor(p:Pixels,x:number,y:number){const s=y/176,w=Math.round(72*s),hh=Math.round(120*s),out=new Pixels(w,hh);for(let yy=0;yy<hh;yy++)for(let xx=0;xx<w;xx++)out.dot(xx,yy,holmes.data[Math.min(119,Math.floor(yy/s))*72+Math.min(71,Math.floor(xx/s))]!);p.paste(out,x-Math.round(36*s),y-Math.round(113*s));}
function compose(frame=0,cast=true,door=0,watsonCel=0){const p=clone(base);p.paste(doors[door]!,...origin);p.paste(fire[frame%4]!,138,109);p.paste(lens,156,74);if(cast)p.paste(page.frames[watsonCel]!,fit.watson.feet[0]-36,fit.watson.feet[1]-113);return p;}
const sample=compose();actor(sample,200,176);sample.paste(foreground,0,0);enlarged(h+'review/room-cast.png',sample,pal,3);save('review/room-cast-native.png',sample);
const doorBoard=new Pixels(270,290,18);doors.forEach((_,i)=>{const p=clone(base);p.paste(doors[i]!,...origin);doorBoard.paste(crop(p,230,20,90,120),(i%3)*90,Math.floor(i/3)*145);doorBoard.text(String(solid.frames[i].angle)+' DEG',(i%3)*90+6,Math.floor(i/3)*145+125,62)});enlarged(h+'review/door-contact-sheet.png',doorBoard,pal,3);
const open=compose(0,true,5);actor(open,230,176);open.paste(foreground,0,0);enlarged(h+'review/door-open.png',open,pal,3);
const scaleBoard=new Pixels(960,430,18);
guide.scaleChecks.forEach((g:any,i:number)=>{
 assert.ok(Math.abs(g.heightPixels-106*g.feet[1]/176)<.001);
 const p=compose();actor(p,...g.feet as [number,number]);p.paste(foreground,0,0);
 p.line(g.feet[0]-4,g.feet[1],g.feet[0]+4,g.feet[1],61);enlarged(h+`review/scale-${i}.png`,p,pal,3);
 const col=i%3,row=Math.floor(i/3);scaleBoard.paste(p,col*320,row*215);scaleBoard.text(`${g.feet.join(',')} / ${Math.round(g.scale*100)}%`,col*320+8,row*215+203,62);
});enlarged(h+'review/scale-check.png',scaleBoard,pal,1);
const construction=clone(room),vp:[number,number]=[160,0];
for(const x of [0,80,160,240,319])construction.line(...vp,x,199,29);
for(const y of [145,176,195])construction.line(0,y,319,y,48);
fit.walkable.forEach((p:[number,number],i:number)=>construction.line(...p,...fit.walkable[(i+1)%fit.walkable.length] as [number,number],61));
for(const[a,b]of fit.watson.edges){construction.line(...fit.watson.joints[a] as [number,number],...fit.watson.joints[b] as [number,number],55)}
for(const p of Object.values(fit.watson.joints) as [number,number][])construction.rect(p[0]-1,p[1]-1,3,3,62);
construction.line(263,36,313,36,55);construction.line(313,36,313,137,55);construction.line(263,137,313,137,55);construction.line(263,36,263,137,55);
enlarged(h+'guides/painted-overlay.png',construction,pal,3);
const roomAnimation=page.timeline.map((key:number,i:number)=>{const d=[0,0,0,0,0,1,2,3,4,5,5,5,5,5,4,3,2,1,0,0][Math.floor(i/2)]!;const p=compose(Math.floor(i/2),true,d,key);actor(p,200,176);p.paste(foreground,0,0);return p});indexedGif(h+'review/scene.gif',roomAnimation,pal,2,10);
indexedGif(h+'review/watson-page.gif',page.timeline.map((key:number)=>{const p=new Pixels(72,80,18);p.paste(page.frames[key]!,0,-40);return p}),pal,4,10);
indexedGif(h+'review/page-in-room.gif',page.timeline.map((key:number,i:number)=>{const p=compose(Math.floor(i/2),true,0,key);actor(p,200,176);p.paste(foreground,0,0);return p}),pal,2,10);
indexedGif(h+'review/fire.gif',Array.from({length:12},(_,i)=>{const p=compose(i);p.paste(foreground,0,0);return p}),pal,2,18);
const traversal=Array.from({length:29},(_,i)=>{const p=compose();actor(p,125+i*5,176);p.paste(foreground,0,0);return p});indexedGif(h+'review/constant-scale.gif',traversal,pal,2,12);
writeFileSync(h+'native-jobs.json',JSON.stringify(jobs,null,2)+'\n');
writeFileSync(h+'art.json',JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[{number:100,layers:[{png:'export/background.png',priority:-1000},{png:'export/foreground-desk.png',priority:199}]}],views:[{number:205,loops:[{cels:[{png:'export/watson-seated.png',anchor:[36,113]}]},{cels:page.frames.map((_,i)=>({png:`export/watson-page-${i}.png`,anchor:[36,113]}))}]},{number:222,loops:[{cels:fire.map((_,i)=>({png:`export/fire-${i}.png`,anchor:[20,32]}))}]},{number:223,loops:[{cels:[{png:'export/mantel-lens.png',anchor:[4,3]}]}]},{number:225,loops:[{cels:doors.map((_,i)=>({png:`export/door-${i}.png`,anchor:[57,113]}))}]}]},null,2)+'\n');
writeFileSync(h+'guides/handoff.json',JSON.stringify({status:'r30 visual review; no production registration',canvas:[320,200],pixelAspect:1.2,perspective:{horizon:0,fullSize:176},walkable:fit.walkable,doorArrival:fit.arrival,hero:[200,176],props:{fire:{view:222,at:[158,141],scale:false,celDurationMs:180,loop:true},lens:{view:223,at:[160,77],scale:false},door:{view:225,at:[313,137],scale:false,angles:[0,16,32,48,64,80],celDurationMs:120,openMs:600,closedCel:0,openCel:5},watson:{view:205,at:fit.watson.feet,scale:false,notes:'Seated art is already fitted to this chair. Do not apply automatic actor scaling a second time.'}},hotspots:{window:[9,16,64,108],violin:[15,99,58,110],correspondence:[103,47,118,73],slipper:[124,93,134,128],bench:[199,83,257,143],door:[263,36,313,137],watson:[72,81,114,147]},foreground:{priority:199,notes:'Cropped desk feet lie below frame; keep walkable x>=104 beside desk.'},seated:{height:fit.watson.exportHeight,canvas:[72,120],anchor:[36,113],masterSha256:createHash('sha256').update(watson.png(pal)).digest('hex'),pageTurn:{loop:1,cels:5,timing:'guides/page-turn.json',lockedBody:true}},checks:{closedDoorReconstructsPaintExactly:true,fiveProjectedHeightsMatchScaleRule:true,doorHingeFixed:true,doorDistinctCels:6,doorThicknessMetres:solid.thicknessMetres,doorRenderedInBlender:true},preview:{constantScale:'Standing sprite translated at constant y to isolate scaling; not a walking-cycle demonstration.'}},null,2)+'\n');
console.log({native:[320,200],door:doors.length,fire:fire.length,projects:jobs.length,closedDoorExact:true,scaleChecks:5});
