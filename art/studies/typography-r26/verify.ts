/** Check that the review's pixels and metrics survive the actual game compiler. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {buildArt} from 'sci2-ts/art';
import {parseFont,ResourceType} from 'sci2-ts';
const h='art/studies/typography-r26/',names=['regular','bold','italic','bold-italic'],m=JSON.parse(readFileSync(h+'guides/metrics.json','utf8')),resources=buildArt(h+'art.json').resources.filter(r=>r.type===ResourceType.Font);
assert.equal(resources.length,4);let glyphs=0;const hashes=new Set<string>();
for(const[r,i]of resources.map((r,i)=>[r,i]as const)){const name=names[i]!,f=parseFont(r.data),master=JSON.parse(readFileSync(h+`source/${name}.json`,'utf8')) as {code:number,rows:string[]}[];assert.equal(r.number,i+1);assert.equal(f.height,12);hashes.add(Buffer.from(r.data).toString('base64'));for(const{code,rows}of master){const g=f.glyphs[code]!;assert.equal(g.width,m.faces[name][code]);assert.equal(g.height,12);for(let y=0;y<12;y++)for(let x=0;x<g.width;x++)assert.equal(g.pixels[y*g.width+x],rows[y]![x]==='#'?1:0,`${name} ${code} ${x},${y}`);glyphs++;}}
assert.equal(hashes.size,4);writeFileSync(h+'guides/verification.json',JSON.stringify({compiledFaces:4,checkedGlyphs:glyphs,allPixelsAndAdvancesMatch:true,lineHeight:12,distinctFaces:4},null,2)+'\n');console.log('380 glyphs match compiled SCI font pixels and advances; four distinct faces.');
