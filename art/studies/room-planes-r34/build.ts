/** Room paint, measured occlusion, camera proofs and editable native delivery. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {Pixels} from '../../source/pixels.ts';
import {clone,loadIndexed,enlarged,indexedGif} from '../../source/study-tools.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
import {setDial} from '../../source/clock-dials.ts';
const root='art/studies/room-planes-r34/';
const pal:string[]=JSON.parse(readFileSync(root+'palette.json','utf8'));
type Point=[number,number];type Layer={name:string;priority:number;points:Point[][]};
const definitions:Record<string,{id:number;hero:Point;layers:Layer[];hotspots:Record<string,number[]>}>={
 street:{id:101,hero:[167,176],layers:[
  {name:'lamp',priority:147,points:[[[98,21],[103,25],[108,31],[109,43],[104,50],[102,52],[102,87],[106,92],[107,119],[112,145],[88,145],[91,122],[94,105],[94,91],[97,87],[97,51],[92,46],[89,34],[93,27]]]},
  {name:'rail',priority:148,points:[[[0,88],[4,88],[4,147],[0,147]],[[9,92],[12,92],[12,147],[9,147]],[[17,91],[20,91],[23,147],[18,147]],[[0,99],[20,99],[20,103],[0,103]],[[69,89],[72,89],[72,142],[69,142]],[[76,91],[80,91],[85,146],[81,146]],[[69,95],[80,95],[80,98],[69,98]]]}],hotspots:{door:[16,43,57,120],cab:[116,43,197,139],horse:[200,65,302,138],lamp:[89,24,111,147]}},
 workshop:{id:102,hero:[168,176],layers:[
  {name:'recess-frame',priority:138,points:[[[88,47],[231,47],[231,54],[88,54]],[[88,54],[97,54],[97,135],[88,135]],[[226,54],[233,54],[233,136],[226,136]]]},
  {name:'bench',priority:136,points:[[[99,96],[227,96],[227,133],[99,133]]]},
  {name:'desk',priority:199,points:[[[0,140],[17,140],[17,145],[78,146],[99,152],[92,164],[92,188],[86,193],[86,199],[0,199]]]}],hotspots:{window:[12,20,67,98],bench:[99,66,226,135],ledger:[30,149,80,175],clock:[238,14,302,154],lantern:[209,80,221,98],scratches:[264,153,280,165],filings:[267,160,299,176]}},
 stair:{id:103,hero:[100,176],layers:[
  {name:'entry-jamb',priority:151,points:[[[51,9],[71,9],[71,145],[54,145]],[[50,0],[313,0],[313,11],[50,11]]]},
  {name:'newel-rail',priority:155,points:[[[157,86],[162,83],[168,87],[168,90],[165,94],[168,154],[157,154]],[[169,88],[288,164],[288,170],[169,96]],[[176,96],[180,99],[180,145],[176,142]],[[191,106],[195,110],[195,152],[191,150]],[[207,117],[211,120],[211,158],[207,156]],[[223,126],[227,130],[227,165],[223,163]],[[239,137],[243,140],[243,170],[239,170]],[[256,148],[260,150],[260,173],[256,173]],[[274,158],[278,160],[278,178],[274,177]]]}],hotspots:{return:[0,17,73,169],stairs:[157,86,299,177],darkness:[173,21,298,149]}}
};
const save=(name:string,p:Pixels)=>writeFileSync(root+name,p.png(pal));
const crop=(p:Pixels,x:number,y:number,w:number,h:number)=>{const out=new Pixels(w,h);out.paste(p,-x,-y);return out};
const jobs:{name:string;expected:string[]}[]=[];
function project(name:string,frames:Pixels[],files:string[],fps=8){writeFileSync(root+`source/${name}.pxo`,pixeloramaProject(pal,[name],frames.map(p=>[p]),frames.length>1?[{name,from:1,to:frames.length}]:[],{fps}));jobs.push({name,expected:files});}
const holmes=loadIndexed('art/reference/holmes-master-v2/master.png',pal);
const watson=loadIndexed('art/studies/baker-street-r13/export/watson-standing.png',pal);
function actor(scene:Pixels,p:Pixels,x:number,y:number){const s=y/176,w=Math.round(p.width*s),h=Math.round(p.height*s),out=new Pixels(w,h);for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)out.dot(xx,yy,p.data[Math.min(p.height-1,Math.floor(yy/s))*p.width+Math.min(p.width-1,Math.floor(xx/s))]!);scene.paste(out,x-Math.round(36*s),y-Math.round(113*s));}
const filings=loadIndexed('art/export/filings-00.png',pal),scratches=loadIndexed('art/export/scratches.png',pal);
for(const [name,p] of [['filings',filings],['scratches',scratches]] as const){save(`export/${name}.png`,p);project(name,[p],[`export/${name}.png`]);}
const clocks=Array.from({length:8},(_,i)=>loadIndexed(root+`export/clock-${i}.png`,pal));
project('clock',clocks,clocks.map((_,i)=>`export/clock-${i}.png`));
const pictures:any[]=[],views:any[]=[{number:221,loops:[{cels:clocks.map((_,i)=>({png:`export/clock-${i}.png`,anchor:[60,150]}))}]}];
views.push({number:227,loops:[{cels:[{png:'export/filings.png',anchor:[16,15]}]}]},{number:228,loops:[{cels:[{png:'export/scratches.png',anchor:[8,11]}]}]});
const handoff:any={status:'Review candidate; no production registration changed',canvas:[320,200],pixelAspect:1.2,perspective:{horizon:0,fullSize:176},rooms:{},notes:['Painted prop bounds are measured separately from Blender blockouts.','Depth comes from overlap, reduced contrast and shallow actor bands.','Scale proofs use the approved side master; the stair does not introduce an unapproved back pose.','The constant-scale previews translate a standing master and are not walk cycles.','Old workshop weather/mouse masks must be refitted before reuse.','Revisit reach timing at the newly measured clock approach before production integration.']};
for(const [kind,def] of Object.entries(definitions)){
 const guide=JSON.parse(readFileSync(root+`guides/${kind}.json`,'utf8'));
 const room=loadIndexed(root+`source/${kind}-native.png`,pal);
 if(kind==='workshop')writeFileSync(root+'guides/wall-dials.json',JSON.stringify([[114,33,5],[161,21,4],[209,28,6]].map(([x,y,r])=>setDial(room,x!,y!,r!)),null,2)+'\n');
 const layers=def.layers.map(layer=>{const mask=new Pixels(320,200),p=new Pixels(320,200);layer.points.forEach(points=>mask.poly(points,0));mask.data.forEach((v,i)=>{if(v>=0)p.data[i]=room.data[i]!});save(`guides/${kind}-${layer.name}-mask.png`,mask);save(`export/${kind}-${layer.name}.png`,p);project(`${kind}-${layer.name}`,[p],[`export/${kind}-${layer.name}.png`]);return{...layer,p}});
 save(`export/${kind}-background.png`,room);
 const closed=clone(room);if(kind==='workshop')closed.paste(clocks[0]!,232,0);
 save(`export/${kind}-closed.png`,closed);
 const fullClock=new Pixels(320,200);if(kind==='workshop')fullClock.paste(clocks[0]!,232,0);
 const pxoLayers=[room,...(kind==='workshop'?[fullClock]:[]),...layers.map(l=>l.p)];
 const flat=clone(room);pxoLayers.slice(1).forEach(p=>flat.paste(p,0,0));assert.deepEqual(flat.data,closed.data,'occlusion must reproduce base exactly');
 writeFileSync(root+`source/${kind}.pxo`,pixeloramaProject(pal,['Background',...(kind==='workshop'?['Clock closed']:[]),...layers.map(l=>l.name)],[pxoLayers],[],{userData:'Shared level camera, horizon 0, fullSize 176. Rear space is not walkable. Masks measured against final painting.'}));jobs.push({name:kind,expected:[`export/${kind}-closed.png`]});
 // Existing native image palette is the only source of flicker colours. No global flashing.
 const boxes=kind==='street'?[[94,33,12,15],[156,77,6,10],[191,77,5,10]]:kind==='workshop'?[[211,83,8,14]]:[];
 const lights=Array.from({length:6},(_,k)=>{const p=new Pixels(320,200);for(const [x,y,w,h] of boxes){const patch=crop(room,x!,y!,w!,h!);patch.data.forEach((c,i)=>{if(k===1||k===4)patch.data[i]=c===63?62:c===62?61:c===61?55:c;if(k===2)patch.data[i]=c===55?61:c===52?55:c});p.paste(patch,x!,y!);}return p});
 if(boxes.length){lights.forEach((p,i)=>save(`export/${kind}-light-${i}.png`,p));project(`${kind}-lights`,lights,lights.map((_,i)=>`export/${kind}-light-${i}.png`),5);views.push({number:kind==='street'?226:220,loops:[{cels:lights.map((_,i)=>({png:`export/${kind}-light-${i}.png`,anchor:[0,0]}))}]});}
 function compose(feet:Point|null=def.hero,cel=0,light=0,companion=false){const p=clone(room);if(boxes.length)p.paste(lights[light%6]!,0,0);if(kind==='workshop'){p.paste(clocks[cel]!,232,0);p.paste(scratches,264,153);p.paste(filings,267,160);}const sorted=[...layers.map(l=>({priority:l.priority,draw:()=>p.paste(l.p,0,0)})),...(feet?[{priority:feet[1],draw:()=>actor(p,holmes,...feet)}]:[]),...(companion?[{priority:174,draw:()=>actor(p,watson,kind==='street'?240:213,174)}]:[])];sorted.sort((a,b)=>a.priority-b.priority).forEach(v=>v.draw());return p;}
 enlarged(root+`review/${kind}-empty.png`,closed,pal,3);enlarged(root+`review/${kind}-cast.png`,compose(def.hero,0,0,kind==='street'),pal,3);
 const scaleBoard=new Pixels(960,432,18);
 guide.scaleChecks.forEach((g:any,i:number)=>{assert.ok(Math.abs(g.heightPixels-106*g.feet[1]/176)<.001);const p=compose(g.feet);p.line(g.feet[0]-4,g.feet[1],g.feet[0]+4,g.feet[1],61);scaleBoard.paste(p,i%3*320,Math.floor(i/3)*216);scaleBoard.text(`${g.plane.toUpperCase()} ${Math.round(g.scale*100)}%`,i%3*320+5,Math.floor(i/3)*216+204,62)});enlarged(root+`review/${kind}-scales.png`,scaleBoard,pal,1);
 const overlay=clone(closed);for(const x of[0,80,160,240,319])overlay.line(160,0,x,199,29);for(const y of[160,176,195])overlay.line(0,y,319,y,48);guide.walkable.forEach((p:Point,i:number)=>overlay.line(...p,...guide.walkable[(i+1)%guide.walkable.length] as Point,61));enlarged(root+`guides/${kind}-overlay.png`,overlay,pal,3);
 const board=new Pixels(320*layers.length,200,18);layers.forEach((l,i)=>board.paste(l.p,i*320,0));enlarged(root+`review/${kind}-layers.png`,board,pal,1);
 if(kind==='workshop'){enlarged(root+'review/workshop-open.png',compose(def.hero,7),pal,3);const seq=[0,0,0,0,1,2,3,4,5,6,7,7,7,7,7,7,7,7,6,5,4,3,2,1,0,0];indexedGif(root+'review/clock.gif',seq.map((c,i)=>compose(def.hero,c,i)),pal,2,15)}
 if(boxes.length)indexedGif(root+`review/${kind}-atmosphere.gif`,Array.from({length:12},(_,i)=>compose(def.hero,0,i,kind==='street')),pal,2,20);
 const start=kind==='stair'?83:kind==='workshop'?127:64,end=kind==='stair'?120:288;
 indexedGif(root+`review/${kind}-constant-scale.gif`,Array.from({length:20},(_,i)=>compose([Math.round(start+(end-start)*i/19),176])),pal,2,12);
 pictures.push({number:def.id,layers:[{png:`export/${kind}-background.png`,priority:-1000},...layers.map(l=>({png:`export/${kind}-${l.name}.png`,priority:l.priority}))]});
 handoff.rooms[def.id]={name:kind,walkable:guide.walkable,arrival:guide.arrival,hero:def.hero,hotspots:def.hotspots,layers:layers.map(({name,priority})=>({file:`export/${kind}-${name}.png`,priority})),scaleChecks:guide.scaleChecks.length,props:kind==='workshop'?{filings:{view:227,at:[283,175],anchor:[16,15],scale:false,priority:155},scratches:{view:228,at:[272,164],anchor:[8,11],scale:false,priority:155},clock:{view:221,at:[292,150],anchor:[60,150],scale:false,closedCel:0,openCel:7,celDurationMs:150},light:{view:220,at:[0,0],anchor:[0,0],priority:130,scale:false,celDurationMs:200}}:kind==='street'?{light:{view:226,at:[0,0],anchor:[0,0],priority:148,scale:false,celDurationMs:200}}:{},approach:kind==='street'?{cab:[193,176],return:[64,174]}:kind==='workshop'?{clock:[252,176],bench:[170,163],window:[113,162],ledger:[112,182]}:{stairs:[120,176],return:[83,176]}};
}
writeFileSync(root+'art.json',JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures,views},null,2)+'\n');
writeFileSync(root+'native-jobs.json',JSON.stringify(jobs,null,2)+'\n');
writeFileSync(root+'guides/handoff.json',JSON.stringify(handoff,null,2)+'\n');
console.log({rooms:pictures.length,projects:jobs.length,views:views.length,scaleChecks:17});
