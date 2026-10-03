import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,clone,enlarged,indexedGif} from '../../source/study-tools.ts';
export {assert,Pixels,loadIndexed,clone,enlarged,indexedGif};
export const root='art/studies/portraits-r44/';
export const palette:string[]=JSON.parse(readFileSync('art/studies/interface-r27/palette.json','utf8'));
export const json=(name:string,value:unknown)=>writeFileSync(root+name,JSON.stringify(value,null,2)+'\n');
export const hash=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
export const frame=loadIndexed('art/studies/portraits-r23/export/frame.png',palette);
export const surround=loadIndexed('art/studies/portraits-r23/export/surround.png',palette);
export type Rect=[number,number,number,number];
export type Edit=[number,number,number];
export const inRect=(x:number,y:number,[rx,ry,w,h]:Rect)=>x>=rx&&x<rx+w&&y>=ry&&y<ry+h;
export const inside=(x:number,y:number)=>surround.data[(y+18)*72+x+8]===4&&frame.data[(y+18)*72+x+8]===-1;
export function clipped(p:Pixels){const q=clone(p);for(let y=0;y<64;y++)for(let x=0;x<56;x++)if(!inside(x,y))q.data[y*56+x]=-1;return q;}
export function flip(p:Pixels){const q=new Pixels(56,64);for(let y=0;y<64;y++)for(let x=0;x<56;x++)q.dot(55-x,y,p.data[y*56+x]!);return q;}
export function crop(p:Pixels,regions:Rect[]){const q=new Pixels(56,64);for(let y=0;y<64;y++)for(let x=0;x<56;x++)if(regions.some(r=>inRect(x,y,r)))q.dot(x,y,p.data[y*56+x]!);return q;}
export function framed(p:Pixels){const q=clone(surround);q.paste(p,8,18);q.paste(frame,0,0);return q;}
export function expand(p:Pixels){const q=new Pixels(72,88);q.paste(p,8,18);return q;}
export function composite(ps:Pixels[]){const q=new Pixels(ps[0]!.width,ps[0]!.height);ps.forEach(p=>q.paste(p,0,0));return q;}
export const oldModels=JSON.parse(readFileSync('art/studies/portraits-r23/models.json','utf8')).models;
export const oldMouth=JSON.parse(readFileSync('art/studies/portraits-r23/landmarks.json','utf8'));
export const oldEyes=JSON.parse(readFileSync('art/studies/portraits-r23/eye-landmarks.json','utf8'));
export type Character={view:number;expressions:string[];brows:Rect[];eyes:Rect[];pupils:[number,number][]};
export const cast:Record<string,Character>={
 toby:{view:212,expressions:['neutral','frightened','tearful','spooked','earnest','relieved'],brows:[[30,27,8,2],[40,27,4,2]],eyes:[[29,30,8,3],[39,29,5,3]],pupils:[[33,31],[42,30]]},
 holmes:{view:213,expressions:['neutral','intent','keen','dry','grave','impatient'],brows:[[31,26,8,2],[42,26,4,2]],eyes:[[31,28,7,2],[42,28,4,2]],pupils:[[35,29],[44,29]]},
 watson:{view:210,expressions:['neutral','warm','puzzled','concerned','surprised','resolute'],brows:[[28,25,9,2],[39,25,5,2]],eyes:[[28,28,7,2],[39,28,5,2]],pupils:[[31,29],[42,29]]},
 hudson:{view:211,expressions:['neutral','flustered','kind','startled'],brows:[[31,25,7,3],[40,25,5,3]],eyes:[[31,28,6,3],[40,28,5,2]],pupils:[[34,29],[42,29]]},
};
