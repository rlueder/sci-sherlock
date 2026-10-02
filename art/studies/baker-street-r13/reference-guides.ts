import {readFileSync,writeFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';import {join} from 'node:path';
import {Pixels} from '../../source/pixels.ts';import {loadIndexed,enlarged} from '../../source/study-tools.ts';import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const here=fileURLToPath(new URL('.',import.meta.url)),pal=JSON.parse(readFileSync(join(here,'palette.json'),'utf8'));
const guide=JSON.parse(readFileSync(join(here,'guides/joints.json'),'utf8'));
// Trace the completed drawing. Hidden knees/hips are construction estimates.
const seated=[[35,71],[33,77],[25,79],[22,90],[33,92],[39,79],[43,87],[44,88],[34,96],[31,100],[34,111],[42,97],[43,110]];
const p=loadIndexed(join(here,'export/watson-seated.png'),pal),g=new Pixels(72,120);
for(const [a,b]of guide.edges)g.line(...seated[a] as [number,number],...seated[b] as [number,number],a>=8?49:54);
for(const v of seated)g.oval(v[0]!,v[1]!,1,1,61);
const display=new Pixels(72,120,18);display.paste(p,0,0);display.paste(g,0,0);
enlarged(join(here,'guides/watson-seated-trace.png'),display,pal,5);
writeFileSync(join(here,'source/watson-seated-guide.pxo'),pixeloramaProject(pal,['Fixed seated model','Joint trace — hidden'],[[p,g]],[],{layers:[{locked:true},{visible:false}]}));
writeFileSync(join(here,'guides/seated-joints.json'),JSON.stringify({labels:guide.labels,edges:guide.edges,joints:seated,status:'Trace of completed seated drawing; occluded joints estimated. Original pre-drawing plan retained separately.'},null,2)+'\n');
const sheet=new Pixels(320,106,18),models=JSON.parse(readFileSync(join(here,'models.json'),'utf8'));
const boxes:Record<string,number[]>={watson:[24,8,30,27],hudson:[24,13,30,28],toby:[24,13,30,29]};
for(const [i,name]of ['watson','hudson','toby'].entries()){
 const m=loadIndexed(join(here,'source/'+name+'-master.png'),pal),[x,y,w,h]=boxes[name]!,head=new Pixels(w!,h!);head.paste(m,-x!,-y!);
 writeFileSync(join(here,'source/'+name+'-head.png'),head.png(pal));sheet.paste(head,i*106+33,8);sheet.text(name.toUpperCase(),i*106+10,42,62);
 const entries=new Map<number,number>();for(const c of m.data)if(c>=0)entries.set(c,(entries.get(c)??0)+1);
 const colours=[...entries].sort((a,b)=>b[1]-a[1]).slice(0,12).map(([c])=>c);
 colours.forEach((c,j)=>sheet.rect(i*106+9+(j%6)*14,59+Math.floor(j/6)*14,12,12,c));
 models.models[i].head={crop:boxes[name],png:'source/'+name+'-head.png',variant:'neutral-three-quarter-right'};
 models.models[i].dominantPaletteIndices=colours;
}
sheet.text('FIXED NEUTRALS / SHARED PALETTE',10,94,62);enlarged(join(here,'guides/identity-colours.png'),sheet,pal,3);
writeFileSync(join(here,'models.json'),JSON.stringify(models,null,2)+'\n');
const camera=JSON.parse(readFileSync(join(here,'guides/perspective.json'),'utf8')),scene=JSON.parse(readFileSync(join(here,'scene.json'),'utf8'));
const lines=camera.objects.flatMap((o:any)=>o.edges.map(([a,b]:number[])=>'<line x1="'+o.vertices[a!]![0]+'" y1="'+o.vertices[a!]![1]+'" x2="'+o.vertices[b!]![0]+'" y2="'+o.vertices[b!]![1]+'"/>')).join('');
writeFileSync(join(here,'guides/painted-perspective.svg'),'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="960" height="720" viewBox="0 0 320 200" preserveAspectRatio="none"><image width="320" height="200" preserveAspectRatio="none" xlink:href="../source/room-native.png"/><g stroke="#81e2df" opacity=".7" stroke-width=".4" fill="none">'+lines+'<path d="M0 72H320" stroke="#ffdd88"/></g></svg>');
scene.guides={camera:'guides/perspective.json',note:'Intended 26-degree blockout; painting is an interpretation, not a calibrated projection. Overlay exposes deviations for cleanup.',mirroredPreviewCast:['hudson','toby'],joints:'guides/joints.json',seatedTrace:'guides/seated-joints.json'};
writeFileSync(join(here,'scene.json'),JSON.stringify(scene,null,2)+'\n');
