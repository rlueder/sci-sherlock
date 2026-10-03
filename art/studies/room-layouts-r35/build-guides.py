"""Three planes, one fixed level camera. No image manipulation: Blender scene construction."""
import bpy, math, json, sys
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
HERE=Path(__file__).resolve().parent
KIND=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else 'street'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.resolution_x=320;s.render.resolution_y=200;s.render.resolution_percentage=100;s.render.pixel_aspect_x=1;s.render.pixel_aspect_y=1.2
H=1.85*176/106;FX=400;FY=FX/1.2
cd=bpy.data.cameras.new('Level 45mm shift camera');c=bpy.data.objects.new('Camera',cd);s.collection.objects.link(c);c.location=(0,0,H);c.rotation_euler=(math.pi/2,0,0);cd.lens=45;cd.sensor_width=36;cd.sensor_fit='HORIZONTAL';cd.shift_y=-.375;s.camera=c
mats={}
for n,col in {'wall':(.20,.26,.22,1),'back':(.19,.24,.26,1),'wood':(.20,.085,.038,1),'trim':(.38,.21,.085,1),'floor':(.32,.21,.115,1),'rug':(.28,.08,.055,1),'velvet':(.34,.045,.052,1),'blue':(.20,.34,.51,1),'dark':(.038,.030,.04,1),'paper':(.67,.55,.36,1),'body':(.20,.31,.45,1),'glass':(.24,.37,.29,1)}.items():
 m=bpy.data.materials.new(n);m.diffuse_color=col;mats[n]=m
objects={}
def box(n,loc,dim,mat='wood'):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=n;o.dimensions=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mats[mat]);objects[n]=o;return o
def floor(x,y):
 d=FY*H/y;return Vector(((x-160)*d/FX,d,0))
def proj(v):
 p=world_to_camera_view(s,c,Vector(v));return[p.x*320,(1-p.y)*200]
def panel(n,rect,base,mat,depth=.12):
 l,t,r,b=rect;D=FY*H/base;w=(r-l)*D/FX;ht=(b-t)*D/FY
 return box(n,(((l+r)/2-160)*D/FX,D,H-(t+b)/2*D/FY),(w,depth,ht),mat)

if KIND=='stair':
 # A level landing ends at y140. The flight runs along +Y, never sideways.
 start=floor(160,150);width=2.25;run=.45;rise=.15;count=15
 near=floor(160,205)
 box('Landing',(0,(near.y+start.y)/2,-.06),(5.7,start.y-near.y,.12),'floor')
 panel('Clock swung aside cropped',[0,0,36,182],182,'wood',.50)
 panel('Left opening jamb',[48,5,64,153],153,'wood',.35)
 panel('Right opening jamb',[266,5,281,153],153,'wood',.35)
 panel('Opening lintel',[47,0,282,14],153,'trim',.4)
 box('Left stairwell wall',(-width/2-.12,start.y+2.5,-.1),(.18,5.3,4.9),'wall')
 box('Right stairwell wall',(width/2+.12,start.y+2.5,-.1),(.18,5.3,4.9),'wall')
 for i in range(count):
  y=start.y+(i+.5)*run;z=-(i+1)*rise
  box('Straight descending tread '+str(i),(0,y,z-.025),(width,run,.05),'trim' if i<6 else 'wood')
  box('Straight descending riser '+str(i),(0,start.y+i*run,z+rise/2),(width,.025,rise),'wood')
  for side in [-1,1]:
   x=side*(width/2-.035)
   box('Baluster '+str(side)+' '+str(i),(x,y,z+.43),(.04,.04,.86),'wood')
   o=box('Straight handrail '+str(side)+' '+str(i),(x,y,z+.9),(.07,(run*run+rise*rise)**.5,.07),'trim');o.rotation_euler.x=-math.atan2(rise,run)
 for side in [-1,1]:box('Landing newel '+str(side),(side*width/2,start.y-.07,.55),(.16,.16,1.1),'trim')
 panel('Dark end without visible bottom',[108,20,211,145],65,'dark',.1)
 points=[(95,160),(230,160),(85,195),(241,195),(160,176)]
 polygon=[[75,160],[250,160],[258,195],[65,195]];arrival=[90,176]
