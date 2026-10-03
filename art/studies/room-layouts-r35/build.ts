/** Layout candidates. Native export and actor proofs, no production registration. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,clone,enlarged} from '../../source/study-tools.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const root='art/studies/room-layouts-r35/',pal:string[]=JSON.parse(readFileSync(root+'palette.json','utf8'));
type Point=[number,number];
const config:Record<string,{feet:Point;watson:Point;band:Point[];fg:Point[][];plaque?:Point;door?:number[]}>={
 'street-a':{feet:[139,149],watson:[187,149],band:[[48,140],[207,140],[213,157],[46,157]],plaque:[77,39],door:[71,43,102,116],fg:[[[271,30],[286,31],[291,39],[294,44],[306,53],[314,61],[319,65],[319,199],[228,199],[223,168],[225,151],[232,139],[243,132],[245,61],[257,61],[262,50],[268,43]]]},
 'street-b':{feet:[178,150],watson:[261,151],band:[[117,140],[292,140],[296,161],[111,161]],plaque:[199,32],door:[192,39,223,115],fg:[[[0,43],[17,37],[35,33],[44,41],[54,53],[56,64],[87,71],[96,79],[101,91],[99,99],[93,100],[93,161],[98,174],[91,198],[0,199]]]},
 'street-c':{feet:[128,163],watson:[178,164],band:[[45,152],[202,152],[204,173],[42,173]],plaque:[93,42],door:[90,48,119,126],fg:[[[306,28],[319,23],[319,199],[257,199],[262,175],[247,156],[235,162],[222,156],[224,142],[221,133],[230,113],[235,105],[242,101],[238,80],[246,88],[253,88],[254,75],[261,86],[271,92],[284,106],[292,123],[307,131],[319,130],[319,63],[295,63],[294,56],[303,44]]]},
 stair:{feet:[126,178],watson:[211,181],band:[[64,161],[246,161],[256,195],[59,195]],fg:[[[0,0],[47,0],[47,177],[0,191]],[[47,0],[313,0],[313,10],[47,10]],[[48,10],[66,10],[66,148],[48,148]],[[260,10],[276,10],[276,149],[260,149]]]}
};
const save=(f:string,p:Pixels)=>writeFileSync(root+f,p.png(pal));
const holmes=loadIndexed('art/reference/holmes-master-v2/master.png',pal),watson=loadIndexed('art/studies/baker-street-r13/export/watson-standing.png',pal);
function actor(scene:Pixels,p:Pixels,feet:Point){const s=feet[1]/176,w=Math.round(p.width*s),h=Math.round(p.height*s),out=new Pixels(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)out.dot(x,y,p.data[Math.min(p.height-1,Math.floor(y/s))*p.width+Math.min(p.width-1,Math.floor(x/s))]!);scene.paste(out,feet[0]-Math.round(36*s),feet[1]-Math.round(113*s));}
const glyphs:Record<string,string[]>= {'2':['110','001','010','100','111'],'1':['010','110','010','010','111'],'B':['110','101','110','101','110']};
const jobs:any[]=[],fit:any={status:'Composition options, not production resources',camera:{horizon:0,fullSize:176,pixelAspect:1.2},notes:['Street placements follow the final painted pavement, which differs from the Blender blockout.','Street feet are farther back than 221B; the same perspective formula sizes the unchanged masters.','Cab/horse masks are proof extractions; select a composition before final occlusion cleanup and animation.','Stair axis runs along world +Y with decreasing Z, no lateral run.','The stair run is an artistic long shallow flight for visibility under the level camera, not a surveyed period stair.'],variants:{}};
const board=new Pixels(640,432,18);
Object.entries(config).forEach(([key,c],index)=>{
 const room=loadIndexed(root+`source/${key}-native.png`,pal);
 if(c.plaque){const [x,y]=c.plaque;room.rect(x,y,19,7,3);room.line(x,y,x+18,y,45);for(const [i,ch]of [...'221B'].entries())glyphs[ch]!.forEach((r,yy)=>[...r].forEach((v,xx)=>{if(v==='1')room.dot(x+2+i*4+xx,y+1+yy,61)}));}
 const mask=new Pixels(320,200),fg=new Pixels(320,200);c.fg.forEach(points=>mask.poly(points,0));mask.data.forEach((v,i)=>{if(v>=0)fg.data[i]=room.data[i]!});
 save(`export/${key}-background.png`,room);save(`export/${key}-foreground.png`,fg);save(`guides/${key}-foreground-mask.png`,mask);
 const rebuilt=clone(room);rebuilt.paste(fg,0,0);assert.deepEqual(room.data,rebuilt.data);
 writeFileSync(root+`source/${key}.pxo`,pixeloramaProject(pal,['Painted base','Foreground occlusion'],[[room,fg]],[],{userData:'Layout study. Final measured actor strip in guides/painted-fit.json differs from construction. No production registration.'}));jobs.push({name:key,expected:[`export/${key}-background.png`]});
 writeFileSync(root+`source/${key}-foreground.pxo`,pixeloramaProject(pal,['Foreground occlusion'],[[fg]],[]));jobs.push({name:key+'-foreground',expected:[`export/${key}-foreground.png`]});
 const cast=clone(room);actor(cast,holmes,c.feet);actor(cast,watson,c.watson);if(key!=='stair')cast.paste(fg,0,0);
 // The doorway is behind the landing actors, while the cropped case is always near.
 if(key==='stair')for(let y=0;y<200;y++)for(let x=0;x<47;x++){const v=fg.data[y*320+x]!;if(v>=0)cast.dot(x,y,v);}
 enlarged(root+`review/${key}-cast.png`,cast,pal,3);enlarged(root+`review/${key}-empty.png`,room,pal,3);
 const overlay=clone(room);c.band.forEach((p,i)=>overlay.line(...p,...c.band[(i+1)%c.band.length]!,61));enlarged(root+`guides/${key}-painted-overlay.png`,overlay,pal,3);
 const scaleBoard=new Pixels(960,432,18),points=[...c.band,c.feet];points.forEach((feet,i)=>{const p=clone(room);actor(p,holmes,feet);if(key!=='stair')p.paste(fg,0,0);scaleBoard.paste(p,i%3*320,Math.floor(i/3)*216);scaleBoard.text(`${feet[0]},${feet[1]} ${Math.round(feet[1]/176*100)}%`,i%3*320+5,Math.floor(i/3)*216+203,62)});enlarged(root+`review/${key}-scales.png`,scaleBoard,pal,1);
 board.paste(room,index%2*320,Math.floor(index/2)*216);board.text(key.toUpperCase(),index%2*320+6,Math.floor(index/2)*216+203,62);
 writeFileSync(root+`${key}.art.json`,JSON.stringify({version:1,maxColours:64,palette:'palette.json',views:[],pictures:[{number:key==='stair'?103:101,layers:[{png:`export/${key}-background.png`,priority:-1000},{png:`export/${key}-foreground.png`,priority:key==='stair'?153:199}]}]},null,2)+'\n');
 fit.variants[key]={holmes:c.feet,watson:c.watson,walkable:c.band,door:c.door,scaleChecks:points,foregroundPriority:key==='stair'?153:199,plaque:c.plaque};
});
enlarged(root+'review/options.png',board,pal,2);
writeFileSync(root+'native-jobs.json',JSON.stringify(jobs,null,2)+'\n');writeFileSync(root+'guides/painted-fit.json',JSON.stringify(fit,null,2)+'\n');
console.log({variants:4,projects:jobs.length,canvas:[320,200],palette:pal.length});
