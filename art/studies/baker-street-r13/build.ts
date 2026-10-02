/** 221B reference package: native room layers, cast, and separate prop states. */
import assert from 'node:assert/strict';import {readFileSync,writeFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';import {join} from 'node:path';import {decodePng} from 'sci-ts/png';import {createHash} from 'node:crypto';
import {Pixels} from '../../source/pixels.ts';import {loadIndexed,clone,enlarged,indexedGif} from '../../source/study-tools.ts';import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const here=fileURLToPath(new URL('.',import.meta.url)),palette=JSON.parse(readFileSync(join(here,'palette.json'),'utf8')) as string[];
const room=loadIndexed(join(here,'source/room-native.png'),palette),base=clone(room),front=new Pixels(320,200),foreMask=new Pixels(320,200);
foreMask.poly([[0,128],[16,134],[17,149],[38,149],[59,152],[85,157],[108,166],[94,173],[94,199],[0,199]],0);
foreMask.data.forEach((c,i)=>{if(c===0)front.data[i]=room.data[i]!;});
function save(path:string,p:Pixels){writeFileSync(join(here,path),p.png(palette));}
function crop(p:Pixels,x:number,y:number,w:number,h:number){const q=new Pixels(w,h);q.paste(p,-x,-y);return q;}
save('export/foreground.png',front);
// The closed door is extracted exactly. Its underlying dark landing is independent.
const doorMask=new Pixels(320,200);doorMask.poly([[290,24],[319,17],[319,153],[290,140]],0);
const doorSource=new Pixels(320,200);doorMask.data.forEach((c,i)=>{if(c===0){doorSource.data[i]=room.data[i]!;const x=i%320,y=Math.floor(i/320);base.data[i]=x<294?5:y>138?4:2;}});
save('source/door-mask.png',doorMask);save('source/door-front.png',doorSource);
type V=[number,number,number];type Pose={angle:number;vertices:V[];uv:[number,number][];hinge:V[]};
const projection=JSON.parse(readFileSync(join(here,'guides/door-projection.json'),'utf8')) as {poses:Pose[]};
const cross=(a:V,b:V,p:V)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
const doorFrames=projection.poses.map((pose,index)=>{
 const full=new Pixels(320,200);
 if(!index)full.paste(doorSource,0,0);
 else for(const indices of [[0,1,2],[0,2,3]]){
  const [a,b,c]=indices.map(i=>pose.vertices[i]!) as [V,V,V],verts=[a,b,c],uv=indices.map(i=>pose.uv[i]!),area=cross(a,b,c);
  for(let y=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1])));y<Math.min(200,Math.ceil(Math.max(a[1],b[1],c[1])));y++)
  for(let x=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0])));x<Math.min(320,Math.ceil(Math.max(a[0],b[0],c[0])));x++){
   const p:V=[x+.5,y+.5,0],w=[cross(b,c,p)/area,cross(c,a,p)/area,cross(a,b,p)/area];if(w.some(v=>v<-.000001))continue;
   const iz=w.reduce((n,v,i)=>n+v/verts[i]![2],0),sample=(axis:number)=>w.reduce((n,v,i)=>n+v*uv[i]![axis]!/verts[i]![2],0)/iz;
   const sx=Math.round(sample(0)),sy=Math.round(sample(1));if(sx<0||sx>=320||sy<0||sy>=200)continue;
   let colour=room.data[sy*320+sx]!;
   // Both door faces use the same paneled joinery; the reverse is shaded on the fixed palette.
   if(area<0){const shade:Record<number,number>={15:9,16:15,21:9,23:15,28:16,29:21,31:23,32:29,39:32,41:32,44:39,45:41,48:44,50:45,51:48,55:51,61:55,62:58};colour=shade[colour]??colour;}
   full.dot(x,y,colour);
  }
 }
 const cel=crop(full,220,0,100,160);for(let y=160;y<200;y++)for(let x=0;x<320;x++)assert.equal(full.data[y*320+x],-1,'door below canvas');
 for(let y=0;y<160;y++)for(let x=0;x<220;x++)assert.equal(full.data[y*320+x],-1,'door left clipping');
 save('export/door-'+index+'.png',cel);return cel;
});
const reconstruct=clone(base);reconstruct.paste(doorFrames[0]!,220,0);assert.deepEqual(reconstruct.data,room.data);
save('export/background.png',base);
writeFileSync(join(here,'source/room.pxo'),pixeloramaProject(palette,['Background — landing exposed','Closed door','Foreground occlusion'],[[base,doorSource,front]],[],{layers:[{}, {}, {}],userData:'Native 320×200 room. Door is a separate exact extraction; foreground layer is an occlusion duplicate. No characters, lens or fire are baked into this master.'}));
writeFileSync(join(here,'source/door.pxo'),pixeloramaProject(palette,['Rigid door leaf'],doorFrames.map(p=>[p]),[{name:'open',from:1,to:6}],{fps:8}));
// Four flame keys, kept inside the dark hearth and behind its fixed iron bars.
const fireFrames=Array.from({length:4},(_,k)=>{
 const p=crop(room,138,86,40,42);
 for(const [n,cx]of [11,18,25,31].entries()){
  const b=27+(n%2),h=[12,15,10,13][(n+k)%4]!,dx=[-1,1,0,2][(n+2*k)%4]!;
  p.poly([[cx-4,b],[cx-3,b-5],[cx+dx,b-h],[cx+2,b-7],[cx+4,b]],47);
  p.poly([[cx-2,b],[cx+dx,b-h+4],[cx+2,b-2]],55);
  p.line(cx,b-1,cx+dx,b-6,61);p.dot(cx,b-2,62);
 }
 // Iron uprights and rails sit in front of the flames.
 for(const [x,y,w,h]of [[7,20,2,17],[32,20,2,17],[7,29,27,2],[7,36,27,1]])for(let yy=y!;yy<y!+h!;yy++)for(let xx=x!;xx<x!+w!;xx++)p.dot(xx,yy,room.data[(86+yy)*320+138+xx]!);
 save('export/fire-'+k+'.png',p);return p;
});
writeFileSync(join(here,'source/fire.pxo'),pixeloramaProject(palette,['Hearth and flame keys'],fireFrames.map(p=>[p]),[{name:'fire',from:1,to:4}],{fps:8}));
const lens=new Pixels(12,8);lens.oval(4,3,4,2,39);lens.oval(4,3,3,1,61);lens.rect(2,3,5,1,-1);lens.line(7,4,11,7,39);lens.line(7,3,11,6,48);save('export/mantel-lens.png',lens);
writeFileSync(join(here,'source/lens.pxo'),pixeloramaProject(palette,['Removable mantel lens'],[[lens]]));
// One coherent seated drawing. It remains a named reference pose, not an invented walk.
const raw=decodePng(readFileSync(join(here,'generated/watson-seated.png'))),rgb=palette.map(h=>[1,3,5].map(n=>parseInt(h.slice(n,n+2),16)));
let l=raw.width,r=0,t=raw.height,b=0;for(let y=0;y<raw.height;y++)for(let x=0;x<raw.width;x++)if(raw.data[(y*raw.width+x)*4+3]!>=240){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
const chairFit=JSON.parse(readFileSync(join(here,'guides/chair-fit.json'),'utf8'));
const sy=chairFit.exportHeight/(b-t+1),sx=sy*1.2,seated=new Pixels(72,120);
for(let y=0;y<120;y++)for(let x=0;x<72;x++){const px=Math.floor((x+.5-36)/sx+(l+r)/2),py=Math.floor((y+.5-113)/sy+b+1);if(px<0||px>=raw.width||py<0||py>=raw.height)continue;const at=(py*raw.width+px)*4;if(raw.data[at+3]!<240)continue;let best=Infinity,colour=0;rgb.forEach((v,i)=>{const d=2*(v[0]!-raw.data[at]!)**2+4*(v[1]!-raw.data[at+1]!)**2+(v[2]!-raw.data[at+2]!)**2;if(d<best){best=d;colour=i;}});seated.dot(x,y,colour);}
save('export/watson-seated.png',seated);save('source/watson-seated-master.png',seated);enlarged(join(here,'review/watson-seated.png'),seated,palette,5);
writeFileSync(join(here,'source/watson-seated.pxo'),pixeloramaProject(palette,['Complete seated reading pose'],[[seated]],[],{userData:'Whole-body redraw from pinned Watson neutral. Named downward reading variant; page-turn animation not yet drawn.'}));
const holmes=loadIndexed(join(here,'../../reference/holmes-master-v2/master.png'),palette),hudson=loadIndexed(join(here,'export/hudson-standing.png'),palette),toby=loadIndexed(join(here,'export/toby-standing.png'),palette);
const placements={holmes:[186,176],watson:chairFit.footPosition as [number,number],hudson:[276,172],toby:[241,180],fire:[138,86],lens:[165,65],door:[220,0]};
function mirror(p:Pixels){const q=new Pixels(p.width,p.height);for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++)q.dot(p.width-1-x,y,p.data[y*p.width+x]!);return q;}
function compose(frame:number,cast=true){const p=clone(base);p.paste(doorFrames[frame%6]!,220,0);p.paste(fireFrames[frame%4]!,138,86);p.paste(lens,165,65);
 if(cast){p.paste(seated,placements.watson[0]-36,placements.watson[1]-113);p.paste(mirror(hudson),240,59);p.paste(holmes,150,63);p.paste(mirror(toby),205,67);}p.paste(front,0,0);return p;}
