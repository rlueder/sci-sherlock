/** Convert complete room/model drawings to the existing shared palette. */
import assert from 'node:assert/strict';import {readFileSync,writeFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';import {join} from 'node:path';import {createHash} from 'node:crypto';import {decodePng} from 'sci-ts/png';
import {Pixels} from '../../source/pixels.ts';import {loadIndexed,enlarged} from '../../source/study-tools.ts';import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const here=fileURLToPath(new URL('.',import.meta.url)),palette=JSON.parse(readFileSync(join(here,'../../reference/holmes-master-v2/palette.json'),'utf8')) as string[];
const rgb=palette.map(h=>[1,3,5].map(n=>parseInt(h.slice(n,n+2),16))),cache=new Map<number,number>();
function nearest(r:number,g:number,b:number){const k=(r<<16)|(g<<8)|b,known=cache.get(k);if(known!==undefined)return known;let best=Infinity,out=0;rgb.forEach((v,i)=>{const d=2*(v[0]!-r)**2+4*(v[1]!-g)**2+(v[2]!-b)**2;if(d<best){best=d;out=i;}});cache.set(k,out);return out;}
const roomRaw=decodePng(readFileSync(join(here,'generated/room.png'))),room=new Pixels(320,200);
for(let y=0;y<200;y++)for(let x=0;x<320;x++){const sx=Math.floor((x+.5)*roomRaw.width/320),sy=Math.floor((y+.5)*roomRaw.height/200),at=(sy*roomRaw.width+sx)*4;room.dot(x,y,nearest(roomRaw.data[at]!,roomRaw.data[at+1]!,roomRaw.data[at+2]!));}
writeFileSync(join(here,'source/room-native.png'),room.png(palette));enlarged(join(here,'review/room-empty.png'),room,palette,3);
const lineup=new Pixels(288,136,18),holmes=loadIndexed(join(here,'../../reference/holmes-master-v2/master.png'),palette);
lineup.paste(holmes,0,0);lineup.text('HOLMES',10,123,62);
const models=[];
for(const [i,[name,height]]of (['watson','hudson','toby'] as const).map((n,i)=>[n,[104,99,99][i]!] as const).entries()){
 const raw=decodePng(readFileSync(join(here,'generated',name+'.png')));let l=raw.width,r=0,t=raw.height,b=0;
 for(let y=0;y<raw.height;y++)for(let x=0;x<raw.width;x++)if(raw.data[(y*raw.width+x)*4+3]!>=240){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
 const sy=height/(b-t+1),sx=sy*1.2,cx=(l+r)/2,p=new Pixels(72,120);
 for(let y=0;y<120;y++)for(let x=0;x<72;x++){const px=Math.floor((x+.5-36)/sx+cx),py=Math.floor((y+.5-113)/sy+b+1);if(px<0||px>=raw.width||py<0||py>=raw.height)continue;const at=(py*raw.width+px)*4;if(raw.data[at+3]!>=240)p.dot(x,y,nearest(raw.data[at]!,raw.data[at+1]!,raw.data[at+2]!));}
 for(let y=0;y<120;y++){assert.equal(p.data[y*72],-1);assert.equal(p.data[y*72+71],-1);}
 const bytes=p.png(palette),hash=createHash('sha256').update(bytes).digest('hex');writeFileSync(join(here,'source',name+'-master.png'),bytes);writeFileSync(join(here,'export',name+'-standing.png'),bytes);
 enlarged(join(here,'review',name+'-master.png'),p,palette,5);
 lineup.paste(p,(i+1)*72,0);lineup.text(name.toUpperCase(),(i+1)*72+8,123,62);
 models.push({name,view:201+i,canvas:[72,120],anchor:[36,113],height,sha256:hash,sourceBox:[l,t,r,b],sourceScale:[sx,sy],status:'Initial fixed model for visual review; no walking/turnaround inferred',rules:['Use this neutral as the identity and palette reference for every future pose.','Draw complete coherent poses before animation.','Name explicit head variants; do not silently regenerate identity.','Keep native body/head size stable; do not per-frame fit figures.']});
 writeFileSync(join(here,'source',name+'-master.pxo'),pixeloramaProject(palette,['Neutral model — review'],[[p]],[],{userData:'Initial 221B cast master. Pin after visual review; preserve exact neutral pixels in later variants.'}));
}
enlarged(join(here,'review/cast-lineup.png'),lineup,palette,4);
writeFileSync(join(here,'models.json'),JSON.stringify({palette:'../../reference/holmes-master-v2/palette.json',pixelAspect:1.2,models},null,2)+'\n');
writeFileSync(join(here,'palette.json'),JSON.stringify(palette,null,2)+'\n');
