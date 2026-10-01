/** Extract the approved v6 pixels; reconstruct only surfaces hidden by movable art. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {decodePng,rgbaPng} from 'sci-ts/png';
import {buildArt} from 'sci-ts/art';
import {Pixels} from './pixels.ts';
import {pixeloramaProject} from './pixelorama-project.ts';
const root=fileURLToPath(new URL('../../',import.meta.url));
const out=join(root,'art/production/workshop-r3');
for(const p of ['export','source','review'])mkdirSync(join(out,p),{recursive:true});
const palette=JSON.parse(readFileSync(join(root,'art/approved/workshop-v6/palette.json'),'utf8')) as string[];
const rgb=palette.map(h=>[1,3,5].map(n=>parseInt(h.slice(n,n+2),16)));
const original=decodePng(readFileSync(join(root,'art/approved/workshop-v6/workshop-320x200.png')));
const clean=decodePng(readFileSync(join(out,'hidden-surfaces-source.png')));
const nearest=(r:number,g:number,b:number)=>{let best=Infinity,found=0;rgb.forEach((c,i)=>{const d=2*(r-c[0]!)**2+4*(g-c[1]!)**2+(b-c[2]!)**2;if(d<best){best=d;found=i;}});return found;};
const ref=new Pixels(320,200),fill=new Pixels(320,200);
for(let y=0;y<200;y++)for(let x=0;x<320;x++){
 const i=(y*320+x)*4, s=(Math.floor((y+.5)*clean.height/200)*clean.width+Math.floor((x+.5)*clean.width/320))*4;
 ref.dot(x,y,nearest(original.data[i]!,original.data[i+1]!,original.data[i+2]!));
 fill.dot(x,y,nearest(clean.data[s]!,clean.data[s+1]!,clean.data[s+2]!));
}
type Point=[number,number];
const outlines:Record<string,Point[][]>={
 holmes:[[[136,61],[140,59],[145,60],[148,64],[154,65],[154,68],[151,69],[152,72],[154,73],[158,74],[158,77],[155,78],[152,76],[146,76],[147,79],[149,82],[150,88],[153,92],[157,95],[159,99],[159,102],[156,104],[152,104],[152,118],[154,133],[151,135],[151,149],[152,155],[158,157],[161,158],[161,160],[158,161],[146,161],[141,158],[139,153],[138,157],[139,160],[142,163],[140,166],[133,166],[129,164],[128,160],[130,152],[130,143],[131,135],[126,134],[125,130],[127,116],[128,108],[124,106],[121,103],[121,99],[124,93],[126,88],[129,84],[133,81],[138,78],[138,76],[136,74],[134,73],[134,69],[135,65]]],
 clock:[[[246,15],[298,15],[298,43],[291,46],[291,61],[294,63],[293,65],[291,66],[291,119],[293,121],[292,124],[292,139],[294,141],[294,149],[251,149],[251,142],[251,140],[251,122],[252,120],[252,66],[248,65],[248,62],[250,60],[250,46],[246,42]]],
 lantern:[[[209,83],[215,84],[217,87],[216,89],[219,91],[220,95],[218,98],[220,102],[220,105],[207,105],[207,101],[209,98],[206,95],[206,90],[208,87]]],
 foreground:[[[0,147],[67,147],[74,151],[102,150],[103,153],[99,155],[98,167],[65,183],[65,192],[51,192],[51,188],[41,188],[40,199],[37,199],[37,192],[19,192],[18,199],[0,199]],[[87,169],[96,165],[96,199],[86,199]],[[0,132],[5,133],[7,143],[9,151],[14,157],[14,168],[0,168]]],
};
const masks:Record<string,Pixels>={},layers:Record<string,Pixels>={};
const base=new Pixels(320,200);base.data.set(ref.data);
for(const [name,polys]of Object.entries(outlines)){
 const mask=new Pixels(320,200);polys.forEach(poly=>mask.poly(poly,0));
 // Remove wall/floor pixels caught by the coarse contour, using the original
 // indexed colours. Hands/face/hat are excluded from the wood-edge cleanup.
 const greens=new Set([18,22,24,26,30,33,34,36]);
 for(let y=0;y<200;y++)for(let x=0;x<320;x++){
  const i=y*320+x;if(mask.data[i]!==0)continue;
  const col=ref.data[i]!,[r,g,b]=rgb[col]!;
  if((name==='holmes'||name==='clock')&&greens.has(col))mask.data[i]=-1;
  if(name==='holmes'&&y>=80&&!(x>=148&&x<=157&&y>=91&&y<=102)&&r!>g!*1.2&&b!<g!*.82)mask.data[i]=-1;
  if(name==='holmes'&&y>=108&&y<=134&&x<Math.round(133-(y-108)*5/26))mask.data[i]=-1;
  if(name==='holmes'&&y>=104&&y<108&&x<Math.round(126+(y-104)*1.6))mask.data[i]=-1;
 }
 if(name==='holmes'){
  // Keep the connected figure and its tiny pipe; reject disconnected bench/floor flecks.
  const seen=new Set<number>(),components:number[][]=[];
  for(let i=0;i<mask.data.length;i++)if(mask.data[i]===0&&!seen.has(i)){
   const group=[i];seen.add(i);
   for(let n=0;n<group.length;n++){const at=group[n]!,x=at%320,y=Math.floor(at/320);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const next=(y+dy)*320+x+dx;if(x+dx<0||x+dx>=320||y+dy<0||y+dy>=200||seen.has(next)||mask.data[next]!==0)continue;seen.add(next);group.push(next);}}
   components.push(group);
  }
  components.sort((a,b)=>b.length-a.length);
  for(const group of components.slice(1))for(const i of group)if(!(i%320>=151&&Math.floor(i/320)>=70&&Math.floor(i/320)<=78))mask.data[i]=-1;
 }
 masks[name]=mask;
 const layer=new Pixels(320,200);
 for(let i=0;i<mask.data.length;i++)if(mask.data[i]===0){layer.data[i]=ref.data[i]!;base.data[i]=fill.data[i]!;}
 layers[name]=layer;
}
const save=(name:string,p:Pixels)=>writeFileSync(join(out,'export',name+'.png'),p.png(palette));
const master=(name:string,names:string[],frames:Pixels[][],tags:{name:string;from:number;to:number}[]=[])=>writeFileSync(join(out,'source',name+'.pxo'),pixeloramaProject(palette,names,frames,tags));
const crop=(p:Pixels,x:number,y:number,w:number,h:number)=>{const q=new Pixels(w,h);for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)q.dot(xx,yy,p.data[(yy+y)*p.width+xx+x]!);return q;};
const copy=(p:Pixels)=>{const q=new Pixels(p.width,p.height);q.data.set(p.data);return q;};
save('workshop',base);save('workshop-front',layers.foreground!);
master('workshop',['base','foreground-181'],[[base,layers.foreground!]]);
master('reference-separated',['base','lantern','clock','holmes','foreground'],[[base,layers.lantern!,layers.clock!,layers.holmes!,layers.foreground!]]);
const pad=(n:number)=>String(n).padStart(2,'0');
const stand=crop(layers.holmes!,108,52,72,116),walks=[stand];
// Pixel cutout rig: retain the approved head, torso, lapel hand and coat.
// Only leg articulation and a one-pixel body rise change in this first side-on pass.
const frontMask=new Pixels(320,200),rearMask=new Pixels(320,200);
frontMask.poly([[131,128],[142,129],[142,139],[140,148],[138,156],[139,160],[142,163],[140,166],[133,166],[129,164],[128,160],[130,153]],0);
rearMask.poly([[142,127],[151,129],[151,149],[152,155],[158,157],[161,158],[161,160],[158,161],[146,161],[141,158],[140,148]],0);
const torso=copy(layers.holmes!);
for(let y=134;y<200;y++)for(let x=0;x<320;x++)torso.data[y*320+x]=-1;
const rotate=(p:Point,pivot:Point,a:number):Point=>{const r=a*Math.PI/180,dx=p[0]-pivot[0],dy=p[1]-pivot[1];return[pivot[0]+dx*Math.cos(r)-dy*Math.sin(r),pivot[1]+dx*Math.sin(r)+dy*Math.cos(r)];};
function limb(dest:Pixels,mask:Pixels,hip:Point,knee:Point,ankle:Point,a:number,b:number,bob:number){
 const k=rotate(knee,hip,a),ank=rotate(ankle,knee,a+b);ank[0]+=k[0]-knee[0];ank[1]+=k[1]-knee[1];
 // Hidden upper trousers extend beneath the coat so a bent knee stays attached.
 dest.poly([[hip[0]-111,hip[1]-52+bob],[hip[0]-105,hip[1]-52+bob],[k[0]-105,k[1]-51+bob],[k[0]-111,k[1]-51+bob]],10);
 // Inverse mapping gives solid clusters with no forward-rotation holes.
 for(let y=123;y<171;y++)for(let x=111;x<177;x++){
  const target:Point=[x,y-bob];
  const foot:Point=[target[0]-ank[0]+ankle[0],target[1]-ank[1]+ankle[1]];
  const lower=rotate([target[0]-k[0]+knee[0],target[1]-k[1]+knee[1]],knee,-a-b);
  const upper=rotate(target,hip,-a);
  for(const [s,min,max]of [[upper,0,knee[1]],[lower,knee[1],ankle[1]],[foot,ankle[1],200]] as [Point,number,number][]){
   const sx=Math.round(s[0]),sy=Math.round(s[1]),i=sy*320+sx;
   if(sy<min||sy>=max||sx<0||sx>=320||sy<0||sy>=200||mask.data[i]!==0||layers.holmes!.data[i]!<0)continue;
   dest.dot(x-108,y-52,ref.data[i]!);
  }
 }
}
const phases=[[-18,8,18,0,0],[-8,0,12,32,-1],[8,0,-2,26,0],[18,0,-18,8,0],[12,32,-8,0,-1],[-2,26,8,0,0]];
for(const [a,b,c,d,bob]of phases){const p=new Pixels(72,116);
 limb(p,rearMask,[146,119],[146,140],[147,155],c!,d!,bob!);
 limb(p,frontMask,[138,119],[136,143],[133,159],a!,b!,bob!);
 p.paste(torso,-108,-52+bob!);walks.push(p);
}
walks.forEach((p,i)=>save('holmes-east-'+pad(i),p));
master('holmes',['body'],walks.map(p=>[p]),[{name:'east',from:1,to:7}]);
const clock=crop(layers.clock!,238,14,64,140),clocks=[clock];
for(const angle of [12,25,40,55,68,78,86]){const p=new Pixels(64,140),r=Math.cos(angle*Math.PI/180),hinge=56,left=Math.round(hinge-56*r);
 for(let y=0;y<140;y++)for(let x=left;x<=hinge;x++){const sx=Math.max(0,Math.min(63,Math.round(hinge-(hinge-x)/r)));p.dot(x,y,clock.data[y*64+sx]!);}
 clocks.push(p);
}
clocks.forEach((p,i)=>save('clock-'+pad(i),p));master('clock',['case'],clocks.map(p=>[p]));
const lamp=crop(layers.lantern!,203,80,20,28),lamps=[lamp];
for(let f=1;f<4;f++){const p=copy(lamp);for(let y=8;y<17;y++)for(let x=6;x<15;x++){const i=y*20+x,c=p.data[i]!;if(c>=0&&rgb[c]![0]!>200&&rgb[c]![1]!>140)p.data[i]=nearest(...(f%2?[229,188,106]:[245,216,177]) as [number,number,number]);}lamps.push(p);}
lamps.forEach((p,i)=>save('lantern-'+pad(i),p));master('lantern',['lamp'],lamps.map(p=>[p]));
const full=(f=0,clockFrame=0,x=108)=>{const p=copy(base);p.paste(lamps[0]!,203,80);p.paste(clocks[clockFrame]!,238,14);p.paste(walks[f]!,x,52);p.paste(layers.foreground!,0,0);return p;};
const rebuilt=full();assert.deepEqual(rebuilt.data,ref.data,'standing composition must exactly reconstruct approved pixels');
let changedOutside=0,changedInside=0;
for(let i=0;i<ref.data.length;i++)if(base.data[i]!==ref.data[i]){if(Object.values(masks).some(m=>m.data[i]===0))changedInside++;else changedOutside++;}
assert.equal(changedOutside,0);
function preview(name:string,p:Pixels,scale=3,aspect=true){const a=p.rgba(palette),w=p.width*scale,h=Math.round(p.height*scale*(aspect?1.2:1)),data=new Uint8Array(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(Math.floor(y*p.height/h)*p.width+Math.floor(x/scale))*4;data.set(a.data.subarray(i,i+4),(y*w+x)*4);}writeFileSync(join(out,'review',name+'.png'),rgbaPng({width:w,height:h,data}));}
// GIF uses the exact palette, nearest-neighbour display correction and no quantizer.
function gif(name:string,frames:Pixels[],scale:number){
 const width=frames[0]!.width*scale,height=Math.round(frames[0]!.height*scale*1.2),bytes:number[]=[];
 const word=(n:number)=>[n&255,n>>8];
 bytes.push(...Buffer.from('GIF89a'),...word(width),...word(height),0xf6,0,0);
 for(let i=0;i<128;i++)bytes.push(...(rgb[i]??[0,0,0]));
 bytes.push(0x21,0xff,11,...Buffer.from('NETSCAPE2.0'),3,1,0,0,0);
 for(const p of frames){
  bytes.push(0x21,0xf9,4,4,16,0,0,0,0x2c,0,0,0,0,...word(width),...word(height),0,7);
  const codes:number[]=[128];let count=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   codes.push(Math.max(0,p.data[Math.floor(y*p.height/height)*p.width+Math.floor(x/scale)]!));
   if(++count===120){codes.push(128);count=0;}
  }
  codes.push(129); // frequent dictionary clears keep every LZW code exactly eight bits
  for(let i=0;i<codes.length;i+=255){const chunk=codes.slice(i,i+255);bytes.push(chunk.length,...chunk);}bytes.push(0);
 }
 bytes.push(0x3b);writeFileSync(join(out,'review',name+'.gif'),Buffer.from(bytes));
}
save('reference-rebuilt',rebuilt);preview('reference-rebuilt',rebuilt);
for(let i=1;i<7;i++){save('walking-room-'+pad(i),full(i));}
preview('clean-background',base);preview('clock-open',full(0,7));
gif('walking-room',walks.slice(1).map((_,i)=>full(i+1)),2);
const solo=walks.slice(1).map(p=>{const q=new Pixels(72,116,18);q.paste(p,0,0);return q;});gif('holmes-walk',solo,3);
const contact=new Pixels(72*7,120,18);walks.forEach((p,i)=>contact.paste(p,72*i,2));preview('holmes-contact',contact,2,true);
const assets=new Pixels(320,200,18);assets.paste(stand,16,25);assets.paste(clock,112,14);assets.paste(lamp,204,30);assets.paste(crop(layers.foreground!,0,132,108,68),202,116);preview('assets',assets);
const maskPicture=new Pixels(320,200,0);Object.values(masks).forEach((m,n)=>m.data.forEach((v,i)=>{if(v===0)maskPicture.data[i]=[53,55,49,19][n]!;}));preview('edit-masks',maskPicture);
const cel=(name:string,anchor:[number,number])=>({png:'export/'+name+'.png',anchor});
const seq=(name:string,n:number,anchor:[number,number])=>({cels:Array.from({length:n},(_,i)=>cel(name+'-'+pad(i),anchor))});
const manifest={version:1,maxColours:64,palette:'palette.json',pictures:[{number:102,layers:[{png:'export/workshop.png',priority:-1000},{png:'export/workshop-front.png',priority:181}]}],views:[{number:200,loops:[seq('holmes-east',7,[36,113]),{link:0,mirror:true}]},{number:220,loops:[seq('lantern',4,[10,25])]},{number:221,loops:[seq('clock',8,[30,136])]}]};
writeFileSync(join(out,'palette.json'),JSON.stringify(palette,null,2)+'\n');writeFileSync(join(out,'art.json'),JSON.stringify(manifest,null,2)+'\n');
const built=buildArt(join(out,'art.json'));
const report={approved:'art/approved/workshop-v6/workshop-320x200.png',standingCompositionChangedPixels:0,backgroundChangesOutsideMasks:changedOutside,reconstructedPixels:changedInside,paletteEntries:64,holmesCanvas:[72,116],holmesAnchor:[36,113],holmesReferencePosition:[144,165],directions:['east','west mirrored'],animation:'six-frame original-pixel cutout rig; one-pixel body rise',ageAdjustment:'pending local face/hair pass',listedImages:built.images,resources:built.resources.length};
writeFileSync(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');writeFileSync(join(out,'masks.json'),JSON.stringify(outlines,null,2)+'\n');console.log(report);
