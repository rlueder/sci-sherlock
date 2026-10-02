/** Fixed character reference, native linked-cel proof, and drift diagnostics. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,enlarged,indexedGif,clone} from '../../source/study-tools.ts';
import {pixeloramaProject} from '../../source/pixelorama-project.ts';
import {decodePng} from 'sci2-ts/png';
const here=fileURLToPath(new URL('.',import.meta.url)),r7=join(here,'../../studies/holmes-r7');
const contract=JSON.parse(readFileSync(join(here,'contract.json'),'utf8')) as {masterFileSha256:string;paletteFileSha256:string;headRect:number[];materialRamps:Record<string,number[]>};
const sha=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');
assert.equal(sha(readFileSync(join(here,'master.png'))),contract.masterFileSha256,'Fixed master changed: use a new explicitly approved version.');
assert.equal(sha(readFileSync(join(here,'palette.json'))),contract.paletteFileSha256,'Fixed palette changed.');
for(const d of ['review','source','export'])mkdirSync(join(here,d),{recursive:true});
const palette=JSON.parse(readFileSync(join(here,'palette.json'),'utf8')) as string[],master=loadIndexed(join(here,'master.png'),palette);
const used=[...new Set(Array.from(master.data).filter(c=>c>=0))].sort((a,b)=>a-b);
writeFileSync(join(here,'character-palette.gpl'),'GIMP Palette\nName: Holmes master v1 exact colours\nColumns: 8\n# Exact master colours; see contract for material ramps\n'+used.map(i=>[1,3,5].map(n=>parseInt(palette[i]!.slice(n,n+2),16)).join(' ')+' index-'+i).join('\n')+'\n');
enlarged(join(here,'review/master.png'),master,palette,5);
const swatches=new Pixels(144,144,18);let row=3;const labels=['NAVY WOOL','WAISTCOAT','BROWN TWEED','SKIN','GREY HAIR','WHITE LINEN','PIPE / BOOTS','WATCH METAL','SMOKE'];for(const [i,[,indices]]of Object.entries(contract.materialRamps).entries()){swatches.text(labels[i]!,2,row,62);indices.forEach((c,n)=>swatches.rect(2+n*9,row+8,8,5,c));row+=15;}
enlarged(join(here,'review/material-ramps.png'),swatches,palette,4);
writeFileSync(join(here,'source/master.pxo'),pixeloramaProject(palette,['FIXED approved master'],[[master]],[],{layers:[{locked:true}],userData:'Approved r6 neutral, pinned by SHA-256 in contract.json. Create a versioned master to change identity.'}));

// Only the smoke effect is newly generated; the character is an exact shared cel.
const effect=decodePng(readFileSync(join(here,'generated/smoke-source.png'))),cw=Math.floor(effect.width/2),ch=Math.floor(effect.height/2);
const boxes=Array.from({length:4},(_,i)=>{const ox=(i%2)*cw,oy=Math.floor(i/2)*ch;let left=cw,right=0,top=ch,bottom=0;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(effect.data[((y+oy)*effect.width+x+ox)*4+3]!>=200){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}let sum=0,n=0;for(let y=bottom-5;y<=bottom;y++)for(let x=left;x<=right;x++)if(effect.data[((y+oy)*effect.width+x+ox)*4+3]!>=200){sum+=x;n++;}return{ox,oy,left,right,top,bottom,originX:sum/n};});
const smokeScale=19/(boxes[2]!.bottom-boxes[2]!.top+1),smokeIndices=contract.materialRamps.smoke!;
const smokeKeys=[new Pixels(72,120),...boxes.map((box,i)=>{const p=new Pixels(72,120),origin=i===3?boxes[2]!:box;for(let y=0;y<120;y++)for(let x=47;x<68;x++){const sx=Math.floor((x+.5-47)/smokeScale+origin.originX),sy=Math.floor((y+.5-23)/smokeScale+origin.bottom);if(sx<0||sy<0||sx>=cw||sy>=ch)continue;const at=((sy+box.oy)*effect.width+sx+box.ox)*4;if(effect.data[at+3]!<200)continue;let best=Infinity,colour=53;for(const c of smokeIndices){const rgb=[1,3,5].map(n=>parseInt(palette[c]!.slice(n,n+2),16));const d=rgb.reduce((n,v,k)=>n+(v-effect.data[at+k]!)**2,0);if(d<best){best=d;colour=c;}}p.dot(x,y,colour);}return p;})];
const sequence=[0,0,0,0,0,0,0,0,1,1,2,2,2,3,3,3,3,4,4,4,0,0,0,0,0,0],composites:Pixels[]=[],files:string[]=[];
for(const [i,key] of sequence.entries()){const smoke=smokeKeys[key]!,p=clone(master);p.paste(smoke,0,0);let bodyChanges=0;master.data.forEach((c,j)=>{if(c>=0&&p.data[j]!==c)bodyChanges++;});assert.equal(bodyChanges,0,'An effect changed character pixels');composites.push(p);const file='puff-'+String(i).padStart(2,'0')+'.png';writeFileSync(join(here,'export',file),p.png(palette));files.push(file);}
writeFileSync(join(here,'source/fixed-puff.pxo'),pixeloramaProject(palette,['FIXED linked body','Smoke only'],sequence.map(key=>[master,smokeKeys[key]!]),[{name:'puff',from:1,to:sequence.length}],{layers:[{locked:true,linkAll:true},{}],currentLayer:1,userData:'Body is one locked linked cel shared by every frame. Only smoke animates. Whole-body posing still required for movement.'}));
indexedGif(join(here,'review/fixed-puff.gif'),composites.map(p=>{const q=new Pixels(72,120,18);q.paste(p,0,0);return q;}),palette,4,13);
const prior=JSON.parse(readFileSync(join(r7,'animation.json'),'utf8')) as {loops:{name:string;files:string[]}[]};
const oldFiles=prior.loops.find(l=>l.name==='puff')!.files;
const compare=composites.map((p,i)=>{const q=new Pixels(144,120,18);q.paste(loadIndexed(join(r7,'export',oldFiles[Math.min(i,oldFiles.length-1)]!),palette),0,0);q.paste(p,72,0);return q;});
indexedGif(join(here,'review/puff-comparison.gif'),compare,palette,4,13);
// Room preview is composed from the native layers, never from resized screenshots.
const base=loadIndexed(join(here,'../../production/workshop-r3/export/workshop.png'),palette),front=loadIndexed(join(r7,'../workshop-r5/export/workshop-front.png'),palette),lamp=loadIndexed(join(here,'../../production/workshop-r3/export/lantern-00.png'),palette),clock=loadIndexed(join(here,'../../production/workshop-r3/export/clock-00.png'),palette);
// R3's coarse extraction missed five mouth/pipe pixels outside the figure contour.
// Restore those exact wall coordinates from its saved hidden-surface source. Keep
// the historical R3 exports and the pinned character intact; this is a room repair.
const beforePipeCleanup=clone(base),pipeCleanup=new Pixels(320,200);
const hidden=decodePng(readFileSync(join(here,'../../production/workshop-r3/hidden-surfaces-source.png')));
const pipeRemnants:[[number,number],...Array<[number,number]>]=[[152,70],[154,72],[155,72],[155,73],[156,73]];
const paletteRgb=palette.map(h=>[1,3,5].map(n=>parseInt(h.slice(n,n+2),16)));
for(const [x,y]of pipeRemnants){const at=(Math.floor((y+.5)*hidden.height/200)*hidden.width+Math.floor((x+.5)*hidden.width/320))*4;let best=Infinity,colour=0;paletteRgb.forEach((rgb,c)=>{const d=2*(rgb[0]!-hidden.data[at]!)**2+4*(rgb[1]!-hidden.data[at+1]!)**2+(rgb[2]!-hidden.data[at+2]!)**2;if(d<best){best=d;colour=c;}});pipeCleanup.dot(x,y,colour);}
base.paste(pipeCleanup,0,0);
const changedBackgroundPixels=Array.from(base.data).filter((c,i)=>c!==beforePipeCleanup.data[i]).length;
assert.equal(changedBackgroundPixels,pipeRemnants.length,'Background repair must stay confined to the five reviewed pixels');
writeFileSync(join(here,'source/pipe-cleanup.pxo'),pixeloramaProject(palette,['Original R3 room — locked','Mouth and pipe remnant cleanup'],[[beforePipeCleanup,pipeCleanup]],[],{layers:[{locked:true},{}],currentLayer:1}));
writeFileSync(join(here,'review/workshop-clean.png'),base.png(palette));
writeFileSync(join(here,'background-cleanup.json'),JSON.stringify({source:'art/production/workshop-r3/export/workshop.png',fillSource:'art/production/workshop-r3/hidden-surfaces-source.png',coordinates:pipeRemnants,changedBackgroundPixels,characterChanged:false},null,2)+'\n');
const pipeDetail=new Pixels(80,38);for(const [n,bg]of [beforePipeCleanup,base].entries()){const composite=clone(bg);composite.paste(master,108,52);for(let y=0;y<38;y++)for(let x=0;x<40;x++)pipeDetail.dot(n*40+x,y,composite.data[(y+54)*320+x+129]!);}
enlarged(join(here,'review/pipe-cleanup-comparison.png'),pipeDetail,palette,6);
const rooms=composites.map(p=>{const room=new Pixels(320,200);room.paste(base,0,0);room.paste(lamp,203,80);room.paste(clock,238,14);room.paste(p,108,52);room.paste(front,0,0);return room;});
indexedGif(join(here,'review/puff-room.gif'),rooms,palette,2,13);enlarged(join(here,'review/puff-room-peak.png'),rooms[13]!,palette,3);

// A real drawing template: static identity reference on left, anatomy guide on right.
// The drawing layer is deliberately empty: this is not a finished walking animation.
const anatomy=JSON.parse(readFileSync(join(r7,'anatomy.json'),'utf8')) as {bones:[string,string][];walk:{phase:string;joints:Record<string,[number,number]>}[]};
const fixed=new Pixels(144,120);fixed.paste(master,0,0);
const template=anatomy.walk.map(pose=>{const guide=new Pixels(144,120),drawing=new Pixels(144,120);for(const [a,b]of anatomy.bones){const aa=pose.joints[a]!,bb=pose.joints[b]!;guide.line(aa[0]+72,aa[1],bb[0]+72,bb[1],a.startsWith('far')?61:54);}guide.line(91,50,91,69,53);guide.line(117,50,117,69,53);return[fixed,guide,drawing];});
writeFileSync(join(here,'source/walk-drawing-template.pxo'),pixeloramaProject(palette,['FIXED linked reference — left','Joint guide and coat-width rails — right','DRAW coherent whole pose — right'],template,anatomy.walk.map((p,i)=>({name:p.phase,from:i+1,to:i+1})),{layers:[{locked:true,linkAll:true},{locked:true},{}],currentLayer:2,userData:'144x120 authoring sheet. Canonical reference at x0; draw on x72..143, referencing head and material ramps. Export only right-hand72x120 after hiding guides. Do not export this template as animation.'}));

const bands={shoulders:[30,39],chest:[40,49],waist:[50,59],hips:[60,69]};
function widths(p:Pixels){return Object.fromEntries(Object.entries(bands).map(([name,[lo,hi]])=>{const spans=[];for(let y=lo!;y<=hi!;y++){const xs=[];for(let x=0;x<p.width;x++)if(p.data[y*p.width+x]!>=0)xs.push(x);if(xs.length)spans.push(Math.max(...xs)-Math.min(...xs)+1);}return[name,Math.round(spans.reduce((a,b)=>a+b,0)/spans.length*10)/10];}));}
function headDifference(p:Pixels){const [x,y,w,h]=contract.headRect;let best={changed:Infinity,dx:0,dy:0};for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){let changed=0;for(let yy=y!;yy<y!+h!;yy++)for(let xx=x!;xx<x!+w!;xx++)if(master.data[yy*72+xx]!==p.data[(yy+dy)*72+xx+dx])changed++;if(changed<best.changed)best={changed,dx,dy};}return best;}
const candidates=[...['puff','thinking','cap','watch'].flatMap(n=>Array.from({length:4},(_,i)=>({name:n+' key '+i,path:join(r7,'source',n+'-key-'+i+'.png')}))),...Array.from({length:6},(_,i)=>({name:'walk cel '+i,path:join(r7,'export','walk-'+String(i).padStart(2,'0')+'.png')}))];
const report={masterFileSha256:contract.masterFileSha256,masterPaletteIndices:used,masterWidths:widths(master),note:'Whole-silhouette band widths include sleeves and are pose-dependent. Head differences use best integer translation only; intentional tilts/occlusion must be reviewed as variants. Diagnostics do not certify anatomy.',candidates:candidates.map(c=>{const p=loadIndexed(c.path,palette);return{name:c.name,widths:widths(p),headDifference:headDifference(p),outsideMasterPalette:[...new Set(Array.from(p.data).filter(i=>i>=0&&!used.includes(i)))].map(i=>({index:i,colour:palette[i]}))};})};
writeFileSync(join(here,'drift-report.json'),JSON.stringify(report,null,2)+'\n');
writeFileSync(join(here,'proof.json'),JSON.stringify({sourceMaster:contract.masterFileSha256,frames:sequence.length,changedCharacterPixels:0,method:'One exact full-body cel reused; separately generated smoke layer varies. No generated body frames.',smoke:{source:'generated/smoke-source.png',scale:smokeScale,boxes,palette:smokeIndices,maxHeight:19,emission:[47,22]},files},null,2)+'\n');
writeFileSync(join(here,'art.json'),JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[],views:[{number:206,loops:[{cels:files.map(file=>({png:'export/'+file,anchor:[36,113]}))}]}]},null,2)+'\n');
console.log({masterWidths:report.masterWidths,masterColours:used.length,proofFrames:sequence.length,changedCharacterPixels:0});
