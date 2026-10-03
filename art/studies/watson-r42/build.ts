/** Pin Watson's corrected stature before making further poses. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodePng} from 'sci2-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,clone,enlarged} from '../../source/study-tools.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const root='art/studies/watson-r42/',pal:string[]=JSON.parse(readFileSync('art/reference/holmes-master-v2/palette.json','utf8'));
const save=(name:string,p:Pixels)=>writeFileSync(root+name,p.png(pal));
const hash=(p:Pixels)=>createHash('sha256').update(p.png(pal)).digest('hex');
const holmes=loadIndexed('art/reference/holmes-master-v2/master.png',pal),old=loadIndexed('art/studies/baker-street-r13/export/watson-standing.png',pal);
const raw=decodePng(readFileSync(root+'generated/watson.png'));
let l=raw.width,t=raw.height,r=0,b=0;
for(let y=0;y<raw.height;y++)for(let x=0;x<raw.width;x++)if(raw.data[(y*raw.width+x)*4+3]!>=240){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);}
const height=97,sy=height/(b-t+1),sx=sy*1.2,cx=(l+r)/2,watson=new Pixels(72,120);
const rgb=pal.map(h=>[1,3,5].map(n=>parseInt(h.slice(n,n+2),16)));
function nearest(c:number[]){let best=Infinity,k=0;rgb.forEach((p,i)=>{const d=2*(p[0]!-c[0]!)**2+4*(p[1]!-c[1]!)**2+(p[2]!-c[2]!)**2;if(d<best){best=d;k=i}});return k;}
// Preserve the established 72x120 / [36,113] registration and 1.2 display aspect.
for(let y=0;y<120;y++)for(let x=0;x<72;x++){const xx=Math.floor((x+.5-36)/sx+cx),yy=Math.floor((y+.5-113)/sy+b+1);if(xx<0||xx>=raw.width||yy<0||yy>=raw.height)continue;const i=(yy*raw.width+xx)*4;if(raw.data[i+3]!>=240)watson.dot(x,y,nearest(Array.from(raw.data.subarray(i,i+3))));}
function bounds(p:Pixels){let x0=p.width,y0=p.height,x1=0,y1=0;p.data.forEach((v,i)=>{if(v>=0){const x=i%p.width,y=Math.floor(i/p.width);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}});return {box:[x0,y0,x1,y1],height:y1-y0+1,width:x1-x0+1};}
assert.equal(bounds(watson).height,97);assert.equal(bounds(watson).box[3],112);assert.equal(bounds(holmes).height,106);
save('source/watson-master.png',watson);save('export/watson-standing.png',watson);
writeFileSync(root+'palette.json',JSON.stringify(pal,null,2)+'\n');
writeFileSync(root+'source/watson-master.pxo',pixeloramaProject(pal,['Watson corrected neutral'],[[watson]],[],{userData:'97px Watson. Fixed 72x120 canvas and [36,113] anchor. Match this model in future actions; never fit each frame separately.'}));
writeFileSync(root+'native-jobs.json',JSON.stringify([{name:'watson-master',expected:['export/watson-standing.png']}],null,2)+'\n');
const head=new Pixels(26,27);for(let y=0;y<27;y++)for(let x=0;x<26;x++)head.dot(x,y,watson.data[(y+13)*72+x+24]!);save('source/watson-head.png',head);enlarged(root+'review/head.png',head,pal,6);
enlarged(root+'review/watson-master.png',watson,pal,5);
const board=new Pixels(216,137,18);[holmes,old,watson].forEach((p,i)=>{board.paste(p,i*72,0);board.line(i*72+5,113,i*72+66,113,40)});
board.text('HOLMES',9,121,62);board.text('OLD 104',78,121,62);board.text('NEW 97',152,121,62);enlarged(root+'review/lineup.png',board,pal,4);
function actor(scene:Pixels,p:Pixels,x:number,y:number){const s=y/176,w=Math.round(72*s),h=Math.round(120*s),q=new Pixels(w,h);for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)q.dot(xx,yy,p.data[Math.min(119,Math.floor(yy/s))*72+Math.min(71,Math.floor(xx/s))]!);scene.paste(q,x-Math.round(36*s),y-Math.round(113*s));}
const roomSamples=[
 {name:'street',background:'baker-street-r41/export/background.png',foreground:'baker-street-r41/export/foreground.png',feet:[[139,139],[188,139]]},
 {name:'221b',background:'221b-r33/export/room-closed.png',foreground:'221b-r33/export/foreground-desk.png',feet:[[195,176],[248,176]]},
 {name:'workshop',background:'room-planes-r34/export/workshop-closed.png',foreground:'room-planes-r34/export/workshop-desk.png',feet:[[151,174],[213,174]]},
];
for(const room of roomSamples)for(const [label,p]of [['before',old],['after',watson]] as const){const scene=clone(loadIndexed('art/studies/'+room.background,pal));actor(scene,holmes,room.feet[0]![0]!,room.feet[0]![1]!);actor(scene,p,room.feet[1]![0]!,room.feet[1]![1]!);scene.paste(loadIndexed('art/studies/'+room.foreground,pal),0,0);save(`review/${room.name}-${label}-native.png`,scene);enlarged(root+`review/${room.name}-${label}.png`,scene,pal,3);}
const dominant=[...new Set(watson.data)].filter(i=>i>=0).map(i=>({index:i,count:watson.data.filter(v=>v===i).length})).sort((a,b)=>b.count-a.count).map(p=>p.index);
writeFileSync(root+'model.json',JSON.stringify({name:'Watson',view:201,status:'Proportion correction for visual review; production manifest unchanged',canvas:[72,120],anchor:[36,113],pixelAspect:1.2,palette:'palette.json',height:97,sha256:hash(watson),bounds:bounds(watson),previous:bounds(old),holmes:{...bounds(holmes),sha256:hash(holmes),changed:false},sourceBox:[l,t,r,b],sourceScale:[sx,sy],head:{crop:[24,13,26,27],png:'source/watson-head.png',variant:'neutral-three-quarter-right'},dominantPaletteIndices:dominant,rules:['Use this fixed model for future standing and walk poses.','Preserve the shared canvas and anchor. Apply the same room perspective scale to both men.','Do not independently fit individual cels to 97px; bend, stride and bob around this neutral stature.','Portraits and the chair-fitted seated reading animation are separate references and are not resized by this change.'],roomSamples},null,2)+'\n');
writeFileSync(root+'art.json',JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[],views:[{number:201,loops:[{cels:[{png:'export/watson-standing.png',anchor:[36,113]}]},{link:0,mirror:true},{cels:[{png:'export/watson-standing.png',anchor:[36,113]}]},{cels:[{png:'export/watson-standing.png',anchor:[36,113]}]}]}]},null,2)+'\n');
console.log({watson:bounds(watson),previous:bounds(old),holmes:bounds(holmes),sha256:hash(watson)});
