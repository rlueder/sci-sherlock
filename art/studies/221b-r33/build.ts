/** Deliver layered room art and proofs; runtime registration is a separate handoff. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodePng} from 'sci2-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {clone,loadIndexed,enlarged,indexedGif} from '../../source/study-tools.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
import {fireplace} from './fire.ts';
const h='art/studies/221b-r33/',old='art/studies/221b-r30/';
const pal:string[]=JSON.parse(readFileSync(h+'palette.json','utf8'));
const guide=JSON.parse(readFileSync(h+'guides/perspective.json','utf8'));
const fit=JSON.parse(readFileSync(h+'guides/painted-fit.json','utf8'));
const source=loadIndexed(h+'source/room-native.png',pal);
const dim=loadIndexed(h+'source/depth-lighting-native.png',pal);
const room=clone(source);
const save=(n:string,p:Pixels)=>writeFileSync(h+n,p.png(pal));
const crop=(p:Pixels,x:number,y:number,w:number,hh:number)=>{const q=new Pixels(w,hh);q.paste(p,-x,-y);return q};
const mask=(points:[number,number][])=>{const p=new Pixels(320,200);p.poly(points,0);return p};
const extract=(p:Pixels,m:Pixels)=>{const q=new Pixels(320,200);m.data.forEach((v,i)=>{if(v>=0)q.data[i]=p.data[i]!});return q};
const backMask=mask([[116,24],[238,24],[238,135],[119,135],[119,106],[116,103]]);
// User's lighting correction applies only to distant spaces. Foreground pixels are pinned.
room.paste(extract(dim,backMask),0,0);
for(let i=0;i<room.data.length;i++)if(backMask.data[i]!<0)assert.equal(room.data[i],source.data[i]);
const base=clone(room);base.paste(crop(dim,273,34,42,103),273,34);
const archMask=new Pixels(320,200);archMask.rect(97,2,160,22,0);archMask.rect(97,24,19,114,0);archMask.rect(238,24,19,114,0);
const chairMask=mask([[71,76],[104,76],[114,79],[114,99],[120,106],[119,121],[115,146],[66,146],[61,122],[61,108],[65,104],[69,99]]);
chairMask.data.forEach((v,i)=>{if(v>=0)archMask.data[i]=-1});
const arch=extract(room,archMask);
const deskMask=mask([[0,142],[39,142],[39,149],[95,149],[99,152],[92,173],[92,194],[86,196],[85,199],[0,199]]);
const desk=extract(room,deskMask);
const chair=extract(room,chairMask);
for(const[n,p]of Object.entries({'background':base,'opening':arch,'foreground-desk':desk,'chair':chair,'room-closed':room}))save(`export/${n}.png`,p);
for(const[n,p]of Object.entries({'opening-mask':archMask,'desk-mask':deskMask,'back-lighting-mask':backMask,'chair-mask':chairMask}))save(`guides/${n}.png`,p);
const jobs:{name:string;expected:string[]}[]=[];
function project(n:string,frames:Pixels[],paths:string[],fps=8){writeFileSync(h+`source/${n}.pxo`,pixeloramaProject(pal,[n],frames.map(p=>[p]),frames.length>1?[{name:n,from:1,to:frames.length}]:[],{fps}));jobs.push({name:n,expected:paths})}
for(const[n,p]of Object.entries({'opening':arch,'foreground-desk':desk,'chair':chair}))project(n,[p],[`export/${n}.png`]);
const solid=JSON.parse(readFileSync(h+'guides/door-solid.json','utf8'));
const rgb=pal.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));
const nearest=(a:number,b:number,c:number)=>{let best=Infinity,k=0;rgb.forEach((v,i)=>{const d=2*(v[0]!-a)**2+4*(v[1]!-b)**2+(v[2]!-c)**2;if(d<best){best=d;k=i}});return k};
const doorOrigin=[258,24] as const;
const doors:Pixels[]=solid.frames.map((f:any,k:number)=>{
 const full=new Pixels(320,200);
 if(k===0)full.paste(crop(room,273,34,42,103),273,34);
 else{const raw=decodePng(readFileSync(h+f.file));for(let y=34;y<137;y++)for(let x=273;x<315;x++){const a=(y*320+x)*4;if(raw.data[a+3]!>=128)full.dot(x,y,nearest(raw.data[a]!,raw.data[a+1]!,raw.data[a+2]!))}}
 assert.deepEqual(f.hinge,solid.frames[0].hinge);const p=crop(full,...doorOrigin,64,120);save(`export/door-${k}.png`,p);return p;
});
assert.ok(doors.at(-1)!.data.every(v=>v<0),'full swing clears opening');
const reconstructed=clone(base);reconstructed.paste(doors[0]!,...doorOrigin);assert.deepEqual(reconstructed.data,room.data);
project('door',doors,doors.map((_,i)=>`export/door-${i}.png`));
const closedFull=new Pixels(320,200);closedFull.paste(doors[0]!,...doorOrigin);
writeFileSync(h+'source/room.pxo',pixeloramaProject(pal,['Background and landing','Closed door','Opening occlusion','Chair occlusion','Desk occlusion'],[[base,closedFull,arch,chair,desk]],[],{userData:'Fixed camera horizon 0/fullSize 176. Occlusion layers are exact duplicates; base stays opaque. Front band y160–195. Back room is not walkable.'}));jobs.push({name:'room',expected:['export/room-closed.png']});
const fire=fireplace(room,pal);fire.forEach((p,i)=>save(`export/fire-${i}.png`,p));project('fire',fire,fire.map((_,i)=>`export/fire-${i}.png`));
const lens=loadIndexed(old+'export/mantel-lens.png',pal);save('export/mantel-lens.png',lens);project('lens',[lens],['export/mantel-lens.png']);
const watson=Array.from({length:5},(_,i)=>{const p=loadIndexed(old+`export/watson-page-${i}.png`,pal);save(`export/watson-page-${i}.png`,p);return p});
project('watson-seated',watson,watson.map((_,i)=>`export/watson-page-${i}.png`),5);
copyFileSync(old+'guides/page-turn.json',h+'guides/page-turn.json');
const pageGuide=JSON.parse(readFileSync(h+'guides/page-turn.json','utf8'));pageGuide.at=[93,146];pageGuide.source='../221b-r30';writeFileSync(h+'guides/page-turn.json',JSON.stringify(pageGuide,null,2)+'\n');
// Small independent native-pixel effects. The glass bars are excluded from the window mask.
const fog=Array.from({length:12},(_,k)=>{const p=new Pixels(36,50);for(let y=5;y<45;y++)for(let x=1;x<35;x++){
 if(x>=16&&x<=19||y>=23&&y<=26)continue;
 const v=room.data[(26+y)*320+201+x]!;
 if(![4,7,10,17,18,22,24,25,34,38,43].includes(v))continue;
 const crest=14+Math.round(3*Math.sin((x+k*3)/11));
 if((y===crest||y===crest+1||y===crest+19)&&(x+y+k)%4===0)p.dot(x,y,[10,17,25].includes(v)?25:17);
 }return p});
const lamp=Array.from({length:6},(_,k)=>{const p=crop(room,207,65,8,15);for(let y=0;y<12;y++)for(let x=0;x<8;x++){const v=p.data[y*8+x]!;if([47,50,52,55,61,62,63].includes(v)){if(k===1||k===4)p.dot(x,y,v===63?62:v===62?61:v===61?55:v);if(k===2)p.dot(x,y,v===52?55:v===55?61:v)}}return p});
const steam=Array.from({length:12},(_,k)=>{const p=new Pixels(16,20);for(let n=0;n<3;n++){
 const age=(k+n*4)%12,y=18-Math.round(age*1.3),x=7+Math.round(2*Math.sin((age+n)/2));if(age>9)continue;p.dot(x,y,age<5?34:24);if(age>2)p.dot(x+1,y-1,24);
 }return p});
for(const[n,frames]of Object.entries({fog,lamp,steam})){frames.forEach((p,i)=>save(`export/${n}-${i}.png`,p));project(n,frames,frames.map((_,i)=>`export/${n}-${i}.png`),5)}
const holmes=loadIndexed('art/reference/holmes-master-v2/master.png',pal);
function actor(p:Pixels,x:number,y:number){const s=y/176,w=Math.round(72*s),hh=Math.round(120*s),out=new Pixels(w,hh);for(let yy=0;yy<hh;yy++)for(let xx=0;xx<w;xx++)out.dot(xx,yy,holmes.data[Math.min(119,Math.floor(yy/s))*72+Math.min(71,Math.floor(xx/s))]!);p.paste(out,x-Math.round(36*s),y-Math.round(113*s));}
function compose(k=0,door=0,page=0,person:[number,number]|null=[205,176],seated=true){
 const p=clone(base);p.paste(fog[Math.floor(k/2)%fog.length]!,201,26);p.paste(lamp[Math.floor(k/2)%lamp.length]!,207,65);p.paste(steam[Math.floor(k/2)%steam.length]!,156,55);
 p.paste(doors[door]!,...doorOrigin);p.paste(fire[k%6]!,15,94);p.paste(lens,44,71);
 if(person&&person[1]<138)actor(p,...person);p.paste(arch,0,0);p.paste(chair,0,0);
 if(seated)p.paste(watson[page]!,57,33);
 if(person&&person[1]>=138)actor(p,...person);p.paste(desk,0,0);return p;
}
const sample=compose();save('review/room-cast-native.png',sample);enlarged(h+'review/room-cast.png',sample,pal,3);enlarged(h+'review/room-empty.png',room,pal,3);enlarged(h+'review/door-open.png',compose(2,9),pal,3);
enlarged(h+'review/before-lighting.png',source,pal,3);
const scaleBoard=new Pixels(960,432,18);
guide.scaleChecks.forEach((g:any,i:number)=>{assert.ok(Math.abs(g.heightPixels-106*g.feet[1]/176)<.001);const p=compose(0,0,0,g.feet);p.line(g.feet[0]-4,g.feet[1],g.feet[0]+4,g.feet[1],61);enlarged(h+`review/scale-${i}.png`,p,pal,3);const x=i%3*320,y=Math.floor(i/3)*216;scaleBoard.paste(p,x,y);scaleBoard.text(`${g.plane.toUpperCase()} ${Math.round(g.scale*100)}%`,x+5,y+203,62)});enlarged(h+'review/scale-check.png',scaleBoard,pal,1);
const overlay=clone(room);for(const x of[0,80,160,240,319])overlay.line(160,0,x,199,29);for(const y of[125,138,160,176,195])overlay.line(0,y,319,y,48);guide.walkable.forEach((p:[number,number],i:number)=>overlay.line(...p,...guide.walkable[(i+1)%guide.walkable.length] as[number,number],61));enlarged(h+'guides/painted-overlay.png',overlay,pal,3);
const layerBoard=new Pixels(960,200,18);[arch,chair,desk].forEach((p,i)=>layerBoard.paste(p,i*320,0));enlarged(h+'review/layers.png',layerBoard,pal,1);
const occlusion=new Pixels(640,200,18);occlusion.paste(compose(0,0,0,[232,125]),0,0);occlusion.paste(compose(0,0,0,[232,176]),320,0);enlarged(h+'review/occlusion.png',occlusion,pal,1);
const doorTimeline=[0,0,0,0,1,2,3,4,5,6,7,8,9,9,9,9,9,9,9,9,9,9,9,9,9,9,8,7,6,5,4,3,2,1,0,0,0,0,0,0];
indexedGif(h+'review/scene.gif',pageGuide.timeline.map((cel:number,i:number)=>compose(i,doorTimeline[i]!,cel)),pal,2,10);
indexedGif(h+'review/atmosphere.gif',Array.from({length:24},(_,i)=>compose(i,9,0,null,false)),pal,2,12);
indexedGif(h+'review/constant-scale.gif',Array.from({length:30},(_,i)=>compose(0,0,0,[122+i*5,176])),pal,2,12);
const views=[{number:205,loops:[{cels:[{png:'export/watson-page-0.png',anchor:[36,113]}]},{cels:watson.map((_,i)=>({png:`export/watson-page-${i}.png`,anchor:[36,113]}))}]},{number:222,loops:[{cels:fire.map((_,i)=>({png:`export/fire-${i}.png`,anchor:[20,39]}))}]},{number:223,loops:[{cels:[{png:'export/mantel-lens.png',anchor:[4,3]}]}]},{number:225,loops:[{cels:doors.map((_,i)=>({png:`export/door-${i}.png`,anchor:[57,113]}))}]}];
for(const [n,frames,id] of [['fog',fog,280],['lamp',lamp,281],['steam',steam,282]] as const)views.push({number:id,loops:[{cels:frames.map((_,i)=>({png:`export/${n}-${i}.png`,anchor:[0,0]}))}]});
writeFileSync(h+'art.json',JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[{number:100,layers:[{png:'export/background.png',priority:-1000},{png:'export/opening.png',priority:138},{png:'export/chair.png',priority:146},{png:'export/foreground-desk.png',priority:199}]}],views},null,2)+'\n');
writeFileSync(h+'native-jobs.json',JSON.stringify(jobs,null,2)+'\n');
const hash=(p:Pixels)=>createHash('sha256').update(p.png(pal)).digest('hex');
writeFileSync(h+'guides/handoff.json',JSON.stringify({status:'r33 review candidate; production registration unchanged',canvas:[320,200],pixelAspect:1.2,perspective:{horizon:0,fullSize:176},walkable:guide.walkable,doorArrival:[292,163],hero:[205,176],layers:[{file:'export/opening.png',priority:138},{file:'export/chair.png',priority:146},{file:'export/foreground-desk.png',priority:199}],props:{watson:{view:205,at:[93,146],priority:146,scale:false,masterSha256:hash(watson[0]!),source:'../221b-r30',timing:'guides/page-turn.json'},door:{view:225,at:[315,137],scale:false,closedCel:0,openCel:9,angles:solid.frames.map((f:any)=>f.angle),celDurationMs:120},fire:{view:222,at:[35,133],scale:false,canvas:[40,40],anchor:[20,39],celDurationMs:120},lens:{view:223,at:[48,74],scale:false}},atmosphere:[{name:'fog',view:280,origin:[201,26],anchor:[0,0],canvas:[36,50],cels:12,celDurationMs:240,priority:110},{name:'lamp',view:281,origin:[207,65],anchor:[0,0],canvas:[8,15],cels:6,celDurationMs:240,priority:132},{name:'steam',view:282,origin:[156,55],anchor:[0,0],canvas:[16,20],cels:12,celDurationMs:240,priority:132}],hotspots:{door:[273,34,315,137],watson:[70,79,115,147],fireplace:[4,75,79,139],lens:[43,69,57,79],chemistryBench:[140,59,220,119],window:[201,26,237,76],bookcase:[118,38,144,116]},checks:{foregroundOutsideLightingMaskIdentical:true,closedDoorReconstructsRoom:true,doorClearsOpening:true,seatedMasterMatchesR30:true,sixProjectedScalesPass:true},notes:['Atmosphere IDs 280–282 are study proposals; confirm availability during production registration.','Opening and furniture layers are exact opaque-base duplicates for occlusion.','Back room has no walkable polygon. Back actor is only a scale proof.','Priority-sorted props must be composed behind opening at 138.','Preview constant-scale GIF translates a standing pose; it is not a walk animation.','Measured painting differs from the initial Blender furniture layout; see painted-fit.json.']},null,2)+'\n');
console.log({projects:jobs.length,doorCels:doors.length,fireCels:fire.length,scaleChecks:guide.scaleChecks.length,watsonPinned:hash(watson[0]!)===hash(loadIndexed(old+'export/watson-page-0.png',pal))});
