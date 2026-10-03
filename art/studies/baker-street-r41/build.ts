/** Selected right-cab scene; palette-native room, scale proofs and animation overlays. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,clone,enlarged,indexedGif} from '../../source/study-tools.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const root='art/studies/baker-street-r41/',pal:string[]=JSON.parse(readFileSync(root+'palette.json','utf8'));
const room=loadIndexed(root+'source/street-native.png',pal),nod=loadIndexed(root+'source/driver-nod-native.png',pal);
const save=(n:string,p:Pixels)=>writeFileSync(root+n,p.png(pal));
// Reuse the native address lettering, leaving all three fanlight arches visible.
const glyphs:Record<string,string[]>={'2':['110','001','010','100','111'],'1':['010','110','010','010','111'],'B':['110','101','110','101','110']};
room.rect(77,41,19,7,3);for(const [i,ch]of [...'221B'].entries())glyphs[ch]!.forEach((r,y)=>[...r].forEach((v,x)=>{if(v==='1')room.dot(79+i*4+x,42+y,61)}));
const fg=new Pixels(320,200),mask=new Pixels(320,200);mask.poly([[270,30],[287,30],[296,41],[301,48],[310,59],[319,64],[319,199],[228,199],[223,168],[225,151],[232,139],[243,132],[245,61],[257,61],[263,48],[268,43]],0);mask.data.forEach((v,i)=>{if(v>=0)fg.data[i]=room.data[i]!});
save('export/background.png',room);save('export/foreground.png',fg);save('guides/foreground-mask.png',mask);
const jobs:{name:string;expected:string[]}[]=[];
function project(name:string,frames:Pixels[],names?:string[]){writeFileSync(root+`source/${name}.pxo`,pixeloramaProject(pal,[name],frames.map(p=>[p]),[],{fps:6}));jobs.push({name,expected:names??frames.map((_,i)=>`export/${name}-${i}.png`)});}
writeFileSync(root+'source/room.pxo',pixeloramaProject(pal,['Painted room','Cab foreground'],[[room,fg]],[]));jobs.push({name:'room',expected:['export/background.png']});project('foreground',[fg],['export/foreground.png']);
const driverOrigin:[number,number]=[265,28],driverSize:[number,number]=[39,29];
const poseMask=new Pixels(320,200);poseMask.poly([[268,30],[288,30],[296,35],[297,44],[301,48],[301,53],[290,55],[278,51],[267,45],[266,39]],0);
const drivers=[0,1].map(cel=>{const p=new Pixels(...driverSize);for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){const i=(y+driverOrigin[1])*320+x+driverOrigin[0];p.dot(x,y,cel&&poseMask.data[i]!>=0?nod.data[i]!:room.data[i]!);}save(`export/driver-${cel}.png`,p);return p;});project('driver',drivers);
assert.ok(drivers[0]!.data.some((v,i)=>v!==drivers[1]!.data[i]));
// Local amber intensity and tiny flame changes; the housing never shifts.
const lampOrigin:[number,number]=[269,72],lampSize:[number,number]=[36,40];
const rgb=pal.map(h=>[1,3,5].map(n=>parseInt(h.slice(n,n+2),16))),levels=[0,-.16,.10,-.28,.04];
function nearest(c:number[]){let best=Infinity,k=0;rgb.forEach((p,i)=>{const d=2*(p[0]!-c[0]!)**2+4*(p[1]!-c[1]!)**2+(p[2]!-c[2]!)**2;if(d<best){best=d;k=i}});return k;}
const lamps=levels.map((level,cel)=>{const p=new Pixels(...lampSize);for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){const xx=x+lampOrigin[0],yy=y+lampOrigin[1],v=room.data[yy*320+xx]!,c=rgb[v]!,d=((xx-285)/18)**2+((yy-88)/20)**2;
const warm=c[0]!>70&&c[0]!>c[2]!*1.6,fall=Math.max(0,1-d),amount=warm?level*fall:0;
p.dot(x,y,amount?nearest([c[0]!*(1+amount),c[1]!*(1+amount),c[2]!*(1+amount*.7)]):v);}
if(cel){const xx=285+(cel===2?1:0),yy=86+(cel===3?1:0);p.dot(xx-lampOrigin[0],yy-lampOrigin[1],cel===3?55:61);}
save(`export/cab-lamp-${cel}.png`,p);return p;});project('cab-lamp',lamps);
// A palette-native smoke overlay: small curls rise from the stationary pipe bowl.
// No body/pipe pixels are moved. Cel 0 is genuinely transparent.
const smokeOrigin:[number,number]=[288,22],smokeSize:[number,number]=[32,30];
const smokeShapes:number[][][]=[[],
 [[11,25,2,40],[11,24,1,53]],
 [[11,23,2,40],[12,21,2,53],[10,25,1,40]],
 [[12,20,3,40],[14,18,2,53],[11,23,1,40]],
 [[14,17,3,40],[16,14,3,53],[12,20,2,40]],
 [[16,13,4,40],[19,11,3,53],[14,17,2,40]],
 [[19,9,4,40],[22,7,2,53],[17,13,2,40]],
 [[22,5,3,40],[25,3,2,40],[20,9,2,24]],
 [[25,2,2,24],[22,6,1,40],[27,1,1,24]]];
const smokes=smokeShapes.map((shapes,i)=>{const p=new Pixels(...smokeSize);for(const [x,y,r,c]of shapes){p.poly([[x!-r!,y!],[x!-1,y!-r!],[x!+r!-1,y!-r!+1],[x!+r!,y!],[x!+1,y!+r!-1],[x!-r!+1,y!+1]],c!);if(r!>=3)p.dot(x!,y!,24);}save(`export/pipe-smoke-${i}.png`,p);return p;});project('pipe-smoke',smokes);
assert.ok(smokes[0]!.data.every(v=>v===-1));
const smokeSheet=new Pixels(288,30,18);smokes.forEach((p,i)=>smokeSheet.paste(p,i*32,0));enlarged(root+'review/smoke-cels.png',smokeSheet,pal,3);
const smokeOrder=Array.from({length:64},(_,i)=>i>=8&&i<24?1+Math.floor((i-8)/2):i>=48?1+Math.floor((i-48)/2):0);
const lampOrder=[0,0,1,0,2,4,0,0,3,1,4,0,2,0,4,0];
const driverOrder=Array.from({length:64},(_,i)=>i>=42&&i<47?1:0);
const frames=driverOrder.map((d,i)=>{const p=clone(room);p.paste(drivers[d]!,...driverOrigin);p.paste(lamps[lampOrder[i%lampOrder.length]!]!,...lampOrigin);p.paste(smokes[smokeOrder[i]!]!,...smokeOrigin);return p;});
const inRect=(x:number,y:number,o:number[],s:number[])=>x>=o[0]!&&x<o[0]!+s[0]!&&y>=o[1]!&&y<o[1]!+s[1]!;
for(const p of frames)for(let y=0;y<200;y++)for(let x=0;x<320;x++)if(!inRect(x,y,driverOrigin,driverSize)&&!inRect(x,y,lampOrigin,lampSize)&&!inRect(x,y,smokeOrigin,smokeSize))assert.equal(p.data[y*320+x],room.data[y*320+x]);
indexedGif(root+'review/scene.gif',frames,pal,2,16);indexedGif(root+'review/driver.gif',driverOrder.map(i=>drivers[i]!),pal,5,16);indexedGif(root+'review/lantern.gif',lampOrder.map(i=>lamps[i]!),pal,5,16);
const smokeDetail=frames.map(p=>{const q=new Pixels(55,38);for(let y=0;y<38;y++)for(let x=0;x<55;x++)q.dot(x,y,p.data[(y+20)*320+x+265]!);return q;});indexedGif(root+'review/pipe-smoke.gif',smokeDetail,pal,5,16);
const poses=new Pixels(78,29);drivers.forEach((p,i)=>poses.paste(p,i*39,0));enlarged(root+'review/driver-poses.png',poses,pal,6);
const holmes=loadIndexed('art/reference/holmes-master-v2/master.png',pal),watson=loadIndexed('art/studies/baker-street-r13/export/watson-standing.png',pal);
function actor(scene:Pixels,p:Pixels,x:number,y:number){const s=y/176,w=Math.round(72*s),h=Math.round(120*s),o=new Pixels(w,h);for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)o.dot(xx,yy,p.data[Math.min(119,Math.floor(yy/s))*72+Math.min(71,Math.floor(xx/s))]!);scene.paste(o,x-Math.round(36*s),y-Math.round(113*s));}
const cast=clone(room);actor(cast,holmes,139,139);actor(cast,watson,188,139);cast.paste(fg,0,0);enlarged(root+'review/street-cast.png',cast,pal,3);enlarged(root+'review/street-empty.png',room,pal,3);
const band:[number,number][]=[[47,136],[211,136],[211,142],[46,142]],overlay=clone(room);band.forEach((p,i)=>overlay.line(...p,...band[(i+1)%band.length]!,61));enlarged(root+'guides/walkable.png',overlay,pal,3);
const board=new Pixels(960,432,18);[...band,[139,139] as [number,number]].forEach(([x,y],i)=>{const p=clone(room);actor(p,holmes,x,y);p.paste(fg,0,0);board.paste(p,i%3*320,Math.floor(i/3)*216);board.text(`${x},${y} ${Math.round(y/176*100)}%`,i%3*320+4,Math.floor(i/3)*216+203,62)});enlarged(root+'review/scales.png',board,pal,1);
writeFileSync(root+'native-jobs.json',JSON.stringify(jobs,null,2)+'\n');
writeFileSync(root+'art.json',JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[{number:101,layers:[{png:'export/background.png',priority:-1000},{png:'export/foreground.png',priority:199}]}],views:[{number:284,loops:[{cels:drivers.map((_,i)=>({png:`export/driver-${i}.png`,anchor:[0,0]}))}]},{number:285,loops:[{cels:lamps.map((_,i)=>({png:`export/cab-lamp-${i}.png`,anchor:[0,0]}))}]},{number:286,loops:[{cels:smokes.map((_,i)=>({png:`export/pipe-smoke-${i}.png`,anchor:[0,0]}))}]}]},null,2)+'\n');
writeFileSync(root+'guides/handoff.json',JSON.stringify({status:'User selected r35 option A; r41 narrowed-pavement and animation review, not registered',perspective:{horizon:0,fullSize:176},walkable:band,arrival:[85,139],holmes:[139,139],watson:[188,139],door:[71,43,103,117],fanlights:[[15,27,42,42],[71,25,104,42],[184,27,212,42]],foregroundPriority:199,driver:{view:284,origin:driverOrigin,size:driverSize,anchor:[0,0],priority:199,tickMs:160,timeline:driverOrder,loopMs:10240},lamp:{view:285,origin:lampOrigin,size:lampSize,anchor:[0,0],priority:199,tickMs:160,timeline:lampOrder,loopMs:2560},smoke:{view:286,origin:smokeOrigin,size:smokeSize,anchor:[0,0],priority:199,tickMs:160,timeline:smokeOrder,cels:9,compositing:'Transparent overlay after driver and cab foreground; redraw underlying scene each frame to avoid smoke trails.'},notes:['Static fanlight glows; driver, pipe smoke and cab lantern animate.','Driver is a small two-key-pose nod from a rerendered connected head/neck. The torso, hands and cab do not move.','Both animation patches are opaque replacements over the foreground, preventing trails. Draw patches after the foreground layer.','Pixel assertions freeze all pixels outside the driver, lamp and smoke regions.','Narrow footway is measured from the painting; this supersedes room 101 runtime walk coordinates. Confirm traversal and door approach when integrating.','No runtime art registration or scripts changed.','Retained camera formula scales original characters; no character masters are resized.']},null,2)+'\n');
console.log({projects:jobs.length,driverCels:drivers.length,lampCels:lamps.length});
