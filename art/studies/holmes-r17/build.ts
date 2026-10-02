/** User-requested layered animation experiment. Native indexed cels; no image generation. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,enlarged,indexedGif} from '../../source/study-tools.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
type P=[number,number]; type Rig={hip:P;knee:P;ankle:P;heel:P;toe?:P;roll?:number};
const home=fileURLToPath(new URL('.',import.meta.url)),palette:string[]=JSON.parse(readFileSync(join(home,'palette.json'),'utf8'));
const master=loadIndexed(join(home,'../../reference/holmes-master-v2/master.png'),palette),guide=JSON.parse(readFileSync(join(home,'../holmes-r16/guides/poses.json'),'utf8'));
const layers={torso:new Pixels(72,120),coat:new Pixels(72,120),near:new Pixels(72,120),far:new Pixels(72,120)};
// Every original pixel belongs to exactly one native layer; reassembly is checked below.
for(let y=0;y<120;y++)for(let x=0;x<72;x++){
 const c=master.data[y*72+x]!;if(c<0)continue;
 const part=y<56?'torso':y<84?((x>=35&&x<=44)?'far':'coat'):(x<33?'near':'far');layers[part].dot(x,y,c);
}
const assembled=new Pixels(72,120);for(const p of [layers.far,layers.near,layers.coat,layers.torso])assembled.paste(p,0,0);assert.deepEqual(assembled.data,master.data,'Split must reconstruct every master pixel exactly');
for(const[name,p]of Object.entries(layers))writeFileSync(join(home,`source/${name}-original.png`),p.png(palette));
const bind:Record<string,Rig>={near:{hip:[29,59],knee:[28,84],ankle:[25,104],heel:[25,110]},far:{hip:[39,58],knee:[39,80],ankle:[37,102],heel:[36,106]}};
// Extend only the occluded upper near trouser leg. Original visible pixels remain intact.
// This is a paintable under-coat layer, not a generated new leg in every frame.
const nearTexture=new Pixels(72,120);nearTexture.paste(layers.near,0,0);
for(let y=57;y<87;y++){const center=29-(y-59)/25,left=Math.floor(center-4.5),right=Math.floor(center+4.5);for(let x=left;x<=right;x++)if(y>=81||nearTexture.data[y*72+x]!<0){const sy=88+(y-57)%8,sx=23+(x-left)%8;const c=master.data[sy*72+sx]!;nearTexture.dot(x,y,c>=0?c:12);}}
const textures={near:nearTexture,far:layers.far};
writeFileSync(join(home,'source/near-with-hidden-thigh.png'),nearTexture.png(palette));
const length=(a:P,b:P)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const strideScale=.68,rootStride=guide.rootDisplacementPerCycle.east[0]*strideScale,bodyBob=[1,1,0,0,1,1,0,0],fps=8;
const toes:Record<string,P>={near:[30,113],far:[48,108]};
const rollDegrees=[0,0,0,3,18,24,8,0];
// Screen-left leg (Holmes's right): a small pelvic rise under the coat lets
// the fixed-length supporting leg extend without moving its planted shoe.
const nearHipRise=[.45,.65,.10,.10,.45,.20,0,0];
function rotate(p:P,pivot:P,angle:number):P{const x=p[0]-pivot[0],y=p[1]-pivot[1];return[pivot[0]+x*Math.cos(angle)-y*Math.sin(angle),pivot[1]+x*Math.sin(angle)+y*Math.cos(angle)];}
function target(side:'near'|'far',i:number):Rig{
 const side3=side==='near'?'left':'right',neutral=guide.poses.east[side==='near'?2:6],g=guide.poses.east[i],b=bind[side]!,bob=bodyBob[i]!;
 const dx=(g.joints[side3+'Heel'][0]-neutral.joints[side3+'Heel'][0])*strideScale+(side==='near'?3:1);
 // Keep east travel horizontal; retain the two separate ground-depth lanes of the master.
 const lift=g.world[side3+'Heel'][2]*57.3*1.25;
 const phase=(i+(side==='near'?0:4))%8,roll=rollDegrees[phase]!*Math.PI/180,pivot=toes[side]!;
 // Roll the whole shoe about its toe. The ankle follows that rotation before IK,
 // so shoe, shin and knee remain connected. The planted toe does not drift.
 const moved=(p:P):P=>{const r=rotate(p,pivot,roll);return[r[0]+dx,r[1]-lift]};
 const ankle=moved(b.ankle),heel=moved(b.heel),toe=moved(pivot),hip:P=[b.hip[0],b.hip[1]+bob-(side==='near'?nearHipRise[i]!:0)];
 const l1=length(b.hip,b.knee),l2=length(b.knee,b.ankle),dist=length(hip,ankle);assert.ok(dist<l1+l2+1e-6,`Unreachable ${side} frame ${i}: ${dist} > ${l1+l2}`);
 const u:P=[(ankle[0]-hip[0])/dist,(ankle[1]-hip[1])/dist],along=(l1*l1-l2*l2+dist*dist)/(2*dist),out=Math.sqrt(Math.max(0,l1*l1-along*along));
 const knee:P=[hip[0]+u[0]*along+u[1]*out,hip[1]+u[1]*along-u[0]*out];return{hip,knee,ankle,heel,toe,roll};
}
function bonePoint(p:P,a:P,b:P,u:P,v:P):P{
 const len=length(a,b),e:P=[(b[0]-a[0])/len,(b[1]-a[1])/len],d:P=[p[0]-a[0],p[1]-a[1]],along=(d[0]*e[0]+d[1]*e[1])/len,across=d[0]*-e[1]+d[1]*e[0],len2=length(u,v),n:P=[-(v[1]-u[1])/len2,(v[0]-u[0])/len2];return[u[0]+(v[0]-u[0])*along+n[0]*across,u[1]+(v[1]-u[1])*along+n[1]*across];
}
const mix=(a:P,b:P,t:number):P=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],clamp=(v:number)=>Math.max(0,Math.min(1,v));
function deform(p:P,b:Rig,t:Rig):P{
 const upper=bonePoint(p,b.hip,b.knee,t.hip,t.knee),lower=bonePoint(p,b.knee,b.ankle,t.knee,t.ankle),rotated=rotate(p,b.heel,t.roll??0),boot:P=[rotated[0]+t.heel[0]-b.heel[0],rotated[1]+t.heel[1]-b.heel[1]];
 const leg=mix(upper,lower,clamp((p[1]-(b.knee[1]-2))/4));return mix(leg,boot,clamp((p[1]-(b.ankle[1]-3))/3));
}
// Triangle rasterization inverse-samples one shared texture; nearest palette index, binary alpha.
function triangle(out:Pixels,tex:Pixels,s:P[],d:P[]){
 const[a,b,c]=d as[P,P,P],det=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(det)<1e-8)return;
 for(let y=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1])));y<=Math.min(119,Math.ceil(Math.max(a[1],b[1],c[1])));y++)for(let x=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0])));x<=Math.min(71,Math.ceil(Math.max(a[0],b[0],c[0])));x++){
 const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/det,v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/det,w=1-u-v;if(u<-.001||v<-.001||w<-.001)continue;
 const sx=Math.round(s[0]![0]*u+s[1]![0]*v+s[2]![0]*w),sy=Math.round(s[0]![1]*u+s[1]![1]*v+s[2]![1]*w);if(sx<0||sx>=72||sy<0||sy>=120)continue;const col=tex.data[sy*72+sx]!;if(col>=0)out.dot(x,y,col);
 }
}
function leg(side:'near'|'far',t:Rig){const out=new Pixels(72,120),tex=textures[side],b=bind[side]!;for(let y=54;y<120;y+=2)for(let x=16;x<54;x+=2){const s:P[]=[[x,y],[x+2,y],[x+2,y+2],[x,y+2]],d=s.map(p=>deform(p,b,t));triangle(out,tex,[s[0]!,s[1]!,s[2]!],[d[0]!,d[1]!,d[2]!]);triangle(out,tex,[s[0]!,s[2]!,s[3]!],[d[0]!,d[2]!,d[3]!]);}return out;}
function coat(i:number,near:Rig,far:Rig){const p=new Pixels(72,120),bob=bodyBob[i]!,lag=Math.sin((i-1)*Math.PI/4);for(let y=56;y<84;y++)for(let x=0;x<72;x++){const col=layers.coat.data[y*72+x]!;if(col<0)continue;const blend=clamp((y-61)/22),follow=x>=45?(far.knee[0]-bind.far!.knee[0])*.65:(near.knee[0]-bind.near!.knee[0])*.3;p.dot(x+Math.round((lag*.7+follow)*blend),y+bob,col);}return p;}
function lining(hem:Pixels,i:number){
 const p=new Pixels(72,120),bob=bodyBob[i]!;
 // Shared trouser seat closes the moving thighs beneath the waistcoat.
 p.poly([[26,55+bob],[43,55+bob],[42,66+bob],[27,66+bob]],2);
 // The open front reveals the dark inside of the coat, never the room behind it.
 // Use the current outer panels as bounds, so this cannot widen their silhouette.
 for(let y=56+bob;y<84+bob;y++){let left=72,right=-1;for(let x=0;x<72;x++)if(hem.data[y*72+x]!>=0){left=Math.min(left,x);right=Math.max(right,x)}if(right>=left)for(let x=left;x<=right;x++)p.dot(x,y,x>right-3?2:1);}
 return p;
}
const frames:Pixels[][]=[],poses:any[]=[],composites:Pixels[]=[],singles:Pixels[]=[],pairs:Pixels[]=[],overlayFrames:Pixels[]=[],metrics:any[]=[];
for(let i=0;i<8;i++){
 const near=target('near',i),far=target('far',i),nearLayer=leg('near',near),farLayer=leg('far',far),torso=new Pixels(72,120);torso.paste(layers.torso,0,bodyBob[i]!);const hem=coat(i,near,far),inner=lining(hem,i),wire=new Pixels(72,120);
 for(const[r,col]of [[near,54],[far,49]]as[Rig,number][]){for(const[a,b]of [[r.hip,r.knee],[r.knee,r.ankle],[r.ankle,r.heel]]as[P,P][])wire.line(...a,...b,col);for(const p of [r.hip,r.knee,r.ankle,r.heel,r.toe!])wire.oval(...p,.7,.7,61);}
 const single=new Pixels(72,120);single.paste(nearLayer,0,0);const pair=new Pixels(72,120);pair.paste(farLayer,0,0);pair.paste(nearLayer,0,0);const complete=new Pixels(72,120);for(const p of [inner,farLayer,nearLayer,hem,torso])complete.paste(p,0,0);
 // The torso is one untouched source layer, translated as a unit. No shoulder/head seam.
 for(let y=0;y<56;y++)for(let x=0;x<72;x++)if(layers.torso.data[y*72+x]!>=0)assert.equal(complete.data[(y+bodyBob[i]!)*72+x],layers.torso.data[y*72+x]);
 for(const[side,r]of [['near',near],['far',far]]as[string,Rig][]){const b=bind[side]!;assert.ok(Math.abs(length(r.hip,r.knee)-length(b.hip,b.knee))<1e-6);assert.ok(Math.abs(length(r.knee,r.ankle)-length(b.knee,b.ankle))<1e-6);}
 for(const[name,p]of Object.entries({near:nearLayer,far:farLayer,coat:hem,lining:inner,torso,wire,single,pair,complete}))writeFileSync(join(home,`export/${name}-${i+1}.png`),p.png(palette));
 frames.push([inner,farLayer,nearLayer,hem,torso,wire]);composites.push(complete);singles.push(single);pairs.push(pair);overlayFrames.push(wire);
 poses.push({cel:i+1,bob:bodyBob[i],near,far,nearStance:guide.poses.east[i].contacts.left.stance,farStance:guide.poses.east[i].contacts.right.stance,rootX:i*rootStride/8});
 for(let y=58+bodyBob[i]!;y<82+bodyBob[i]!;y++){
  let left=72,right=-1;for(let x=0;x<72;x++)if(hem.data[y*72+x]!>=0){left=Math.min(left,x);right=Math.max(right,x)}
  for(let x=left;x<=right;x++)assert.ok(complete.data[y*72+x]!>=0,`Background leak inside coat ${i+1}/${x}/${y}`);
 }
 metrics.push({cel:i+1,torsoPixelsUnchanged:true,coatInteriorOpaque:true});
}
const tags=[{name:'walk',from:1,to:8}],options={layers:[{},{},{},{},{locked:true},{visible:false,locked:true}],fps:8,userData:'User-requested split-sprite experiment: far leg, near leg, coat hem, connected torso. 72x120 anchor36,113. Source textures reused; IK driven feet; hidden construction. Review before integration.'};
writeFileSync(join(home,'source/layered-walk.pxo'),pixeloramaProject(palette,['Inner coat and pelvis backing','Far leg','Near leg','Coat hem','Head shoulders and torso — one piece','Joint guide — hidden'],frames,tags,options));
writeFileSync(join(home,'source/split-master.pxo'),pixeloramaProject(palette,['Far leg','Near leg','Coat hem','Head shoulders and torso'],[[layers.far,layers.near,layers.coat,layers.torso]],[],{userData:'Exact disjoint partition of the approved master. Reassembly is pixel-identical.'}));
writeFileSync(join(home,'export/standing.png'),master.png(palette));
for(const[name,fs]of Object.entries({single:singles,pair:pairs,complete:composites})){indexedGif(join(home,`review/${name}.gif`),fs.map(f=>{const p=new Pixels(72,120,18);p.paste(f,0,0);return p}),palette,4,13);const sheet=new Pixels(288,240,18);fs.forEach((p,i)=>sheet.paste(p,i%4*72,Math.floor(i/4)*120));enlarged(join(home,`review/${name}-sheet.png`),sheet,palette,4);}
const split=new Pixels(360,120,18);[master,layers.torso,layers.coat,nearTexture,layers.far].forEach((p,i)=>split.paste(p,i*72,0));enlarged(join(home,'review/layers.png'),split,palette,3);
const motion={canvas:[72,120],anchor:[36,113],direction:'east',fps,cycleTicks:8,rootPixelsPerCycle:rootStride,rootPixelsPerSecond:rootStride*fps/8,sourceGuide:'../holmes-r16/guides/poses.json',retarget:'Guide horizontal displacement ×0.68; foot paths centered beneath hips; source master ground-depth lanes retained; toe-pivot shoe roll drives ankles before fixed-length 2-bone IK; higher swing clearance; torso rises as a unit over the straight supporting leg; screen-left hip rises up to 0.65px under the coat for a straighter support knee.',bind,poses};
writeFileSync(join(home,'motion.json'),JSON.stringify(motion,null,2)+'\n');
const contacts=[];for(const side of ['near','far'])for(const group of (side==='near'?[[0,1,2,3,4]]:[[0],[4,5,6,7]])){
 const points=group.map(i=>poses[i][side].toe[0]+poses[i].rootX),maxDrift=Math.max(...points)-Math.min(...points);assert.ok(maxDrift<1e-4,`${side} world toe slide ${maxDrift}`);contacts.push({side,cels:group.map(i=>i+1),worldToeDriftBeforePixelRounding:maxDrift});}
writeFileSync(join(home,'checks.json'),JSON.stringify({splitReconstructsMasterExactly:true,torsoPixelsUnchanged:true,boneLengthsPreserved:true,coatInteriorOpaque:true,contacts,scope:'Geometry and native pixel invariants. Artistic approval remains separate.'},null,2)+'\n');console.log({frames:8,layers:6,rootStride,speed:motion.rootPixelsPerSecond,contacts});
