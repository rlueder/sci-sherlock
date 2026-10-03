import {readFileSync,writeFileSync} from 'node:fs';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
import {root,palette,json,hash,assert,Pixels,loadIndexed,clone,enlarged,indexedGif,cast,frame,surround,clipped,flip,framed,expand,composite,inRect} from './common.ts';
import type {Rect} from './common.ts';
import {mouths,eyes} from './animation.ts';
const models=JSON.parse(readFileSync(root+'models.json','utf8')).models,marks=JSON.parse(readFileSync(root+'landmarks.json','utf8'));
const jobs:any[]=[],views:any[]=[],manifest:any={version:1,status:'Review study; not registered in the game',canvas:[56,64],anchor:[0,0],palette:'palette.json',surround:{png:'export/surround.png',frame:'export/frame.png',size:[72,88],offset:[-8,-18],mirror:false},eyeCels:['open','half','closed','toward','away','down'],mouthCels:['closed','slightly-open','open','wide'],characters:{}},checks:any[]=[];
writeFileSync(root+'export/frame.png',frame.png(palette));writeFileSync(root+'export/surround.png',surround.png(palette));
export const all:Record<string,Pixels[][]>={};
function changedInside(base:Pixels,overlay:Pixels,regions:Rect[],left:boolean,label:string){const p=clone(base);p.paste(overlay,0,0);let changed=0;for(let y=0;y<64;y++)for(let x=0;x<56;x++)if(p.data[y*56+x]!==base.data[y*56+x]){changed++;assert.ok(regions.some(r=>inRect(left?55-x:x,y,r)),`${label}: ${x},${y} outside regions`);}return changed;}
function transform(p:Pixels,left:boolean){return clipped(left?flip(p):p);}
for(const [name,char] of Object.entries(cast)){
 const loops:Pixels[][]=[],nativeFrames:Pixels[][]=[],tags:any[]=[],expected:string[]=[],entries:any[]=[];
 const addNative=(b:Pixels,m:Pixels,e:Pixels)=>{nativeFrames.push([surround,expand(b),expand(m),expand(e),frame]);};
 for(const [i,expression] of char.expressions.entries()){
  const model=models.find((m:any)=>m.name===name&&m.expression===expression),bytes=readFileSync(root+model.master);assert.equal(hash(bytes),model.sha256,`${name}/${expression}: master changed; revise it deliberately, never in an animation build`);
  const master=loadIndexed(root+model.master,palette),mark=marks[name][expression],ms=mouths(name,expression,master,mark),es=eyes(name,expression,master,mark),base=i*6;
  if(i===0)assert.equal(hash(bytes),model.neutralSourceSha256,'Neutral must remain byte-identical to r23');
  for(const left of [false,true]){
   const bust=transform(master,left),mc=ms.map(p=>transform(p,left)),ec=es.map(p=>transform(p,left));loops.push([bust],mc,ec);
   const neutral=clone(bust);neutral.paste(mc[0]!,0,0);neutral.paste(ec[0]!,0,0);assert.deepEqual(neutral.data,bust.data,'Closed mouth + open eyes must reconstruct expression');
   mc.forEach((p,c)=>checks.push({name,expression,left,type:'mouth',cel:c,changed:changedInside(bust,p,[mark.mouthRegion],left,name)}));
   ec.forEach((p,c)=>checks.push({name,expression,left,type:'eyes',cel:c,changed:changedInside(bust,p,mark.eyeRegions,left,name)}));
   const from=nativeFrames.length+1;for(let c=0;c<4;c++)addNative(bust,mc[c]!,ec[0]!);for(let c=1;c<6;c++)addNative(bust,mc[0]!,ec[c]!);
   tags.push({name:`${expression}-${left?'left':'right'}`,from,to:nativeFrames.length});
  }
  entries.push({name:expression,baseLoop:base,right:{bust:base,mouth:base+1,eyes:base+2},left:{bust:base+3,mouth:base+4,eyes:base+5},mouthRegion:mark.mouthRegion,eyeRegions:mark.eyeRegions,leftMouthRegion:[56-mark.mouthRegion[0]-mark.mouthRegion[2],...mark.mouthRegion.slice(1)],leftEyeRegions:mark.eyeRegions.map(([x,y,w,h]:Rect)=>[56-x-w,y,w,h]),master:model.master,sha256:model.sha256});
  const board=new Pixels(78*6,100,18);
  for(let c=0;c<6;c++){const p=clone(master);p.paste(es[c]!,0,0);board.paste(framed(clipped(p)),c*78,0);board.text(manifest.eyeCels[c].toUpperCase(),c*78+6,92,62);}
  enlarged(root+`review/${name}-${expression}-eyes.png`,board,palette,2);
  const mouthBoard=new Pixels(78*4,100,18);for(let c=0;c<4;c++){const p=clone(master);p.paste(ms[c]!,0,0);mouthBoard.paste(framed(clipped(p)),c*78,0);mouthBoard.text(['CLOSED','SLIGHT','OPEN','WIDE'][c]!,c*78+6,92,62);}enlarged(root+`review/${name}-${expression}-mouths.png`,mouthBoard,palette,2);
  const anim:Pixels[]=[];for(let t=0;t<32;t++){const p=clone(master);p.paste(ms[[0,0,1,2,3,1,0,0][t%8]!]!,0,0);p.paste(es[t===24?1:t===25?2:t===26?1:t>27?3:0]!,0,0);const backdrop=new Pixels(72,88,18);backdrop.paste(framed(clipped(p)),0,0);anim.push(backdrop);}indexedGif(root+`review/${name}-${expression}.gif`,anim,palette,2,12);
 }
 all[name]=loops;
 loops.forEach((cs,l)=>cs.forEach((p,c)=>writeFileSync(root+`export/${name}-${l}-${c}.png`,p.png(palette))));
 views.push({number:char.view,loops:loops.map((cs,l)=>({cels:cs.map((_,c)=>({png:`export/${name}-${l}-${c}.png`,anchor:[0,0]}))}))});
 nativeFrames.forEach((ls,i)=>{const path=`review/${name}-native-${String(i+1).padStart(3,'0')}.png`;writeFileSync(root+path,composite(ls).png(palette));expected.push(path);});
 writeFileSync(root+`source/${name}.pxo`,pixeloramaProject(palette,['Gilt surround — fixed','LOCKED expression master','Mouth','Eyes','Frame protection'],nativeFrames,tags,{fps:8,layers:[{locked:true,linkAll:true},{locked:true},{},{},{locked:true,linkAll:true}],userData:`56x64 faces at (8,18) in 72x88 authoring canvas. expressions.json / landmarks.json / models.json. Reference layer locked; changes require intentional revision. Original neutrals pixel-identical.`}));
 jobs.push({name,expected});manifest.characters[name]={view:char.view,expressions:entries};
}
json('expressions.json',manifest);json('art.json',{version:1,maxColours:68,palette:'palette.json',pictures:[],views});json('native-jobs.json',jobs);
json('checks.json',{mastersVerified:22,neutralFilesByteIdentical:4,neutralOverlaysReconstructMaster:true,frameNeverMirrored:true,regions:checks,resources:views.length,cels:views.reduce((n,v)=>n+v.loops.reduce((n:number,l:any)=>n+l.cels.length,0),0),nativeProjects:jobs.length,nativeFrames:jobs.reduce((n,j)=>n+j.expected.length,0)});
console.log({expressions:22,cels:484,projects:jobs.length,nativeFrames:jobs.reduce((n,j)=>n+j.expected.length,0)});
