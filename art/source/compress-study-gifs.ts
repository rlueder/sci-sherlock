/** ffmpeg compresses GIF storage only; decoded pixels must remain identical. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {existsSync,mkdtempSync,readFileSync,readdirSync,renameSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {Pixels} from './pixels.ts';
function run(args:string[]){const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error',...args],{encoding:'utf8'});if(r.error)throw r.error;assert.equal(r.status,0,r.stderr);return r.stdout}
function hashes(f:string){return run(['-ignore_loop','1','-i',f,'-pix_fmt','rgb24','-f','framemd5','-']).split('\n').filter(s=>s&&!s.startsWith('#')).map(s=>s.split(',').at(-1)!.trim()).join('\n')}
for(const dir of process.argv.slice(2)){
 const stage=mkdtempSync(join(tmpdir(),'sherlock-gif-palette-'));
 try{
  // UI studies add purple shades. The production 64-colour swatch would remap them.
  const studyPalette=join(dirname(dir),'palette.json');let swatch=resolve('docs/images/gif-palette.png');
  if(existsSync(studyPalette)){
   const palette:string[]=JSON.parse(readFileSync(studyPalette,'utf8'));assert.ok(palette.length>0&&palette.length<=256);
   const p=new Pixels(16,16);for(let i=0;i<256;i++)p.data[i]=Math.min(i,palette.length-1);
   swatch=join(stage,'palette.png');writeFileSync(swatch,p.png(palette));
  }
  for(const n of readdirSync(dir).filter(n=>n.endsWith('.gif'))){
   const source=join(dir,n),temp=source+'.tmp.gif';
   try{run(['-y','-ignore_loop','1','-i',source,'-i',swatch,'-filter_complex','[0:v][1:v]paletteuse=dither=none','-loop','0',temp]);assert.equal(hashes(source),hashes(temp));renameSync(temp,source);console.log(source+': identical decoded frames')}
   finally{rmSync(temp,{force:true})}
  }
 }finally{rmSync(stage,{recursive:true,force:true})}
}
