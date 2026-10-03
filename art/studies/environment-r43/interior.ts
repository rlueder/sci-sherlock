import{root,read,save,json,review,convert,mask,extract,clone,Pixels,assert,project,layered,actor,holmes,watson,type Point}from'./common.ts';
export function interior(){
 const old=read('art/studies/221b-r33/export/background.png'),paint=convert('221b');
 // Extract ONLY additions and their local attachment shadows. All other room pixels stay pinned.
 const regions:{name:string;points:Point[];rect:number[]}[]=[
 {name:'letters',points:[[34,75],[37,82],[41,87],[39,94],[30,95],[27,88],[28,81]],rect:[26,75,42,95]},
 {name:'slipper',points:[[58,79],[60,83],[64,86],[64,99],[62,106],[55,107],[53,103],[55,99],[53,88],[55,83]],rect:[53,79,66,107]},
 {name:'violin',points:[[16,161],[23,165],[38,165],[50,169],[54,175],[53,180],[49,182],[37,179],[27,176],[24,170],[14,168]],rect:[14,161,55,183]},
 ];
 const room=clone(old),all=new Pixels(320,200),props=new Pixels(320,200);
 for(const reg of regions){const m=mask(reg.points),p=extract(paint,m);room.paste(p,0,0);props.paste(p,0,0);all.paste(m,0,0);save(`guides/221b-${reg.name}-mask.png`,m);project('221b-'+reg.name,[p]);}
 for(let i=0;i<room.data.length;i++)if(all.data[i]!<0)assert.equal(room.data[i],old.data[i]);
 const opening=read('art/studies/221b-r33/export/opening.png'),chair=read('art/studies/221b-r33/export/chair.png'),desk=read('art/studies/221b-r33/export/foreground-desk.png');
 // Violin participates in the existing table occlusion. Mantel props also cover the edge of the fire patch.
 props.data.forEach((v,i)=>{if(v>=0&&desk.data[i]!>=0)desk.data[i]=v});
 const mantel=extract(room,mask([...regions[0]!.points]));mantel.paste(extract(room,mask(regions[1]!.points)),0,0);
 project('221b-background',[room]);project('221b-desk',[desk]);project('221b-mantel-details',[mantel]);
 const closed=clone(room);closed.paste(read('art/studies/221b-r33/export/door-0.png'),258,24);
 const cast=clone(closed);cast.paste(read('art/studies/221b-r33/export/fire-0.png'),15,94);cast.paste(read('art/studies/221b-r33/export/mantel-lens.png'),44,71);cast.paste(mantel,0,0);cast.paste(opening,0,0);cast.paste(chair,0,0);cast.paste(read('art/studies/221b-r33/export/watson-page-0.png'),57,33);actor(cast,holmes,205,176);cast.paste(desk,0,0);
 layered('221b-edit-master',[{name:'Original room',p:old},{name:'Story objects',p:props}]);review('221b-empty',closed);review('221b-cast',cast);
 const details=cropDetails(closed);review('221b-details',details,5);
 json('guides/221b-handoff.json',{picture:100,background:'export/221b-background-0.png',replaceForegroundDesk:'export/221b-desk-0.png',addLayer:{png:'export/221b-mantel-details-0.png',priority:137},unchangedLayers:['opening at 138','chair at 146','foreground desk at 199'],hotspots:Object.fromEntries(regions.map(r=>[r.name,r.rect])),notes:['Keep all room-100 coordinates, existing prop views and camera settings.','Letters and slipper need the priority-137 static overlay above fire priority 133.','Violin is on the foreground writing table. Change the parked line from chair to table when restoring it.','Three props are painted into the background, not new views.','Original room pixels outside the three saved masks are identical.','Use seated Watson from r33; no new pose or seated scaling.']});
 return {picture:{number:100,layers:[{png:'export/221b-background-0.png',priority:-1000},{png:'export/221b-mantel-details-0.png',priority:137},{png:'../221b-r33/export/opening.png',priority:138},{png:'../221b-r33/export/chair.png',priority:146},{png:'export/221b-desk-0.png',priority:199}]},cast};
}
function cropDetails(room:Pixels){const q=new Pixels(130,43,18);const boxes=[[24,73,44,35],[11,158,48,28]];boxes.forEach(([x,y,w,h],i)=>{for(let yy=0;yy<h!;yy++)for(let xx=0;xx<w!;xx++)q.dot(i*65+xx,yy,room.data[(y!+yy)*320+x!+xx]!)});return q;}
