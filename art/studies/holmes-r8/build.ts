/** Coherent front-body redraws over a locked, linked character reference. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,enlarged,indexedGif,clone} from '../../source/study-tools.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const here=fileURLToPath(new URL('.',import.meta.url)),ref=join(here,'../../reference/holmes-master-v1');
const contract=JSON.parse(readFileSync(join(ref,'contract.json'),'utf8')) as {masterFileSha256:string};
assert.equal(createHash('sha256').update(readFileSync(join(ref,'master.png'))).digest('hex'),contract.masterFileSha256);
const palette=JSON.parse(readFileSync(join(ref,'palette.json'),'utf8')) as string[],master=loadIndexed(join(ref,'master.png'),palette);
const mask=new Pixels(72,120);mask.poly([[38,27],[44,27],[44,11],[63,11],[63,59],[38,59]],0);
// Protect the entire original opaque head/cap/pipe; fingers may touch its silhouette.
for(let y=0;y<28;y++)for(let x=0;x<72;x++)if(master.data[y*72+x]!>=0)mask.dot(x,y,-1);
const fixed=clone(master);mask.data.forEach((c,i)=>{if(c===0)fixed.data[i]=-1;});
writeFileSync(join(here,'source/gesture-mask.png'),mask.png(palette));
const base=loadIndexed(join(ref,'review/workshop-clean.png'),palette),front=loadIndexed(join(here,'../workshop-r5/export/workshop-front.png'),palette),lamp=loadIndexed(join(here,'../../production/workshop-r3/export/lantern-00.png'),palette),clock=loadIndexed(join(here,'../../production/workshop-r3/export/clock-00.png'),palette);
function room(p:Pixels){const r=clone(base);r.paste(lamp,203,80);r.paste(clock,238,14);r.paste(p,108,52);r.paste(front,0,0);return r;}
const plans={
 thinking:{sequence:[0,0,0,0,0,0,1,1,2,2,2,2,3,3,3,3,3,3,2,2,1,1,0,0,0,0],joints:[[[40,31],[47,45],[43,41]],[[40,31],[49,39],[46,30]],[[40,31],[49,37],[43,26]],[[40,31],[49,37],[43,26]]]},
 cap:{sequence:[0,0,0,0,0,0,1,1,2,2,3,3,3,2,2,1,1,0,0,0,0],joints:[[[40,31],[47,45],[43,41]],[[40,31],[51,38],[50,32]],[[40,31],[53,29],[48,16]],[[40,31],[53,29],[48,17]]]},
 watch:{sequence:[0,0,0,0,0,0,1,1,1,2,2,2,3,3,3,3,3,3,3,3,2,2,2,1,1,1,0,0,0,0],joints:[[[40,31],[47,45],[43,41]],[[40,31],[48,48],[43,51]],[[40,31],[49,49],[47,53]],[[40,31],[49,45],[45,39]]]},
};
const loops:{name:string;files:string[];sequence:number[];fps:number;joints:number[][][];unchangedOutsideMask:boolean}[]=[],allFrames:Pixels[][]=[];
const contact=new Pixels(72*4,120*3,18),guideContact=new Pixels(72*4,120*3,18);
for(const [row,[name,plan]]of Object.entries(plans).entries()){
 const keys=Array.from({length:4},(_,key)=>{
  const drawn=key===0?master:loadIndexed(join(here,'source',name+'-registered-'+key+'.png'),palette),change=new Pixels(72,120),p=clone(fixed);
  mask.data.forEach((c,i)=>{if(c===0)change.data[i]=drawn.data[i]!;});
  // Native-pixel prop cleanup: nearest sampling lost the fine source chain.
  // These are watch/chain pixels only; no synthetic anatomy or limb warping.
  if(name==='watch'&&key>=2){const cy=key===2?50:37,chain=key===2?[[39,50],[40,52],[42,53],[43,51]]:[[39,50],[40,52],[42,52],[43,50],[43,39]];for(let n=0;n<chain.length-1;n++)change.line(chain[n]![0]!,chain[n]![1]!,chain[n+1]![0]!,chain[n+1]![1]!,39);change.oval(43,cy,1,1,55);change.dot(43,cy,61);change.dot(44,cy+1,39);}
  p.paste(change,0,0);
  // Remove disconnected sampling flecks, not legitimate connected fingers/chain.
  const seen=new Set<number>(),stack=[80*72+30];while(stack.length){const i=stack.pop()!;if(seen.has(i)||p.data[i]!<0)continue;seen.add(i);const x=i%72,y=Math.floor(i/72);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(x+dx>=0&&x+dx<72&&y+dy>=0&&y+dy<120)stack.push((y+dy)*72+x+dx);}
  mask.data.forEach((c,i)=>{if(c===0&&p.data[i]!>=0&&!seen.has(i)){p.data[i]=-1;change.data[i]=-1;}});
  master.data.forEach((c,i)=>{if(mask.data[i]!==0)assert.equal(p.data[i],c,'Changed a locked reference pixel');});
  if(key===0)assert.deepEqual(p.data,master.data);
  writeFileSync(join(here,'source',name+'-key-'+key+'.png'),p.png(palette));
  contact.paste(p,key*72,row*120);const g=clone(p),j=plan.joints[key]!;
  for(let n=0;n<j.length-1;n++)g.line(j[n]![0]!,j[n]![1]!,j[n+1]![0]!,j[n+1]![1]!,54);
  j.forEach(v=>g.oval(v[0]!,v[1]!,1,1,61));g.line(28,31,34,60,54);g.line(28,31,40,31,54);guideContact.paste(g,key*72,row*120);
  return{p,change};
 });
 const frames=plan.sequence.map(k=>keys[k]!.p),files=frames.map((p,i)=>{const file=name+'-'+String(i).padStart(2,'0')+'.png';writeFileSync(join(here,'export',file),p.png(palette));return file;});
 assert.deepEqual(frames[0]!.data,master.data);assert.deepEqual(frames.at(-1)!.data,master.data);
 writeFileSync(join(here,'source',name+'.pxo'),pixeloramaProject(palette,['FIXED model pixels — linked','Coherent chest and gesture redraw'],plan.sequence.map(k=>[fixed,keys[k]!.change]),[{name,from:1,to:frames.length}],{layers:[{locked:true,linkAll:true},{}],currentLayer:1,userData:'Whole-pose rendered gesture sources registered to one fixed master. Only the reviewed chest/active-arm region varies; head, pipe, stance, far coat silhouette remain exact. No limb rotations or interpolation.'}));
 indexedGif(join(here,'review',name+'.gif'),frames.map(p=>{const q=new Pixels(72,120,18);q.paste(p,0,0);return q;}),palette,4,13);
 indexedGif(join(here,'review',name+'-room.gif'),frames.map(room),palette,2,13);
 loops.push({name,files,sequence:plan.sequence,fps:8,joints:plan.joints,unchangedOutsideMask:true});allFrames.push(frames);
}
enlarged(join(here,'review/keys.png'),contact,palette,3);enlarged(join(here,'review/joints.png'),guideContact,palette,3);
indexedGif(join(here,'review/idles.gif'),Array.from({length:30},(_,i)=>{const p=new Pixels(216,120,18);allFrames.forEach((f,n)=>p.paste(f[Math.min(i,f.length-1)]!,n*72,0));return p;}),palette,3,13);
writeFileSync(join(here,'palette.json'),JSON.stringify(palette,null,2)+'\n');
writeFileSync(join(here,'animation.json'),JSON.stringify({status:'Idle revision for visual review; walking deferred',master:contract.masterFileSha256,canvas:[72,120],anchor:[36,113],fixedRegion:'Every pixel outside source/gesture-mask.png, including all opaque head pixels and every pixel at y>=59',loops},null,2)+'\n');
writeFileSync(join(here,'art.json'),JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[],views:[{number:206,loops:[{cels:Array.from({length:26},(_,i)=>({png:'../../reference/holmes-master-v1/export/puff-'+String(i).padStart(2,'0')+'.png',anchor:[36,113]}))},...loops.map(l=>({cels:l.files.map(file=>({png:'export/'+file,anchor:[36,113]}))}))]}]},null,2)+'\n');
console.log({idleCels:loops.reduce((n,l)=>n+l.files.length,0),unchangedOutsideMask:true,neutralReturnExact:true,walking:'deferred'});
