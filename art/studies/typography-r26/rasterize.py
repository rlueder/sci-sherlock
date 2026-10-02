"""Create bitmap font masters from pinned OFL outlines with FreeType monochrome hinting."""
import json, hashlib
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, features
ROOT=Path(__file__).resolve().parent
FACES={'regular':'Regular','bold':'Bold','italic':'Italic','bold-italic':'BoldItalic'}
metrics={}; proof=[]
for name,upstream in FACES.items():
 path=ROOT/'source/upstream'/f'LibertinusSerif-{upstream}.ttf'
 font=ImageFont.truetype(str(path),11,layout_engine=ImageFont.Layout.BASIC)
 glyphs=[]; fit=[]; vertical=[]
 for code in range(32,127):
  ch=chr(code); mask=Image.new('1',(40,32));d=ImageDraw.Draw(mask);d.fontmode='1';d.text((10,18),ch,font=font,fill=1,anchor='ls')
  bb=mask.getbbox(); cell=Image.new('1',(8,12))
  if bb:
   l,t,r,b=bb;g=mask.crop(bb);w,hh=g.size
   # Preserve the baseline, and fit only overwide glyphs; record each fit for review.
   if w>8:g=g.resize((8,hh),Image.Resampling.NEAREST);fit.append({'char':ch,'from':w,'to':8})
   if hh>12:g=g.resize((g.width,12),Image.Resampling.NEAREST);vertical.append({'char':ch,'heightFrom':hh,'heightTo':12});hh=12
   yy=t-18+9
   adjusted=max(0,min(12-hh,yy))
   if adjusted!=yy:vertical.append({'char':ch,'shift':adjusted-yy});yy=adjusted
   assert yy>=0 and yy+hh<=12,(name,ch,bb,yy)
   cell.paste(g,(0,yy))
  rows=[''.join('#' if cell.getpixel((x,y)) else '.' for x in range(8)) for y in range(12)]
  glyphs.append({'code':code,'rows':rows})
 metrics[name]={'source':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'pixelSize':11,'baseline':9,'horizontalFits':fit,'verticalFits':vertical}
 (ROOT/'source'/f'{name}.json').write_text(json.dumps(glyphs,indent=2)+'\n')
(ROOT/'guides/rasterization.json').write_text(json.dumps({'family':'Libertinus Serif','version':'7.051','license':'OFL-1.1','renderer':'Pillow '+__import__('PIL').__version__,'freetype':features.version_module('freetype2'),'faces':metrics},indent=2)+'\n')
