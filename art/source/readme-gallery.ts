/** Documentation contact sheets: existing native cels only, no new artwork. */
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {Pixels} from './pixels.ts';
import {loadIndexed,enlarged} from './study-tools.ts';
const root=fileURLToPath(new URL('../../',import.meta.url)),out=join(root,'docs/images');
mkdirSync(out,{recursive:true});
const palette=JSON.parse(readFileSync(join(root,'art/reference/holmes-master-v2/palette.json'),'utf8')) as string[];
const read=(path:string)=>loadIndexed(join(root,path),palette);
const poses=new Pixels(288,136,18);
const poseFiles=['art/reference/holmes-master-v2/master.png',...['thinking','cap','watch'].map(name=>'art/studies/holmes-r10/source/'+name+'-key-3.png')];
poseFiles.forEach((file,i)=>poses.paste(read(file),i*72,0));
['NEUTRAL','THINKING','CAP','WATCH'].forEach((label,i)=>poses.text(label,i*72+8,125,62));
enlarged(join(out,'holmes-poses.png'),poses,palette,3);
const props=new Pixels(300,166,18);
props.paste(read('art/studies/workshop-r9/export/pendulum-00.png'),5,5);
props.text('CLOCK',14,151,62);
const r5='art/studies/workshop-r5/export/';
props.paste(read('art/studies/workshop-r9/export/lamp-00.png'),86,8);props.text('LAMP',78,38,62);
props.paste(read(r5+'lens-icon.png'),89,53);props.text('LENS',78,78,62);
props.paste(read(r5+'filings-01.png'),78,94);props.text('FILINGS',73,127,62);
props.paste(read(r5+'dial-inspection.png'),164,22);props.text('DIAL / CLUE',164,151,62);
enlarged(join(out,'interactive-props.png'),props,palette,3);
console.log('README galleries written to docs/images (nearest sampling, 1:1.2 pixel aspect).');

// Optional lossless GIF packaging for GitHub: retain frames, timing and palette
// colours while compressing the intentionally simple study GIF encoder's output.
if(process.argv.includes('--gifs')){
 const {spawnSync}=await import('node:child_process');
 const gifPalette=new Pixels(16,16);gifPalette.data.forEach((_,i)=>gifPalette.data[i]=i%palette.length);writeFileSync(join(out,'gif-palette.png'),gifPalette.png(palette));
 const clips=[['art/studies/holmes-r10/review/idles.gif','holmes-idles.gif'],['art/reference/holmes-master-v2/review/puff.gif','pipe-puff.gif'],['art/studies/workshop-r9/review/ambience.gif','workshop-ambience.gif']];
 for(const [source,name]of clips){
  const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ignore_loop','1','-i',join(root,source!),'-i',join(out,'gif-palette.png'),'-filter_complex','[0:v][1:v]paletteuse=dither=none','-loop','0',join(out,name!)],{encoding:'utf8'});
  if(result.error)throw result.error;if(result.status!==0)throw new Error(result.stderr);
  // Compare decoded RGB frames, not GIF bytes/palette index ordering.
  const hashes=(file:string)=>{const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-ignore_loop','1','-i',file,'-pix_fmt','rgb24','-f','framemd5','-'],{encoding:'utf8'});if(r.status!==0)throw new Error(r.stderr);return r.stdout.split('\n').filter(l=>l&&!l.startsWith('#')).map(l=>l.split(',').at(-1)!.trim()).join('\n');};
  if(hashes(join(root,source!))!==hashes(join(out,name!)))throw new Error('GIF frame mismatch: '+name);
  console.log(name+': decoded frames match the original study exactly.');
 }
}
