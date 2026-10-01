/** Rasterize Blender's projected guide at native resolution, on the approved palette.
 * pnpm exec tsx art/studies/clock-perspective-r4/export-pixels.ts
 * Overwrites this study's exports, review images and clock.pxo. Does not publish art.
 */
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {decodePng, rgbaPng} from 'sci-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const here=fileURLToPath(new URL('.',import.meta.url));
const root=fileURLToPath(new URL('../../../',import.meta.url));
for(const p of ['export','review'])mkdirSync(join(here,p),{recursive:true});
const palette=JSON.parse(readFileSync(join(root,'art/approved/workshop-v6/palette.json'),'utf8')) as string[];
const colours=palette.map(h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)));
const colourIndex=new Map(colours.map((c,i)=>[c.join(','),i]));
function load(path:string){const png=decodePng(readFileSync(join(root,path))),p=new Pixels(png.width,png.height);
 for(let i=0;i<p.data.length;i++){const at=i*4;assert.ok(png.data[at+3]===0||png.data[at+3]===255);if(png.data[at+3]){const c=colourIndex.get(Array.from(png.data.subarray(at,at+3)).join(','));assert.notEqual(c,undefined);p.data[i]=c!;}}return p;}
const reference=load('art/approved/workshop-v6/workshop-320x200.png');
const texture=load('art/production/workshop-r3/export/clock-00.png');
const clean=load('art/production/workshop-r3/export/workshop.png');
const copy=(p:Pixels)=>{const c=new Pixels(p.width,p.height);c.data.set(p.data);return c;};
type V=[number,number,number]; type UV=[number,number];
type Face={object:string;kind:string;vertices:V[];uv:UV[];face:number};
type Pose={angle:number;faces:Face[];hinge:V[]};
const projection=JSON.parse(readFileSync(join(here,'projection.json'),'utf8')) as {blender:string;poses:Pose[]};
const background=copy(reference),passage=new Pixels(320,200);
// A separate dark reveal, clipped to the actual opaque source. The approved room
// outside that footprint stays unchanged; this is a study, not a new room export.
passage.rect(254,38,36,108,2);
passage.rect(255,41,3,103,5);
passage.rect(258,43,2,100,3);
passage.poly([[258,131],[287,125],[287,145],[258,145]],1);
for(let n=0;n<4;n++){
 const y=132+n*4;passage.line(259,y,287,y-5,7);passage.line(259,y+1,287,y-4,4);
}
for(let y=0;y<140;y++)for(let x=0;x<64;x++)if(texture.data[y*64+x]!>=0){
 const at=(y+14)*320+x+238;background.data[at]=passage.data[at]!>=0?passage.data[at]!:clean.data[at]!;
}
const origin:UV=[232,0],size:UV=[88,168],anchor:UV=[60,150];
const cels:Pixels[]=[],rooms:Pixels[]=[];
const bounds:{angle:number;box:number[]}[]=[];
const cross=(a:V,b:V,p:V)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
function render(pose:Pose){
 const full=new Pixels(320,200),depth=new Float64Array(320*200).fill(Infinity);
 for(const face of pose.faces)for(const indices of [[0,1,2],[0,2,3]]){
  const [a,b,c]=indices.map(i=>face.vertices[i]!) as [V,V,V];
  const uv=indices.map(i=>face.uv[i]!);const area=cross(a,b,c);if(Math.abs(area)<.00001)continue;
  for(let y=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1])));y<Math.min(200,Math.ceil(Math.max(a[1],b[1],c[1])));y++)
  for(let x=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0])));x<Math.min(320,Math.ceil(Math.max(a[0],b[0],c[0])));x++){
   const p:V=[x+.5,y+.5,0],w=[cross(b,c,p)/area,cross(c,a,p)/area,cross(a,b,p)/area];
   if(w.some(v=>v<-.000001))continue;
   const reciprocal=w[0]!/a[2]+w[1]!/b[2]+w[2]!/c[2],z=1/reciprocal,at=y*320+x;
   if(z>=depth[at]!)continue;
   const q=[a,b,c],sample=(axis:number)=>w.reduce((s,t,i)=>s+t*uv[i]![axis]!/q[i]![2],0)*z;
   let colour=-1;
   if(face.kind==='front'){
    const tx=Math.min(63,Math.max(0,Math.floor(sample(0)))),ty=Math.min(139,Math.max(0,Math.floor(sample(1))));
    colour=texture.data[ty*64+tx]!;
    // Past edge-on we see the back of the decorative face, not a reversed dial.
    if(area<0&&colour>=0)colour=tx%11===0?16:9;
   }else{
    // Sparse, stable cabinet-grain guide in face coordinates, not screen noise.
    const u=sample(0),v=sample(1),edge=Math.min(u,v,1-u,1-v);
    colour=face.face===4?8:15;
    if(edge<.07)colour=9;
    else if(edge<.14)colour=23;
    else if(Math.floor(u*31)%9===0)colour=16;
    if(face.face===0)colour=21;
   }
   if(colour>=0){full.data[at]=colour;depth[at]=z;}
  }
 }
 return full;
}
let rawClosedDifference=0;
for(const pose of projection.poses){
 let full=render(pose);
 if(pose.angle===0){
  const exact=new Pixels(320,200);exact.paste(texture,238,14);
  rawClosedDifference=full.data.reduce((n,c,i)=>n+Number(c!==exact.data[i]),0);
  // The standing cel is always the exact original; the volumes are construction guides.
  full=exact;
 }
 const occupied:Array<UV>=[];full.data.forEach((c,i)=>{if(c>=0)occupied.push([i%320,Math.floor(i/320)]);});
 const box=[Math.min(...occupied.map(p=>p[0])),Math.min(...occupied.map(p=>p[1])),Math.max(...occupied.map(p=>p[0])),Math.max(...occupied.map(p=>p[1]))];
 assert.ok(box[0]!>=origin[0]&&box[1]!>=origin[1]&&box[2]!<origin[0]+size[0]&&box[3]!<origin[1]+size[1],'cel would clip');
 bounds.push({angle:pose.angle,box});
 const cel=new Pixels(...size);cel.paste(full,-origin[0],-origin[1]);cels.push(cel);
 const room=copy(background);room.paste(full,0,0);rooms.push(room);
}
assert.deepEqual(rooms[0]!.data,reference.data,'closed room must exactly equal v6');
const hingeError=Math.max(...projection.poses.flatMap(p=>p.hinge.flatMap((v,i)=>v.map((n,k)=>Math.abs(n-projection.poses[0]!.hinge[i]![k]!)))));
assert.ok(hingeError<.00001,'hinge drift');
const closedCorners=projection.poses[0]!.faces[0]!.vertices;
const fitError=Math.max(...closedCorners.flatMap((v,i)=>v.slice(0,2).map((n,k)=>Math.abs(n-[[238,14],[302,14],[302,154],[238,154]][i]![k]!))));
assert.ok(fitError<.001,'camera fit');
function save(name:string,p:Pixels){writeFileSync(join(here,'export',name+'.png'),p.png(palette));}
save('background-study',background);cels.forEach((p,i)=>save('clock-'+String(i).padStart(2,'0'),p));
rooms.forEach((p,i)=>save('room-'+String(i).padStart(2,'0'),p));
function preview(name:string,p:Pixels,scale=3){const source=p.rgba(palette),width=p.width*scale,height=Math.round(p.height*scale*1.2),data=new Uint8Array(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(Math.floor(y*p.height/height)*p.width+Math.floor(x/scale))*4;data.set(source.data.subarray(i,i+4),(y*width+x)*4);}
 writeFileSync(join(here,'review',name+'.png'),rgbaPng({width,height,data}));}
