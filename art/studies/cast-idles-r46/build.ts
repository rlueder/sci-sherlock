/** Animate saved whole-pose keys. Never regenerate the drawings during export. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,clone,enlarged,indexedGif} from '../../source/study-tools.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const root=new URL('.',import.meta.url),path=(s:string)=>new URL(s,root).pathname;
const palette=JSON.parse(readFileSync(path('palette.json'),'utf8')) as string[];
const hash=(file:string)=>createHash('sha256').update(readFileSync(path(file))).digest('hex');
const registrations=JSON.parse(readFileSync(path('registration.json'),'utf8')) as {name:string;reference:string;referenceSha256:string;keys:{file:string;sha256:string}[]}[];
const hold=(k:number,n:number)=>Array(n).fill(k) as number[];
const plans:Record<string,{view:number;gesture:string;sequence:number[];arms:number[][][][]}>={
 watson:{view:207,gesture:'Smooth moustache',sequence:[...hold(0,6),1,2,3,...hold(4,3),...hold(5,4),4,4,5,5,5,4,3,2,1,...hold(0,9)],arms:[
  [[[40,36],[47,48],[46,46]]],[[[40,36],[51,47],[47,42]]],[[[40,36],[52,45],[49,35]]],[[[40,36],[53,44],[49,32]]],[[[40,36],[53,43],[48,29]]],[[[40,36],[54,41],[49,27]]]]},
 hudson:{view:208,gesture:'Smooth apron',sequence:[...hold(0,6),1,1,2,2,2,...hold(3,4),2,2,4,4,...hold(0,12)],arms:[
  [[[25,36],[23,50],[37,58]],[[43,36],[46,50],[44,58]]],
  [[[25,36],[22,49],[33,56]],[[43,36],[48,49],[45,56]]],
  [[[25,36],[27,55],[35,65]],[[43,36],[48,55],[48,66]]],
  [[[25,36],[28,56],[36,67]],[[43,36],[49,56],[48,68]]],
  [[[25,36],[22,49],[33,56]],[[43,36],[48,49],[45,56]]]]},
 toby:{view:209,gesture:'Twist cap',sequence:[...hold(0,6),4,1,1,2,2,3,3,2,2,3,3,2,1,4,4,...hold(0,10)],arms:[
  [[[26,37],[24,53],[38,58]],[[42,36],[46,52],[45,58]]],
  [[[26,37],[24,49],[35,52]],[[42,36],[48,49],[46,52]]],
  [[[26,37],[25,50],[37,53]],[[42,36],[48,50],[47,52]]],
  [[[26,37],[25,50],[38,53]],[[42,36],[48,51],[47,54]]],
  [[[26,37],[25,53],[38,58]],[[42,36],[48,53],[46,58]]]]}
};
const mirror=(p:Pixels)=>{const q=new Pixels(72,120);for(let y=0;y<120;y++)for(let x=0;x<72;x++)q.dot(71-x,y,p.data[y*72+x]!);return q;};
const jobs:{name:string;expected:string[]}[]=[],animations:unknown[]=[],views:unknown[]=[],all:Pixels[][]=[];
for(const reg of registrations){
 assert.equal(hash(reg.reference),reg.referenceSha256,'Reference has changed: review registration first');
 const plan=plans[reg.name]!,keys=reg.keys.map(k=>{assert.equal(hash(k.file),k.sha256,'Authored key changed: update registration deliberately');return loadIndexed(path(k.file),palette);});
 const master=keys[0]!,mask=loadIndexed(path('source/'+reg.name+'-mask.png'),palette),fixed=clone(master);
 mask.data.forEach((c,i)=>{if(c>=0)fixed.data[i]=-1;});
 keys.forEach(p=>p.data.forEach((c,i)=>{if(mask.data[i]!<0)assert.equal(c,master.data[i],'Changed a locked model pixel');}));
 const guideSheet=new Pixels(keys.length*72,120,18);
 const guides=keys.map((p,k)=>{const g=clone(p);g.line(27,36,43,36,54);g.line(35,36,35,68,54);g.line(29,68,42,68,54);g.line(29,68,30,110,54);g.line(42,68,45,108,54);
  for(const arm of plan.arms[k]!) {for(let i=0;i<arm.length-1;i++)g.line(arm[i]![0]!,arm[i]![1]!,arm[i+1]![0]!,arm[i+1]![1]!,61);for(const joint of arm)g.oval(joint[0]!,joint[1]!,1,1,55);}
  guideSheet.paste(g,k*72,0);writeFileSync(path('guides/'+reg.name+'-'+k+'.png'),g.png(palette));return g;});
 enlarged(path('review/'+reg.name+'-joints.png'),guideSheet,palette,3);
 const right=plan.sequence.map(k=>keys[k]!),left=right.map(mirror),files:string[][]=[];
 assert.deepEqual(right[0]!.data,master.data);assert.deepEqual(right.at(-1)!.data,master.data);
 for(const [loop,frames] of [right,left].entries())files.push(frames.map((p,i)=>{const file='export/'+reg.name+'-'+loop+'-'+String(i).padStart(2,'0')+'.png';writeFileSync(path(file),p.png(palette));return file;}));
 const changes=plan.sequence.map(k=>{const p=new Pixels(72,120);mask.data.forEach((c,i)=>{if(c>=0)p.data[i]=keys[k]!.data[i]!;});return p;});
 writeFileSync(path('source/'+reg.name+'.pxo'),pixeloramaProject(palette,['Fixed master — linked and locked','Whole-pose arm and garment redraw'],changes.map(p=>[fixed,p]),[{name:plan.gesture,from:1,to:changes.length}],{fps:10,layers:[{locked:true,linkAll:true},{}],currentLayer:1,userData:'72×120 anchor [36,113]. Whole-pose rendered keys; fixed model pixels outside explicit variation mask. See registration.json, prompts.json and guides. No limb rotations or interpolated skeleton mesh.'}));
 jobs.push({name:reg.name,expected:files[0]!});
 indexedGif(path('review/'+reg.name+'.gif'),right.map(p=>{const q=new Pixels(72,120,18);q.paste(p,0,0);return q;}),palette,4,10);
 indexedGif(path('review/'+reg.name+'-joints.gif'),plan.sequence.map(k=>{const q=new Pixels(72,120,18);q.paste(guides[k]!,0,0);return q;}),palette,4,10);
 animations.push({name:reg.name,gesture:plan.gesture,proposedView:plan.view,fps:10,sequence:plan.sequence,seconds:right.length/10,files,arms:plan.arms,reference:reg.reference,referenceSha256:reg.referenceSha256});
 views.push({number:plan.view,loops:files.map(f=>({cels:f.map(png=>({png,anchor:[36,113]}))}))});all.push(right);
}
const length=Math.max(...all.map(a=>a.length)),board=Array.from({length},(_,i)=>{const p=new Pixels(216,120,18);all.forEach((a,n)=>p.paste(a[Math.min(i,a.length-1)]!,n*72,0));return p;});
indexedGif(path('review/idles.gif'),board,palette,4,10);
const room=loadIndexed(path('../environment-r43/export/221b-background-0.png'),palette);
const foreground=loadIndexed(path('../221b-r33/export/foreground-desk.png'),palette);
const roomFrames=Array.from({length:length*3},(_,i)=>{const p=clone(room),active=Math.floor(i/length),frame=i%length;all.forEach((a,n)=>p.paste(a[n===active?Math.min(frame,a.length-1):0]!,[105,215,162][n]!-36,176-113));p.paste(foreground,0,0);return p;});
indexedGif(path('review/room.gif'),roomFrames,palette,3,10);
enlarged(path('review/room.png'),roomFrames[0]!,palette,3);
writeFileSync(path('native-jobs.json'),JSON.stringify(jobs,null,2)+'\n');
writeFileSync(path('animation.json'),JSON.stringify({status:'Review study, not registered in the game',canvas:[72,120],anchor:[36,113],pixelAspect:1.2,loops:{0:'right',1:'left (mirrored)'},playOnce:true,holmesChanged:false,animations},null,2)+'\n');
writeFileSync(path('art.json'),JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[],views},null,2)+'\n');
console.log({nativeFrames:jobs.reduce((s,j)=>s+j.expected.length,0),exportedCels:all.reduce((s,a)=>s+a.length*2,0),fixedPixelsVerified:true,neutralReturnExact:true,holmesChanged:false});
