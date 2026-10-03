/** Deliberate authoring step. Animation builds NEVER call this or change a reference. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {root,palette,json,hash,assert,loadIndexed,clone,oldModels,oldMouth,oldEyes,cast,crop,framed,clipped,enlarged,Pixels} from './common.ts';
import type {Rect} from './common.ts';
const replace=process.argv.includes('--replace-masters');
assert.ok(replace||!existsSync(root+'models.json'),'Masters already exist. Use a deliberate --replace-masters revision after reviewing the source changes.');
const models:any[]=[],landmarks:Record<string,any>={};
// Colours are r27 RGB-mapped indices; white is 67, never the old r23 index 63.
const skin=[61,61,55,55,50,47,45,45,45];
const config:Record<string,any>={
 frightened:{brow:'plead',eye:'wide',mouth:'frown'},tearful:{brow:'plead',eye:'wet',mouth:'tremble'},spooked:{brow:'raised',eye:'away',mouth:'tight'},earnest:{brow:'raised',eye:'bright',mouth:'soft'},relieved:{brow:'soft',eye:'soft',mouth:'smile'},
 intent:{brow:'down',eye:'narrow',mouth:'tight'},keen:{brow:'one',eye:'bright',mouth:'soft'},dry:{brow:'one',eye:'narrow',mouth:'smirk'},grave:{brow:'plead',eye:'soft',mouth:'frown'},impatient:{brow:'down',eye:'narrow',mouth:'pressed'},
 warm:{brow:'soft',eye:'soft',mouth:'smile'},puzzled:{brow:'one',eye:'bright',mouth:'frown'},concerned:{brow:'plead',eye:'soft',mouth:'frown'},surprised:{brow:'raised',eye:'wide',mouth:'soft'},resolute:{brow:'down',eye:'narrow',mouth:'pressed'},
 flustered:{brow:'raised',eye:'wide',mouth:'pressed'},kind:{brow:'soft',eye:'soft',mouth:'smile'},startled:{brow:'raised',eye:'wide',mouth:'round'},
};
for(const [name,char] of Object.entries(cast)){
 const model=oldModels.find((m:any)=>m.name===name),bytes=readFileSync('art/studies/portraits-r23/'+model.master);assert.equal(hash(bytes),model.sha256);
 const neutral=loadIndexed('art/studies/portraits-r23/'+model.master,palette),spec=oldMouth[name];landmarks[name]={};
 const sheet=new Pixels(6*78,100,18);
 for(const [i,expression] of char.expressions.entries()){
  const p=clone(neutral),cfg=config[expression];let eyes=char.eyes.map(r=>[...r] as Rect),editRegions:Rect[]=[];
  if(i){
   // Re-articulate each brow on its own forehead plane. The nose, hair and contour stay fixed.
   char.brows.forEach(([x,y,w,h],side)=>{
    const r:Rect=[x,y-1,w,h+2];editRegions.push(r);
    for(let yy=y-1;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)p.dot(xx,yy,skin[Math.min(8,Math.floor((xx-x)*6/w)+(side?1:0))]!);
    for(let k=0;k<w;k++){
     let dy=0;const f=k/(w-1);
     if(cfg.brow==='raised')dy=-1;
     if(cfg.brow==='one')dy=side?0:-1;
     if(cfg.brow==='plead')dy=side?(f<.5?-1:0):(f>.5?-1:0);
     if(cfg.brow==='down')dy=side?(f<.5?1:0):(f>.5?1:0);
     if(cfg.brow==='soft')dy=(f>.15&&f<.7)?-1:0;
     const yy=y+dy+(name==='hudson'?1:0);p.dot(x+k,yy,k===0||k===w-1?41:name==='hudson'?39:15);
     if(k>0&&k<w-1&&name!=='hudson')p.dot(x+k,yy+1,45);
    }
   });
   if(cfg.eye==='wide')eyes=eyes.map(([x,y,w,h])=>[x,y-1,w,h+1]);
   eyes.forEach(([x,y,w,h],side)=>{
    editRegions.push([x,y,w,h]);
    if(cfg.eye==='wide'){
     for(let k=1;k<w-1;k++){p.dot(x+k,y,39);p.dot(x+k,y+1,62);}
     const px=char.pupils[side]![0];p.dot(px,y+1,9);p.dot(px,y+2,9);p.dot(Math.max(x+1,px-1),y+1,67);
    } else if(cfg.eye==='narrow'){
     for(let k=1;k<w-1;k++)p.dot(x+k,y,k<w/2?55:50);
     p.dot(char.pupils[side]![0],y+h-1,15);
    } else if(cfg.eye==='bright'){
     const [px,py]=char.pupils[side]!;p.dot(px-1,py,67);
    } else if(cfg.eye==='away'){
     const [px,py]=char.pupils[side]!;p.dot(px,py,58);p.dot(Math.max(x+1,px-2),py,9);
    } else if(cfg.eye==='wet'){
     p.dot(x+1,y+h-1,37);p.dot(x+2,y+h-1,51);p.dot(char.pupils[side]![0]-1,y+1,67);
    } else if(cfg.eye==='soft'){
     p.dot(x+1,y,45);p.dot(x+w-2,y,45);
    }
   });
   if(expression==='tearful'){editRegions.push([29,33,3,4]);p.dot(30,33,58);p.dot(30,34,62);p.dot(30,35,58);p.dot(31,36,51);}
   editRegions.push(spec.mouthRegion);
   const lip=spec.lipLine as number[][];const left=lip[0]!,middle=lip[1]!,right=lip[2]!;
   if(cfg.mouth==='smile'||cfg.mouth==='smirk'){
    p.dot(left[0]!,left[1]!-1,32);p.dot(left[0]!+1,left[1]!,32);
    if(cfg.mouth==='smile')p.dot(right[0]!,Math.max(spec.mouthRegion[1],right[1]!-1),32);
    p.dot(middle[0]!,middle[1]!+1,51);
   } else if(cfg.mouth==='frown'||cfg.mouth==='tremble'){
    p.dot(left[0]!,left[1]!+1,41);p.dot(right[0]!,right[1]!+1,32);
    p.dot(middle[0]!,middle[1]!,23);if(cfg.mouth==='tremble')p.dot(middle[0]!+1,middle[1]!+1,45);
   } else if(cfg.mouth==='pressed'||cfg.mouth==='tight'){
    p.line(left[0]!,left[1]!,right[0]!,right[1]!,cfg.mouth==='pressed'?23:32);
   } else if(cfg.mouth==='round'){p.dot(middle[0]!,middle[1]!,23);p.dot(middle[0]!,middle[1]!+1,32);}
  }
  if(name==='toby'&&i===0)eyes=[[29,30,8,5],[39,29,5,4]];
  const dest=`source/masters/${name}-${expression}-right.png`;
  // Neutral is copied byte-for-byte, including its original PNG encoding.
  writeFileSync(root+dest,i?p.png(palette):bytes);
  let differences=0;for(let y=0;y<64;y++)for(let x=0;x<56;x++)if(p.data[y*56+x]!==neutral.data[y*56+x]){differences++;assert.ok(editRegions.some(([rx,ry,w,h])=>x>=rx&&x<rx+w&&y>=ry&&y<ry+h));}
  models.push({name,expression,master:dest,sha256:hash(readFileSync(root+dest)),neutralSource:model.master,neutralSourceSha256:model.sha256,changedPixels:differences,editRegions,status:'Fixed authoring master; user visual review pending'});
  const lipLine=spec.lipLine.map((point:number[])=>[...point]);
  if(cfg?.mouth==='smile'||cfg?.mouth==='smirk'){lipLine[0][1]--;if(cfg.mouth==='smile')lipLine[2][1]=Math.max(spec.mouthRegion[1],lipLine[2][1]-1);}
  if(cfg?.mouth==='frown'||cfg?.mouth==='tremble'){lipLine[0][1]++;lipLine[2][1]++;}
  landmarks[name][expression]={mouthRegion:spec.mouthRegion,lipCorners:[lipLine[0],lipLine[2]],lipLine,chin:spec.chin,eyeRegions:eyes,pupils:char.pupils,browRegions:char.brows,mouthShape:cfg?.mouth??'neutral',eyeShape:cfg?.eye??'neutral',note:spec.note};
  sheet.paste(framed(clipped(p)),i*78,0);sheet.text(expression.toUpperCase(),i*78+1,92,62);
 }
 enlarged(root+`review/${name}-masters.png`,sheet,palette,3);
}
json('palette.json',palette);json('models.json',{status:'Fixed references; user review pending',models});json('landmarks.json',landmarks);
console.log({masters:models.length,neutralBytesUnchanged:4});
