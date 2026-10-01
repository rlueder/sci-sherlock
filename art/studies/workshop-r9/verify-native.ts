import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodePng} from 'sci-ts/png';
const here=fileURLToPath(new URL('.',import.meta.url)),stage=mkdtempSync(join(tmpdir(),'sherlock-r9-native-'));
const {sets}=JSON.parse(readFileSync(join(here,'animation.json'),'utf8')) as {sets:{name:string;files:string[]}[]};
try{let count=0;for(const set of [...sets,{name:'cabinet',files:['workshop.png']}]){const folder=join(stage,set.name);mkdirSync(folder);
 const run=spawnSync(process.env.PIXELORAMA_BIN??'pixelorama',['--headless','--quit-after','120','--','--export','--output',join(folder,set.name+'.png'),join(here,'source',set.name+'.pxo')],{encoding:'utf8',timeout:30000});if(run.error)throw run.error;assert.equal(run.status,0,run.stderr);assert.ok(run.stdout.includes('Pixelorama v1.2.3-'));
 set.files.forEach((file,i)=>{assert.deepEqual(decodePng(readFileSync(join(folder,set.name+(set.files.length>1?'_'+String(i+1).padStart(4,'0'):'')+'.png'))),decodePng(readFileSync(join(here,'export',file))),file);count++;});}
 const result={application:'Pixelorama 1.2.3',masters:sets.length+1,comparedExports:count,decodedPixelsIdentical:true};writeFileSync(join(here,'native-export-check.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{rmSync(stage,{recursive:true,force:true});}
