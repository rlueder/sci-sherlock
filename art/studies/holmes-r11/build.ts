/** Full-body investigation gestures; sparse drawn keys, no limb interpolation. */
import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';import {join} from 'node:path';
import {Pixels} from '../../source/pixels.ts';import {clone,loadIndexed,enlarged,indexedGif} from '../../source/study-tools.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const here=fileURLToPath(new URL('.',import.meta.url)),ref=join(here,'../../reference/holmes-master-v2');
const palette=JSON.parse(readFileSync(join(ref,'palette.json'),'utf8')) as string[],master=loadIndexed(join(ref,'master.png'),palette),contract=JSON.parse(readFileSync(join(ref,'contract.json'),'utf8'));
assert.equal(createHash('sha256').update(readFileSync(join(ref,'master.png'))).digest('hex'),contract.masterFileSha256);
const plan=JSON.parse(readFileSync(join(here,'pose-plan.json'),'utf8')) as {edges:[number,number][];labels:string[];poses:{kneel:number[][][];reach:number[][][]}};
const neutral=plan.poses.reach[0]!;
const joints:Record<string,number[][][]>={
 reach:[neutral,[[36,18],[35,29],[27,32],[22,45],[25,51],[40,30],[49,40],[59,32],[34,62],[30,86],[29,112],[41,84],[43,109]],[[36,18],[35,29],[27,32],[22,45],[25,51],[40,30],[54,36],[67,29],[34,62],[30,86],[29,112],[41,84],[43,109]],[[36,18],[35,29],[27,32],[22,45],[25,51],[40,30],[52,35],[62,29],[34,62],[30,86],[29,112],[41,84],[43,109]]],
 kneel:[neutral,[[46,32],[43,43],[32,43],[25,55],[37,62],[45,46],[49,59],[58,71],[32,76],[19,91],[10,110],[48,82],[50,109]],[[48,57],[44,67],[32,65],[37,77],[48,79],[42,68],[40,85],[50,96],[23,89],[25,110],[8,106],[49,84],[50,110]],[[51,61],[46,72],[32,71],[39,78],[48,82],[43,74],[42,87],[50,96],[23,93],[27,110],[9,106],[50,86],[51,110]]]
};
function guide(j:number[][]){const p=new Pixels(72,120);for(const [a,b]of plan.edges)p.line(...j[a]! as [number,number],...j[b]! as [number,number],a>=8?49:54);for(const v of j)p.oval(v[0]!,v[1]!,1,1,61);return p;}
function head(p:Pixels,neck:[number,number],angle:number,clear:[number,number,number,number]){
 p.rect(...clear,-1);
 // One named model-derived head variant, rotated around the neck in display space.
 const h=new Pixels(72,120);for(let y=0;y<28;y++)for(let x=24;x<50;x++)h.dot(x,y,master.data[y*72+x]!);
 for(let y=0;y<120;y++)for(let x=0;x<72;x++){
  const dx=x-neck[0],dy=(y-neck[1])*1.2;
  const sx=Math.round(35+dx*Math.cos(angle)+dy*Math.sin(angle)),sy=Math.round(28+(-dx*Math.sin(angle)+dy*Math.cos(angle))/1.2);
  if(sx>=0&&sx<72&&sy>=0&&sy<28&&h.data[sy*72+sx]!>=0)p.dot(x,y,h.data[sy*72+sx]!);
 }
}
function pose(name:string,key:number){
 if(!key)return clone(master);
 const p=loadIndexed(join(here,'source',name+'-registered-'+key+'.png'),palette);
 if(name==='reach'){
  // Redrawn whole chest/sleeve, with identical head and planted lower stance.
  for(let y=0;y<28;y++)for(let x=0;x<72;x++)p.dot(x,y,master.data[y*72+x]!);
  for(let y=59;y<120;y++)for(let x=0;x<72;x++)p.dot(x,y,master.data[y*72+x]!);
  p.paste(loadIndexed(join(ref,'source/chain.png'),palette),0,0);
 }else{
  const variants:[number,number,number,[number,number,number,number]][]=[
   [43,43,.22,[36,20,25,23]],[44,67,.30,[39,44,24,23]],[46,72,.40,[40,50,25,23]]
  ];
  const [nx,ny,a,clear]=variants[key-1]!;
  if(key===2)p.rect(50,67,13,5,-1);if(key===3)p.rect(51,72,14,6,-1);
  head(p,[nx,ny],a,clear);
  // Rebuild only the sub-pixel lens rim/handle as an editable native prop.
  const lens=key===1?[65,77]:key===2?[57,99]:[61,96],cx=lens[0]!,cy=lens[1]!;
  p.rect(cx-5,cy-5,11,11,-1);if(key>=2)p.rect(55,cy-5,16,11,-1);
  p.line(key===1?58:50,cy,cx-3,cy,39);p.oval(cx,cy,4,3,39);p.oval(cx,cy,3,2,61);p.oval(cx,cy,2,1,-1);
  // The waistcoat chain is only exposed in the lowering pose.
  if(key===1){p.line(38,64,40,67,48);p.line(40,67,42,65,48);}
 }
 return p;
}
const sequences:Record<string,number[]>={reach:[0,0,0,0,1,1,2,2,2,3,3,3,3,2,1,1,0,0,0,0],kneel:[0,0,0,0,1,1,1,2,2,2,3,3,3,3,3,3,3,3,2,2,1,1,1,0,0,0,0]};
const placements:Record<string,[number,number]>={reach:[187,52],kneel:[180,58]};
const base=loadIndexed(join(here,'../workshop-r9/export/workshop.png'),palette),front=loadIndexed(join(here,'../workshop-r9/export/workshop-front.png'),palette),lamp=loadIndexed(join(here,'../../production/workshop-r3/export/lantern-00.png'),palette),clock=loadIndexed(join(here,'../../production/workshop-r3/export/clock-00.png'),palette);
const keysSheet=new Pixels(288,240,18),guidesSheet=new Pixels(288,240,18),loops=[];
function room(p:Pixels,name:string){const r=clone(base);r.paste(lamp,203,80);r.paste(clock,238,14);r.paste(p,...placements[name]!);r.paste(front,0,0);return r;}
for(const [row,name]of ['reach','kneel'].entries()){
 const keys=Array.from({length:4},(_,key)=>pose(name,key)),files=keys.map((p,k)=>{const f=name+'-'+k+'.png';writeFileSync(join(here,'export',f),p.png(palette));keysSheet.paste(p,k*72,row*120);const g=clone(p);g.paste(guide(joints[name]![k]!),0,0);guidesSheet.paste(g,k*72,row*120);return f;});
 assert.deepEqual(keys[0]!.data,master.data);
 const sequence=sequences[name]!,frames=sequence.map(k=>keys[k]!);
 for(const p of keys){assert.ok(p.data.every(c=>c>=-1&&c<64));for(let y=0;y<120;y++){assert.equal(p.data[y*72],-1,'left clipping');assert.equal(p.data[y*72+71],-1,'right clipping');}}
 writeFileSync(join(here,'source',name+'.pxo'),pixeloramaProject(palette,['Full-body pose','Joint construction — hidden'],keys.map((p,k)=>[p,guide(joints[name]![k]!)]),[{name,from:1,to:4}],{layers:[{}, {visible:false,locked:true}],fps:8,userData:'Four full-body key drawings; native 72×120, anchor36,113. No limb interpolation. Neutral exactly master v2; named model-derived head variants. animation.json holds playback timing.'}));
 indexedGif(join(here,'review',name+'.gif'),frames.map(p=>{const q=new Pixels(72,120,18);q.paste(p,0,0);return q;}),palette,4,13);
 indexedGif(join(here,'review',name+'-room.gif'),frames.map(p=>room(p,name)),palette,2,13);
 enlarged(join(here,'review',name+'-room.png'),room(keys[3]!,name),palette,3);
 loops.push({name,files,sequence,fps:8,placement:placements[name],joints:joints[name],contact:name==='reach'?{key:2,hand:[67,29],world:[254,81]}:{key:3,lens:[61,96],world:[241,154]},notes:name==='reach'?'Contact study; mechanism travel will be synchronized with the clock reveal next.':'Knee reaches floor, near foot planted; coat drapes over bent thighs. Preview reverses drawn keys to stand.'});
}
enlarged(join(here,'review/keys.png'),keysSheet,palette,4);enlarged(join(here,'review/joints.png'),guidesSheet,palette,4);
writeFileSync(join(here,'palette.json'),JSON.stringify(palette,null,2)+'\n');
writeFileSync(join(here,'animation.json'),JSON.stringify({status:'Investigation key-pose study for review, not final production motion',canvas:[72,120],anchor:[36,113],master:contract.masterFileSha256,edges:plan.edges,labels:plan.labels,loops},null,2)+'\n');
writeFileSync(join(here,'art.json'),JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[],views:[{number:204,loops:loops.map(l=>({cels:l.files.map(file=>({png:'export/'+file,anchor:[36,113]}))}))}]},null,2)+'\n');
console.log({keys:8,view:204,neutralExact:true,canvas:[72,120],animation:'drawn keys with holds; review'});
