import{readFileSync,writeFileSync}from'node:fs';import{fileURLToPath}from'node:url';import{join}from'node:path';import{Pixels}from'../../source/pixels.ts';import{enlarged}from'../../source/study-tools.ts';
const h=fileURLToPath(new URL('.',import.meta.url)),p=JSON.parse(readFileSync(join(h,'palette.json'),'utf8')),data=JSON.parse(readFileSync(join(h,'guides/poses.json'),'utf8'));
for(const[name,poses]of Object.entries(data.poses)){
 const sheet=new Pixels(288,240,18);
 for(const[i,pose]of (poses as any[]).entries()){
 const c=new Pixels(72,120,18);c.line(0,113,71,113,24);
 for(let n=0;n<4;n++)c.line(...pose.coat[n] as[number,number],...pose.coat[(n+1)%4] as[number,number],39);
 for(const[a,b]of data.edges)c.line(...pose.joints[a] as[number,number],...pose.joints[b] as[number,number],a.startsWith('far')?49:54);
 for(const v of Object.values(pose.joints))c.oval(...v as[number,number],1,1,61);
 c.oval(...pose.joints.head as[number,number],5,7,39);c.text(String(i+1),3,3,62);sheet.paste(c,i%4*72,Math.floor(i/4)*120);
 }enlarged(join(h,'guides/'+name+'-plan.png'),sheet,p,4);
}
