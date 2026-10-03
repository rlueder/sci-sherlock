import{root,Pixels,read,save,json,review,gif,convert,extract,clone,assert,project,layered,actor,holmes,watson,rgb,nearest,celView,crop,type Point}from'./common.ts';
export function workshop(){
 const base=read('art/studies/room-planes-r34/export/workshop-closed.png');
 // Glazed interior only. Frame, weights, all clock hands and the surrounding room are fixed.
 const origin:Point=[257,65],size:Point=[30,62],old=crop(base,...origin,...size),clean=convert('clock-clean',...size),fixed=clone(old),inside=new Pixels(...size),pend=new Pixels(...size);
 inside.poly([[16,6],[22,11],[23,51],[8,51],[8,13]],0);inside.data.forEach((v,i)=>{if(v>=0)fixed.data[i]=clean.data[i]!});
 // Trace the original rod and bob once, then rotate the same pixels around a fixed pivot.
 const moving=new Pixels(...size);moving.rect(15,7,2,31,0);moving.poly([[14,37],[19,37],[22,40],[22,44],[17,49],[13,48],[10,44],[10,40]],0);
 moving.data.forEach((v,i)=>{if(v>=0)pend.data[i]=old.data[i]!});save('source/pendulum-original.png',pend);save('source/clock-clean-plate.png',fixed);save('guides/pendulum-mask.png',moving);
 const pivot:Point=[16,7],amplitude=.07;
 const pendulums=Array.from({length:24},(_,f)=>{const p=clone(fixed),angle=Math.sin(f/24*Math.PI*2)*amplitude;for(let y=6;y<52;y++)for(let x=7;x<24;x++){if(inside.data[y*30+x]!<0)continue;const dx=x-pivot[0],dy=(y-pivot[1])*1.2,sx=Math.round(pivot[0]+dx*Math.cos(angle)+dy*Math.sin(angle)),sy=Math.round(pivot[1]+(-dx*Math.sin(angle)+dy*Math.cos(angle))/1.2);if(sx>=0&&sx<30&&sy>=0&&sy<62&&pend.data[sy*30+sx]!>=0)p.dot(x,y,pend.data[sy*30+sx]!);}p.data.forEach((v,i)=>{if(inside.data[i]!<0)assert.equal(v,old.data[i])});return p});project('workshop-pendulum',pendulums,12);gif('pendulum',pendulums,7,8);
 const poses=new Pixels(90,62);[6,0,18].forEach((c,i)=>poses.paste(pendulums[c]!,i*30,0));review('pendulum-extremes',poses,5);
 // Blue exterior pixels inside eight measured panes. Interior sill, mullions, globe and books excluded.
 const windowOrigin:Point=[12,20],windowSize:Point=[55,78],glass=new Pixels(...windowSize),poly=new Pixels(...windowSize),blues=new Set([25,38,43,46,49,54,56,57,59]);
 for(const [x,w]of [[3,22],[28,23]])for(const [y,h]of [[2,17],[22,15],[41,15],[60,14]])poly.rect(x!,y!,w!,h!,0);
 for(let y=0;y<78;y++)for(let x=0;x<55;x++)if(poly.data[y*55+x]===0&&blues.has(base.data[(y+20)*320+x+12]!))glass.dot(x,y,0);
 save('guides/window-glass-mask.png',glass);const maskProof=crop(base,12,20,55,78);glass.data.forEach((v,i)=>{if(v>=0)maskProof.data[i]=i%2?49:61});review('window-mask',maskProof,6);
 const darkMap:Record<number,number>={25:17,38:25,43:38,46:38,49:43,54:49,56:49,57:49,59:49};
 const skies=Array.from({length:16},(_,f)=>{const p=new Pixels(...windowSize),cloud=(1-Math.cos(f/16*Math.PI*2))/2;glass.data.forEach((v,i)=>{if(v<0)return;const x=i%55,y=Math.floor(i/55),c=base.data[(y+20)*320+x+12]!,a=rgb[c]!,b=rgb[darkMap[c]!]!;p.data[i]=nearest(a.map((v,j)=>v*(1-cloud)+b[j]!*cloud))});return p});project('workshop-sky',skies,.25);
 // A short streak advances two native pixels each 125ms = 16px/s.
 const rains=Array.from({length:40},(_,f)=>{const p=new Pixels(...windowSize);for(let n=0;n<12;n++){const y=(n*23+f*2)%80,x=4+(n*17)%45;for(let j=0;j<3;j++){const xx=x-Math.floor(j/2),yy=y+j;if(yy<78&&glass.data[yy*55+xx]===0)p.dot(xx,yy,n%3===0?54:49);}}return p});project('workshop-rain',rains,8);
 for(const p of [...skies,...rains])p.data.forEach((v,i)=>{if(v>=0)assert.equal(glass.data[i],0)});
 // Existing coherent side-view mouse cels, modestly lifted dorsal contrast. No new anatomy.
 const mice=Array.from({length:4},(_,i)=>{const p=read(`art/studies/workshop-r9/export/mouse-${String(i).padStart(2,'0')}.png`);p.data.forEach((v,j)=>{const y=Math.floor(j/20);if(y>=2&&y<=5)p.data[j]=v===21?40:v===29?39:v;});return p});
 const left=mice.map(p=>{const q=new Pixels(20,10);for(let y=0;y<10;y++)for(let x=0;x<20;x++)q.dot(x,y,p.data[y*20+19-x]!);return q});project('mouse-east',mice,16);project('mouse-west',left,16);
 const occlusion=new Pixels(320,200),mouseMask=new Pixels(320,200);
 // Real cabinet/recess uprights conceal the two endpoints. The bench stretcher passes above the mouse.
 for(const [x,y,w,h]of [[0,96,97,44],[97,96,11,42],[108,120,112,7],[226,96,29,44]])mouseMask.rect(x!,y!,w!,h!,0);
 mouseMask.data.forEach((v,i)=>{if(v>=0)occlusion.data[i]=base.data[i]!});project('mouse-occlusion',[occlusion]);save('guides/mouse-occlusion-mask.png',mouseMask);
 const routes=[{name:'Left recess to right recess',points:[[93,135],[239,135]],loop:0,seconds:3.2},{name:'Right recess to left recess',points:[[239,135],[93,135]],loop:1,seconds:3.2}];
 function visible(p:Pixels,at:Point){let count=0;p.data.forEach((v,i)=>{const x=at[0]-10+i%20,y=at[1]-8+Math.floor(i/20);if(v>=0&&mouseMask.data[y*320+x]!<0)count++});return count;}
 for(const r of routes){assert.equal(visible((r.loop?left:mice)[0]!,r.points[0] as Point),0);assert.equal(visible((r.loop?left:mice)[0]!,r.points[1] as Point),0);assert.ok(visible((r.loop?left:mice)[0]!,[166,135])>20);}
 const mouseAt=(i:number,route=0)=>{const r=routes[route]!,p=clone(base),u=(i-8)/40;p.paste(pendulums[i%24]!,...origin);p.paste(skies[5]!,...windowOrigin);p.paste(rains[Math.floor(i*.08*8)%40]!,...windowOrigin);if(u>=0&&u<=1){const a=r.points[0]!,b=r.points[1]!,x=Math.round(a[0]!+(b[0]!-a[0]!)*u),y=135;p.paste((r.loop?left:mice)[Math.floor(i*.08*16)%4]!,x-10,y-8);}p.paste(occlusion,0,0);return p;};
 for(let r=0;r<routes.length;r++){const frames=Array.from({length:64},(_,i)=>mouseAt(i,r));gif('mouse-route-'+r,frames,2,8);gif('mouse-close-'+r,frames.map(p=>crop(p,85,119,165,23)),4,8);}
 const routeProof=clone(base);for(const r of routes)routeProof.line(...r.points[0] as Point,...r.points[1] as Point,61);review('mouse-routes',routeProof);
 const scenes=Array.from({length:64},(_,i)=>{const p=mouseAt(i);actor(p,holmes,164,176);actor(p,watson,213,174);p.paste(read('art/studies/room-planes-r34/export/workshop-desk.png'),0,0);return p});gif('workshop',scenes,2,8);review('workshop-cast',scenes[0]!);
 gif('weather',skies.map(s=>{const p=clone(base);p.paste(s,...windowOrigin);return p}),2,400);
 gif('window',Array.from({length:40},(_,i)=>{const p=crop(base,...windowOrigin,...windowSize);p.paste(skies[5]!,0,0);p.paste(rains[i]!,0,0);return p}),5,12);
 const handoff={picture:102,unchangedBackground:'../room-planes-r34/export/workshop-background.png',pendulum:{view:272,origin,size,anchor:[0,0],priority:151,scale:false,frames:24,fps:12,loopMs:2000,pivot,amplitudeRadians:amplitude,stopWhen:'caseOpen; hide overlay before changing view 221 away from cel 0'},weather:{origin:windowOrigin,size:windowSize,anchor:[0,0],priority:90,scale:false,rain:{view:270,priority:90,frames:40,fps:8,pixelsPerSecond:16},sky:{view:274,priority:89,frames:16,celMs:4000,loopMs:64000},mask:'guides/window-glass-mask.png'},mouse:{view:273,canvas:[20,10],anchor:[10,8],fps:16,scale:false,priority:139,occlusion:{png:'export/mouse-occlusion-0.png',priority:140},routes,cooldownSeconds:[18,35],endpointVisiblePixels:0,notes:['Two opposite routes along the same visible strip, using side-view sprites matched to travel direction.','Choose a route after an 18-35s pause; play one traversal; hide the mouse between routes.','Occlusion must draw above mouse and below foreground actors.','Original view 273 has one loop. The replacement supplies east loop 0 and west loop 1; update routing accordingly.']},notes:['Redraw underlying picture for every frame, then sky, then rain. Never accumulate transparent cels.','Pendulum cels are opaque full replacements inside their 30x62 patch, preventing trails.','All pixels outside the glazed interior remain fixed; clock hands and dial never move.','Overlay is on top of closed view 221 only; removal is essential before the case-opening animation.']};json('guides/workshop-handoff.json',handoff);
 return{views:[celView(272,'workshop-pendulum',24),celView(270,'workshop-rain',40),celView(274,'workshop-sky',16),{number:273,loops:[{cels:mice.map((_,i)=>({png:`export/mouse-east-${i}.png`,anchor:[10,8]}))},{cels:left.map((_,i)=>({png:`export/mouse-west-${i}.png`,anchor:[10,8]}))}]}]};
}
