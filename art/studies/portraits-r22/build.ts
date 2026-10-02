/** Ornate surround, separate from the fixed 56x64 face/animation contract. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {decodePng} from 'sci2-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,enlarged,indexedGif} from '../../source/study-tools.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const h='art/studies/portraits-r22/',old='art/studies/portraits-r21/',pal:string[]=JSON.parse(readFileSync(h+'palette.json','utf8'));
const rgb=pal.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16))),raw=decodePng(readFileSync(h+'generated/ornate-frame.png'));
const frame=new Pixels(72,88);
// Sample the complete source silhouette with a one-pixel safety margin.
let l=raw.width,t=raw.height,r=0,b=0;
for(let y=0;y<raw.height;y++)for(let x=0;x<raw.width;x++)if(raw.data[(y*raw.width+x)*4+3]!>=240){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}
for(let y=1;y<87;y++)for(let x=1;x<71;x++){const xx=Math.floor(l+(x-.5)*(r-l+1)/70),yy=Math.floor(t+(y-.5)*(b-t+1)/86),i=(yy*raw.width+xx)*4;if(raw.data[i+3]!<180)continue;let best=Infinity,k=0;rgb.forEach((v,n)=>{const d=2*(v[0]!-raw.data[i]!)**2+4*(v[1]!-raw.data[i+1]!)**2+(v[2]!-raw.data[i+2]!)**2;if(d<best){best=d;k=n}});frame.dot(x,y,k)}
// Flood only the enclosed opening, never the ribbon's openwork or exterior.
const opening=new Set<number>(),todo=[50*72+36];while(todo.length){const i=todo.pop()!;if(opening.has(i)||frame.data[i]!>=0)continue;const x=i%72,y=Math.floor(i/72);assert.ok(x>0&&x<71&&y>0&&y<87,'Frame aperture leaked to exterior');opening.add(i);todo.push(i-1,i+1,i-72,i+72)}
const surround=new Pixels(72,88);for(const i of opening)surround.data[i]=4;surround.paste(frame,0,0);
writeFileSync(h+'export/frame.png',frame.png(pal));writeFileSync(h+'export/surround.png',surround.png(pal));enlarged(h+'review/frame.png',frame,pal,5);
const oldFrame=loadIndexed(old+'source/frame.png',pal),views:any[]=[],jobs:any[]=[],all:Record<string,Pixels[][]>={};
function expanded(p:Pixels){const q=new Pixels(72,88);q.paste(p,8,18);return q}
function compose(layers:Pixels[]){const p=new Pixels(72,88);layers.forEach(q=>p.paste(q,0,0));return p}
for(const[name,view]of [['watson',210],['hudson',211],['toby',212]]as const){const loops:Pixels[][]=[];for(let loop=0;loop<6;loop++){const cels:Pixels[]=[];for(let c=0;c<(loop%3===0?1:3);c++){const p=loadIndexed(old+`export/${name}-${loop}-${c}.png`,pal);for(let y=0;y<64;y++)for(let x=0;x<56;x++){const i=y*56+x;if(!opening.has((y+18)*72+x+8)||oldFrame.data[i]!>=0)p.data[i]=-1}if(loop%3===0)for(let i=0;i<p.data.length;i++)if(p.data[i]===18)p.data[i]=4;cels.push(p);writeFileSync(h+`export/${name}-${loop}-${c}.png`,p.png(pal))}loops.push(cels)}all[name]=loops;
 for(const facing of [0,3]){const key=name+(facing===0?'-right':'-left'),combos=[[0,0],[1,0],[2,0],[0,1],[0,2],[1,1],[2,2]],layers=combos.map(([m,e])=>[surround,expanded(loops[facing]![0]!),expanded(loops[facing+1]![m!]!),expanded(loops[facing+2]![e!]!),frame]);writeFileSync(h+`source/${key}.pxo`,pixeloramaProject(pal,['Velvet and gilt surround','Fixed portrait','Mouth','Eyes','Frame protection'],layers,[{name:'mouth',from:1,to:3},{name:'blink',from:4,to:5}],{fps:8,layers:[{locked:true,linkAll:true},{locked:true,linkAll:true},{},{},{locked:true,linkAll:true}],userData:'72x88 surround at portrait origin minus [8,18]. Face cels remain 56x64, unscaled. Shared frame never reflected.'}));layers.forEach((ps,i)=>writeFileSync(h+`review/${key}-native-${i+1}.png`,compose(ps).png(pal)));jobs.push({name:key,expected:layers.map((_,i)=>`review/${key}-native-${i+1}.png`)});enlarged(h+`review/${key}.png`,compose(layers[0]!),pal,4);assert.deepEqual(compose(layers[0]!).data,compose([surround,expanded(loops[facing]![0]!),frame]).data)}
 views.push({number:view,loops:loops.map((cs,l)=>({cels:cs.map((_,c)=>({png:`export/${name}-${l}-${c}.png`,anchor:[0,0]}))}))});
}
const names=Object.keys(all),animated:Pixels[]=[];for(let t=0;t<32;t++){const sheet=new Pixels(234,190,18);names.forEach((name,k)=>{const m=[0,1,0,2,1,0,1,2][t%8]!,q=(t+k*7)%32,e=q===22||q===24?1:q===23?2:0;for(const f of [0,3]){const p=compose([surround,expanded(all[name]![f]![0]!),expanded(all[name]![f+1]![m]!),expanded(all[name]![f+2]![e]!),frame]);sheet.paste(p,k*78,f===0?0:102)}sheet.text(name.toUpperCase(),k*78+10,91,62)});animated.push(sheet)}enlarged(h+'review/facings.png',animated[0]!,pal,3);indexedGif(h+'review/facings.gif',animated,pal,3,13);
writeFileSync(h+'art.json',JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[],views},null,2)+'\n');writeFileSync(h+'native-jobs.json',JSON.stringify(jobs,null,2)+'\n');writeFileSync(h+'guides/facing-contract.json',JSON.stringify({portraitCanvas:[56,64],anchor:[0,0],surroundCanvas:[72,88],surroundOffset:[-8,-18],surroundPng:'export/surround.png',framePng:'export/frame.png',right:{bust:0,mouth:1,eyes:2},left:{bust:3,mouth:4,eyes:5},drawOrder:['surround','bust','mouth','eyes','frame (optional protection)'],placement:{left:{surround:[4,4],portrait:[12,22],facing:'right'},right:{surround:[244,4],portrait:[252,22],facing:'left'}}},null,2)+'\n');console.log({frame:[72,88],portrait:[56,64],aperturePixels:opening.size,views:3,facings:2,cels:42});
