/** Local native-pixel flame and illumination cels; no whole-room brightness pulsing. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,clone,enlarged,indexedGif} from '../../source/study-tools.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const root='art/studies/stair-r40/',pal:string[]=JSON.parse(readFileSync(root+'palette.json','utf8'));
const room=loadIndexed(root+'source/stair-native.png',pal),rgb=pal.map(h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)));
const origin:[number,number]=[121,22],size:[number,number]=[80,76];
const levels=[0,-.14,.08,-.26,-.06,.14];
const timeline=[0,0,1,0,2,0,0,4,1,3,4,0,2,2,0,0,1,4,0,5,2,0,0,4,1,0,2,0,4,0,0,0];
const flame:number[][][]=[[],[[161,56,62],[161,55,61],[160,54,50]],[[160,56,62],[161,56,62],[160,55,61],[161,54,55],[161,53,50]],[[161,56,61],[160,56,52],[161,55,52]],[[160,56,62],[161,56,61],[160,55,55],[160,54,50]],[[160,56,63],[161,56,62],[160,55,62],[161,55,61],[160,54,55],[160,53,50]]];
function closest(c:number[]){let best=Infinity,k=0;rgb.forEach((p,i)=>{const d=2*(p[0]!-c[0]!)**2+4*(p[1]!-c[1]!)**2+(p[2]!-c[2]!)**2;if(d<best){best=d;k=i}});return k;}
const cels=levels.map((level,i)=>{const patch=new Pixels(...size);
 for(let y=0;y<size[1];y++)for(let x=0;x<size[0];x++){
  const xx=x+origin[0],yy=y+origin[1],index=room.data[yy*320+xx]!,c=rgb[index]!;
  const r=((xx-161)/33)**2+((yy-55)/34)**2,fall=Math.max(0,1-r)**2;
  // Warm illuminated plaster only; keep the iron housing silhouette immobile.
  const housing=xx>=156&&xx<=164&&yy>=44&&yy<=69;
  const amount=!housing&&c[0]!>35&&c[0]!>c[1]!*1.2?level*fall:0;
  patch.dot(x,y,amount?closest([c[0]!+amount*85,c[1]!+amount*48,c[2]!+amount*12]):index);
 }
 if(i){for(let y=53;y<=56;y++)for(let x=160;x<=161;x++)patch.dot(x-origin[0],y-origin[1],y===53?41:45);for(const [x,y,c] of flame[i]!)patch.dot(x!-origin[0],y!-origin[1],c!);}
 writeFileSync(root+`export/lamp-${i}.png`,patch.png(pal));return patch;
});
assert.equal(new Set(cels.map(p=>Buffer.from(p.data.buffer).toString('base64'))).size,6);
const scenes=cels.map(p=>{const out=clone(room);out.paste(p,...origin);return out;});
assert.deepEqual(scenes[0]!.data,room.data);
for(const p of scenes)for(let y=0;y<200;y++)for(let x=0;x<320;x++)if(x<origin[0]||x>=origin[0]+size[0]||y<origin[1]||y>=origin[1]+size[1])assert.equal(p.data[y*320+x],room.data[y*320+x]);
writeFileSync(root+'source/lamp.pxo',pixeloramaProject(pal,['Flame and local wall light'],cels.map(p=>[p]),[{name:'Lamp cels — use handoff timeline',from:1,to:6}],{fps:8}));
const playback=timeline.map(i=>scenes[i]!);indexedGif(root+'review/scene.gif',playback,pal,2,12);
const detail=timeline.map(i=>cels[i]!);indexedGif(root+'review/lamp.gif',detail,pal,4,12);
const sheet=new Pixels(size[0]*6,size[1]);cels.forEach((p,i)=>sheet.paste(p,i*size[0],0));enlarged(root+'review/lamp-cels.png',sheet,pal,2);
const jobs=JSON.parse(readFileSync(root+'native-jobs.json','utf8')).filter((j:any)=>j.name!=='lamp');jobs.push({name:'lamp',expected:cels.map((_,i)=>`export/lamp-${i}.png`)});writeFileSync(root+'native-jobs.json',JSON.stringify(jobs,null,2)+'\n');
const manifest=JSON.parse(readFileSync(root+'art.json','utf8'));manifest.views=[{number:283,loops:[{cels:cels.map((_,i)=>({png:`export/lamp-${i}.png`,anchor:[0,0]}))}]}];writeFileSync(root+'art.json',JSON.stringify(manifest,null,2)+'\n');
writeFileSync(root+'guides/lamp-animation.json',JSON.stringify({status:'candidate view 283; not registered',origin,size,anchor:[0,0],priority:80,tickMs:120,timeline,loopMs:timeline.length*120,cels:6,levels,compositing:'Opaque local replacement patch: always replace at the same position to clear the preceding flame. Do not use additive blending.',scope:'Only the flame and a bounded pool of amber light change. Housing, furniture, rug and room remain fixed.',validation:{uniqueCels:6,cel0MatchesBase:true,outsidePatchUnchanged:true}},null,2)+'\n');
console.log({cels:cels.length,loopMs:timeline.length*120,origin,size});
