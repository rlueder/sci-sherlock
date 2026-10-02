/** Fixed scale per sheet; palette from master; named directional heads reused exactly. */
import assert from'node:assert/strict';import{readFileSync,writeFileSync}from'node:fs';import{fileURLToPath}from'node:url';import{join}from'node:path';import{decodePng}from'sci2-ts/png';import{Pixels}from'../../source/pixels.ts';import{loadIndexed,enlarged}from'../../source/study-tools.ts';
const h=fileURLToPath(new URL('.',import.meta.url)),pal=JSON.parse(readFileSync(join(h,'palette.json'),'utf8')),master=loadIndexed(join(h,'../../reference/holmes-master-v2/master.png'),pal),rgb=pal.map((s:string)=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)));
const used=[...new Set([...master.data].filter(v=>v>=0))],cache=new Map<number,number>();
function colour(r:number,g:number,b:number){const k=(r<<16)|(g<<8)|b;if(cache.has(k))return cache.get(k)!;let best=Infinity,c=0;for(const i of used){const v=rgb[i],d=2*(v[0]-r)**2+4*(v[1]-g)**2+(v[2]-b)**2;if(d<best){best=d;c=i}}cache.set(k,c);return c}
function sheet(name:string,cols:number,rows:number){
 const raw=decodePng(readFileSync(join(h,'generated/'+name+'.png'))),cw=Math.floor(raw.width/cols),ch=Math.floor(raw.height/rows);
 const boxes=Array.from({length:cols*rows},(_,i)=>{const ox=i%cols*cw,oy=Math.floor(i/cols)*ch;let l=cw,r=0,t=ch,b=0;
 for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(raw.data[((y+oy)*raw.width+x+ox)*4+3]!>=240){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}
 assert.ok(l>0&&r<cw-1&&t>0&&b<ch-1,'Clipped figure '+name+i);return{ox,oy,l,r,t,b}});
 const heights=boxes.map(b=>b.b-b.t+1).sort((a,b)=>a-b),sy=106/heights[Math.floor(heights.length/2)]!,sx=sy*1.2;
 const cels=boxes.map((b,i)=>{
 let left=cw,right=0;for(let y=b.t;y<b.t+8/sy;y++)for(let x=b.l;x<=b.r;x++)if(raw.data[((y+b.oy)*raw.width+x+b.ox)*4+3]!>=240){left=Math.min(left,x);right=Math.max(right,x)}
 const dx=36-(left+right)/2*sx,dy=113-(b.b+1)*sy,p=new Pixels(72,120);
 for(let y=0;y<120;y++)for(let x=0;x<72;x++){const px=Math.floor((x+.5-dx)/sx),py=Math.floor((y+.5-dy)/sy);if(px<0||px>=cw||py<0||py>=ch)continue;const n=((py+b.oy)*raw.width+px+b.ox)*4;if(raw.data[n+3]!>=240)p.dot(x,y,colour(raw.data[n]!,raw.data[n+1]!,raw.data[n+2]!));}
 return p;
 });return{cels,registration:{source:[raw.width,raw.height],boxes,scale:[sx,sy],rule:'One scale per complete sheet; cap center and foot baseline registered, no per-cel stretching'}}}
const save=(n:string,p:Pixels)=>writeFileSync(join(h,n),p.png(pal));
save('export/east-0.png',master);
const standing=sheet('standing',2,1);save('export/toward-0.png',standing.cels[0]!);save('export/away-0.png',standing.cels[1]!);enlarged(join(h,'review/toward-standing.png'),standing.cels[0]!,pal,5);enlarged(join(h,'review/away-standing.png'),standing.cels[1]!,pal,5);
const regs:Record<string,unknown>={standing:standing.registration};
for(const dir of ['east','toward','away']){
 let input;try{input=sheet(dir,4,2)}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')continue;throw e}
 regs[dir]=input.registration;
 const neutral=loadIndexed(join(h,'export/'+dir+'-0.png'),pal);
 const contact=new Pixels(288,240,18);
 input.cels.forEach((p,i)=>{
 save('source/'+dir+'-registered-'+(i+1)+'.png',p);
 // The walk uses the same gaze: its named head is intentionally unchanged.
 const bob=[0,1,0,-1,0,1,0,-1][i]!;
 p.rect(0,0,72,32+bob,-1);
 for(let y=0;y<32;y++)for(let x=0;x<72;x++)if(neutral.data[y*72+x]!>=0)p.dot(x,y+bob,neutral.data[y*72+x]!);
 save('export/'+dir+'-'+(i+1)+'.png',p);contact.paste(p,i%4*72,Math.floor(i/4)*120);
 });
 enlarged(join(h,'review/'+dir+'-contact.png'),contact,pal,3);
}
for(let i=0;i<9;i++){
 let p;try{p=loadIndexed(join(h,'export/east-'+i+'.png'),pal)}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')continue;throw e}
 const west=new Pixels(72,120);for(let y=0;y<120;y++)for(let x=1;x<72;x++)west.dot(72-x,y,p.data[y*72+x]!);save('export/west-'+i+'.png',west);
}
const lineup=new Pixels(288,120,18);['east','west','toward','away'].forEach((n,i)=>lineup.paste(loadIndexed(join(h,'export/'+n+'-0.png'),pal),i*72,0));enlarged(join(h,'review/standing.png'),lineup,pal,4);
writeFileSync(join(h,'registration.json'),JSON.stringify(regs,null,2)+'\n');
