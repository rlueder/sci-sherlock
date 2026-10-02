/** Room staging and model scale guides, drawn before the room and cast. */
import {readFileSync,writeFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';import {join} from 'node:path';
import {Pixels} from '../../source/pixels.ts';import {enlarged,loadIndexed} from '../../source/study-tools.ts';
const here=fileURLToPath(new URL('.',import.meta.url)),palette=JSON.parse(readFileSync(join(here,'../../reference/holmes-master-v2/palette.json'),'utf8')) as string[];
const projection=JSON.parse(readFileSync(join(here,'guides/perspective.json'),'utf8'));
const p=new Pixels(320,200,18);p.rect(0,120,320,80,21);
const o=(name:string)=>projection.objects.find((q:any)=>q.name===name);
const face=(name:string,indices:number[],colour:number)=>p.poly(indices.map(i=>o(name).vertices[i]) as [number,number][],colour);
face('Rear wall',[0,1,3,2],18);
face('Window',[0,1,3,2],25);
face('Fireplace and mantel',[0,1,3,2],9);
face('Entry frame',[0,1,3,2],5);
face('Watson chair envelope',[0,1,3,2],13);
face('Chemistry bench',[0,1,3,2],9);
face('Chemistry bench',[2,3,7,6],39);
face('Foreground table',[0,1,3,2],5);
face('Foreground table',[2,3,7,6],29);
for(const obj of projection.objects)for(const [a,b]of obj.edges)p.line(...obj.vertices[a] as [number,number],...obj.vertices[b] as [number,number],55);
const skeleton=new Pixels(320,200);
for(const [name,x,y,h]of [['HOLMES',202,173,106],['WATSON',96,165,83],['HUDSON',270,173,99],['TOBY',247,176,99]] as [string,number,number,number][]){
 skeleton.line(x,y-h+18,x,y-45,54);skeleton.oval(x,y-h+8,6,8,55);skeleton.line(x-12,y-h+28,x+12,y-h+28,54);skeleton.line(x,y-45,x-7,y,54);skeleton.line(x,y-45,x+7,y,54);
}
enlarged(join(here,'guides/layout.png'),p,palette,3);
const staged=new Pixels(320,200);staged.paste(p,0,0);staged.paste(skeleton,0,0);enlarged(join(here,'guides/scale-stage.png'),staged,palette,3);
const master=loadIndexed(join(here,'../../reference/holmes-master-v2/master.png'),palette),lineup=new Pixels(288,120,18);lineup.paste(master,0,0);
const heights=[106,104,99,99];for(let n=0;n<4;n++){const x=n*72;lineup.line(x+2,113,x+70,113,61);lineup.line(x+2,113-heights[n]!,x+70,113-heights[n]!,24);if(n){lineup.oval(x+36,121-heights[n]!,6,8,39);lineup.line(x+36,133-heights[n]!,x+36,68,54);lineup.line(x+23,143-heights[n]!,x+49,143-heights[n]!,54);lineup.line(x+36,68,x+28,113,54);lineup.line(x+36,68,x+44,113,54);}}
enlarged(join(here,'guides/cast-scale.png'),lineup,palette,4);
writeFileSync(join(here,'guides/layout.json'),JSON.stringify({canvas:[320,200],pixelAspect:1.2,room:100,proposedFloor:[[79,151],[267,148],[311,150],[311,193],[79,193]],placements:{holmes:[202,173],watsonSeated:[96,165],mrsHudson:[270,173],toby:[247,176]},targets:{window:[14,20,80,91],fire:[144,99,39,35],lens:[179,74,10,7],door:[273,45,38,100],bench:[211,94,49,53],violin:[34,117,17,35],slipper:[197,86,10,14],correspondence:[133,65,18,13]},characterCanvas:[72,120],characterAnchor:[36,113],heights:{holmes:106,watson:104,hudson:99,toby:99},status:'Proposed composition; trace final painted extents separately; no runtime changes'},null,2)+'\n');
const lines=projection.objects.flatMap((o:any)=>o.edges.map(([a,b]:[number,number])=>'<path d="M'+o.vertices[a].join(',')+'L'+o.vertices[b].join(',')+'" fill="none" stroke="#e5bc6a" stroke-width=".5"/>')).join('');
writeFileSync(join(here,'guides/perspective.svg'),'<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 320 200" preserveAspectRatio="none"><image href="layout.png" width="320" height="200" opacity=".5"/><path d="M0 72H320" stroke="#76a6f5" stroke-width=".5" stroke-dasharray="2 2"/>'+lines+'</svg>');
