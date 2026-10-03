"""Three planes, one fixed level camera. No image manipulation: Blender scene construction."""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
HERE=Path(__file__).resolve().parent
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
# Front wall sits at floor y155; central opening cuts all the way to the floor.
D=FY*H/155
panel('Left front wall',[-5,-5,101,155],155,'wall')
panel('Right front wall',[250,-5,325,155],155,'wall')
panel('Over opening wall',[101,-5,250,26],155,'wall')
for x in [101,247]:panel('Opening post '+str(x),[x,25,x+5,155],155,'wood',.22)
panel('Opening carved transom',[100,20,253,31],155,'trim',.24)
for x in range(107,245,7):panel('Fret spindle '+str(x),[x,22,x+2,29],155,'wood',.25)
# Folded panels remain narrow at each edge, keeping a broad view through the room.
for x in [106,242]:panel('Folded door '+str(x),[x,31,x+5,145],155,'trim',.20)
# Back room is a separate physical plane; same camera and no alternate scaling.
panel('Back wall',[90,10,262,125],125,'back')
box('Continuous floor',(0,7,-.07),(12,12,.14),'floor')
for x in range(-4,5):box('Floor seam '+str(x),(x*.6,7,.005),(.012,12,.01),'wood')
panel('Rear blue window',[203,32,238,88],125,'blue',.26)
for x in [202,219,238]:panel('Window vertical '+str(x),[x,31,x+2,90],125,'wood',.32)
for y in [31,60,88]:panel('Window horizontal '+str(y),[202,y,240,y+2],125,'wood',.32)
panel('Rear bookcase',[114,39,139,117],125,'wood',.25)
for y in [40,56,72,88,104,116]:panel('Bookshelf '+str(y),[114,y,139,y+2],125,'trim',.34)
for x in range(116,136,4):
 for y in [43,59,75,91]:panel('Books '+str(x)+str(y),[x,y,x+2,y+11],125,'paper',.29)
# Bench furniture in back room at depth y130.
p=floor(176,132)
box('Chemistry bench top',(p.x,p.y,.94),(1.55,.55,.09),'trim')
for dx in [-.69,.69]:box('Bench leg '+str(dx),(p.x+dx,p.y,.44),(.09,.45,.88))
for dx in [-.5,-.25,.12,.4]:box('Bottle '+str(dx),(p.x+dx,p.y,1.11),(.10,.12,.28),'glass')
# Front fireplace faces camera, on wall left of opening.
panel('Mantel silhouette',[7,81,75,153],155,'wood',.44)
panel('Hearth',[20,106,62,151],155,'dark',.51)
panel('Mantel shelf',[5,78,77,84],155,'trim',.62)
panel('Overmantel painting',[12,32,71,70],155,'trim',.15)
panel('Overmantel canvas',[15,35,68,67],155,'paper',.20)
for y in [137,143,149]:panel('Grate bar '+str(y),[22,y,60,y+1],155,'trim',.60)
# Landing door, fixed right hinge, frontal and near the walking band.
panel('Landing door casing',[267,36,319,158],158,'trim',.22)
panel('Landing closed leaf',[272,41,315,158],158,'wood',.27)
for t,b in [(47,101),(109,150)]:panel('Door inset '+str(t),[277,t,310,b],158,'trim',.28)
# Watson's chair projects to the near room, with feet at 165.
p=floor(88,172);cx,cy=p.x,p.y
box('Chair back',(cx,cy+.40,.88),(.73,.15,1.32),'velvet')
box('Chair cushion',(cx,cy+.18,.46),(.69,.58,.17),'velvet')
for dx in [-.34,.34]:
 box('Chair arm '+str(dx),(cx+dx,cy+.18,.67),(.12,.64,.18),'velvet')
 for dy in [-.10,.43]:box('Chair foot '+str(dx)+str(dy),(cx+dx,cy+dy,.22),(.07,.07,.44))
# Near desk clipped by frame; no walking in its area.
p=floor(12,243)
box('Foreground desk',(p.x,p.y+.40,.76),(1.30,.88,.13),'trim')
box('Desk apron',(p.x,p.y+.4,.53),(1.18,.78,.40))
box('Rug',(0,5.82,.014),(3.2,.90,.02),'rug')
checks=[];standins=[]
for i,(x,y) in enumerate([(120,160),(289,160),(105,195),(297,195),(205,176),(180,125)]):
 p=floor(x,y);o=box('Scale person '+str(i),(p.x,p.y,.925),(.43,.22,1.85),'body');o.hide_render=True;standins.append(o)
 crown=proj(p+Vector((0,0,1.85)));feet=proj(p);checks.append({'feet':[x,y],'world':list(p),'scale':y/176,'heightPixels':feet[1]-crown[1],'expectedHeight':106*y/176,'plane':'back' if i==5 else 'front'})
bpy.context.view_layer.update()
assert max(abs(a['heightPixels']-a['expectedHeight']) for a in checks)<.001
bounds={}
for n,o in objects.items():
 pts=[proj(o.matrix_world@Vector(v)) for v in o.bound_box];bounds[n]={'rect':[min(p[0] for p in pts),min(p[1] for p in pts),max(p[0] for p in pts),max(p[1] for p in pts)]}
joints={k:proj((cx+dx,cy+dy,z)) for k,(dx,dy,z) in {'crown':(0,.43,1.3),'pelvis':(0,.29,.51),'kneeL':(-.17,-.03,.46),'kneeR':(.17,-.03,.46),'footL':(-.17,-.20,.03),'footR':(.17,-.20,.03)}.items()}
data={'camera':{'heightMetres':H,'lensMM':45,'sensorWidthMM':36,'shiftY':-.375,'yawDegrees':0,'pitchDegrees':0,'rollDegrees':0,'horizon':0,'fullSize':176,'vanishingPoint':[160,0],'canvas':[320,200],'pixelAspect':1.2},'planes':{'backRoomFloor':125,'openingPriority':155,'frontBand':[160,195],'foregroundPriority':199},'scaleChecks':checks,'objects':bounds,'seatedJoints':joints,'walkable':[[120,160],[300,160],[308,195],[99,195],[105,176]],'arrival':[292,163]}
(HERE/'guides/perspective.json').write_text(json.dumps(data,indent=2)+'\n')
s.render.engine='BLENDER_WORKBENCH';s.display.shading.light='STUDIO';s.display.shading.color_type='MATERIAL';s.display.shading.show_shadows=True;s.display.shading.show_cavity=True;s.display.shading.cavity_type='BOTH';s.display.shading.background_type='WORLD';s.world.color=(.06,.07,.07);s.view_settings.view_transform='Standard';s.render.image_settings.file_format='PNG';bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'source/221b-planes.blend'))
s.render.resolution_x=960;s.render.resolution_y=720;s.render.pixel_aspect_y=1;s.render.filepath=str(HERE/'guides/blockout.png');bpy.ops.render.render(write_still=True)
for o in standins:o.hide_render=False
s.render.filepath=str(HERE/'guides/blockout-scale.png');bpy.ops.render.render(write_still=True)
