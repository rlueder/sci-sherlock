/** Same approved rigid cabinet surfaces, reprojected for the shared room camera. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,enlarged} from '../../source/study-tools.ts';
const h='art/studies/room-planes-r34/',old='art/studies/clock-r12/';
const pal:string[]=JSON.parse(readFileSync(h+'palette.json','utf8'));
const texture=loadIndexed(old+'source/front-317.png',pal),back=loadIndexed(old+'source/reverse-front.png',pal);
const surfaces=new Map<string,Pixels>();
for(const n of ['Upper case volume','Long case volume','Plinth volume'])for(const side of ['side','back'])surfaces.set(n+'-'+side,loadIndexed(old+'source/'+n.replaceAll(' ','-').toLowerCase()+'-'+side+'.png',pal));
type V=[number,number,number];type UV=[number,number];
type Face={object:string;kind:string;vertices:V[];uv:UV[];face:number};type Pose={angle:number;faces:Face[];hinge:V[]};
const projection=JSON.parse(readFileSync(h+'guides/clock-projection.json','utf8')) as{poses:Pose[]};
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
    if(area<0&&colour>=0)colour=back.data[ty*64+tx]!;
   }else{
    const u=sample(0),v=sample(1),plate=surfaces.get(face.object+(face.face===4?'-back':'-side'))!;
    const tx=Math.min(plate.width-1,Math.max(0,Math.floor(u*plate.width)));
    const ty=Math.min(plate.height-1,Math.max(0,Math.floor(v*plate.height)));
    colour=plate.data[ty*plate.width+tx]!;
    if(face.face===0)colour=colour===5?5:21;

   }
   if(colour>=0){full.data[at]=colour;depth[at]=z;}
  }
 }
 return full;
}

const poses=projection.poses.map((pose,k)=>{let full=render(pose);if(k===0){full=new Pixels(320,200);full.paste(texture,238,14)}
 const occupied:number[]=[];full.data.forEach((c,i)=>{if(c>=0)occupied.push(i)});
 const bounds=[Math.min(...occupied.map(i=>i%320)),Math.min(...occupied.map(i=>Math.floor(i/320))),Math.max(...occupied.map(i=>i%320)),Math.max(...occupied.map(i=>Math.floor(i/320)))];
 assert.ok(bounds[0]!>=232&&bounds[2]!<320&&bounds[1]!>=0&&bounds[3]!<168,'clock cel clipping');
 const cel=new Pixels(88,168);cel.paste(full,-232,0);writeFileSync(h+`export/clock-${k}.png`,cel.png(pal));return{angle:pose.angle,bounds};
});
const hingeError=Math.max(...projection.poses.flatMap(p=>p.hinge.flatMap((v,i)=>v.map((n,k)=>Math.abs(n-projection.poses[0]!.hinge[i]![k]!)))));assert.ok(hingeError<.00001);
const corners=projection.poses[0]!.faces[0]!.vertices;const fitError=Math.max(...corners.flatMap((v,i)=>v.slice(0,2).map((n,k)=>Math.abs(n-[[238,14],[302,14],[302,154],[238,154]][i]![k]!))));assert.ok(fitError<.001);
writeFileSync(h+'guides/clock-check.json',JSON.stringify({horizon:0,fullSize:176,canvas:[88,168],anchor:[60,150],at:[292,150],hingeError,fitError,closedMasterUnchanged:true,poses},null,2)+'\n');
console.log({clockCels:poses.length,hingeError,fitError});
