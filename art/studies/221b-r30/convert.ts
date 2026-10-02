import {readFileSync,writeFileSync} from 'node:fs';
import {decodePng} from 'sci2-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {enlarged} from '../../source/study-tools.ts';
const h='art/studies/221b-r30/',pal:string[]=JSON.parse(readFileSync('art/palette.json','utf8'));
const rgb=pal.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));
function convert(name:string){
const raw=decodePng(readFileSync(h+`generated/${name}.png`)),out=new Pixels(320,200);
for(let y=0;y<200;y++)for(let x=0;x<320;x++){
 const at=(Math.floor((y+.5)*raw.height/200)*raw.width+Math.floor((x+.5)*raw.width/320))*4;let best=Infinity,k=0;
 rgb.forEach((c,i)=>{const d=2*(c[0]!-raw.data[at]!)**2+4*(c[1]!-raw.data[at+1]!)**2+(c[2]!-raw.data[at+2]!)**2;if(d<best){best=d;k=i}});out.dot(x,y,k);
}
return out;
}
writeFileSync(h+'palette.json',JSON.stringify(pal,null,2)+'\n');
for(const name of ['room','landing','room-before-texture']){const out=convert(name);writeFileSync(h+`source/${name}-native.png`,out.png(pal));enlarged(h+`review/${name==='room'?'room-empty':name}.png`,out,pal,3);}
