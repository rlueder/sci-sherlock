/** Run deliberately to establish a new static master; animation build never rewrites these. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodePng} from 'sci2-ts/png';
import {Pixels} from '../../source/pixels.ts';
import {loadIndexed,enlarged} from '../../source/study-tools.ts';
const h='art/studies/portraits-r23/',pal:string[]=JSON.parse(readFileSync(h+'palette.json','utf8')),rgb=pal.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));
const corrections=JSON.parse(readFileSync(h+'master-corrections.json','utf8'));
const models=[];const raw=decodePng(readFileSync(h+'generated/holmes.png'));const holmes=new Pixels(56,64),scale=62/1060;
for(let y=3;y<64;y++)for(let x=0;x<56;x++){const xx=Math.floor((x+.5-28)/(scale*1.2)+580),yy=Math.floor((y+.5-3)/scale+68);if(xx<0||xx>=raw.width||yy>=raw.height)continue;const i=(yy*raw.width+xx)*4;if(raw.data[i+3]!<240)continue;let best=Infinity,k=0;rgb.forEach((v,n)=>{const d=2*(v[0]!-raw.data[i]!)**2+4*(v[1]!-raw.data[i+1]!)**2+(v[2]!-raw.data[i+2]!)**2;if(d<best){best=d;k=n}});holmes.dot(x,y,k)}
for(const name of ['holmes','watson','hudson','toby']){const p=name==='holmes'?holmes:loadIndexed(`art/studies/portraits-r22/export/${name}-0-0.png`,pal),file=corrections[name]?.master??`source/masters/${name}-right.png`;if(corrections[name])for(const[x,y,c]of corrections[name].edits)p.dot(x,y,c);writeFileSync(h+file,p.png(pal));enlarged(h+`review/${name}-static.png`,p,pal,6);models.push({name,master:file,revision:corrections[name]?.revision??1,correction:corrections[name]?'master-corrections.json':undefined,sha256:createHash('sha256').update(p.png(pal)).digest('hex'),canvas:[56,64],anchor:[0,0],origin:name==='holmes'?'generated/holmes.png':`../portraits-r22/export/${name}-0-0.png`,rule:'All cels copy this master. Character-specific landmark masks only. No whole-face regeneration, rescaling or shifting.'});}
writeFileSync(h+'models.json',JSON.stringify({status:'Fixed neutral references; visual review pending',models},null,2)+'\n');
