/** Six painted fire keys, anchored ember bed and unchanged foreground grate. */
import assert from 'node:assert/strict';import{readFileSync,writeFileSync}from'node:fs';import{decodePng}from'sci2-ts/png';import{Pixels}from'../../source/pixels.ts';import{enlarged,indexedGif}from'../../source/study-tools.ts';
const h='art/studies/221b-r33/';
export function fireplace(room:Pixels,pal:string[]){
 const raw=decodePng(readFileSync('art/studies/221b-r30/generated/fire-keys.png')),cw=raw.width/3,ch=raw.height/2,rgb=pal.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));
 const bounds=Array.from({length:6},(_,k)=>{const ox=k%3*cw,oy=Math.floor(k/3)*ch;let l=cw,r=0,t=ch,b=0;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(raw.data[((oy+y)*raw.width+ox+x)*4+3]!>=240){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}return{ox,oy,l,r,t,b}});
 const scale=30/Math.max(...bounds.map(b=>b.r-b.l+1));
 const fixed=(x:number,y:number)=>x<6||x>34||(y>=24&&y<=25)||(y>=28&&y<=29)||(y>=32&&y<=33);
 const frames=bounds.map(b=>{const p=new Pixels(40,40);for(let y=0;y<40;y++)for(let x=0;x<40;x++){
  const original=room.data[(94+y)*320+15+x]!;p.dot(x,y,original);if(fixed(x,y))continue;
  const sx=Math.floor((x+.5-20)/scale+(b.l+b.r)/2),sy=Math.floor((y+.5-34)/scale+b.b);if(sx<0||sx>=cw||sy<0||sy>=ch)continue;const at=((b.oy+sy)*raw.width+b.ox+sx)*4;if(raw.data[at+3]!<240)continue;
  let best=Infinity,index=0;rgb.forEach((c,i)=>{const d=2*(c[0]!-raw.data[at]!)**2+4*(c[1]!-raw.data[at+1]!)**2+(c[2]!-raw.data[at+2]!)**2;if(d<best){best=d;index=i}});p.dot(x,y,index);
 }for(let y=0;y<40;y++)for(let x=0;x<40;x++)if(fixed(x,y))assert.equal(p.data[y*40+x],room.data[(94+y)*320+15+x]);return p});
 const board=new Pixels(120,96,18);frames.forEach((p,i)=>{board.paste(p,i%3*40,Math.floor(i/3)*48);board.text(String(i),i%3*40+2,Math.floor(i/3)*48+40,62)});enlarged(h+'review/fire-keys.png',board,pal,5);indexedGif(h+'review/fire-detail.gif',frames,pal,8,12);
 writeFileSync(h+'guides/fire.json',JSON.stringify({source:'../221b-r30/generated/fire-keys.png',sourceCells:bounds,canvas:[40,40],anchor:[20,39],at:[35,133],drawOrigin:[15,94],emberBaseline:34,scale,cels:6,celDurationMs:120,alphaThreshold:240,gratePixelsUnchanged:true,notes:'Flames rise, curl and split; every cel composites onto the clean hearth. High alpha threshold removes the generated halo; no rectangular glow layer.'},null,2)+'\n');return frames;
}
