/** Reproducible native-pixel helpers shared by art studies, never runtime code. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {decodePng,rgbaPng} from 'sci-ts/png';
import {Pixels} from './pixels.ts';
export type Point=[number,number];
export const clone=(p:Pixels)=>{const q=new Pixels(p.width,p.height);q.data.set(p.data);return q;};
export function loadIndexed(path:string,palette:string[]){
 const png=decodePng(readFileSync(path)),p=new Pixels(png.width,png.height);
 const map=new Map(palette.map((h,i)=>[[1,3,5].map(n=>parseInt(h.slice(n,n+2),16)).join(','),i]));
 for(let i=0;i<p.data.length;i++){const n=i*4,a=png.data[n+3];assert.ok(a===0||a===255);if(a){const c=map.get(Array.from(png.data.subarray(n,n+3)).join(','));assert.notEqual(c,undefined);p.data[i]=c!;}}return p;
}
export function enlarged(path:string,p:Pixels,palette:string[],scale=3){
 const src=p.rgba(palette),width=p.width*scale,height=Math.round(p.height*scale*1.2),data=new Uint8Array(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(Math.floor(y*p.height/height)*p.width+Math.floor(x/scale))*4;data.set(src.data.subarray(i,i+4),(y*width+x)*4);}
 writeFileSync(path,rgbaPng({width,height,data}));
}
export function indexedGif(path:string,frames:Pixels[],palette:string[],scale=2,delay=13){
 const width=frames[0]!.width*scale,height=Math.round(frames[0]!.height*scale*1.2),bytes:number[]=[];
 const word=(n:number)=>[n&255,n>>8],rgb=palette.map(h=>[1,3,5].map(n=>parseInt(h.slice(n,n+2),16)));
 bytes.push(...Buffer.from('GIF89a'),...word(width),...word(height),0xf6,0,0);
 for(let i=0;i<128;i++)bytes.push(...(rgb[i]??[0,0,0]));
 bytes.push(0x21,0xff,11,...Buffer.from('NETSCAPE2.0'),3,1,0,0,0);
 for(const p of frames){bytes.push(0x21,0xf9,4,4,...word(delay),0,0,0x2c,0,0,0,0,...word(width),...word(height),0,7);const codes=[128];let count=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){codes.push(Math.max(0,p.data[Math.floor(y*p.height/height)*p.width+Math.floor(x/scale)]!));if(++count===120){codes.push(128);count=0;}}
  codes.push(129);for(let i=0;i<codes.length;i+=255){const b=codes.slice(i,i+255);bytes.push(b.length,...b);}bytes.push(0);}
 bytes.push(0x3b);writeFileSync(path,Buffer.from(bytes));
}
/** Projective map solved from four correspondences; avoids affine tabletop shear. */
export function homography(from:Point[],to:Point[]){
 const rows:number[][]=[];
 from.forEach(([x,y],i)=>{const [u,v]=to[i]!;rows.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);});
 for(let i=0;i<8;i++){let pivot=i;for(let j=i+1;j<8;j++)if(Math.abs(rows[j]![i]!)>Math.abs(rows[pivot]![i]!))pivot=j;
  [rows[i],rows[pivot]]=[rows[pivot]!,rows[i]!];const d=rows[i]![i]!;assert.ok(Math.abs(d)>1e-10,'degenerate quad');for(let k=i;k<9;k++)rows[i]![k]!/=d;
  for(let j=0;j<8;j++)if(j!==i){const f=rows[j]![i]!;for(let k=i;k<9;k++)rows[j]![k]!-=f*rows[i]![k]!;}}
 const h=rows.map(r=>r[8]!);
 return (x:number,y:number):Point=>{const d=h[6]!*x+h[7]!*y+1;return[(h[0]!*x+h[1]!*y+h[2]!)/d,(h[3]!*x+h[4]!*y+h[5]!)/d];};
}
