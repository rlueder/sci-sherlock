/** Native-pixel redraw and asset assembly. Overwrites only this study's generated files. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Pixels} from '../../source/pixels.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
import {clone,loadIndexed,enlarged,indexedGif,homography,type Point} from '../../source/study-tools.ts';
const here=fileURLToPath(new URL('.',import.meta.url)),root=fileURLToPath(new URL('../../../',import.meta.url));
for(const dir of ['export','source','review'])mkdirSync(join(here,dir),{recursive:true});
const palette=JSON.parse(readFileSync(join(root,'art/approved/workshop-v6/palette.json'),'utf8')) as string[];
const read=(path:string)=>loadIndexed(join(root,path),palette);
const old=(name:string)=>read('art/production/workshop-r3/export/'+name+'.png');
const r4=(name:string)=>read('art/studies/clock-perspective-r4/export/'+name+'.png');
const ref=read('art/approved/workshop-v6/workshop-320x200.png');
const base=old('workshop'),originalFront=old('workshop-front'),standing=new Pixels(72,120);
standing.paste(old('holmes-east-00'),0,0); // four transparent rows accommodate foreshortened feet
const clockOriginal=old('clock-00'),clockBackground=r4('background-study');
for(let y=0;y<140;y++)for(let x=0;x<64;x++)if(clockOriginal.data[y*64+x]!>=0){const at=(14+y)*320+238+x;base.data[at]=clockBackground.data[at]!;}
const save=(name:string,p:Pixels)=>writeFileSync(join(here,'export',name+'.png'),p.png(palette));
const preview=(name:string,p:Pixels,scale=3)=>enlarged(join(here,'review',name+'.png'),p,palette,scale);
const master=(name:string,layers:string[],frames:Pixels[][],tags:{name:string;from:number;to:number}[]=[])=>writeFileSync(join(here,'source',name+'.pxo'),pixeloramaProject(palette,layers,frames,tags));
const pad=(n:number)=>String(n).padStart(2,'0');

// Transfer the existing tabletop and apron pixels to coherent projected planes.
const desk=JSON.parse(readFileSync(join(here,'desk.json'),'utf8')) as {sourceQuads:Record<string,Point[]>;targetQuads:Record<string,Point[]>;vanishingPoints:Point[];perpendicularDot:number};
assert.ok(Math.abs(desk.perpendicularDot)<1e-6);
const foreground=clone(originalFront),deskMask=new Pixels(320,200);
for(const q of Object.values(desk.sourceQuads))deskMask.poly(q,0);
for(const q of Object.values(desk.targetQuads))deskMask.poly(q,0);
for(let i=0;i<deskMask.data.length;i++)if(deskMask.data[i]===0)foreground.data[i]=-1;
for(const name of ['front','right','top']){
 const target=desk.targetQuads[name]!,source=desk.sourceQuads[name]!,inverse=homography(target,source),mask=new Pixels(320,200);mask.poly(target,0);
 for(let y=0;y<200;y++)for(let x=0;x<320;x++)if(mask.data[y*320+x]===0){const [sx,sy]=inverse(x+.5,y+.5);const ix=Math.max(0,Math.min(319,Math.floor(sx))),iy=Math.max(0,Math.min(199,Math.floor(sy)));foreground.dot(x,y,ref.data[iy*320+ix]!);}
}
// The near leg stays vertical and meets the corrected apron. Original wood pixels
// are extended only in the newly exposed two-row joint, never across the whole room.
for(let y=190;y<194;y++)for(let x=58;x<65;x++)if(originalFront.data[y*320+x]!>=0)foreground.dot(x,y,originalFront.data[y*320+x]!);
// The candlestick rises out of the top plane and must not be flattened with it.
for(let y=132;y<164;y++)for(let x=0;x<15;x++)if(originalFront.data[y*320+x]!>=0)foreground.dot(x,y,originalFront.data[y*320+x]!);
let deskChanged=0;for(let i=0;i<foreground.data.length;i++)if(foreground.data[i]!==originalFront.data[i]){deskChanged++;assert.ok(deskMask.data[i]===0||i%320<15,'desk change outside local correction');}
save('workshop-front',foreground);save('desk-before',originalFront);save('desk-change-mask',deskMask);

// Reconstruct trousers from the Blender joints. No original leg fragment is rotated.
type Leg={phase:number;hip:Point;knee:Point;ankle:Point;sole:Point;toe:Point;heel:Point;flatContact:boolean;lengths:number[]};
type Pose={phase:string;travel:number;travelY:number;bob:number;legs:{near:Leg;far:Leg}};
const motion=JSON.parse(readFileSync(join(here,'motion.json'),'utf8')) as {fps:number;stepPixels:number;stepY:number;legLength:number;poses:Pose[]};
const layers:Pixels[][]=[[new Pixels(72,120),clone(standing),new Pixels(72,120)]],walks=[standing],guides:Pixels[]=[];
const local=([x,y]:Point):Point=>[x-108,y-52];
function band(p:Pixels,a:Point,b:Point,wa:number,wb:number,col:number){
 const length=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=(b[1]-a[1])/length,ny=-(b[0]-a[0])/length;
 p.poly([[a[0]-nx*wa,a[1]-ny*wa],[a[0]+nx*wa,a[1]+ny*wa],[b[0]+nx*wb,b[1]+ny*wb],[b[0]-nx*wb,b[1]-ny*wb]],col);
}
function legPixels(leg:Leg,near:boolean){
 const p=new Pixels(72,120),h=local(leg.hip),k=local(leg.knee),a=local(leg.ankle),s=local(leg.sole),toe=local(leg.toe),heel=local(leg.heel);
 band(p,h,k,near?4:3.2,3.3,near?7:4);band(p,k,a,3.3,near?2.9:2.5,near?7:4);
 // Long cloth clusters follow the limb, with short knee folds and a dark inseam.
 band(p,[h[0]-.7,h[1]],[k[0]-.7,k[1]],1.5,1.2,near?17:10);
 band(p,[k[0]-.7,k[1]],[a[0]-.5,a[1]],1.1,.8,near?17:10);
 p.line(k[0]-2,k[1],k[0]+1,k[1]+1,near?24:12);
 p.line(k[0],k[1]+2,k[0]+2,k[1]+3,4);
 p.line(a[0]-2,a[1]-2,a[0]+1,a[1]-1,near?24:7);
 const x=s[0],y=s[1],tx=toe[0],ty=toe[1],hx=heel[0],hy=heel[1];
 if(leg.phase===0){ // heel strike: toe still raised
  p.poly([[hx,hy-3],[x+2,y-3],[tx,ty-3],[tx+1,ty-1],[tx-1,ty],[hx-1,hy]],1);
  p.line(x,y-2,tx-1,ty-2,17);
 }else if(leg.phase===4){ // toe-off: rear of shoe lifts
  p.poly([[hx,hy-5],[x+1,y-4],[tx,ty-2],[tx+1,ty],[tx-2,ty+1],[hx-1,hy-2]],1);
  p.line(x,y-3,tx-1,ty-1,10);
 }else{
  p.poly([[hx-1,hy-3],[x+1,y-4],[x+3,y-2],[tx,ty-1],[tx+1,ty+1],[tx-2,ty+2],[hx-1,hy+1]],1);
  p.line(x-1,y-2,tx-1,ty-1,17);p.line(tx-2,ty,tx,ty,7);
 }
 return p;
}
for(let f=0;f<8;f++){
 const pose=motion.poses[f]!,rear=legPixels(pose.legs.far,false),near=legPixels(pose.legs.near,true),body=new Pixels(72,120);
 // Keep approved head, hat, pipe and fabric pixels. The shoulder and coat response
 // is articulated row by row, while the newly drawn legs carry the weight transfer.
 const lean=[0,0,1,1,0,0,-1,-1][f]!,hem=[-1,-2,-1,0,1,2,1,0][f]!;
 for(let y=0;y<69;y++)for(let x=0;x<72;x++){
  const c=standing.data[y*72+x]!;if(c<0)continue;
  const shift=y<35?lean:Math.round(lean*(65-y)/30);
  const tail=y>66?Math.round(hem*(y-66)/17):0;
  body.dot(x+shift+tail,y+pose.bob,c);
 }
 // Two long overcoat skirts overlap the thighs at different depths. Transfer the
 // reference cloth into their changing silhouettes; the hem follows the stride.
 const coatPanels=[
  {source:[[20,62],[34,62],[31,83],[18,82]] as Point[],target:[[20,62+pose.bob],[34,62+pose.bob],[31+hem,86+pose.bob],[17+hem,83+pose.bob]] as Point[]},
  {source:[[34,62],[43,61],[45,82],[34,81]] as Point[],target:[[34,62+pose.bob],[43,61+pose.bob],[44-hem*.5,84+pose.bob],[34,86+pose.bob]] as Point[]}
 ];
 for(const panel of coatPanels){const mask=new Pixels(72,120);mask.poly(panel.target,0);const map=homography(panel.target,panel.source);
  for(let y=62;y<91;y++)for(let x=12;x<49;x++)if(mask.data[y*72+x]===0){const [sx,sy]=map(x+.5,y+.5),c=standing.data[Math.floor(sy)*72+Math.floor(sx)]!;body.dot(x,y,c>=0?c:7);}}
 body.line(31+hem,84+pose.bob,34,86+pose.bob,4);
 body.line(35,65+pose.bob,34,84+pose.bob,4);
 const cel=clone(rear);cel.paste(near,0,0);cel.paste(body,0,0);
 layers.push([rear,body,near]);walks.push(cel);
 const guide=new Pixels(72,120,18);guide.paste(cel,0,0);
 for(const [which,col]of [['far',49],['near',55]] as const){const l=pose.legs[which];guide.line(...local(l.hip),...local(l.knee),col);guide.line(...local(l.knee),...local(l.ankle),col);for(const p of [l.hip,l.knee,l.ankle])guide.oval(...local(p),1,1,col);}
 for(const l of Object.values(pose.legs)){const s=local(l.sole);guide.line(s[0]-4,s[1],s[0]+5,s[1]+1,40);}guides.push(guide);
}
walks.forEach((p,i)=>save('holmes-east-'+pad(i),p));
// Layer order is rear legs, near legs, coat/body. Keep that same order on export.
master('holmes',['far leg','near leg','coat and body'],layers.map(([rear,body,near])=>[rear!,near!,body!]),[{name:'east-walk',from:2,to:9}]);
master('walk-guides',['pose and contact'],guides.map(p=>[p]));
const lengths=motion.poses.flatMap(p=>Object.values(p.legs).flatMap(l=>l.lengths));
assert.ok(Math.max(...lengths)-Math.min(...lengths)<1e-6,'construction leg lengths changed');
const flatWorld=motion.poses.slice(1,4).map(p=>p.travel+p.legs.near.sole[0]);
const plantedDrift=Math.max(...flatWorld)-Math.min(...flatWorld);assert.ok(plantedDrift<.0001);
const flatWorldY=motion.poses.slice(1,4).map(p=>p.travelY+p.legs.near.sole[1]);
const plantedDriftY=Math.max(...flatWorldY)-Math.min(...flatWorldY);assert.ok(plantedDriftY<.0001);

// Existing fixed-housing lantern and approved rigid clock turn.
const lamps=Array.from({length:4},(_,i)=>old('lantern-'+pad(i))),clocks=Array.from({length:8},(_,i)=>r4('clock-'+pad(i)));
lamps.forEach((p,i)=>save('lantern-'+pad(i),p));clocks.forEach((p,i)=>save('clock-'+pad(i),p));
master('lantern',['housing and flame'],lamps.map(p=>[p]));master('clock',['rigid case'],clocks.map(p=>[p]));

// Interactive clue states: a concentrated patch, then the patch plus a trail.
const filings=[new Pixels(72,20),new Pixels(72,20)];
const shaving=(p:Pixels,x:number,y:number,n:number)=>{p.line(x,y,x+2,y,9);p.dot(x,y-1,n%3?40:53);p.dot(x+1,y,n%3?29:51);if(n%5===0)p.dot(x+2,y-1,55);};
for(let i=0;i<11;i++)shaving(filings[0]!,5+(i*7)%16,4+(i*11)%9,i);
filings[1]!.paste(filings[0]!,0,0);
for(let i=0;i<24;i++){const x=23+i*1.7,y=10+Math.sin(i/6)*3;shaving(filings[1]!,x,y,i);}
filings.forEach((p,i)=>save('filings-'+pad(i),p));master('filings',['metal shavings'],filings.map(p=>[p]));
const scratches=new Pixels(16,12);for(let i=0;i<3;i++){scratches.line(2+i*3,3+i,8+i*2,6+i,9);scratches.line(2+i*3,4+i,8+i*2,7+i,51);}save('scratches',scratches);master('scratches',['fresh floor grooves'],[[scratches]]);
const lens=(size:number,cx:number,cy:number,r:number)=>{const p=new Pixels(size,size);p.oval(cx,cy,r+1,r+1,9);p.oval(cx,cy,r,r,55);p.oval(cx,cy,r-1,r-1,31);p.oval(cx,cy,r-2,r-2,-1);p.line(cx-r+2,cy-2,cx-2,cy-r+2,62);p.line(cx+1,cy+r-2,cx+r-2,cy+1,40);band(p,[cx+r-1,cy+r-1],[size-2,size-2],2,1.5,9);p.line(cx+r,cy+r,size-2,size-2,32);return p;};
const icon=lens(24,8,8,7),cursor=lens(16,6,6,5);save('lens-icon',icon);save('lens-cursor',cursor);master('lens-icon',['brass lens'],[[icon]]);master('lens-cursor',['lens cursor'],[[cursor]]);
const dial=read('art/export/dial-inspection.png');save('dial-inspection',dial);master('dial-inspection',['stopped dial'],[[dial]]);

save('workshop',base);master('workshop',['base','foreground-181'],[[base,foreground]]);
const compose=(frame=0,clock=0,x=144,clues=0,y=165)=>{const p=clone(base);p.paste(lamps[frame%4]!,203,80);p.paste(filings[clues]!,193,146);if(clues)p.paste(scratches,241,146);p.paste(clocks[clock]!,232,0);p.paste(walks[frame]!,x-36,y-113);p.paste(foreground,0,0);return p;};
preview('room',compose());preview('room-clues',compose(0,7,144,1));
const walkFrames=Array.from({length:8},(_,i)=>compose(i+1,0,144,1));
indexedGif(join(here,'review/walk-room.gif'),walkFrames,palette,2);
const moving=Array.from({length:24},(_,i)=>compose(i%8+1,0,114+i*4,1,153+i*motion.stepY));
indexedGif(join(here,'review/walk-travel.gif'),moving,palette,2);
const solo=walks.slice(1).map(p=>{const q=new Pixels(72,120,18);q.paste(p,0,0);return q;});indexedGif(join(here,'review/walk.gif'),solo,palette,3);
const contact=new Pixels(72*4,120*2,18);solo.forEach((p,i)=>contact.paste(p,(i%4)*72,Math.floor(i/4)*120));preview('walk-contact',contact,2);
const guideContact=new Pixels(72*4,120*2,18);guides.forEach((p,i)=>guideContact.paste(p,(i%4)*72,Math.floor(i/4)*120));preview('walk-construction',guideContact,2);
const deskBefore=clone(base);deskBefore.paste(originalFront,0,0);const deskAfter=clone(base);deskAfter.paste(foreground,0,0);preview('desk-before',deskBefore);preview('desk-after',deskAfter);
const assets=new Pixels(400,220,18);assets.paste(walks[3]!,5,20);assets.paste(clocks[4]!,86,0);assets.paste(lamps[0]!,190,30);assets.paste(filings[0]!,170,100);assets.paste(filings[1]!,170,128);assets.paste(scratches,215,160);assets.paste(icon,290,28);assets.paste(dial,270,100);preview('assets',assets);
writeFileSync(join(here,'palette.json'),JSON.stringify(palette,null,2)+'\n');
const seq=(name:string,count:number,anchor:Point)=>({cels:Array.from({length:count},(_,i)=>({png:'export/'+name+'-'+pad(i)+'.png',anchor}))});
const single=(name:string,anchor:Point)=>({cels:[{png:'export/'+name+'.png',anchor}]});
writeFileSync(join(here,'art.json'),JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[{number:102,layers:[{png:'export/workshop.png',priority:-1000},{png:'export/workshop-front.png',priority:181}]}],views:[{number:200,loops:[seq('holmes-east',9,[36,113]),{link:0,mirror:true}]},{number:220,loops:[seq('lantern',4,[10,25])]},{number:221,loops:[seq('clock',8,[60,150])]},{number:227,loops:[seq('filings',2,[36,18])]},{number:228,loops:[single('scratches',[8,11])]},{number:240,loops:[single('dial-inspection',[0,0])]},{number:250,loops:[single('lens-icon',[0,0]),single('lens-cursor',[6,6])]}]},null,2)+'\n');
writeFileSync(join(here,'report.json'),JSON.stringify({status:'workshop perspective, interactive assets and eight-pose walk review; not integrated',deskChangedPixels:deskChanged,deskVanishingPoints:desk.vanishingPoints,deskPlanesPerpendicular:Math.abs(desk.perpendicularDot)<1e-6,walkFrames:8,standingChangedPixels:0,legLengthWorldUnits:motion.legLength,flatContactWorldDriftPixels:[plantedDrift,plantedDriftY],walkFps:motion.fps,travelPixelsPerFrame:[motion.stepPixels,motion.stepY],holmesCanvas:[72,120],holmesAnchor:[36,113],paletteEntries:palette.length,missing:['north/south walk','local age adjustment','Watson','engine placement and choreography']},null,2)+'\n');
console.log({deskChangedPixels:deskChanged,walkFrames:8,plantedDrift,assetViews:7});
