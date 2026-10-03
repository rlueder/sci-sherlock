/** Small shareable proof generated from exported cels, with the same fixed room layout. */
import{readFileSync,writeFileSync}from'node:fs';
import{root,palette,Pixels,loadIndexed,clone,framed,enlarged,indexedGif}from'./common.ts';
const spec=JSON.parse(readFileSync(root+'expressions.json','utf8'));
const font=JSON.parse(readFileSync('art/studies/typography-r29/export/regular.json','utf8')),atlas=loadIndexed('art/studies/typography-r29/export/regular.png',palette);
const room=loadIndexed('art/studies/environment-r43/export/221b-background-0.png',palette),cache=new Map<string,Pixels>();
function cel(n:string,l:number,c:number){const key=`${n}-${l}-${c}`;if(!cache.has(key))cache.set(key,loadIndexed(root+`export/${key}.png`,palette));return cache.get(key)!;}
function portrait(n:string,i:number,left:boolean,m:number,e:number){const b=i*6+(left?3:0),p=clone(cel(n,b,0));p.paste(cel(n,b+1,m),0,0);p.paste(cel(n,b+2,e),0,0);return framed(p);}
function text(p:Pixels,s:string,x:number,y:number){let pen=x;for(const ch of s){const g=font.glyphs.find((g:any)=>g.code===ch.charCodeAt(0));if(!g)continue;const[sx,sy,w,h]=g.rect;for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)if(atlas.data[(sy+yy)*atlas.width+sx+xx]!>=0)p.dot(pen+g.bearingX+xx,y+g.top+yy,4);pen+=g.advance;}}
const frames:Pixels[]=[];
for(let t=0;t<96;t++){
 const p=clone(room),expression=Math.floor(t/16),beat=t%16,m=[0,0,1,2,3,2,1,0,0,0,1,2,1,0,0,0][beat]!,e=beat===10?1:beat===11?2:beat===12?1:beat>12?3:0;
 p.rect(73,139,174,59,32);p.rect(75,141,170,55,62);text(p,'Toby',82,143);text(p,'Every clock stopped.',82,160);text(p,'Seventeen past three.',82,174);
 p.paste(portrait('toby',expression,false,m,e),0,110);p.paste(portrait('holmes',expression,true,0,beat>12?3:0),248,110);frames.push(p);
}
writeFileSync(root+'review/scene-native.png',frames[16]!.png(palette));enlarged(root+'review/scene.png',frames[16]!,palette,3);indexedGif(root+'review/conversation.gif',frames,palette,2,13);
const board=new Pixels(468,400,18);for(const[n,name]of ['toby','holmes','watson','hudson'].entries()){for(let i=0;i<spec.characters[name]!.expressions.length;i++){board.paste(portrait(name,i,false,0,0),i*78,n*100);board.text(spec.characters[name].expressions[i].name.toUpperCase(),i*78,n*100+92,62);}}enlarged(root+'review/all-expressions.png',board,palette,2);
