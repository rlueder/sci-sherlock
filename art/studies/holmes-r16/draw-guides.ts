import{readFileSync,writeFileSync}from'node:fs';import{fileURLToPath}from'node:url';import{join}from'node:path';import{Pixels}from'../../source/pixels.ts';import{enlarged,indexedGif,loadIndexed}from'../../source/study-tools.ts';
const h=fileURLToPath(new URL('.',import.meta.url)),pal=JSON.parse(readFileSync(join(h,'palette.json'),'utf8')),data=JSON.parse(readFileSync(join(h,'guides/poses.json'),'utf8'));
function hull(p:number[][]){const q=p.slice().sort((a,b)=>a[0]!-b[0]!||a[1]!-b[1]!),cross=(a:number[],b:number[],c:number[])=>(b[0]!-a[0]!)*(c[1]!-a[1]!)-(b[1]!-a[1]!)*(c[0]!-a[0]!);const a:number[][]=[],b:number[][]=[];for(const v of q){while(a.length>1&&cross(a[a.length-2]!,a[a.length-1]!,v)<=0)a.pop();a.push(v)}for(const v of q.reverse()){while(b.length>1&&cross(b[b.length-2]!,b[b.length-1]!,v)<=0)b.pop();b.push(v)}return a.slice(0,-1).concat(b.slice(0,-1)) as[number,number][]}
for(const[dir,poses]of Object.entries(data.poses)){
 const sheet=new Pixels(288,240,18),frames:Pixels[]=[];
 for(const[i,g]of (poses as any[]).entries()){
 const p=new Pixels(72,120,18),j=g.joints; p.line(0,113,71,113,24);p.poly(hull(g.chest),28);
 // Solid connected torso, neck and limbs; far and near leg retain fixed identities.
 for(const side of ['right','left']){
 for(const[a,b]of [[side+'Hip',side+'Knee'],[side+'Knee',side+'Ankle'],[side+'Shoulder',side+'Elbow'],[side+'Elbow',side+'Wrist']] as [string,string][]){
 const u=j[a],v=j[b],dx=v[0]-u[0],dy=v[1]-u[1],l=Math.hypot(dx,dy),r=a.endsWith('Hip')?3:a.endsWith('Knee')?2.3:2;
 p.poly([[u[0]-dy/l*r,u[1]+dx/l*r],[u[0]+dy/l*r,u[1]-dx/l*r],[v[0]+dy/l*r,v[1]-dx/l*r],[v[0]-dy/l*r,v[1]+dx/l*r]],side==='left'?45:25);
 }p.line(...j[side+'Heel']as[number,number],...j[side+'Toe']as[number,number],side==='left'?54:49);
 }
 p.line(...j.chest as[number,number],...j.neck as[number,number],39);p.oval(...j.head as[number,number],4.5,7,39);
 const coat=hull(g.coat);for(let k=0;k<coat.length;k++)p.line(...coat[k]!,...coat[(k+1)%coat.length]!,39);
 for(const[a,b]of data.edges)p.line(...j[a]as[number,number],...j[b]as[number,number],a.startsWith('left')?54:49);
 for(const v of Object.values(j))p.oval(...v as[number,number],.65,.65,61);
 p.text(String(i+1),3,3,62);sheet.paste(p,i%4*72,Math.floor(i/4)*120);frames.push(p);writeFileSync(join(h,`guides/${dir}-${i+1}.png`),p.png(pal));
 }enlarged(join(h,`guides/${dir}-plan.png`),sheet,pal,4);indexedGif(join(h,`guides/${dir}.gif`),frames,pal,4,13);
}
enlarged(join(h,'guides/master.png'),loadIndexed(join(h,'../../reference/holmes-master-v2/master.png'),pal),pal,6);
