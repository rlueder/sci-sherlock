/** Guard the clean handoff against composited characters and mismatched dial cels. */
import assert from 'node:assert/strict';import {readFileSync,writeFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';import {join} from 'node:path';
import {Pixels} from '../../source/pixels.ts';import {loadIndexed,clone,enlarged} from '../../source/study-tools.ts';
const here=fileURLToPath(new URL('.',import.meta.url)),pal=JSON.parse(readFileSync(join(here,'palette.json'),'utf8'));
const load=(p:string)=>loadIndexed(join(here,p),pal),base=load('../workshop-r9/export/workshop.png'),background=load('export/background-clean.png'),front=load('source/front-317.png');
const oldBase=load('../../reference/holmes-master-v1/review/workshop-clean.png');oldBase.paste(load('../workshop-r9/export/cabinet-patch.png'),0,0);
let changedRoom=0;
for(let y=0;y<200;y++)for(let x=0;x<320;x++){
 const at=y*320+x;
 if(base.data[at]!==oldBase.data[at]){
  changedRoom++;
  assert.ok([[123,45,8],[168,31,6],[219,39,9]].some(([cx,cy,n])=>x>=cx!-2&&x<=cx!+n!&&y>=cy!-2&&y<=cy!+3),'Unexpected room edit at '+x+','+y);
 }
 const tx=x-238,ty=y-14,casePixel=tx>=0&&tx<64&&ty>=0&&ty<140&&front.data[ty*64+tx]!>=0;
 if(!casePixel)assert.equal(background.data[at],base.data[at],'Actor or other overlay leaked into clean background at '+x+','+y);
}
const oldClock=load('../../production/workshop-r3/export/clock-00.png');let changedDial=0;
front.data.forEach((c,i)=>{if(c!==oldClock.data[i]){changedDial++;const x=i%64,y=Math.floor(i/64);assert.ok(x>=34&&x<=44&&y>=33&&y<=38);}});
for(let f=0;f<24;f++){
 const p=load('../workshop-r9/export/pendulum-'+String(f).padStart(2,'0')+'.png');
 assert.equal(p.width,64);assert.equal(p.height,140);
 for(let i=0;i<64*57;i++)assert.equal(p.data[i],front.data[i],'Pendulum dial differs from reveal master');
}
const closed=clone(background);closed.paste(load('export/clock-00.png'),232,0);
const expected=clone(base);expected.paste(front,238,14);assert.deepEqual(closed.data,expected.data,'Clean closed reconstruction');
const room=clone(closed);room.paste(load('../workshop-r9/export/lamp-00.png'),203,80);room.paste(load('../workshop-r9/export/workshop-front.png'),0,0);
enlarged(join(here,'review/handoff-clean-room.png'),room,pal,3);
const detail=new Pixels(112,30,18);for(const [i,[cx,cy]]of [[123,45],[168,31],[219,39],[274,49]].entries()){
 const face=new Pixels(26,30);face.paste(room,13-cx!,15-cy!);detail.paste(face,i*28,0);
}enlarged(join(here,'review/handoff-dials.png'),detail,pal,6);
const result={changedRoomPixels:changedRoom,changedTallCasePixels:changedDial,roomChangesLimitedToThreeHandsets:true,cleanBackgroundMatchesR9OutsideCase:true,pendulumCelsMatchingR12Dial:24,closedCleanReconstructionExact:true};
writeFileSync(join(here,'handoff-check.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
