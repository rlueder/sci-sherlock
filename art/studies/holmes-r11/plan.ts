/** Full-body staging guides; annotations, not a deforming character rig. */
import {readFileSync,writeFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';import {join} from 'node:path';
import {Pixels} from '../../source/pixels.ts';import {enlarged} from '../../source/study-tools.ts';
const here=fileURLToPath(new URL('.',import.meta.url)),palette=JSON.parse(readFileSync(join(here,'../../reference/holmes-master-v2/palette.json'),'utf8'));
// head, neck, far shoulder/elbow/hand, near shoulder/elbow/hand,
// pelvis, far knee/ankle, near knee/ankle. All points projected into 72x120.
const neutral=[[36,18],[35,29],[28,31],[23,45],[23,52],[40,31],[47,45],[43,41],[34,62],[30,86],[29,112],[41,84],[43,109]];
const poses={
 kneel:[neutral,[[41,31],[39,42],[31,43],[29,60],[34,73],[44,45],[52,59],[52,75],[32,76],[21,92],[16,112],[45,88],[51,112]],[[45,44],[41,55],[33,56],[32,73],[39,89],[46,58],[54,74],[57,95],[29,84],[26,110],[14,112],[46,89],[51,112]],[[45,46],[41,57],[33,58],[33,74],[40,89],[46,59],[54,77],[57,97],[29,84],[26,110],[14,112],[46,89],[51,112]]],
 reach:[neutral,[[36,18],[35,29],[28,31],[23,45],[23,52],[40,31],[50,39],[52,32],[34,62],[30,86],[29,112],[41,84],[43,109]],[[38,19],[37,30],[30,32],[25,46],[25,53],[42,32],[52,37],[64,35],[35,62],[30,86],[29,112],[42,84],[45,109]],[[38,19],[37,30],[30,32],[25,46],[25,53],[42,32],[54,38],[65,36],[35,62],[30,86],[29,112],[42,84],[45,109]]]
};
const edges=[[0,1],[2,1],[1,5],[2,3],[3,4],[5,6],[6,7],[1,8],[8,9],[9,10],[8,11],[11,12]];
for(const [name,keys]of Object.entries(poses)){const sheet=new Pixels(288,120,18);for(const [i,j]of keys.entries()){const p=new Pixels(72,120,18);p.line(0,113,71,113,24);for(const [a,b]of edges)p.line(...j[a!] as [number,number],...j[b!] as [number,number],a!>=8?49:54);for(const v of j)p.oval(v[0]!,v[1]!,1,1,61);p.oval(j[0]![0]!,j[0]![1]!,6,8,39);p.text(String(i),3,3,62);sheet.paste(p,72*i,0);}enlarged(join(here,'review/'+name+'-plan.png'),sheet,palette,3);}
writeFileSync(join(here,'pose-plan.json'),JSON.stringify({canvas:[72,120],anchor:[36,113],edges,labels:['head','neck','farShoulder','farElbow','farHand','nearShoulder','nearElbow','nearHand','pelvis','farKnee','farAnkle','nearKnee','nearAnkle'],poses,status:'Pre-drawing staging estimates; trace actual joints after full-pose rendering'},null,2)+'\n');
