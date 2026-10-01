/** Native indexed cabinet surfaces, shared by every projected angle. */
import {Pixels} from '../../source/pixels.ts';
export function cabinetSurface(w:number,h:number,back=false){
 const p=new Pixels(w,h,back?9:15);
 // Low-contrast grouped grain; fixed UV pixels prevent texture swimming.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const band=Math.floor(x/6),grain=(x*13+Math.floor(y/3)*7)%29;
  p.dot(x,y,(band%3===0?8:back?9:15));
  if(grain===0||grain===1)p.dot(x,y,back?15:23);
  if((x+Math.floor(y/12))%17===0)p.dot(x,y,5);
 }
 // Stiles, rails, bevel and an inset field.
 p.rect(1,1,w-2,2,23);p.rect(1,h-3,w-2,2,5);
 p.rect(1,3,2,h-6,21);p.rect(w-3,3,2,h-6,5);
 p.rect(5,6,w-10,1,3);p.rect(5,6,1,h-12,3);
 p.rect(6,h-7,w-12,1,23);p.rect(w-6,6,1,h-12,23);
 for(const y of [4,h-5])for(const x of [3,w-4]){p.dot(x,y,3);p.dot(x+1,y,29);}
 return p;
}
export function reverseFront(mask:Pixels){
 const p=cabinetSurface(mask.width,mask.height,true);
 // The visible reverse of carved pediment, cross rails and lower plinth.
 for(let y=0;y<mask.height;y++)for(let x=0;x<mask.width;x++){
  if(mask.data[y*mask.width+x]!<0)p.dot(x,y,-1);
  else if(y<19)p.dot(x,y,(x+y)%11<2?15:5);
 }
 for(const y of [47,50,103,106,124,128]){
  for(let x=11;x<59;x++)if(mask.data[y*mask.width+x]!>=0)p.dot(x,y,y%2?23:5);
 }
 for(const y of [51,104])for(let x=14;x<56;x+=13){if(mask.data[y*mask.width+x]!>=0){p.dot(x,y,29);p.dot(x+1,y,3);}}
 // Two restrained hinge plates on the fixed edge, never painted on the dial.
 for(const y of [56,99]){p.rect(52,y,3,6,21);p.line(53,y,53,y+5,39);p.dot(52,y+1,3);p.dot(52,y+4,3);}
 for(let i=0;i<p.data.length;i++)if(mask.data[i]!<0)p.data[i]=-1;
 return p;
}
export function setDial(p:Pixels,cx:number,cy:number,length:number){
 // Local restoration of only the old hand cluster; retain rim and minute marks.
 for(let y=cy-2;y<=cy+3;y++)for(let x=cx-2;x<=cx+length;x++){
  if((x-cx)**2/((length+1)**2)+(y-cy)**2/25<=1)p.dot(x,y,58);
 }
 const minute=17/60*Math.PI*2,hour=(3+17/60)/12*Math.PI*2;
 const endpoint=(a:number,n:number):[number,number]=>[Math.round(cx+Math.sin(a)*n),Math.round(cy-Math.cos(a)*n/1.2)];
 const m=endpoint(minute,length),h=endpoint(hour,Math.max(3,length-3));
 p.line(cx,cy,...m,5);p.line(cx,cy,...h,3);p.dot(cx,cy,3);
 return{center:[cx,cy],hour:3,minute:17,minuteTip:m,hourTip:h};
}
export function passage(){
 const p=new Pixels(320,200);
 p.rect(254,38,36,108,2);p.rect(255,40,3,105,5);p.line(255,41,255,143,21);
 p.poly([[258,43],[265,50],[265,129],[258,145]],5);
 p.poly([[287,43],[281,50],[281,128],[287,145]],4);
 // Sparse masonry joints stay subordinate to the dark entrance.
 for(let y=55;y<130;y+=11){p.line(259,y,264,y+3,3);p.line(283,y+3,287,y,2);}
 // Descending steps drop below the threshold: do not draw an ascending triangle.
 p.poly([[259,137],[287,135],[287,145],[258,145]],1);
 p.line(258,139,287,137,7);
 p.line(260,141,285,139,4);
 p.line(262,143,283,141,7);
 p.line(264,145,281,143,4);
 p.dot(261,139,12);p.dot(276,138,12);p.dot(269,142,12);
 return p;
}
