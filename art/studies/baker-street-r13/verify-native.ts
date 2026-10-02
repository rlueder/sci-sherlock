import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {mkdtempSync,readFileSync,readdirSync,rmSync,writeFileSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {fileURLToPath} from 'node:url';import {decodePng} from 'sci2-ts/png';
const here=fileURLToPath(new URL('.',import.meta.url)),stage=mkdtempSync(join(tmpdir(),'sherlock-221b-native-'));
const jobs:[string,string[]][]=[
 ['room',['source/room-native.png']],
 ...['watson','hudson','toby'].flatMap(n=>[[n+'-master',['export/'+n+'-standing.png']],[n+'-guide',['export/'+n+'-standing.png']]] as [string,string[]][]),
 ['watson-seated',['export/watson-seated.png']],['watson-seated-guide',['export/watson-seated.png']],
 ['door',Array.from({length:6},(_,i)=>'export/door-'+i+'.png')],
 ['fire',Array.from({length:4},(_,i)=>'export/fire-'+i+'.png')],['lens',['export/mantel-lens.png']]
];
try{let compared=0;
for(const [name,expected]of jobs){
 const run=spawnSync(process.env.PIXELORAMA_BIN??'pixelorama',['--headless','--quit-after','120','--','--export','--output',join(stage,name+'.png'),join(here,'source/'+name+'.pxo')],{encoding:'utf8',timeout:30000});
 if(run.error)throw run.error;assert.equal(run.status,0,run.stderr);assert.ok(run.stdout.includes('Pixelorama v1.2.3-'));
 const actual=readdirSync(stage).filter(n=>n===name+'.png'||n.startsWith(name+'_')).sort();assert.equal(actual.length,expected.length,name);
 actual.forEach((file,i)=>{assert.deepEqual(decodePng(readFileSync(join(stage,file))),decodePng(readFileSync(join(here,expected[i]!))),file);compared++;});
}
const result={application:'Pixelorama 1.2.3',projects:jobs.length,comparedExports:compared,decodedPixelsIdentical:true,hiddenGuidesExcluded:true};
writeFileSync(join(here,'native-export-check.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{rmSync(stage,{recursive:true,force:true});}
