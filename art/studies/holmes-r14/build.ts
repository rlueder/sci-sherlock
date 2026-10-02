import assert from'node:assert/strict';import{readFileSync,writeFileSync}from'node:fs';import{join}from'node:path';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';import{Pixels}from'../../source/pixels.ts';import{loadIndexed,clone,enlarged,indexedGif}from'../../source/study-tools.ts';import{pixeloramaProject}from'../../source/pixelorama-project.ts';
const h=fileURLToPath(new URL('.',import.meta.url)),pal=JSON.parse(readFileSync(join(h,'palette.json'),'utf8')),dirs=['east','west','toward','away'],guide=JSON.parse(readFileSync(join(h,'guides/poses.json'),'utf8'));
const master=loadIndexed(join(h,'../../reference/holmes-master-v2/master.png'),pal),frames=dirs.map(n=>Array.from({length:9},(_,i)=>loadIndexed(join(h,'export/'+n+'-'+i+'.png'),pal)));
assert.deepEqual(frames[0]![0]!.data,master.data,'East standing must remain the exact master');
const report:any={reviewStatus:"rejected",reviewReasons:["Dancing in place; unconvincing support and weight transfer.","Shoulders and torso appear disconnected."],canvas:[72,120],anchor:[36,113],palette:pal.length,standingEastExact:true,loops:[],limitations:['Generated body keys need visual approval; palette and head equality do not prove anatomy.','Support-foot markers and translation speed need in-game review.','Joint overlays are pre-drawing Blender guides, not a recovered rig of the final drawing.']};
function wire(direction:string,i:number){const p=new Pixels(72,120);if(!i)return p;const g=guide.poses[direction==='west'?'east':direction][i-1],point=(v:number[])=>[direction==='west'?72-v[0]!:v[0]!,v[1]!]as[number,number];for(const[a,b]of guide.edges)p.line(...point(g.joints[a]),...point(g.joints[b]),a.startsWith('far')?49:54);for(const v of Object.values(g.joints))p.oval(...point(v as number[]),1,1,61);return p}
for(const[d,name]of dirs.entries()){
 const keys=frames[d]!,neutral=keys[0]!,metrics=[];
 for(const[i,p]of keys.entries()){
 assert.equal(p.width,72);assert.equal(p.height,120);
 const xs:number[]=[],ys:number[]=[];p.data.forEach((c,n)=>{if(c>=0){xs.push(n%72);ys.push(Math.floor(n/72));}});
 assert.ok(Math.min(...xs)>0&&Math.max(...xs)<71,'Horizontal clipping '+name+i);
 metrics.push({cel:i,bounds:[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],opaque:xs.length});
 if(name==='west')for(let y=0;y<120;y++)for(let x=1;x<72;x++)assert.equal(p.data[y*72+x],frames[0]![i]!.data[y*72+72-x],'Mirror mismatch');
 if(i){const bob=[0,1,0,-1,0,1,0,-1][i-1]!;for(let y=0;y<32;y++)for(let x=0;x<72;x++)if(y+bob>=0)assert.equal(p.data[(y+bob)*72+x],neutral.data[y*72+x],'Head drift '+name+i);}
 writeFileSync(join(h,'guides/'+name+'-'+i+'.png'),wire(name,i).png(pal));
 }
 writeFileSync(join(h,'source/'+name+'.pxo'),pixeloramaProject(pal,['Complete pose / fixed named head','Construction joints — hidden'],keys.map((p,i)=>[p,wire(name,i)]),[{name:'standing',from:1,to:1},{name:'walk',from:2,to:9}],{layers:[{}, {visible:false,locked:true}],fps:8,userData:'Cel0 standing; cels1–8 loop. Whole-body redraws, fixed directional head. 72x120 anchor36,113. Review before runtime registration.'}));
 report.loops.push({number:d,name,cels:9,standingSha256:createHash('sha256').update(neutral.png(pal)).digest('hex'),metrics});
 indexedGif(join(h,'review/'+name+'.gif'),keys.slice(1).map(p=>{const b=new Pixels(72,120,18);b.paste(p,0,0);return b}),pal,4,13);
}
writeFileSync(join(h,'art.json'),JSON.stringify({version:1,maxColours:64,palette:'palette.json',pictures:[],views:[{number:200,loops:dirs.map(n=>({cels:Array.from({length:9},(_,i)=>({png:'export/'+n+'-'+i+'.png',anchor:[36,113]}))}))}]},null,2)+'\n');
writeFileSync(join(h,'report.json'),JSON.stringify(report,null,2)+'\n');
const compare=Array.from({length:8},(_,i)=>{const p=new Pixels(288,132,18);frames.forEach((f,d)=>{p.paste(f[i+1]!,d*72,0);p.text(dirs[d]!.toUpperCase(),d*72+5,123,62)});return p});
indexedGif(join(h,'review/four-directions.gif'),compare,pal,3,13);enlarged(join(h,'review/four-directions.png'),compare[0]!,pal,3);
writeFileSync(join(h,'timing.json'),JSON.stringify({standingCel:0,walkCels:[1,2,3,4,5,6,7,8],excludeStandingDuringWalk:true,loopOrder:dirs,previewFps:7.5,withdrawnEngineProposal:{cycleSpeedTicks:8,moveSpeedTicks:3,xStep:2,yStep:1},nominalPixelsPerSecond:{horizontal:40,vertical:20},status:'REJECTED: dancing motion and disconnected shoulders/torso. Historical preview timing only; engine proposal withdrawn. Do not integrate.'},null,2)+'\n');
console.log({view:200,loops:4,cels:36,standingEastExact:true});
