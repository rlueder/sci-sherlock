import {readFileSync,writeFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';import {join} from 'node:path';
import {Pixels} from '../../source/pixels.ts';import {loadIndexed,enlarged} from '../../source/study-tools.ts';import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const here=fileURLToPath(new URL('.',import.meta.url)),pal=JSON.parse(readFileSync(join(here,'palette.json'),'utf8'));
const edges=[[0,1],[1,2],[2,3],[3,4],[1,5],[5,6],[6,7],[1,8],[8,9],[9,10],[8,11],[11,12]];
const joints={
 watson:[[38,18],[36,28],[25,32],[23,47],[25,62],[42,31],[47,44],[42,40],[35,63],[30,86],[30,111],[42,86],[45,108]],
 hudson:[[38,23],[36,32],[25,36],[23,50],[38,59],[43,36],[46,50],[43,58],[36,65],[31,87],[32,111],[43,87],[44,109]],
 toby:[[40,23],[36,34],[26,37],[24,53],[37,58],[42,36],[46,52],[45,58],[35,67],[31,88],[30,111],[42,87],[45,109]],
 seated:[[38,41],[35,51],[24,54],[24,70],[38,70],[42,54],[48,69],[47,70],[35,81],[47,90],[51,111],[32,92],[33,113]]
};
const sheet=new Pixels(288,136,18);
for(const [index,name]of (['watson','hudson','toby','seated'] as const).entries()){
 const g=new Pixels(72,120);
 for(const [a,b]of edges)g.line(...joints[name][a!] as [number,number],...joints[name][b!] as [number,number],a!>=8?49:54);
 for(const v of joints[name])g.oval(v[0]!,v[1]!,1,1,61);
 if(name==='seated'){g.line(18,82,49,82,39);g.oval(38,40,6,8,39);g.poly([[31,67],[44,68],[49,74],[35,73]],58);}
 const p=new Pixels(72,120,18);
 if(name!=='seated'){const m=loadIndexed(join(here,'source',name+'-master.png'),pal);p.paste(m,0,0);writeFileSync(join(here,'source',name+'-guide.pxo'),pixeloramaProject(pal,['Fixed character','Joint annotation — hidden'],[[m,g]],[],{layers:[{locked:true},{visible:false}],currentLayer:1}));}
 p.paste(g,0,0);sheet.paste(p,index*72,0);sheet.text(name.toUpperCase(),index*72+5,124,62);
 if(name==='seated')enlarged(join(here,'guides/watson-seated-plan.png'),p,pal,5);
}
enlarged(join(here,'guides/cast-joints.png'),sheet,pal,4);
writeFileSync(join(here,'guides/joints.json'),JSON.stringify({canvas:[72,120],anchor:[36,113],edges,labels:['head','neck','farShoulder','farElbow','farHand','nearShoulder','nearElbow','nearHand','pelvis','farKnee','farAnkle','nearKnee','nearAnkle'],joints,status:'Standing joint annotations; seated is pre-drawing staging. Covered joints are estimates, not a solved rig.'},null,2)+'\n');