else:
 # Frontal residential terrace; foreground cab crops vary, pavement stays behind it.
 for i in range(5):
  x=-35+i*82
  panel('Attached house '+str(i),[x,-50,x+82,150],150,'wall',.25)
  panel('Stucco ground '+str(i),[x,10,x+82,150],150,'paper',.28)
  for xx in [x+9,x+45]:
   for yy in [-58,30]:panel('Sash '+str(xx)+' '+str(yy),[xx,yy,xx+23,yy+60],150,'blue',.4)
  panel('Door '+str(i),[x+10,35,x+35,149],150,'wood',.5)
  for xx in [x+40,x+49,x+58,x+67,x+76]:panel('Area rail '+str(xx),[xx,120,xx+1.5,150],150,'dark',.6)
 box('Worn footway',(0,5.8,-.035),(18,1.6,.07),'floor')
 box('Carriageway',(0,3.8,-.14),(18,2.5,.10),'dark')
 # Crop: A right cab, B left cab, C tight right horse/cab edge.
 left,right=(244,357) if KIND=='street-a' else (-52,79) if KIND=='street-b' else (279,390)
 panel('Foreground hansom',[left,77,right,194],218,'wood',.4)
 panel('Cab glazing',[left+18,89,right-15,134],218,'glass',.5)
 panel('Cab roof',[left-5,74,right+5,79],218,'dark',.6)
 panel('Cab near lamp',[left-6,94,left+6,113],218,'paper',.65)
 panel('Cab far lamp',[right-7,92,right+3,109],218,'paper',.65)
 D=FY*H/218
 for xx in [left+25,right-12]:
  bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=.65,depth=.10,location=((xx-160)*D/FX,D,H-182*D/FY),rotation=(math.pi/2,0,0));o=bpy.context.object;o.name='Cropped wheel '+str(xx);o.data.materials.append(mats['dark']);objects[o.name]=o
 if KIND=='street-c':panel('Near horse neck crop',[244,112,282,213],218,'wood',.7);panel('Near horse head crop',[219,101,280,128],218,'wood',.8)
 points=[(100,160),(213,160),(100,181),(213,181),(157,176),(183,145)]
 polygon=[[87,160],[225,160],[225,183],[87,183]];arrival=[112,164]
checks=[];standins=[]
for i,(x,y) in enumerate(points):
 p=floor(x,y);o=box('Scale person '+str(i),(p.x,p.y,.925),(.43,.22,1.85),'body');o.hide_render=True;standins.append(o)
 feet=proj(p);crown=proj(p+Vector((0,0,1.85)));checks.append({'feet':[x,y],'scale':y/176,'heightPixels':feet[1]-crown[1],'expectedHeight':106*y/176,'plane':'rear' if i==5 else 'front'})
bpy.context.view_layer.update();assert max(abs(v['heightPixels']-v['expectedHeight']) for v in checks)<.001
bounds={}
for n,o in objects.items():
 pts=[proj(o.matrix_world@Vector(v)) for v in o.bound_box];bounds[n]={'rect':[min(p[0] for p in pts),min(p[1] for p in pts),max(p[0] for p in pts),max(p[1] for p in pts)]}
data={'room':KIND,'camera':{'heightMetres':H,'lensMM':45,'sensorWidthMM':36,'shiftY':-.375,'horizon':0,'fullSize':176,'vanishingPoint':[160,0],'yawDegrees':0,'pitchDegrees':0,'rollDegrees':0,'canvas':[320,200],'pixelAspect':1.2},'scaleChecks':checks,'objects':bounds,'walkable':polygon,'arrival':arrival}
(HERE/('guides/'+KIND+'.json')).write_text(json.dumps(data,indent=2)+'\n')
s.render.engine='BLENDER_WORKBENCH';s.display.shading.light='STUDIO';s.display.shading.color_type='MATERIAL';s.display.shading.show_shadows=True;s.display.shading.show_cavity=True;s.display.shading.cavity_type='BOTH';s.display.shading.background_type='WORLD';s.world.color=(.025,.025,.035);s.view_settings.view_transform='Standard';s.render.image_settings.file_format='PNG';bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/('source/'+KIND+'-planes.blend')))
s.render.resolution_x=960;s.render.resolution_y=720;s.render.pixel_aspect_y=1;s.render.filepath=str(HERE/('guides/'+KIND+'-blockout.png'));bpy.ops.render.render(write_still=True)
for o in standins:o.hide_render=False
s.render.filepath=str(HERE/('guides/'+KIND+'-scale.png'));bpy.ops.render.render(write_still=True)
