import assert from'node:assert/strict';import{readFileSync,writeFileSync}from'node:fs';
const root='art/studies/holmes-r16/',g=JSON.parse(readFileSync(root+'guides/poses.json','utf8'));
const results:any[]=[];
for(const[d,frames]of Object.entries(g.poses))for(const side of ['left','right']){
 const groups=new Map<number,number[][]>();
 for(const[f,p]of (frames as any[]).entries()){
 const h=p.world[side+'Hip'],k=p.world[side+'Knee'],a=p.world[side+'Ankle'];
 for(const[u,v]of [[h,k],[k,a]])assert.ok(Math.abs(Math.hypot(...u.map((n:number,i:number)=>n-v[i]))-.425)<1e-6,`Limb length ${d}/${side}/${f}`);
 if(p.contacts[side].stance){const key=Math.floor(f/8+(side==='right'?.5:0));if(!groups.has(key))groups.set(key,[]);groups.get(key)!.push(p.contacts[side].heelWorld);}
 }
 for(const[key,pts]of groups){const error=Math.max(...pts.map(p=>Math.hypot(...p.map((n,i)=>n-pts[0]![i]!))));assert.ok(error<1e-6,`Ground slide ${d}/${side}/${key}`);results.push({direction:d,foot:side,stance:key,samples:pts.length,worldSlideMetres:error});}
}
writeFileSync(root+'guides/contact-report.json',JSON.stringify({scope:'Construction only, not validation of rendered sprites',boneLengthMetres:.425,results},null,2)+'\n');console.log('Construction: constant leg lengths and planted world-space heels verified');
