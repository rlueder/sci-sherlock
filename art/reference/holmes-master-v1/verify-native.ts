import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {inflateRawSync} from 'node:zlib';
import {mkdtempSync,mkdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodePng} from 'sci2-ts/png';
const here=fileURLToPath(new URL('.',import.meta.url)),stage=mkdtempSync(join(tmpdir(),'sherlock-fixed-master-'));
function metadata(name:string){const zip=readFileSync(join(here,'source',name+'.pxo'));let off=0;while(zip.readUInt32LE(off)===0x04034b50){const size=zip.readUInt32LE(off+18),n=zip.readUInt16LE(off+26),extra=zip.readUInt16LE(off+28),file=zip.subarray(off+30,off+30+n).toString(),start=off+30+n+extra;if(file==='data.json')return JSON.parse(inflateRawSync(zip.subarray(start,start+size)).toString());off=start+size;}throw new Error('Missing metadata');}
const proof=JSON.parse(readFileSync(join(here,'proof.json'),'utf8')) as {frames:number};
const meta=metadata('fixed-puff');assert.equal(meta.layers[0].locked,true);assert.equal(meta.layers[0].new_cels_linked,true);assert.deepEqual(meta.layers[0].link_sets[0].cels,Array.from({length:proof.frames},(_,i)=>i));
const templateMeta=metadata('walk-drawing-template');assert.equal(templateMeta.layers[0].locked,true);assert.equal(templateMeta.layers[1].locked,true);assert.equal(templateMeta.current_layer,2);
const master=decodePng(readFileSync(join(here,'master.png')));
try{let exports=0;for(const [name,count] of [['master',1],['fixed-puff',proof.frames],['walk-drawing-template',8],['pipe-cleanup',1]] as const){const folder=join(stage,name);mkdirSync(folder);const run=spawnSync(process.env.PIXELORAMA_BIN??'pixelorama',['--headless','--quit-after','120','--','--export','--output',join(folder,name+'.png'),join(here,'source',name+'.pxo')],{encoding:'utf8',timeout:30000});if(run.error)throw run.error;assert.equal(run.status,0,run.stderr);assert.ok(run.stdout.includes('Pixelorama v1.2.3-'));
for(let i=0;i<count;i++){const out=decodePng(readFileSync(join(folder,name+(count>1?'_'+String(i+1).padStart(4,'0'):'')+'.png')));
 if(name==='master')assert.deepEqual(out,master);
 else if(name==='fixed-puff')assert.deepEqual(out,decodePng(readFileSync(join(here,'export','puff-'+String(i).padStart(2,'0')+'.png'))));
 else if(name==='pipe-cleanup')assert.deepEqual(out,decodePng(readFileSync(join(here,'review/workshop-clean.png'))));
 else{assert.equal(out.width,144);assert.equal(out.height,120);for(let y=0;y<120;y++)for(let x=0;x<72;x++)assert.deepEqual(out.data.subarray((y*144+x)*4,(y*144+x)*4+4),master.data.subarray((y*72+x)*4,(y*72+x)*4+4));}
 exports++;}}
 const result={application:'Pixelorama 1.2.3',projects:4,checkedExports:exports,linkedBodyFrames:proof.frames,lockedReferenceLayers:true,unchangedMasterInAllTemplateFrames:true,proofPixelsMatch:true,backgroundCleanupMatches:true};writeFileSync(join(here,'native-export-check.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{rmSync(stage,{recursive:true,force:true});}
