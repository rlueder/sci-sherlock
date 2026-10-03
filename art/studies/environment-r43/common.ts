import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {decodePng} from 'sci2-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,clone,enlarged,indexedGif} from '../../source/study-tools.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
export {assert,readFileSync,writeFileSync,Pixels,clone};
export type Point=[number,number];
export const root='art/studies/environment-r43/',pal:string[]=JSON.parse(readFileSync(root+'palette.json','utf8'));
export const rgb=pal.map(h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)));
export function nearest(c:number[]){let best=Infinity,k=0;rgb.forEach((p,i)=>{const d=2*(p[0]!-c[0]!)**2+4*(p[1]!-c[1]!)**2+(p[2]!-c[2]!)**2;if(d<best){best=d;k=i}});return k;}
export const read=(p:string)=>loadIndexed(p,pal);
export const save=(p:string,img:Pixels)=>writeFileSync(root+p,img.png(pal));
export const json=(p:string,obj:unknown)=>writeFileSync(root+p,JSON.stringify(obj,null,2)+'\n');
export const review=(name:string,p:Pixels,scale=3)=>enlarged(root+'review/'+name+'.png',p,pal,scale);
export const gif=(name:string,p:Pixels[],scale=2,delay=10)=>indexedGif(root+'review/'+name+'.gif',p,pal,scale,delay);
export function crop(p:Pixels,x:number,y:number,w:number,h:number){const q=new Pixels(w,h);q.paste(p,-x,-y);return q;}
export function mask(points:Point[]){const p=new Pixels(320,200);p.poly(points,0);return p;}
export function extract(p:Pixels,m:Pixels){const q=new Pixels(p.width,p.height);m.data.forEach((v,i)=>{if(v>=0)q.data[i]=p.data[i]!});return q;}
export function convert(name:string,w=320,h=200){const raw=decodePng(readFileSync(root+'generated/'+name+'.png')),p=new Pixels(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(Math.floor((y+.5)*raw.height/h)*raw.width+Math.floor((x+.5)*raw.width/w))*4;assert.equal(raw.data[i+3],255);p.dot(x,y,nearest(Array.from(raw.data.subarray(i,i+3))));}save('source/'+name+'-native.png',p);return p;}
export const jobs:{name:string;expected:string[]}[]=[];
export function project(name:string,frames:Pixels[],fps=10){frames.forEach((p,i)=>save(`export/${name}-${i}.png`,p));writeFileSync(root+`source/${name}.pxo`,pixeloramaProject(pal,[name],frames.map(p=>[p]),frames.length>1?[{name,from:1,to:frames.length}]:[],{fps}));jobs.push({name,expected:frames.map((_,i)=>`export/${name}-${i}.png`)});}
export function layered(name:string,layers:{name:string;p:Pixels}[]){const flat=clone(layers[0]!.p);layers.slice(1).forEach(l=>flat.paste(l.p,0,0));save('export/'+name+'.png',flat);writeFileSync(root+`source/${name}.pxo`,pixeloramaProject(pal,layers.map(l=>l.name),[layers.map(l=>l.p)],[]));jobs.push({name,expected:['export/'+name+'.png']});return flat;}
export const holmes=read('art/reference/holmes-master-v2/master.png'),watson=read('art/studies/watson-r42/export/watson-standing.png');
export function actor(scene:Pixels,p:Pixels,x:number,y:number){const s=y/176,w=Math.round(72*s),h=Math.round(120*s),q=new Pixels(w,h);for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)q.dot(xx,yy,p.data[Math.min(119,Math.floor(yy/s))*72+Math.min(71,Math.floor(xx/s))]!);scene.paste(q,x-Math.round(36*s),y-Math.round(113*s));}
export const celView=(number:number,name:string,n:number,anchor:Point=[0,0])=>({number,loops:[{cels:Array.from({length:n},(_,i)=>({png:`export/${name}-${i}.png`,anchor}))}]});