preview('closed',rooms[0]!);preview('half-open',rooms[4]!);preview('open',rooms[7]!);
const contact=new Pixels(size[0]*4,size[1]*2,18);cels.forEach((p,i)=>contact.paste(p,(i%4)*size[0],Math.floor(i/4)*size[1]));preview('contact',contact,2);
// Indexed GIF: original palette only, literal LZW with short dictionary runs.
const width=640,height=480,bytes:number[]=[];const word=(n:number)=>[n&255,n>>8];
bytes.push(...Buffer.from('GIF89a'),...word(width),...word(height),0xf6,0,0);
for(let i=0;i<128;i++)bytes.push(...(colours[i]??[0,0,0]));
bytes.push(0x21,0xff,11,...Buffer.from('NETSCAPE2.0'),3,1,0,0,0);
const timeline=[0,0,0,1,2,3,4,5,6,7,7,7,7,7,7,6,5,4,3,2,1,0];
for(const frame of timeline){const p=rooms[frame]!;bytes.push(0x21,0xf9,4,4,16,0,0,0,0x2c,0,0,0,0,...word(width),...word(height),0,7);const codes=[128];let count=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){codes.push(p.data[Math.floor(y*200/height)*320+Math.floor(x/2)]!);if(++count===120){codes.push(128);count=0;}}
 codes.push(129);for(let i=0;i<codes.length;i+=255){const block=codes.slice(i,i+255);bytes.push(block.length,...block);}bytes.push(0);}
bytes.push(0x3b);writeFileSync(join(here,'review/clock-turn.gif'),Buffer.from(bytes));
writeFileSync(join(here,'clock.pxo'),pixeloramaProject(palette,['case — perspective study'],cels.map(p=>[p]),[{name:'open',from:1,to:8}]));
writeFileSync(join(here,'palette.json'),JSON.stringify(palette,null,2)+'\n');
writeFileSync(join(here,'art.json'),JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[],views:[{number:221,loops:[{cels:cels.map((_,i)=>({png:'export/clock-'+String(i).padStart(2,'0')+'.png',anchor}))}]}]},null,2)+'\n');
writeFileSync(join(here,'report.json'),JSON.stringify({status:'perspective construction and pixel paint-over study; not approved or integrated',blender:projection.blender,closedRoomChangedPixels:0,rawGuideClosedDifferencePixels:rawClosedDifference,cameraFitMaxErrorPixels:fitError,hingeMaxDrift:hingeError,canvas:size,origin,anchor,actorPosition:[292,150],angles:projection.poses.map(p=>p.angle),bounds,paletteEntries:palette.length,sideSurfaces:'blockout colours and sparse grain; final pixel drawing pending'},null,2)+'\n');
// Export construction lines as vector guides; they are never baked into the PNGs.
const lines=projection.poses[4]!.faces.map(f=>`<polygon points="${f.vertices.map(v=>`${v[0]},${v[1]}`).join(' ')}" fill="none" stroke="${f.kind==='front'?'#efbc69':'#7acfcd'}" stroke-width=".35"/>`).join('');
writeFileSync(join(here,'construction.svg'),`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="960" height="720" viewBox="0 0 320 200" preserveAspectRatio="none"><image xlink:href="../../approved/workshop-v6/workshop-320x200.png" width="320" height="200" opacity=".55" style="image-rendering:pixelated"/><path d="M0 72H320 M292 14V150" fill="none" stroke="#efbc69" stroke-width=".4" stroke-dasharray="2 2"/>${lines}</svg>`);
console.log({closedRoomChangedPixels:0,rawClosedDifference,fitError,hingeError,cels:cels.length});
