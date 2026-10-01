/** Hand-placed anatomy landmarks and a constant-length 2D walk planning guide.
 * These are drawing guides, not a deformation rig or recovered 3D anatomy. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,enlarged,type Point} from '../../source/study-tools.ts';
const here=fileURLToPath(new URL('.',import.meta.url));
mkdirSync(join(here,'review'),{recursive:true});
const palette=JSON.parse(readFileSync(join(here,'../holmes-r6/palette.json'),'utf8')) as string[];
const guidePalette=[...palette,'#58d9e6','#ffb45e','#e9eed8'];
export const bones=[['head','neck'],['neck','pelvis'],['nearShoulder','farShoulder'],['nearShoulder','nearElbow'],['nearElbow','nearWrist'],['farShoulder','farElbow'],['farElbow','farWrist'],['nearHip','farHip'],['nearHip','nearKnee'],['nearKnee','nearAnkle'],['nearAnkle','nearToe'],['farHip','farKnee'],['farKnee','farAnkle'],['farAnkle','farToe']];
type Joints=Record<string,Point>;
const neutral:Joints={head:[36,20],neck:[34,27],pelvis:[34,61],nearShoulder:[28,31],farShoulder:[40,31],nearElbow:[19,43],nearWrist:[25,51],farElbow:[47,42],farWrist:[42,39],nearHip:[30,62],farHip:[39,61],nearKnee:[29,85],farKnee:[39,84],nearAnkle:[29,108],farAnkle:[42,105],nearToe:[33,112],farToe:[49,107]};
const variants:Record<string,Joints>={neutral,thinking:{...neutral,nearElbow:[24,45],nearWrist:[39,44],farElbow:[45,42],farWrist:[42,28]},cap:{...neutral,farElbow:[50,34],farWrist:[47,20]},watch:{...neutral,head:[37,22],farElbow:[45,45],farWrist:[52,39]}};
function wire(p:Pixels,j:Joints){for(const [a,b]of bones){const c=a!.startsWith('far')?65:64;p.line(...j[a!]!,...j[b!]!,c);}for(const v of Object.values(j))p.rect(v[0]-1,v[1]-1,2,2,66);}
const overlay=new Pixels(72*4,120,18);
for(const [i,[name,j]]of Object.entries(variants).entries()){const p=loadIndexed(join(here,'../holmes-r6/export',name+'.png'),palette);wire(p,j);overlay.paste(p,i*72,0);}
enlarged(join(here,'review/approved-pose-skeletons.png'),overlay,guidePalette,4);
const footX=[8,4,0,-4,-8,-4,0,6],lift=[0,0,0,0,0,3,5,3],bob=[0,1,0,-1,0,1,0,-1];
function knee(h:Point,a:Point,length:number):Point{const dx=a[0]-h[0],dy=a[1]-h[1],d=Math.hypot(dx,dy);const bend=Math.sqrt(length*length-d*d/4);return[(h[0]+a[0])/2+dy/d*bend,(h[1]+a[1])/2-dx/d*bend];}
const walk=Array.from({length:8},(_,i)=>{const j=Object.fromEntries(Object.entries(neutral).map(([n,p])=>[n,[p[0],p[1]+bob[i]!]])) as Joints;
for(const [side,offset]of [['near',0],['far',4]] as const){const phase=(i+offset)%8,far=side==='far';const hip:Point=[far?39:30,(far?61:62)+bob[i]!],ankle:Point=[(far?37:30)+footX[phase]!, (far?104:108)-lift[phase]!];j[side+'Hip']=hip;j[side+'Knee']=knee(hip,ankle,far?22.5:24);j[side+'Ankle']=ankle;j[side+'Toe']=[ankle[0]+6,ankle[1]+2];}
return{phase:['contact A','down A','passing A','up A','contact B','down B','passing B','up B'][i],joints:j};});
const sheet=new Pixels(72*4,120*2,18);walk.forEach((p,i)=>{const c=new Pixels(72,120,18);c.line(3,114,69,114,28);wire(c,p.joints);sheet.paste(c,i%4*72,Math.floor(i/4)*120);});
enlarged(join(here,'review/walk-skeleton-guide.png'),sheet,guidePalette,4);
for(const offset of [0,4]){
const mannequin=new Pixels(72*2,120*2,18);
for(let i=0;i<4;i++){const j=walk[i+offset]!.joints,p=new Pixels(72,120,18);
 const limb=(a:Point,b:Point,c:number,r=2)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1]));for(let t=0;t<=n;t++)p.oval(a[0]+(b[0]-a[0])*t/n,a[1]+(b[1]-a[1])*t/n,r,r,c);};
 for(const side of ['far','near']){const c=side==='far'?65:64;limb(j[side+'Hip']!,j[side+'Knee']!,c);limb(j[side+'Knee']!,j[side+'Ankle']!,c);limb(j[side+'Ankle']!,j[side+'Toe']!,c,1);}
 p.poly([j.nearShoulder!,j.farShoulder!,j.farHip!,j.nearHip!],66);p.oval(...j.head!,4,6,66);limb(j.head!,j.neck!,66,1);
 for(const side of ['far','near']){const c=side==='far'?65:64;limb(j[side+'Shoulder']!,j[side+'Elbow']!,c);limb(j[side+'Elbow']!,j[side+'Wrist']!,c);}
 mannequin.paste(p,i%2*72,Math.floor(i/2)*120);
}
enlarged(join(here,offset?'review/walk-volume-guide-b.png':'review/walk-volume-guide.png'),mannequin,guidePalette,5);
}
writeFileSync(join(here,'anatomy.json'),JSON.stringify({status:'Artist-estimated projected drawing guides; hidden shoulders, hips and knees are inferred, not measured 3D joints',canvas:[72,120],anchor:[36,113],bones,approvedPoses:variants,walk,guideColours:{near:'#58d9e6',far:'#ffb45e',joints:'#e9eed8'},notes:['Guide does not deform the sprite','Guide-only thigh/shin lengths: near 24px, far 22.5px in projected canvas space','Near/far offset represents camera depth; perspective is not a profile leg swap']},null,2)+'\n');
