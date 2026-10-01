/** Export each actual .pxo through Pixelorama 1.2.3 and compare decoded PNG pixels. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,readFileSync,readdirSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodePng} from 'sci-ts/png';
const here=fileURLToPath(new URL('.',import.meta.url)),stage=mkdtempSync(join(tmpdir(),'sherlock-r5-native-'));
const seq=(name:string,count:number,prefix=name)=>({name,files:Array.from({length:count},(_,i)=>[`${name}_${String(i+1).padStart(4,'0')}.png`,`${prefix}-${String(i).padStart(2,'0')}.png`] as [string,string])});
const single=(name:string)=>({name,files:[[name+'.png',name+'.png']] as [string,string][]});
const idle=JSON.parse(readFileSync(join(here,'idle.json'),'utf8')) as {nativeProjects:{name:string;files:string[]}[]};
const projects=[{name:'workshop',split:true,files:[['workshop(base) _0001.png','workshop.png'],['workshop(foreground-181) _0001.png','workshop-front.png']] as [string,string][]},seq('holmes',9,'holmes-east'),seq('clock',8),seq('lantern',4),seq('filings',2),single('scratches'),single('lens-icon'),single('lens-cursor'),single('dial-inspection'),...idle.nativeProjects.map(p=>seq(p.name,p.files.length))];
try{let count=0;
 for(const p of projects){const folder=join(stage,p.name);mkdirSync(folder);
  const run=spawnSync(process.env.PIXELORAMA_BIN??'pixelorama',['--headless','--quit-after','120','--','--export',...('split'in p?['--split-layers']:[]),'--output',join(folder,p.name+'.png'),join(here,'source',p.name+'.pxo')],{encoding:'utf8',timeout:30000});
  if(run.error)throw run.error;assert.equal(run.status,0,run.stderr);assert.ok(run.stdout.includes('Pixelorama v1.2.3-'));
  assert.deepEqual(readdirSync(folder).sort(),p.files.map(([n])=>n).sort());
  for(const [native,png]of p.files){assert.deepEqual(decodePng(readFileSync(join(folder,native))),decodePng(readFileSync(join(here,'export',png))),png);count++;}
 }
 const result={application:'Pixelorama 1.2.3',masters:projects.length,comparedExports:count,decodedPixelsIdentical:true};writeFileSync(join(here,'native-export-check.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{rmSync(stage,{recursive:true,force:true});}
