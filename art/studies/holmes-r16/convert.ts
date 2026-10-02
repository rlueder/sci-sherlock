/** Quantize complete drawings; never paste heads or limbs between poses. */
import assert from'node:assert/strict';import{readFileSync,writeFileSync}from'node:fs';import{join}from'node:path';import{fileURLToPath}from'node:url';import{decodePng}from'sci2-ts/png';import{Pixels}from'../../source/pixels.ts';import{enlarged,indexedGif,loadIndexed}from'../../source/study-tools.ts';
const h=fileURLToPath(new URL('.',import.meta.url)),pal=JSON.parse(readFileSync(join(h,'palette.json'),'utf8')),master=loadIndexed(join(h,'../../reference/holmes-master-v2/master.png'),pal),rgb=pal.map((s:string)=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16))),used=[...new Set([...master.data].filter(v=>v>=0))],cache=new Map<number,number>();
function colour(r:number,g:number,b:number){const k=(r<<16)|(g<<8)|b;if(cache.has(k))return cache.get(k)!;let best=Infinity,c=0;for(const i of used){const v=rgb[i],d=2*(v[0]-r)**2+4*(v[1]-g)**2+(v[2]-b)**2;if(d<best){best=d;c=i}}cache.set(k,c);return c}
const args=process.argv.slice(2),name=args[0]??'east',cols=Number(args[1]??2),rows=Number(args[2]??2),raw=decodePng(readFileSync(join(h,'generated/'+name+'.png'))),cw=Math.floor(raw.width/cols),ch=Math.floor(raw.height/rows);
assert.equal(cw,Math.floor(cw));assert.equal(ch,Math.floor(ch));
const boxes=Array.from({length:cols*rows},(_,i)=>{const ox=i%cols*cw,oy=Math.floor(i/cols)*ch;let l=cw,r=0,t=ch,b=0;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(raw.data[((y+oy)*raw.width+x+ox)*4+3]!>=240){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)};return{ox,oy,l,r,t,b}});
const heights=boxes.map(b=>b.b-b.t+1).sort((a,b)=>a-b),sy=106/heights[Math.floor(heights.length/2)]!,sx=sy*1.2,frames:Pixels[]=[];
const contact=new Pixels(cols*72,rows*120,18);
for(const[b,i]of boxes.map((b,i)=>[b,i]as const)){
 // Whole-pose cap registration; preserve all pixel relationships within each drawing.
 let left=cw,right=0;for(let y=b.t;y<b.t+9/sy;y++)for(let x=b.l;x<=b.r;x++)if(raw.data[((y+b.oy)*raw.width+x+b.ox)*4+3]!>=240){left=Math.min(left,x);right=Math.max(right,x)}
 const dx=35-(left+right)/2*sx,dy=7-b.t*sy,p=new Pixels(72,120);
 for(let y=0;y<120;y++)for(let x=0;x<72;x++){const px=Math.floor((x+.5-dx)/sx),py=Math.floor((y+.5-dy)/sy);if(px<0||px>=cw||py<0||py>=ch)continue;const n=((py+b.oy)*raw.width+px+b.ox)*4;if(raw.data[n+3]!>=240)p.dot(x,y,colour(raw.data[n]!,raw.data[n+1]!,raw.data[n+2]!));}
 writeFileSync(join(h,`review/rejected-export/${name}-${i+1}.png`),p.png(pal));frames.push(p);contact.paste(p,i%cols*72,Math.floor(i/cols)*120);
}
enlarged(join(h,`review/${name}-contact.png`),contact,pal,5);indexedGif(join(h,`review/${name}.gif`),frames.map(f=>{const p=new Pixels(72,120,18);p.paste(f,0,0);return p}),pal,4,25);
writeFileSync(join(h,`source/${name}-registration.json`),JSON.stringify({source:[raw.width,raw.height],grid:[cols,rows],scale:[sx,sy],boxes,method:'Whole-pose placement; no head/collar replacement or isolated limb transforms'},null,2)+'\n');
