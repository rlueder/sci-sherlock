/** Read-only native Pixelorama roundtrip; writes only its small verification report. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,readdirSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodePng} from 'sci2-ts/png';
const here=fileURLToPath(new URL('.',import.meta.url));
const stage=mkdtempSync(join(tmpdir(),'sherlock-clock-native-'));
try {
 const run=spawnSync(process.env.PIXELORAMA_BIN??'pixelorama',['--headless','--quit-after','120','--','--export','--output',join(stage,'clock.png'),join(here,'clock.pxo')],{encoding:'utf8',timeout:30000});
 if(run.error)throw run.error;
 assert.equal(run.status,0,run.stderr);
 assert.ok(run.stdout.includes('Pixelorama v1.2.3-'),'native mapping requires Pixelorama 1.2.3');
 const filenames=Array.from({length:8},(_,i)=>'clock_'+String(i+1).padStart(4,'0')+'.png');
 assert.deepEqual(readdirSync(stage).sort(),filenames);
 filenames.forEach((name,i)=>assert.deepEqual(decodePng(readFileSync(join(stage,name))),decodePng(readFileSync(join(here,'export/clock-'+String(i).padStart(2,'0')+'.png'))),name));
 const backgroundRun=spawnSync(process.env.PIXELORAMA_BIN??'pixelorama',['--headless','--quit-after','120','--','--export','--output',join(stage,'background-clean.png'),join(here,'source/background-clean.pxo')],{encoding:'utf8',timeout:30000});
 if(backgroundRun.error)throw backgroundRun.error;assert.equal(backgroundRun.status,0,backgroundRun.stderr);
 assert.deepEqual(decodePng(readFileSync(join(stage,'background-clean.png'))),decodePng(readFileSync(join(here,'export/background-clean.png'))));
 const result={application:'Pixelorama 1.2.3',masters:['clock.pxo','source/background-clean.pxo'],comparedExports:9,decodedPixelsIdentical:true};
 writeFileSync(join(here,'native-export-check.json'),JSON.stringify(result,null,2)+'\n');
 console.log(result);
}finally{rmSync(stage,{recursive:true,force:true});}
