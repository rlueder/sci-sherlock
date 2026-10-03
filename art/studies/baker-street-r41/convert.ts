import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {decodePng} from 'sci2-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {enlarged} from '../../source/study-tools.ts';
const h='art/studies/baker-street-r41/',pal:string[]=JSON.parse(readFileSync(h+'palette.json','utf8'));
assert.equal(pal.length,64);
const reports:object[]=[];
const rgb=pal.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));
function convert(name:string){
const raw=decodePng(readFileSync(h+`generated/${name}.png`)),out=new Pixels(320,200);
for(let y=0;y<200;y++)for(let x=0;x<320;x++){
 const at=(Math.floor((y+.5)*raw.height/200)*raw.width+Math.floor((x+.5)*raw.width/320))*4;let best=Infinity,k=0;
 rgb.forEach((c,i)=>{const d=2*(c[0]!-raw.data[at]!)**2+4*(c[1]!-raw.data[at+1]!)**2+(c[2]!-raw.data[at+2]!)**2;if(d<best){best=d;k=i}});out.dot(x,y,k);
}
assert.ok(out.data.every(v=>v>=0&&v<64));
reports.push({source:name,sourceSize:[raw.width,raw.height],nativeSize:[320,200],usedColours:new Set(out.data).size,opaque:true});
return out;
}
writeFileSync(h+'palette.json',JSON.stringify(pal,null,2)+'\n');
for(const name of ['street','driver-nod']){const out=convert(name);writeFileSync(h+`source/${name}-native.png`,out.png(pal));enlarged(h+`review/${name}-empty.png`,out,pal,3);}

writeFileSync(h+'guides/style-conversion.json',JSON.stringify({method:'Same conversion as approved workshop v6: nearest-neighbour sampling, fixed-palette weighted RGB mapping',paletteEntries:64,nativeSize:[320,200],displaySize:[960,720],pixelAspect:1.2,dithering:false,antialiasing:false,paletteUnchanged:true,images:reports},null,2)+'\n');
