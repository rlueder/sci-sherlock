/** Preserve the model-led paint as native pixels; provide editable layers and scale proofs. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,clone,enlarged} from '../../source/study-tools.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
const root='art/studies/stair-r38/',pal:string[]=JSON.parse(readFileSync(root+'palette.json','utf8'));
const room=loadIndexed(root+'source/stair-native.png',pal),guide=JSON.parse(readFileSync(root+'guides/stair.json','utf8'));
const save=(n:string,p:Pixels)=>writeFileSync(root+n,p.png(pal));
const layers=[{name:'entrance-door',priority:154,rects:[[0,27,59,127]]},{name:'wall-return',priority:152,rects:[[59,0,18,154],[246,0,18,151],[59,0,205,6]]}];
const pixels=layers.map(l=>{const mask=new Pixels(320,200),p=new Pixels(320,200);l.rects.forEach(([x,y,w,h])=>mask.rect(x!,y!,w!,h!,0));mask.data.forEach((v,i)=>{if(v>=0)p.data[i]=room.data[i]!});save(`export/${l.name}.png`,p);save(`guides/${l.name}-mask.png`,mask);return p});
save('export/background.png',room);const reassembled=clone(room);pixels.forEach(p=>reassembled.paste(p,0,0));assert.deepEqual(reassembled.data,room.data);
const jobs=[{name:'room',expected:['export/background.png']}];
writeFileSync(root+'source/room.pxo',pixeloramaProject(pal,['Painted room',...layers.map(l=>l.name)],[[room,...pixels]],[],{userData:'Blender connected return stair. Final paint is an interpretation; see cutaway and model route. No runtime registration.'}));
pixels.forEach((p,i)=>{const n=layers[i]!.name;writeFileSync(root+`source/${n}.pxo`,pixeloramaProject(pal,[n],[[p]],[]));jobs.push({name:n,expected:[`export/${n}.png`]})});
const holmes=loadIndexed('art/reference/holmes-master-v2/master.png',pal),watson=loadIndexed('art/studies/baker-street-r13/export/watson-standing.png',pal);
function actor(scene:Pixels,src:Pixels,x:number,y:number){const s=y/176,w=Math.round(72*s),h=Math.round(120*s),p=new Pixels(w,h);for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)p.dot(xx,yy,src.data[Math.min(119,Math.floor(yy/s))*72+Math.min(71,Math.floor(xx/s))]!);scene.paste(p,x-Math.round(36*s),y-Math.round(113*s));}
const cast=clone(room);actor(cast,holmes,117,177);actor(cast,watson,230,181);enlarged(root+'review/stair-cast.png',cast,pal,3);enlarged(root+'review/stair-empty.png',room,pal,3);
const board=new Pixels(960,432,18);guide.scaleChecks.forEach((g:any,i:number)=>{const p=clone(room);actor(p,holmes,...g.feet as[number,number]);board.paste(p,i%3*320,Math.floor(i/3)*216);board.text(`${g.feet[0]},${g.feet[1]} ${Math.round(g.scale*100)}%`,i%3*320+5,Math.floor(i/3)*216+203,62)});enlarged(root+'review/scales.png',board,pal,1);
const overlay=clone(room);guide.walkable.forEach((p:[number,number],i:number)=>overlay.line(...p,...guide.walkable[(i+1)%guide.walkable.length] as[number,number],61));enlarged(root+'guides/walkable.png',overlay,pal,3);
writeFileSync(root+'native-jobs.json',JSON.stringify(jobs,null,2)+'\n');
writeFileSync(root+'art.json',JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[{number:103,layers:[{png:'export/background.png',priority:-1000},...layers.map(l=>({png:`export/${l.name}.png`,priority:l.priority}))]}],views:[]},null,2)+'\n');
writeFileSync(root+'guides/handoff.json',JSON.stringify({status:'r38 central rail and plain walls review; not registered',canvas:[320,200],pixelAspect:1.2,perspective:{horizon:0,fullSize:176},walkable:guide.walkable,arrival:[90,174],hero:[117,177],watson:[230,181],hotspots:{entranceDoor:[0,28,58,152],leftStair:[78,139,148,151],turningLanding:[111,138,205,150],lowerRightStair:[152,141,215,151]},layers,notes:['Safe walking remains on the upper landing only.','Both flights have 0.21 m rise and 0.38 m run; landing at -1.68 m and lower return at -3.36 m.','Most stair treads are hidden by the upper floor at this pitch. Only the central rail remains; outer and back guards are replaced by enclosing walls.','The visible entrance is now a door; the clock remains on the workshop side. Engineer should revise caseClock.look and hotspot naming accordingly.','Current story says the pendulum is visible here; this line no longer matches the art.','Side-facing masters are scale references, not final scene performances.','Paint follows a checked model but is not a pixel-exact render of its geometry.']},null,2)+'\n');
console.log({projects:jobs.length,canvas:[320,200],palette:pal.length});
