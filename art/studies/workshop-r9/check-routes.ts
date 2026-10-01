/** Inspect real sprite coverage against authored furniture occlusion. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';import {fileURLToPath} from 'node:url';
import {Pixels} from '../../source/pixels.ts';import {loadIndexed,clone,enlarged} from '../../source/study-tools.ts';
const here=fileURLToPath(new URL('.',import.meta.url)),data=JSON.parse(readFileSync(join(here,'animation.json'),'utf8')),pal=JSON.parse(readFileSync(join(here,'palette.json'),'utf8'));
const read=(f:string)=>loadIndexed(join(here,'export',f+'.png'),pal),bg=read('workshop'),occ=read('mouse-occlusion'),front=read('workshop-front'),clock=read('pendulum-00');
const blocker=clone(occ);blocker.paste(clock,238,14);blocker.paste(front,0,0);
const contact=new Pixels(80*6,36*3),visibility:any[]=[];
for(let r=0;r<3;r++)for(const [j,u]of [0,.2,.4,.6,.8,1].entries()){
 const route=data.mouse.routes[r],at=u*3,i=Math.min(2,Math.floor(at)),a=route.points[i],b=route.points[i+1],x=Math.round(a[0]+(b[0]-a[0])*(at-i)),y=Math.round(a[1]+(b[1]-a[1])*(at-i));const set={right:'mouse',left:'mouse-left','away-right':'mouse-away','away-left':'mouse-away-left'}[route.directions[i] as string]!;
 const sprite=read(set+'-00'),p=clone(bg);let visible=0;sprite.data.forEach((c,n)=>{if(c<0)return;const xx=x-10+n%20,yy=y-8+Math.floor(n/20);if(blocker.data[yy*320+xx]!<0)visible++;});visibility.push({route:r,progress:u,visiblePixels:visible});p.paste(sprite,x-10,y-8);p.paste(blocker,0,0);const ox=r===1?202:60;for(let yy=0;yy<36;yy++)for(let xx=0;xx<80;xx++)contact.dot(j*80+xx,r*36+yy,p.data[(yy+126)*320+xx+ox]!);
 if(u===0||u===1)for(let frame=0;frame<4;frame++){
  const cel=read(set+'-'+String(frame).padStart(2,'0'));let exposed=0;cel.data.forEach((c,n)=>{if(c<0)return;const xx=x-10+n%20,yy=y-8+Math.floor(n/20);if(blocker.data[yy*320+xx]!<0)exposed++;});assert.equal(exposed,0,`Route ${r} endpoint ${u} frame ${frame} pops visibly`);
 }
}
enlarged(join(here,'review/routes-contact.png'),contact,pal,3);writeFileSync(join(here,'route-check.json'),JSON.stringify(visibility,null,2)+'\n');console.log(visibility);
