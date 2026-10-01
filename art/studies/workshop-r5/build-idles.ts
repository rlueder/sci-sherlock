/** Small native-pixel gesture studies using the approved three-quarter standing cel. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Pixels} from '../../source/pixels.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
import {clone,loadIndexed,enlarged,indexedGif,type Point} from '../../source/study-tools.ts';
const here=fileURLToPath(new URL('.',import.meta.url));
const palette=JSON.parse(readFileSync(join(here,'palette.json'),'utf8')) as string[];
const standing=loadIndexed(join(here,'export/holmes-east-00.png'),palette);
for(const dir of ['export','source','review'])mkdirSync(join(here,dir),{recursive:true});
const mix=(a:Point,b:Point,t:number):Point=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
function sleeve(p:Pixels,a:Point,b:Point,w:number){
 const l=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=(b[1]-a[1])/l,ny=-(b[0]-a[0])/l;
 p.poly([[a[0]-nx*w,a[1]-ny*w],[a[0]+nx*w,a[1]+ny*w],[b[0]+nx*(w-1),b[1]+ny*(w-1)],[b[0]-nx*(w-1),b[1]-ny*(w-1)]],7);
 p.line(a[0]-nx,a[1]-ny,b[0]-nx,b[1]-ny,17);
 p.line(a[0]+nx*w,a[1]+ny*w,b[0]+nx*(w-1),b[1]+ny*(w-1),4);
}
function tiltHead(p:Pixels,amount:number){
 if(!amount)return;
 const part=new Pixels(72,120);for(let y=0;y<30;y++)for(let x=23;x<55;x++){part.dot(x,y,p.data[y*72+x]!);p.data[y*72+x]=-1;}
 const a=amount*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 for(let y=0;y<34;y++)for(let x=20;x<58;x++){
  const dx=x-33,dy=(y-29)*1.2,sx=Math.round(33+c*dx+s*dy),sy=Math.round(29+(-s*dx+c*dy)/1.2);
  if(sx>=0&&sx<72&&sy>=0&&sy<120&&part.data[sy*72+sx]!>=0)p.dot(x,y,part.data[sy*72+sx]!);
 }
}
function gesture(name:string,t:number,variation=0){
 const p=clone(standing);if(t===0)return p;
 const mask=new Pixels(72,120);mask.poly([[40,36],[44,36],[51,42],[52,51],[46,54],[41,49]],0);
 for(let y=35;y<56;y++)for(let x=39;x<54;x++)if(mask.data[y*72+x]===0)p.dot(x,y,x<44?standing.data[y*72+39]!:-1);
 const shoulder:Point=[36,35];
 const target=name==='think'?{hand:[41,27] as Point,elbow:[47,44] as Point}:name==='cap'?{hand:[42,14+variation] as Point,elbow:[52,34] as Point}:{hand:[49,43] as Point,elbow:[47,51] as Point};
 const elbow=mix([44,46],target.elbow,t),hand=mix([47,45],target.hand,t);
 if(name==='watch')tiltHead(p,12*t);
 sleeve(p,shoulder,elbow,3.7);sleeve(p,elbow,hand,3.1);
 const wrist=mix(hand,elbow,.13);p.line(wrist[0]-1,wrist[1],wrist[0]+1,wrist[1]+1,60);
 p.poly([[hand[0]-2,hand[1]+1],[hand[0]-2,hand[1]-2],[hand[0],hand[1]-3],[hand[0]+2,hand[1]-1],[hand[0]+1,hand[1]+2]],55);
 p.line(hand[0]-1,hand[1]-2,hand[0]+1,hand[1]-1,60);p.dot(hand[0]+1,hand[1]+1,44);
 if(name==='watch'&&t>.4){
  const wx=hand[0]+2,wy=hand[1]-2;
  p.line(41,52,43,55,48);p.line(43,55,47,54,55);p.line(47,54,wx,wy+2,48);
  p.oval(wx,wy,2.5,2.5,9);p.oval(wx,wy,1.8,1.8,55);p.oval(wx,wy,1,1,60);p.dot(wx,wy,4);p.dot(wx,wy-3,55);
 }
 return p;
}
const idles:Record<string,Pixels[]>={puff:[],think:[],cap:[],watch:[]};
for(let f=0;f<12;f++){
 const p=clone(standing);
 if(f>0&&f<11){const age=f-1,cx=51+Math.sin(age*.7)*2,cy=21-age*1.15;
  const dots:Point[]=[[0,0],[1,-1],[2,-1],[3,0],[2,1],[0,2],[-1,1]];
  dots.forEach(([x,y],i)=>{if((i+f)%3&&!(f>7&&i%2))p.dot(cx+x*(1+age*.06),cy+y,age<5?(i%2?40:24):33);});
  if(f<6)p.dot(51,22,40);
 }
 idles.puff!.push(p);
}
for(const [name,timeline] of Object.entries({
 think:[0,.3,.6,1,1,1,1,1,1,1,1,1,1,1,.7,.4,0],
 cap:[0,.35,.7,1,1,1,1,1,.7,.35,0],
 watch:[0,.3,.6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,.6,.3,0]
}))idles[name]=timeline.map((t,i)=>gesture(name,t,name==='cap'&&i===5?-1:0));
const nativeProjects:{name:string;files:string[]}[]=[];
for(const [name,frames]of Object.entries(idles)){
 const files=frames.map((p,i)=>{const filename=`idle-${name}-${String(i).padStart(2,'0')}.png`;writeFileSync(join(here,'export',filename),p.png(palette));return filename;});
 writeFileSync(join(here,'source',`idle-${name}.pxo`),pixeloramaProject(palette,['body and gesture'],frames.map(p=>[p]),[{name,from:1,to:frames.length}]));
 nativeProjects.push({name:`idle-${name}`,files});
 const bg=frames.map(p=>{const q=new Pixels(72,120,18);q.paste(p,0,0);return q;});indexedGif(join(here,'review',`idle-${name}.gif`),bg,palette,3,13);
}
const contact=new Pixels(72*4,120,18);['puff','think','cap','watch'].forEach((name,i)=>contact.paste(idles[name]![name==='puff'?5:4]!,i*72,0));enlarged(join(here,'review/idles.png'),contact,palette,3);
const manifestPath=join(here,'art.json'),manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
manifest.views=manifest.views.filter((v:{number:number})=>v.number!==206);
manifest.views.push({number:206,loops:Object.keys(idles).map(name=>({cels:idles[name]!.map((_,i)=>({png:`export/idle-${name}-${String(i).padStart(2,'0')}.png`,anchor:[36,113]}))}))});
writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
writeFileSync(join(here,'idle.json'),JSON.stringify({status:'native-pixel gesture studies for visual review',view:206,anchor:[36,113],fps:8,loops:Object.keys(idles).map((name,index)=>({name,index,cels:idles[name]!.length})),nativeProjects,scheduling:'Choose infrequently while standing; play once; restore standing. Interrupt promptly when movement starts.',suggestions:['Brief glance toward a sound','Brush dust from a coat sleeve','A small satisfied nod after a deduction'],note:'Watch chain is visible while the watch is out. No permanent chain is baked into the approved standing reference.'},null,2)+'\n');
console.log(Object.fromEntries(Object.entries(idles).map(([name,cels])=>[name,cels.length])));
