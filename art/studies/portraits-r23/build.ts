/** Build cels from saved static masters. Never infer mouth positions from a template. */
import assert from 'node:assert/strict';
import{readFileSync,writeFileSync}from'node:fs';
import{createHash}from'node:crypto';
import{Pixels}from'../../source/pixels.ts';
import{loadIndexed,enlarged,indexedGif}from'../../source/study-tools.ts';
import{pixeloramaProject}from'../../source/pixelorama-project.ts';
const h='art/studies/portraits-r23/',pal:string[]=JSON.parse(readFileSync(h+'palette.json','utf8'));
type Mark={view:number;mouthRegion:number[];lipLine:number[][];chin:number[];note:string;parted:number[][];open:number[][];timing:number[]};
const marks:Record<string,Mark>=JSON.parse(readFileSync(h+'landmarks.json','utf8')),models=JSON.parse(readFileSync(h+'models.json','utf8')),names=['holmes','watson','hudson','toby'];
type EyeMark={note:string;regions?:number[][];half?:number[][];closed?:number[][];preserveFrom?:string};
const eyeMarks:Record<string,EyeMark>=JSON.parse(readFileSync(h+'eye-landmarks.json','utf8'));
const eyeChecks:any[]=[];
const frame=loadIndexed(h+'export/frame.png',pal),surround=loadIndexed(h+'export/surround.png',pal),all:Record<string,Pixels[][]>={},jobs:any[]=[],views:any[]=[],checks:any[]=[];
const inside=(x:number,y:number)=>surround.data[(y+18)*72+x+8]===4&&frame.data[(y+18)*72+x+8]===-1;
function clone(p:Pixels){const q=new Pixels(p.width,p.height);q.data.set(p.data);return q}
function flip(p:Pixels){const q=new Pixels(56,64);for(let y=0;y<64;y++)for(let x=0;x<56;x++)q.dot(55-x,y,p.data[y*56+x]!);return q}
function clipped(p:Pixels){const q=clone(p);for(let y=0;y<64;y++)for(let x=0;x<56;x++)if(!inside(x,y))q.data[y*56+x]=-1;return q}
function overlay(p:Pixels,rect:number[]){const out=new Pixels(56,64),[x,y,w,hh]=rect as[number,number,number,number];for(let yy=y;yy<y+hh;yy++)for(let xx=x;xx<x+w;xx++)out.dot(xx,yy,p.data[yy*56+xx]!);return out}
function expand(p:Pixels){const q=new Pixels(72,88);q.paste(p,8,18);return q}
function composite(layers:Pixels[]){const p=new Pixels(72,88);layers.forEach(q=>p.paste(q,0,0));return p}
function display(n:string,f:number,m=0,e=0){const ls=all[n]!;return composite([surround,expand(ls[f]![0]!),expand(ls[f+1]![m]!),expand(ls[f+2]![e]!),frame])}
for(const name of names){const spec=marks[name]!,model=models.models.find((m:any)=>m.name===name),bytes=readFileSync(h+model.master);assert.equal(createHash('sha256').update(bytes).digest('hex'),model.sha256,'Static master changed: create a deliberate new reference revision first');const master=loadIndexed(h+model.master,pal),mouths=[overlay(master,spec.mouthRegion)];
 for(const edits of [spec.parted,spec.open]){const p=overlay(master,spec.mouthRegion);for(const[x,y,c]of edits){assert.ok(x!>=spec.mouthRegion[0]!&&x!<spec.mouthRegion[0]!+spec.mouthRegion[2]!&&y!>=spec.mouthRegion[1]!&&y!<spec.mouthRegion[1]!+spec.mouthRegion[3]!);assert.ok(master.data[y!*56+x!]!>=0);p.dot(x!,y!,c!)}mouths.push(p)}
 const eyes:Pixels[]=[];
 const eyeSpec=eyeMarks[name]!;
 if(name==='toby'){for(let c=0;c<3;c++)eyes.push(loadIndexed(`art/studies/portraits-r22/export/toby-2-${c}.png`,pal))}
 else {const neutral=new Pixels(56,64);for(const rect of eyeSpec.regions!)neutral.paste(overlay(master,rect),0,0);eyes.push(neutral);for(const edits of [eyeSpec.half!,eyeSpec.closed!]){const cel=clone(neutral);for(const[x,y,c]of edits){assert.ok(eyeSpec.regions!.some(([rx,ry,rw,rh])=>x!>=rx!&&x!<rx!+rw!&&y!>=ry!&&y!<ry!+rh!),name+' eyelid edit outside its eye');cel.dot(x!,y!,c!)}eyes.push(cel)}eyeChecks.push({name,regions:eyeSpec.regions,onlyActualEyeRegionsChange:true});}

 const loops:Pixels[][]=[];for(const f of [0,3]){const transform=(p:Pixels)=>clipped(f?flip(p):p);loops.push([transform(master)],mouths.map(transform),eyes.map(transform))}all[name]=loops;
 loops.forEach((cels,l)=>cels.forEach((p,c)=>writeFileSync(h+`export/${name}-${l}-${c}.png`,p.png(pal))));views.push({number:spec.view,loops:loops.map((cs,l)=>({cels:cs.map((_,c)=>({png:`export/${name}-${l}-${c}.png`,anchor:[0,0]}))}))});
 for(const f of [0,3]){const key=name+(f===0?'-right':'-left'),combos=[[0,0],[1,0],[2,0],[0,1],[0,2],[1,1],[2,2]],layers=combos.map(([m,e])=>[surround,expand(loops[f]![0]!),expand(loops[f+1]![m!]!),expand(loops[f+2]![e!]!),frame]);writeFileSync(h+`source/${key}.pxo`,pixeloramaProject(pal,['Ornate surround','LOCKED static master','Character mouth','Eyes','Frame protection'],layers,[{name:'mouth-keys',from:1,to:3},{name:'blink',from:4,to:5}],{fps:7,layers:[{locked:true,linkAll:true},{locked:true,linkAll:true},{},{},{locked:true,linkAll:true}],userData:`Reference: ${model.master}; SHA256 ${model.sha256}. Mouth landmarks: landmarks.json/${name}. ${spec.note}`}));layers.forEach((ps,i)=>writeFileSync(h+`review/${key}-native-${i+1}.png`,composite(ps).png(pal)));jobs.push({name:key,expected:layers.map((_,i)=>`review/${key}-native-${i+1}.png`)});const neutral=display(name,f),base=composite([surround,expand(loops[f]![0]!),frame]);assert.deepEqual(neutral.data,base.data);for(let c=1;c<3;c++){const full=clone(loops[f]![0]!);full.paste(loops[f+1]![c]!,0,0);let changed=0;for(let y=0;y<64;y++)for(let x=0;x<56;x++)if(full.data[y*56+x]!==loops[f]![0]!.data[y*56+x]){changed++;const xx=f?55-x:x;assert.ok(xx>=spec.mouthRegion[0]!&&xx<spec.mouthRegion[0]!+spec.mouthRegion[2]!&&y>=spec.mouthRegion[1]!&&y<spec.mouthRegion[1]!+spec.mouthRegion[3]!)}checks.push({name:key,cel:c,changedPixels:changed,onlyOwnMouthRegionChanges:true})}enlarged(h+`review/${key}.png`,neutral,pal,4);}
 const guide=expand(clipped(master));guide.line(spec.lipLine[0]![0]!+8,spec.lipLine[0]![1]!+18,spec.lipLine[1]![0]!+8,spec.lipLine[1]![1]!+18,57);guide.line(spec.lipLine[1]![0]!+8,spec.lipLine[1]![1]!+18,spec.lipLine[2]![0]!+8,spec.lipLine[2]![1]!+18,57);for(const[x,y]of spec.lipLine)guide.dot(x!+8,y!+18,63);guide.dot(spec.chin[0]!+8,spec.chin[1]!+18,42);enlarged(h+`guides/${name}-landmarks.png`,guide,pal,6);
 const blinkKeys=new Pixels(234,100,18);for(let c=0;c<3;c++)blinkKeys.paste(display(name,0,0,c),c*78,0);['OPEN','HALF','CLOSED'].forEach((s,c)=>blinkKeys.text(s,c*78+10,92,62));enlarged(h+`review/${name}-blink-keys.png`,blinkKeys,pal,3);
 const eyeGuide=expand(clipped(master));if(eyeSpec.regions)for(const[x,y,w,hh]of eyeSpec.regions){eyeGuide.line(x!+8,y!+17,x!+w!+7,y!+17,57);eyeGuide.line(x!+8,y!+18+hh!,x!+w!+7,y!+18+hh!,57)}enlarged(h+`guides/${name}-eye-fit.png`,eyeGuide,pal,6);
 const keys=new Pixels(234,100,18);for(let c=0;c<3;c++)keys.paste(display(name,0,c),c*78,0);['CLOSED','PARTED','OPEN'].forEach((s,c)=>keys.text(s,c*78+10,92,62));enlarged(h+`review/${name}-mouth-keys.png`,keys,pal,3);
 const anim:Pixels[]=[];for(let t=0;t<48;t++){const p=new Pixels(72,88,18);p.paste(display(name,0,spec.timing[t%spec.timing.length]!,t===35?2:t===34||t===36?1:0),0,0);anim.push(p)}indexedGif(h+`review/${name}.gif`,anim,pal,3,15);
}
const statics=new Pixels(312,100,18),facings=new Pixels(312,198,18),animated:Pixels[]=[];names.forEach((n,k)=>{statics.paste(display(n,0),k*78,0);statics.text(n.toUpperCase(),k*78+8,92,62);facings.paste(display(n,0),k*78,0);facings.paste(display(n,3),k*78,108);facings.text(n.toUpperCase(),k*78+8,94,62)});enlarged(h+'review/static-masters.png',statics,pal,3);enlarged(h+'review/facings.png',facings,pal,3);
for(let t=0;t<48;t++){const p=new Pixels(312,100,18);names.forEach((n,k)=>{const q=(t+k*9)%48,e=q===34||q===36?1:q===35?2:0;p.paste(display(n,0,marks[n]!.timing[t%marks[n]!.timing.length]!,e),k*78,0);p.text(n.toUpperCase(),k*78+8,92,62)});animated.push(p)}indexedGif(h+'review/cast.gif',animated,pal,3,15);
writeFileSync(h+'art.json',JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[],views},null,2)+'\n');writeFileSync(h+'native-jobs.json',JSON.stringify(jobs,null,2)+'\n');writeFileSync(h+'checks.json',JSON.stringify({masterHashesVerified:true,neutralReconstructsMaster:true,mouths:checks,eyes:eyeChecks,tobyEyesPreserved:true},null,2)+'\n');console.log({staticMasters:4,views:views.length,nativeProjects:jobs.length,cels:56});
const halfPair=new Pixels(150,88,18);halfPair.paste(display('watson',0,0,1),0,0);halfPair.paste(display('hudson',0,0,1),78,0);enlarged(h+'review/half-blink-correction.png',halfPair,pal,4);
