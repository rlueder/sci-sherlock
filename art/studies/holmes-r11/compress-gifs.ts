/** Compress review GIFs without changing decoded colours or frames. */
import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {renameSync,rmSync} from 'node:fs';import {fileURLToPath} from 'node:url';import {join} from 'node:path';
const here=fileURLToPath(new URL('.',import.meta.url));
function run(args:string[]){const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error',...args],{encoding:'utf8'});if(r.error)throw r.error;assert.equal(r.status,0,r.stderr);return r.stdout;}
function hashes(file:string){return run(['-ignore_loop','1','-i',file,'-pix_fmt','rgb24','-f','framemd5','-']).split('\n').filter(l=>l&&!l.startsWith('#')).map(l=>l.split(',').at(-1)!.trim()).join('\n');}
for(const name of ['reach','kneel','reach-room','kneel-room']){
 const source=join(here,'review',name+'.gif'),temp=join(here,'review',name+'-compressed.gif');
 try{run(['-y','-ignore_loop','1','-i',source,'-i',join(here,'../../../docs/images/gif-palette.png'),'-filter_complex','[0:v][1:v]paletteuse=dither=none','-loop','0',temp]);assert.equal(hashes(source),hashes(temp));renameSync(temp,source);console.log(name+': decoded frames unchanged');}finally{rmSync(temp,{force:true});}
}
