/** Check that native Pixelorama exports reproduce every delivered timeline cel. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,readFileSync,readdirSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodePng} from 'sci2-ts/png';
const here=fileURLToPath(new URL('.',import.meta.url)),stage=mkdtempSync(join(tmpdir(),'sherlock-r7-native-'));
const {loops}=JSON.parse(readFileSync(join(here,'animation.json'),'utf8')) as {loops:{name:string;files:string[]}[]};
try{let count=0;for(const loop of loops){const folder=join(stage,loop.name);mkdirSync(folder);
 const run=spawnSync(process.env.PIXELORAMA_BIN??'pixelorama',['--headless','--quit-after','120','--','--export','--output',join(folder,loop.name+'.png'),join(here,'source',loop.name+'.pxo')],{encoding:'utf8',timeout:30000});if(run.error)throw run.error;assert.equal(run.status,0,run.stderr);assert.ok(run.stdout.includes('Pixelorama v1.2.3-'));
 const names=loop.files.map((_,i)=>loop.name+'_'+String(i+1).padStart(4,'0')+'.png');assert.deepEqual(readdirSync(folder).sort(),names.sort());
 loop.files.forEach((file,i)=>{assert.deepEqual(decodePng(readFileSync(join(folder,loop.name+'_'+String(i+1).padStart(4,'0')+'.png'))),decodePng(readFileSync(join(here,'export',file))),file);count++;});}
 const result={application:'Pixelorama 1.2.3',masters:loops.length,comparedExports:count,decodedPixelsIdentical:true};writeFileSync(join(here,'native-export-check.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{rmSync(stage,{recursive:true,force:true});}