enlarged(join(here,'review/room-cast.png'),compose(0),palette,3);enlarged(join(here,'review/door-open.png'),compose(5,false),palette,3);
const atlas=new Pixels(240,160,18);atlas.paste(doorFrames[0]!,0,0);atlas.paste(doorFrames[5]!,100,0);atlas.paste(fireFrames[0]!,198,90);atlas.paste(lens,206,140);enlarged(join(here,'review/props.png'),atlas,palette,3);
indexedGif(join(here,'review/fire.gif'),Array.from({length:12},(_,i)=>{const p=clone(room);p.paste(fireFrames[i%4]!,138,86);return p;}),palette,2,15);
indexedGif(join(here,'review/door.gif'),[0,0,0,1,2,3,4,5,5,5,5,4,3,2,1,0].map(i=>compose(i,false)),palette,2,15);
writeFileSync(join(here,'art.json'),JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[{number:100,layers:[{png:'export/background.png',priority:-1000},{png:'export/foreground.png',priority:192}]}],views:[
 ...['watson','hudson','toby'].map((n,i)=>({number:201+i,loops:[{cels:[{png:'export/'+n+'-standing.png',anchor:[36,113]}]}]})),
 {number:205,loops:[{cels:[{png:'export/watson-seated.png',anchor:[36,113]}]}]},
 {number:222,loops:[{cels:fireFrames.map((_,i)=>({png:'export/fire-'+i+'.png',anchor:[20,40]}))}]},
 {number:223,loops:[{cels:[{png:'export/mantel-lens.png',anchor:[4,3]}]}]},
 {number:225,loops:[{cels:doorFrames.map((_,i)=>({png:'export/door-'+i+'.png',anchor:[70,145]}))}]}
]},null,2)+'\n');
writeFileSync(join(here,'scene.json'),JSON.stringify({status:'First room/cast reference study; not a production manifest or runtime integration',canvas:[320,200],pixelAspect:1.2,placements,doorAngles:projection.poses.map(p=>p.angle),targets:{window:[8,17,63,77],fire:[138,86,40,42],lens:[165,65,12,8],door:[287,17,33,137],bench:[208,54,62,77],violin:[8,102,42,34],slipper:[184,78,14,26],correspondence:[117,46,17,20]},seated:{sourceBox:[l,t,r,b],scale:[sx,sy],height:chairFit.exportHeight,chairGuide:'guides/chair-fit.json',sha256:createHash('sha256').update(seated.png(palette)).digest('hex')},checks:{closedDoorReconstructsRoom:true,doorHingeDrift:Math.max(...projection.poses.flatMap(p=>p.hinge.flatMap((v,i)=>v.map((n,k)=>Math.abs(n-projection.poses[0]!.hinge[i]![k]!)))))},pending:['Cast visual review','Seated fit and joint trace review','Page-turn keys','Cast turnarounds and arrival walks','Talking portraits','Final hotspot, floor and depth integration']},null,2)+'\n');
console.log({room:[320,200],newCast:3,seatedPose:1,fireKeys:4,doorKeys:6,palette:palette.length,closedDoorExact:true});
