/** Local perspective repair and independent native-pixel ambient animation layers. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {decodePng} from 'sci-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,clone,enlarged,indexedGif,homography,type Point} from '../../source/study-tools.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const here=fileURLToPath(new URL('.',import.meta.url)),ref=join(here,'../../reference/holmes-master-v1'),r3=join(here,'../../production/workshop-r3/export');
const palette=JSON.parse(readFileSync(join(ref,'palette.json'),'utf8')) as string[],rgb=palette.map(h=>[1,3,5].map(n=>parseInt(h.slice(n,n+2),16)));
const read=(p:string)=>loadIndexed(p,palette),base=read(join(ref,'review/workshop-clean.png')),before=clone(base),front=read(join(here,'../workshop-r5/export/workshop-front.png')),holmes=read(join(here,'../../reference/holmes-master-v2/master.png'));
const pad=(i:number)=>String(i).padStart(2,'0'),save=(n:string,p:Pixels)=>writeFileSync(join(here,'export',n+'.png'),p.png(palette));
const sets:{name:string;files:string[]}[]=[];
function timeline(name:string,frames:Pixels[],layers?:Pixels[][],fps=8){const files=frames.map((p,i)=>{const file=name+'-'+pad(i);save(file,p);return file+'.png';});writeFileSync(join(here,'source',name+'.pxo'),pixeloramaProject(palette,layers?['Fixed housing — linked','Moving element']:['Animation'],layers??frames.map(p=>[p]),[{name,from:1,to:frames.length}],layers?{layers:[{locked:true,linkAll:true},{}],currentLayer:1,fps}:{fps}));sets.push({name,files});}

// Cabinet under the window, not the previously corrected foreground desk.
// A single planar grid shares a vanishing point at [300,72]; verticals stay vertical.
const vp:Point=[300,72],quad:Point[]=[[42,126],[80,72+(126-72)*(300-80)/(300-42)],[80,72+(158-72)*(300-80)/(300-42)],[42,158]];
const project=homography([[0,0],[1,0],[1,1],[0,1]],quad),inverse=homography(quad,[[0,0],[1,0],[1,1],[0,1]]),cabinetMask=new Pixels(320,200),cabinetPatch=new Pixels(320,200);
cabinetMask.poly(quad,0);
const drawerSources:Point[][]=[[[43,127],[59,124],[59,133],[43,136]],[[62,123],[78,119],[78,129],[62,132]],[[43,138],[59,134],[59,145],[43,148]],[[62,134],[78,130],[78,139],[62,143]],[[43,150],[59,147],[59,152],[43,156]],[[62,145],[78,140],[78,146],[62,152]]];
const textureMaps=drawerSources.map(q=>homography([[0,0],[1,0],[1,1],[0,1]],q));
const oldHandles:Point[]=[[51,130],[71,126],[51,140],[71,136],[51,151],[71,145]];
for(let y=116;y<159;y++)for(let x=42;x<=80;x++){if(cabinetMask.data[y*320+x]!==0)continue;const [u,v]=inverse(x+.5,y+.5);const col=Math.min(1,Math.floor(u*2)),row=Math.min(2,Math.floor(v*3)),fu=u*2-col,fv=v*3-row;
 // Reproject each existing drawer's continuous painted wood; remove its old knob
 // locally before placing all six knobs on the new common plane.
 const which=row*2+col,[tx,ty]=textureMaps[which]!(fu,fv),[hx,hy]=oldHandles[which]!;let sx=Math.floor(tx),sy=Math.floor(ty);if(Math.abs(sx-hx)<=2&&Math.abs(sy-hy)<=2)sx-=5;if(sx<48&&sy>=138&&sy<=149)sx=55;let c=before.data[sy*320+sx]!;
 if(fu<.05||fu>.96||fv<.045||fv>.95)c=5;
 else if(fv<.09)c=32;
 cabinetPatch.dot(x,y,c);
}
for(let row=0;row<3;row++)for(let col=0;col<2;col++){const [x,y]=project((col+.5)/2,(row+.5)/3);cabinetPatch.rect(x-1,y,3,2,5);cabinetPatch.dot(x,y-1,61);cabinetPatch.dot(x,y,48);cabinetPatch.dot(x,y+1,9);}
// The chair arm sits in front of the drawer bank; retain those original pixels.
const chair=new Pixels(320,200);chair.poly([[42,139],[47,140],[48,147],[44,150],[42,149]],0);chair.data.forEach((c,i)=>{if(c===0&&cabinetMask.data[i]===0)cabinetPatch.data[i]=before.data[i]!;});
base.paste(cabinetPatch,0,0);save('workshop',base);save('workshop-front',front);save('cabinet-patch',cabinetPatch);save('cabinet-mask',cabinetMask);
let cabinetChanged=0;base.data.forEach((c,i)=>{if(c!==before.data[i]){cabinetChanged++;assert.equal(cabinetMask.data[i],0);}});
writeFileSync(join(here,'source/cabinet.pxo'),pixeloramaProject(palette,['Original room — locked','Corrected drawer plane'],[[before,cabinetPatch]],[],{layers:[{locked:true},{}],currentLayer:1}));
const guides=new Pixels(320,200);for(const v of [0,1/3,2/3,1]){const a=project(0,v),b=project(1,v);guides.line(...a,...vp,54);guides.line(...a,...b,61);}for(const u of [0,.5,1])guides.line(...project(u,0),...project(u,1),61);save('cabinet-guides',guides);
writeFileSync(join(here,'cabinet-perspective.svg'),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><image href="review/room.png" width="320" height="200"/><path d="M0 72H320" stroke="#76a6f5" stroke-width=".4" stroke-dasharray="2 2"/>${[0,1/3,2/3,1].map(v=>{const a=project(0,v);return`<path d="M${a}L${vp}" fill="none" stroke="#e5bc6a" stroke-width=".4"/>`;}).join('')}<circle cx="300" cy="72" r="2" fill="#e5bc6a"/></svg>`);

// Rain is clipped to glass colours inside the window outline, so it passes behind
// mullions, curtain, books and exterior silhouettes. No whole-screen weather overlay.
const windowMask=new Pixels(320,200),windowPoly=new Pixels(320,200);
// Actual glass excludes the blue-lit interior right jamb and sill.
windowPoly.poly([[16,20],[54,29],[57,104],[11,110]],0);
const blues=new Set([25,38,43,46,49,54,56,57,59]);
before.data.forEach((c,i)=>{const x=i%320,y=Math.floor(i/320);const bars=(x>=29&&x<=34)||Math.abs(y-(42+(x-12)*7/44))<2||Math.abs(y-69)<2||Math.abs(y-90)<2;if(windowPoly.data[i]===0&&blues.has(c)&&!bars)windowMask.data[i]=0;});save('window-mask',windowMask);
const rains=Array.from({length:48},(_,f)=>{const p=new Pixels(320,200);for(let n=0;n<17;n++){const y=16+(n*29+f*2)%96,x=13+(n*19)%44;for(let j=0;j<3;j++){const xx=x-Math.floor(j/2),yy=y+j,at=yy*320+xx;if(windowMask.data[at]===0)p.dot(xx,yy,n%4===0?56:49);}}return p;});timeline('rain',rains);
for(const p of rains)p.data.forEach((c,i)=>{if(c>=0){assert.equal(windowMask.data[i],0);assert.ok(i%320<58,'Rain reached interior jamb');}});
// A 64-second palette cycle: clear -> overcast -> clear. Existing palette only.
const skyColours=blues,skyTargets=[17,25,38,43,46,49,54,56,57,59],overcast:Record<number,number>={25:17,38:25,43:38,46:38,49:43,54:49,56:49,57:49,59:49};
const skies=Array.from({length:16},(_,f)=>{const p=new Pixels(320,200),cloud=(1-Math.cos(f/16*Math.PI*2))/2;before.data.forEach((c,i)=>{if(windowMask.data[i]!==0||!skyColours.has(c))return;const v=rgb[c]!,end=rgb[overcast[c]!]!;const target=v.map((v,j)=>v*(1-cloud)+end[j]!*cloud);let best=c,score=Infinity;for(const k of skyTargets){const d=rgb[k]!.reduce((n,v,j)=>n+(v-target[j]!)**2,0);if(d<score){score=d;best=k;}}p.data[i]=best;});return p;});

// Reuse the existing lamp's warm palette; only its light/flame clusters flicker.
const originalLamp=read(join(r3,'lantern-00.png')),lampFixed=clone(originalLamp),lampMask=new Pixels(originalLamp.width,originalLamp.height);
for(let y=7;y<24;y++)for(let x=3;x<20;x++){const i=y*originalLamp.width+x,c=originalLamp.data[i]!;if([47,48,50,51,52,55,58,60,61,62,63].includes(c)){lampMask.data[i]=0;lampFixed.data[i]=-1;}}
const lampKeys=Array.from({length:4},(_,f)=>{const p=clone(originalLamp);p.data.forEach((c,i)=>{if(lampMask.data[i]!==0)return;const y=Math.floor(i/p.width),x=i%p.width;if(f===1&&(x+y)%3===0)p.data[i]=c===63?62:c===62?61:c===61?55:c===55?50:c;else if(f===2&&(x+2*y)%4===0)p.data[i]=c===55?61:c===61?62:c;else if(f===3&&(x+y)%4===0)p.data[i]=c===62?61:c===61?55:c===55?50:c;});return p;});
timeline('lamp',lampKeys,lampKeys.map(p=>{const light=new Pixels(p.width,p.height);p.data.forEach((c,i)=>{if(lampMask.data[i]===0)light.data[i]=c;});return[lampFixed,light];}));
lampKeys.forEach(p=>p.data.forEach((c,i)=>{if(lampMask.data[i]!==0)assert.equal(c,originalLamp.data[i]);}));

// Extract the original pendulum pixels and move them on a rigid arc. The face,
// weights/case and surrounding furniture never move. Pixel aspect enters rotation.
const originalClock=read(join(r3,'clock-00.png')),clockFixed=clone(originalClock),bob=new Pixels(64,140),pivot:Point=[35,57];
const pendulumMask=new Pixels(64,140);pendulumMask.rect(33,57,4,28,0);pendulumMask.rect(28,84,14,17,0);
for(let y=57;y<=100;y++)for(let x=28;x<=41;x++){const i=y*64+x;if(pendulumMask.data[i]!==0)continue;bob.data[i]=originalClock.data[i]!;clockFixed.data[i]=originalClock.data[y*64+27]!;}
const clockFrames:Pixels[]=[],clockLayers:Pixels[][]=[];
for(let f=0;f<24;f++){const angle=Math.sin(f/24*Math.PI*2)*.065,moving=new Pixels(64,140);for(let y=57;y<102;y++)for(let x=24;x<47;x++){const dx=x-pivot[0],dy=(y-pivot[1])*1.2,sx=Math.round(pivot[0]+dx*Math.cos(angle)+dy*Math.sin(angle)),sy=Math.round(pivot[1]+(-dx*Math.sin(angle)+dy*Math.cos(angle))/1.2);if(sx>=0&&sx<64&&sy>=0&&sy<140&&bob.data[sy*64+sx]!>=0)moving.dot(x,y,bob.data[sy*64+sx]!);}
 const p=clone(clockFixed);p.paste(moving,0,0);clockFrames.push(p);clockLayers.push([clockFixed,moving]);for(let i=0;i<64*57;i++)assert.equal(p.data[i],originalClock.data[i],'Clock face or case moved');}
timeline('pendulum',clockFrames,clockLayers,12);

// Convert four generated complete mouse poses to a very small 20x10 cel.
const raw=decodePng(readFileSync(join(here,'generated/mouse.png'))),cw=Math.floor(raw.width/4),mousePalette=[1,5,7,21,24,29,39,40,44];
const mouseFrames=Array.from({length:4},(_,f)=>{let l=cw,r=0,t=raw.height,b=0;for(let y=0;y<raw.height;y++)for(let x=0;x<cw;x++)if(raw.data[(y*raw.width+f*cw+x)*4+3]!>=220){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}const p=new Pixels(20,10),scale=17/(r-l+1);for(let y=0;y<10;y++)for(let x=0;x<20;x++){const sx=Math.floor(l+(x-1+.5)/scale),sy=Math.floor(b+(y-8+.5)/scale);if(sx<l||sx>r||sy<t||sy>b)continue;const at=(sy*raw.width+f*cw+sx)*4;if(raw.data[at+3]!<220)continue;let best=Infinity,c=7;for(const k of mousePalette){const d=rgb[k]!.reduce((n,v,j)=>n+(v-raw.data[at+j]!)**2,0);if(d<best){best=d;c=k;}}p.dot(x,y,c);}return p;});timeline('mouse',mouseFrames,undefined,16);
timeline('sky',skies,undefined,.25);
const awayRaw=decodePng(readFileSync(join(here,'generated/mouse-away.png')));
const awayFrames=Array.from({length:4},(_,f)=>{const w=Math.floor(awayRaw.width/4);let l=w,r=0,t=awayRaw.height,b=0;for(let y=0;y<awayRaw.height;y++)for(let x=0;x<w;x++)if(awayRaw.data[(y*awayRaw.width+f*w+x)*4+3]!>=220){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}const p=new Pixels(20,10),scale=Math.min(17/(r-l+1),8/(b-t+1));for(let y=0;y<10;y++)for(let x=0;x<20;x++){const sx=Math.floor(l+(x-2+.5)/scale),sy=Math.floor(b+(y-8+.5)/scale);if(sx<l||sx>r||sy<t||sy>b)continue;const i=(sy*awayRaw.width+f*w+sx)*4;if(awayRaw.data[i+3]!<220)continue;let best=7,score=Infinity;for(const k of mousePalette){const d=rgb[k]!.reduce((n,v,j)=>n+(v-awayRaw.data[i+j]!)**2,0);if(d<score){score=d;best=k;}}p.dot(x,y,best);}return p;});timeline('mouse-away',awayFrames,undefined,16);
const left=mouseFrames.map(p=>{const q=clone(p);for(let y=0;y<10;y++)for(let x=0;x<20;x++)q.data[y*20+x]=p.data[y*20+19-x]!;return q;}),awayLeft=awayFrames.map(p=>{const q=clone(p);for(let y=0;y<10;y++)for(let x=0;x<20;x++)q.data[y*20+x]=p.data[y*20+19-x]!;return q;});timeline('mouse-left',left,undefined,16);timeline('mouse-away-left',awayLeft,undefined,16);
const mouseContact=new Pixels(80,40,18);[mouseFrames,left,awayFrames,awayLeft].forEach((row,j)=>row.forEach((p,i)=>mouseContact.paste(p,i*20,j*10)));enlarged(join(here,'review/mouse.png'),mouseContact,palette,6);

// Explicit routes start/end beneath furniture. Each traversal exposes one mouse,
// then waits 18–35 seconds; runtime integration should reuse this data, not teleport.
const routes=[{name:'Cabinet to workbench',points:[[70,146],[87,153],[99,152],[107,138]],directions:['right','right','away-right'],seconds:1.8},{name:'Clock to bench',points:[[260,149],[244,149],[230,149],[217,138]],directions:['left','left','away-left'],seconds:1.9},{name:'Under the workbench',points:[[100,137],[130,145],[182,145],[224,137]],directions:['right','right','right'],seconds:2.3}];
const occlusion=new Pixels(320,200),cabinetOcclusion=new Pixels(320,200);cabinetOcclusion.poly([[0,119],[81,112],[81,145],[74,148],[3,150],[0,157]],0);cabinetOcclusion.data.forEach((c,i)=>{if(c===0)occlusion.data[i]=base.data[i]!;});for(const [x,y,w,h]of [[76,137,5,14],[89,124,147,18],[90,133,5,16],[230,130,5,20],[244,134,8,15]])for(let yy=y!;yy<y!+h!;yy++)for(let xx=x!;xx<x!+w!;xx++)occlusion.dot(xx,yy,base.data[yy*320+xx]!);save('mouse-occlusion',occlusion);
const compose=(f:number,old=false)=>{const p=clone(old?before:base);p.paste(skies[Math.floor(f/48)%16]!,0,0);p.paste(rains[Math.floor(f*8/12)%48]!,0,0);p.paste(lampKeys[[0,0,1,0,2,0,0,3][f%8]!]!,203,80);p.paste(clockFrames[f%24]!,238,14);p.paste(holmes,108,52);p.paste(front,0,0);return p;};
for(const [n,route]of routes.entries()){const frames=Array.from({length:48},(_,f)=>{const p=clone(base);p.paste(skies[Math.floor(f/48)%16]!,0,0);p.paste(rains[Math.floor(f*8/12)%48]!,0,0);const progress=(f/12-.6)/route.seconds;if(progress>=0&&progress<=1){const at=progress*(route.points.length-1),i=Math.min(route.points.length-2,Math.floor(at)),a=route.points[i]!,b=route.points[i+1]!,u=at-i;const direction=route.directions[i]!,sprite=({right:mouseFrames,left,'away-right':awayFrames,'away-left':awayLeft}[direction]!)[Math.floor(f*16/12)%4]!;p.paste(sprite,Math.round(a[0]!+(b[0]!-a[0]!)*u)-10,Math.round(a[1]!+(b[1]!-a[1]!)*u)-8);}p.paste(occlusion,0,0);p.paste(lampKeys[f%4]!,203,80);p.paste(clockFrames[f%24]!,238,14);p.paste(holmes,108,52);p.paste(front,0,0);return p;});indexedGif(join(here,'review/mouse-route-'+n+'.gif'),frames,palette,2,8);if(n===1){const closeups=frames.map(frame=>{const p=new Pixels(76,36);for(let y=0;y<36;y++)for(let x=0;x<76;x++)p.dot(x,y,frame.data[(126+y)*320+207+x]!);return p;});indexedGif(join(here,'review/clock-route-closeup.gif'),closeups,palette,6,8);}}
enlarged(join(here,'review/room.png'),compose(0),palette,3);enlarged(join(here,'review/before.png'),compose(0,true),palette,3);
indexedGif(join(here,'review/ambience.gif'),Array.from({length:48},(_,i)=>compose(i)),palette,2,8);
const cabinetCompare=new Pixels(92,58);for(const [n,p]of [before,base].entries())for(let y=0;y<58;y++)for(let x=0;x<46;x++)cabinetCompare.dot(n*46+x,y,p.data[(y+108)*320+x+38]!);enlarged(join(here,'review/cabinet-comparison.png'),cabinetCompare,palette,5);
const report={nativeRoom:[320,200],pixelAspect:1.2,paletteColours:64,cabinet:{vanishingPoint:vp,quad,changedPixels:cabinetChanged,scope:'Drawer bank only, beneath window',projection:'Artist-chosen local plane; not a calibrated whole-room camera'},rain:{frames:48,fps:8,pixelsPerSecond:16,glassMaskOnly:true},sky:{frames:16,fps:.25,cycleSeconds:64,scope:"Exterior blue palette within glass mask"},lamp:{frames:4,fps:8,fixedHousing:true,sequence:[0,0,1,0,2,0,0,3]},pendulum:{frames:24,fps:12,pivot,amplitudeRadians:.065,faceUnchanged:true,storyConflict:'Original story has stopped clocks. Requested ambient swing is preview-only until story integration is resolved.'},mouse:{frames:4,fps:16,canvas:[20,10],anchor:[10,8],routes,cooldownSeconds:[18,35]},sets};
writeFileSync(join(here,'animation.json'),JSON.stringify(report,null,2)+'\n');writeFileSync(join(here,'palette.json'),JSON.stringify(palette,null,2)+'\n');
// Study-only resource IDs; existing production manifests are not changed.
writeFileSync(join(here,'art.json'),JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[{number:102,layers:[{png:'export/workshop.png',priority:-1000},{png:'export/mouse-occlusion.png',priority:150},{png:'export/workshop-front.png',priority:181}]}],views:sets.map((s,i)=>({number:260+i,loops:[{cels:s.files.map(f=>({png:'export/'+f,anchor:[[0,0],[10,25],[30,136],[10,8],[0,0],[10,8],[10,8],[10,8]][i]}))}]}))},null,2)+'\n');
const weatherReview=skies.map(s=>{const p=clone(base);p.paste(s,0,0);p.paste(holmes,108,52);p.paste(front,0,0);return p;});indexedGif(join(here,'review/weather-cycle.gif'),weatherReview,palette,2,30);
console.log({cabinetChanged,frames:sets.map(s=>[s.name,s.files.length]),foregroundUnchanged:true});
