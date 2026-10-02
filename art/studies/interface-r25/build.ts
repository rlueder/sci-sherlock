/** Victorian UI: stored painted masters, fixed-palette native exports, editable Pixelorama. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {decodePng} from 'sci2-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {clone,loadIndexed,enlarged} from '../../source/study-tools.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const h='art/studies/interface-r25/',pal:string[]=JSON.parse(readFileSync('art/palette.json','utf8'));
const rgb=pal.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16))),raw=decodePng(readFileSync(h+'generated/icon-masters.png'));
const views:any[]=[],jobs:any[]=[];writeFileSync(h+'palette.json',JSON.stringify(pal,null,2)+'\n');
function sample(x:number,y:number,w:number,hh:number,n:number){const p=new Pixels(n,n);for(let yy=0;yy<n;yy++)for(let xx=0;xx<n;xx++){const at=(Math.floor(y+(yy+.5)*hh/n)*raw.width+Math.floor(x+(xx+.5)*w/n))*4;let best=Infinity,k=0;rgb.forEach((v,i)=>{const d=2*(v[0]!-raw.data[at]!)**2+4*(v[1]!-raw.data[at+1]!)**2+(v[2]!-raw.data[at+2]!)**2;if(d<best){best=d;k=i}});p.dot(xx,yy,k)}return p}
function save(name:string,number:number,loops:Pixels[][],anchors:number[][]){loops.forEach((fs,l)=>{fs.forEach((p,c)=>writeFileSync(h+`export/${name}-${l}-${c}.png`,p.png(pal)));const key=name+'-'+l;writeFileSync(h+`source/${key}.pxo`,pixeloramaProject(pal,[name],fs.map(p=>[p]),[],{fps:6}));jobs.push({name:key,expected:fs.map((_,c)=>`export/${name}-${l}-${c}.png`)})});views.push({number,loops:loops.map((fs,l)=>({cels:fs.map((_,c)=>({png:`export/${name}-${l}-${c}.png`,anchor:anchors[l]}))}))})}
const crops=[[21,25,475,464],[530,25,478,464],[1039,25,478,464],[21,531,475,460],[530,531,478,460],[1039,531,478,460]];
const normal=crops.map(([x,y,w,hh])=>sample(x!,y!,w!,hh!,24));
// Use one approved square bezel for all six buttons. Keep pictorial centers untouched.
const bezel=clone(normal[1]!);for(let y=0;y<24;y++)for(let x=0;x<24;x++)if(x>=3&&x<=20&&y>=3&&y<=20)bezel.dot(x,y,-1);
normal.forEach(p=>p.paste(bezel,0,0));
const picked=normal.map(p=>{const q=clone(p);for(let y=0;y<24;y++)for(let x=0;x<24;x++){if(x<3||x>20||y<3||y>20){const c=q.data[y*24+x]!;const lifts:Record<number,number>={9:29,15:41,16:45,23:48,28:50,29:51,31:55,41:55,44:61,45:61,48:61,50:61,55:62,61:62};q.dot(x,y,lifts[c]??c)}}q.line(7,22,16,22,62);q.dot(11,21,62);q.dot(12,21,62);return q});
save('icon-bar',266,[normal,picked],[[0,0],[0,0]]);writeFileSync(h+'source/bezel.png',bezel.png(pal));
// Frameless symbols have their background removed from edges, preserving enclosed dark detail.
function cutout(p:Pixels){const q=clone(p),todo:number[]=[],seen=new Set<number>();for(let x=0;x<p.width;x++)todo.push(x,(p.height-1)*p.width+x);for(let y=0;y<p.height;y++)todo.push(y*p.width,y*p.width+p.width-1);while(todo.length){const i=todo.pop()!;if(seen.has(i))continue;seen.add(i);const c=q.data[i]!;if(c>=0&&c>9)continue;q.data[i]=-1;const x=i%q.width,y=Math.floor(i/q.width);if(x)todo.push(i-1);if(x<q.width-1)todo.push(i+1);if(y)todo.push(i-q.width);if(y<q.height-1)todo.push(i+q.width)}return q}
const symbols=crops.map(([x,y,w,hh])=>cutout(sample(x!+w!*.105,y!+hh!*.105,w!*.79,hh!*.79,16)));
// Mouth is a silhouette of lips, not a rectangular cheek crop.
const lips=sample(174,655,200,127,16),lipMask=new Pixels(16,16);lipMask.poly([[0,8],[5,4],[8,5],[12,3],[15,5],[14,10],[9,13],[4,12]],1);for(let i=0;i<256;i++)if(lipMask.data[i]!<0)lips.data[i]=-1;symbols[3]=lips;
// Suppress disconnected source-frame specks after the crop, retaining the main silhouette.
function largest(p:Pixels){const seen=new Set<number>(),groups:number[][]=[];for(let i=0;i<p.data.length;i++){if(seen.has(i)||p.data[i]!<0)continue;const group:number[]=[],todo=[i];while(todo.length){const j=todo.pop()!;if(seen.has(j)||p.data[j]!<0)continue;seen.add(j);group.push(j);const x=j%p.width,y=Math.floor(j/p.width);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(x+dx>=0&&x+dx<p.width&&y+dy>=0&&y+dy<p.height)todo.push((y+dy)*p.width+x+dx)}groups.push(group)}groups.sort((a,b)=>b.length-a.length);for(const g of groups.slice(1))if(g.length<5)for(const i of g)p.data[i]=-1;return p}
symbols.forEach(largest);for(let i=0;i<symbols[0]!.data.length;i++){const c=symbols[0]!.data[i]!;symbols[0]!.data[i]=({9:29,15:41,16:45,23:48,28:50,29:51,31:55} as Record<number,number>)[c]??c;}
const wait=new Pixels(16,16);wait.oval(8,8,6,7,9);wait.oval(8,8,5,6,48);wait.oval(8,8,4,5,61);wait.oval(8,8,3,4,62);wait.line(8,8,8,4,29);wait.line(8,8,11,9,29);wait.rect(6,0,4,2,55);wait.dot(8,0,62);symbols.push(wait);
const names=['walk','look','use','talk','wait'],anchors=[[9,14],[5,5],[12,2],[8,8],[8,8]];
names.forEach((n,i)=>save(n,261+i,[[i===4?wait:symbols[i]!]],[anchors[i]!]));
const lens24=largest(cutout(sample(586,80,363,361,24)));save('lens',250,[[lens24],[symbols[1]!]],[[0,0],[5,5]]);
// Every cel is 14x14 for compiler loop invariance; edge ink occupies six pixels.
const corner=sample(530,25,110,110,14);for(let y=0;y<14;y++)for(let x=0;x<14;x++){const i=y*14+x;if(corner.data[i]!<=9)corner.data[i]=-1;}
largest(corner);
const tiles:Pixels[]=[];for(let i=0;i<4;i++){const p=new Pixels(14,14);for(let y=0;y<14;y++)for(let x=0;x<14;x++)p.dot(x,y,corner.data[(i>=2?13-y:y)*14+(i%2?13-x:x)]!);tiles.push(p)}
// Runtime order is TL TR BL BR TOP BOTTOM LEFT RIGHT (lib/996.sc).
for(let i=0;i<4;i++){const p=new Pixels(14,14);for(let a=0;a<14;a++)for(let b=0;b<6;b++){const c=[9,48,61,a%2?29:55,48,9][b]!;p.dot(i<2?a:i===2?b:13-b,i===0?b:i===1?13-b:a,c)}tiles.push(p)}save('box-frame',260,[tiles],[[0,0]]);
function panel(w:number,hh:number,fill:number){const p=new Pixels(w,hh,fill);for(let x=14;x<w;x+=14){p.paste(tiles[4]!,x,0);p.paste(tiles[5]!,x,hh-14)}for(let y=14;y<hh;y+=14){p.paste(tiles[6]!,0,y);p.paste(tiles[7]!,w-14,y)}p.paste(tiles[0]!,0,0);p.paste(tiles[1]!,w-14,0);p.paste(tiles[2]!,0,hh-14);p.paste(tiles[3]!,w-14,hh-14);return p}
const toolbar=panel(320,40,4);normal.forEach((p,i)=>toolbar.paste(i===0?picked[i]!:p,10+i*28+(i>=4?28:0),8));toolbar.line(211,8,211,31,48);toolbar.text('STOPPED CLOCKS',221,12,61);toolbar.text('Walk',221,24,58);writeFileSync(h+'export/toolbar-skin.png',toolbar.png(pal));
const room=loadIndexed('art/studies/baker-street-r13/export/background.png',pal),scene=clone(room);scene.paste(toolbar,0,0);enlarged(h+'review/toolbar.png',scene,pal,3);
const speech=clone(room),box=panel(226,64,62);box.text('HOLMES',18,18,29);box.text('The clock has stopped at 3:17.',18,31,2);box.text('A curious coincidence, Watson.',18,43,2);speech.paste(box,86,11);const surround=loadIndexed('art/studies/portraits-r22/export/surround.png',pal),face=loadIndexed('art/studies/portraits-r23/export/holmes-0-0.png',pal);speech.paste(surround,7,3);speech.paste(face,15,21);enlarged(h+'review/dialogue.png',speech,pal,3);
const oldLayout=clone(room),oldPanel=panel(320,68,62);normal.forEach((p,i)=>oldPanel.paste(i===0?picked[i]!:p,22+i*28+(i>=4?28:0),22));oldLayout.paste(oldPanel,0,0);enlarged(h+'review/existing-layout.png',oldLayout,pal,3);
const board=new Pixels(320,196,4);board.text('VICTORIAN INTERFACE / NATIVE 24PX',12,8,61);normal.forEach((p,i)=>board.paste(p,12+i*49,26));picked.forEach((p,i)=>board.paste(p,12+i*49,62));['WALK','LOOK','USE','TALK','BAG','MENU'].forEach((n,i)=>board.text(n,12+i*49,52,58));names.forEach((n,i)=>{board.paste(i===4?wait:symbols[i]!,14+i*49,101);board.text(n.toUpperCase(),12+i*49,122,58)});board.paste(lens24,258,99);board.paste(panel(296,48,62),12,141);board.text('THE STOPPED CLOCKS',30,154,29);board.text('Carved gilt, velvet and ivory.',30,169,2);enlarged(h+'review/interface.png',board,pal,3);
for(const[name,p]of [['toolbar-skin',toolbar]] as const){writeFileSync(h+`source/${name}.pxo`,pixeloramaProject(pal,[name],[[p]]));jobs.push({name,expected:[`export/${name}.png`]})}
['Walk','Look','Use','Talk','Inventory','Menu'].forEach((name,i)=>{const p=new Pixels(93,10,4);p.text(name,0,0,58);writeFileSync(h+`review/action-label-${i}.png`,p.png(pal))});
const old=JSON.parse(readFileSync('art/studies/interface-r20/art.json','utf8'));writeFileSync(h+'export/dialogue-font.png',readFileSync('art/studies/interface-r20/export/dialogue-font.png'));
writeFileSync(h+'art.json',JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[],views,fonts:old.fonts},null,2)+'\n');writeFileSync(h+'native-jobs.json',JSON.stringify(jobs,null,2)+'\n');
writeFileSync(h+'guides/handoff.json',JSON.stringify({status:'review study, not registered',iconOrder:['walk','look','do','talk','inventory','menu'],icons:{view:266,size:[24,24],loops:{normal:0,picked:1}},frame:{view:260,cornerSize:[14,14],horizontalEdge:[14,14],verticalEdge:[14,14],order:['top-left','top-right','bottom-left','bottom-right','top','bottom','left','right']},colours:{paper:62,ink:2,border:48,toolbarInterior:4},proposedToolbar:{size:[320,40],iconOrigin:[10,8],iconStep:28,activeItemSlot:[122,8,24,24],inventoryX:150,menuX:178,skin:'export/toolbar-skin.png',requires:'Engine layout change; skin is an unregistered optional compositing reference.'},cursors:names.map((name,i)=>({name,view:261+i,anchor:anchors[i]})),cropRectangles:crops},null,2)+'\n');
assert.equal(normal.length,6);console.log({views:views.length,nativeProjects:jobs.length,icons:'24x24',frame:'14px canvas / 6px edge ink',palette:64});
