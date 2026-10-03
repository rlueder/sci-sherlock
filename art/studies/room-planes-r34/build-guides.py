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

if KIND=='street':
 panel('Far houses',[-20,-5,340,105],105,'back')
 for x in range(110,315,40):
  for y in [23,50,76]:panel('Distant sash '+str(x)+str(y),[x,y,x+15,y+20],105,'blue',.2)
 box('Road',(0,8,-.08),(14,12,.16),'dark')
 # Pavement raised by only a modest kerb; actor reference plane remains z0.
 box('Near pavement',(0,4.9,-.02),(14,2.3,.04),'floor')
 panel('221 facade',[-20,-5,74,147],147,'wall')
 panel('Warm doorway',[15,34,62,137],147,'paper',.3)
 panel('Open door sliver',[16,37,24,135],147,'wood',.4)
 for y in [140,146,151]:panel('Entry step '+str(y),[9,y,70,y+2],147,'trim',.4)
 # Full side-on hansom plus horse, correctly behind the front pavement.
 D=FY*H/137
 def wp(x,y):return ((x-160)*D/FX,D,H-y*D/FY)
 panel('Cab body',[127,52,195,115],137,'wood',.9)
 panel('Cab window',[136,62,174,89],137,'blue',1.0)
 panel('Cab roof',[124,48,196,53],137,'dark',1.1)
 for x in [133,184]:
  bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=.64,depth=.12,location=wp(x,111),rotation=(math.pi/2,0,0));o=bpy.context.object;o.name='Cab wheel '+str(x);o.data.materials.append(mats['dark']);objects[o.name]=o
 panel('Rear driver seat',[126,28,144,51],137,'dark',.45)
 panel('Driver torso',[128,11,140,29],137,'dark',.4)
 panel('Driver head',[129,3,137,11],137,'paper',.4)
 panel('Horse body',[213,77,275,103],137,'wood',.65)
 panel('Horse neck',[268,61,282,86],137,'wood',.55)
 panel('Horse head',[278,56,299,69],137,'wood',.45)
 for x in [216,225,263,271]:panel('Horse leg '+str(x),[x,101,x+4,137],137,'wood',.3)
 panel('Shaft',[190,96,269,99],137,'trim',1.1)
 for x in [126,193]:panel('Cab lantern '+str(x),[x,54,x+6,64],137,'paper',1.1)
 # Lamp and left railing make the middle band; leave the actor route open.
 panel('Gas lamp stem',[89,43,93,151],151,'dark',.18)
 panel('Gas lamp lantern',[84,19,98,43],151,'trim',.22)
 panel('Gas lamp glass',[87,24,95,38],151,'paper',.25)
 for x in [3,12,21,30,39,48]:panel('Near rail '+str(x),[x,115,x+2,151],151,'dark',.20)
 panel('Railing top',[0,120,51,122],151,'dark',.22)
 points=[(63,160),(296,160),(63,195),(296,195),(167,176),(244,137)]
 polygon=[[55,160],[308,160],[308,195],[55,195]];arrival=[64,174]
elif KIND=='workshop':
 panel('Left front wall',[-5,-5,86,147],147,'wall')
 panel('Right front wall',[234,-5,325,147],147,'wall')
 panel('Upper front wall',[86,-5,234,57],147,'wall')
 panel('Work bay shadow',[86,57,234,147],129,'dark',.12)
 panel('Recess wall',[96,62,225,129],129,'back',.22)
 # Front wall cutout is represented by the recess panel; paint adds the recess depth.
 for x in [87,231]:panel('Bay stile '+str(x),[x,54,x+3,147],147,'wood',.4)
 panel('Bay lintel',[87,54,234,59],147,'trim',.4)
 panel('Window',[7,12,70,104],147,'blue',.28)
 for x in [6,37,69]:panel('Window upright '+str(x),[x,11,x+2,106],147,'wood',.36)
 for y in [12,43,74,104]:panel('Window sash '+str(y),[6,y,72,y+2],147,'wood',.36)
 panel('Cabinet',[5,113,77,149],147,'wood',.6)
 for x,y in [(119,28),(166,16),(215,28)]:
  panel('Wall clock case '+str(x),[x-13,y-10,x+13,y+28],147,'wood',.28)
  panel('Wall clock face '+str(x),[x-9,y-4,x+9,y+14],147,'paper',.38)
 panel('Bench',[99,99,225,110],139,'trim',.75)
 for x in [102,218]:panel('Bench leg '+str(x),[x,109,x+5,139],139,'wood',.70)
 panel('Tools',[121,65,202,95],139,'wood',.3)
 panel('Lamp',[206,80,216,101],139,'paper',.8)
 panel('Concealed clock opening',[246,20,292,150],150,'dark',.50)
 panel('Right drawers',[303,63,324,150],147,'wood',.7)
 box('Floor',(0,6,-.04),(14,12,.08),'floor')
 for x in range(-4,5):box('Floor seam '+str(x),(x*.6,6,.01),(.01,12,.01),'wood')
 p=floor(16,244);box('Near writing desk',(p.x,p.y+.4,.76),(1.25,.9,.16),'trim')
 box('Rug',(0,5.72,.015),(3.1,1.0,.02),'rug')
 points=[(115,160),(292,160),(108,195),(292,195),(164,176),(168,132)]
 polygon=[[111,160],[306,160],[306,195],[105,195]];arrival=[290,176]
else:
 # Held ending shot: safe near landing on left; flight drops sideways to the right.
 box('Left landing',(-1.10,5.6,-.10),(2.50,2.5,.20),'floor')
 panel('Shadow wall',[-5,-5,325,157],157,'dark')
 panel('Old plaster',[44,8,155,143],155,'wall',.2)
 panel('Left clock reverse',[0,0,45,172],172,'wood',.65)
 panel('Opening lintel',[40,8,315,18],154,'wood',.7)
 panel('Opening left jamb',[44,15,53,161],161,'wood',.6)
 # Real descending steps: world X increases while world Z decreases.
 start=floor(153,156)
 for i in range(9):
  x=start.x+i*.27;y=start.y+.2;z=-i*.18
  box('Descending tread '+str(i),(x,y,z-.04),(.28,1.05,.08),'trim')
  box('Descending riser '+str(i),(x+.13,y,z-.13),(.035,1.05,.18),'wood')
 # Near newel and a descending rail, leaving the platform readable.
 p=floor(155,182);box('Near newel',(p.x,p.y,.52),(.14,.14,1.04),'wood')
 for i in range(8):
  x=start.x+i*.27;y=start.y-.34;z=-i*.18
  box('Banister '+str(i),(x,y,z+.42),(.045,.045,.84),'wood')
  o=box('Handrail '+str(i),(x+.135,y,z+.82),(.33,.085,.085),'trim');o.rotation_euler.y=math.atan2(.18,.27)
 points=[(67,160),(125,160),(67,195),(125,195),(108,176)]
 polygon=[[58,160],[130,160],[135,195],[58,195]];arrival=[85,176]
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
