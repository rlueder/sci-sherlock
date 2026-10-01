/** Convert whole-figure renders to the native palette; never synthesize body parts. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {decodePng} from 'sci-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
import {loadIndexed,enlarged} from '../../source/study-tools.ts';
const here=fileURLToPath(new URL('.',import.meta.url)),root=fileURLToPath(new URL('../../../',import.meta.url));
for(const dir of ['export','review','source'])mkdirSync(join(here,dir),{recursive:true});
const palette=JSON.parse(readFileSync(join(root,'art/approved/workshop-v6/palette.json'),'utf8')) as string[];
const rgb=palette.map(h=>[1,3,5].map(n=>parseInt(h.slice(n,n+2),16)));
const image=decodePng(readFileSync(join(here,'period-pose-source.png')));
const names=['neutral','thinking','cap','watch'],cellW=image.width/2,cellH=image.height/2;
const boxes=names.map((name,i)=>{const ox=(i%2)*cellW,oy=Math.floor(i/2)*cellH;let left=cellW,right=0,top=cellH,bottom=0;
 for(let y=0;y<cellH;y++)for(let x=0;x<cellW;x++)if(image.data[((y+oy)*image.width+x+ox)*4+3]!>=200){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 let footLeft=cellW,footRight=0;
 for(let y=Math.floor(top+(bottom-top)*.85);y<=bottom;y++)for(let x=left;x<=right;x++)if(image.data[((y+oy)*image.width+x+ox)*4+3]!>=200){footLeft=Math.min(footLeft,x);footRight=Math.max(footRight,x);}
 return{name,ox,oy,left,right,top,bottom,anchorX:(footLeft+footRight)/2};});
const scale=106/(boxes[0]!.bottom-boxes[0]!.top+1);
const nearest=(r:number,g:number,b:number)=>{let best=Infinity,index=0;rgb.forEach((c,i)=>{const d=2*(c[0]!-r)**2+4*(c[1]!-g)**2+(c[2]!-b)**2;if(d<best){best=d;index=i;}});return index;};
const poses=boxes.map(box=>{const p=new Pixels(72,120);
 for(let y=0;y<120;y++)for(let x=0;x<72;x++){
  const sx=Math.floor((x+.5-36)/scale+box.anchorX),sy=Math.floor((y+.5-114)/scale+box.bottom);
  if(sx<0||sy<0||sx>=cellW||sy>=cellH)continue;const at=((box.oy+sy)*image.width+box.ox+sx)*4;
  if(image.data[at+3]!>=200)p.dot(x,y,nearest(image.data[at]!,image.data[at+1]!,image.data[at+2]!));
 }
 writeFileSync(join(here,'export',box.name+'.png'),p.png(palette));writeFileSync(join(here,'source',box.name+'.pxo'),pixeloramaProject(palette,['complete re-rendered figure'],[[p]]));return p;});
const contact=new Pixels(72*5,120,18),reference=loadIndexed(join(root,'art/production/workshop-r3/export/holmes-east-00.png'),palette);contact.paste(reference,0,0);poses.forEach((p,i)=>contact.paste(p,(i+1)*72,0));enlarged(join(here,'review/pose-comparison.png'),contact,palette,3);
const base=loadIndexed(join(root,'art/production/workshop-r3/export/workshop.png'),palette),front=loadIndexed(join(root,'art/studies/workshop-r5/export/workshop-front.png'),palette),lamp=loadIndexed(join(root,'art/production/workshop-r3/export/lantern-00.png'),palette),clock=loadIndexed(join(root,'art/production/workshop-r3/export/clock-00.png'),palette);
poses.forEach((p,i)=>{const room=new Pixels(320,200);room.paste(base,0,0);room.paste(lamp,203,80);room.paste(clock,238,14);room.paste(p,108,52);room.paste(front,0,0);enlarged(join(here,'review',names[i]+'-room.png'),room,palette,3);});
writeFileSync(join(here,'palette.json'),JSON.stringify(palette,null,2)+'\n');
writeFileSync(join(here,'art.json'),JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[],views:[{number:206,loops:names.map(name=>({cels:[{png:'export/'+name+'.png',anchor:[36,113]}]}))}]},null,2)+'\n');
writeFileSync(join(here,'conversion.json'),JSON.stringify({status:'Four whole-figure key poses, not animation loops',source:[image.width,image.height],names,boxes,uniformScale:scale,neutralTargetHeight:106,canvas:[72,120],binaryAlphaThreshold:200,paletteEntries:64,method:'Nearest sampling and palette mapping of each complete figure. No limb grafting, torso reuse or pose interpolation.'},null,2)+'\n');
console.log({source:[image.width,image.height],scale,boxes});
