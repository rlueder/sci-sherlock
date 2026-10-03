"""Level front-facing street camera, metre-scale cab/horse and y-only actor proofs."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
HERE=Path(__file__).resolve().parent
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.resolution_x=320;s.render.resolution_y=200;s.render.resolution_percentage=100;s.render.pixel_aspect_x=1;s.render.pixel_aspect_y=1.2
H=1.85*176/106;FX=400;FY=FX/1.2
cd=bpy.data.cameras.new('Locked level frontal camera');cam=bpy.data.objects.new('Camera',cd);s.collection.objects.link(cam);s.camera=cam;cam.location=(0,0,H);cam.rotation_euler=(math.pi/2,0,0);cd.lens=45;cd.sensor_width=36;cd.sensor_fit='HORIZONTAL';cd.shift_y=-.375
mats={}
for n,c in {'wall':(.18,.21,.20,1),'stone':(.32,.30,.25,1),'road':(.13,.16,.17,1),'pavement':(.25,.25,.22,1),'wood':(.10,.055,.037,1),'dark':(.025,.029,.035,1),'glass':(.65,.38,.10,1),'light':(.95,.70,.29,1),'horse':(.21,.11,.063,1),'actor':(.20,.33,.46,1)}.items():
 m=bpy.data.materials.new(n);m.diffuse_color=c;mats[n]=m
objects={}
def box(n,p,d,mat):
 bpy.ops.mesh.primitive_cube_add(size=1,location=p);o=bpy.context.object;o.name=n;o.dimensions=d;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mats[mat]);objects[n]=o;return o
def floor(x,y):
 d=FY*H/y;return Vector(((x-160)*d/FX,d,0))
def proj(v):
 q=world_to_camera_view(s,cam,Vector(v));return[q.x*320,(1-q.y)*200]
def cylinder(n,p,r,depth,mat,rot=(0,0,0)):
 bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=r,depth=depth,location=p,rotation=rot);o=bpy.context.object;o.name=n;o.data.materials.append(mats[mat]);objects[n]=o;return o
D=floor(160,145).y;kerb=floor(160,163).y
box('Road',(0,5,-.04),(14,12,.08),'road');box('Pavement',(-3.3,(D+kerb)/2,-.018),(3.8,D-kerb,.036),'pavement');box('Kerb edge',(-3.3,kerb,-.005),(3.8,.09,.035),'stone')
box('Front parallel terrace wall',(-3.3,D+.12,2.5),(3.8,.2,5),'wall');box('Lower stone band',(-3.3,D-.02,.33),(3.8,.12,.66),'stone');box('Horizontal storey band',(-3.3,D-.03,2.90),(3.8,.14,.09),'stone')
dp=floor(45,145);dx=dp.x
box('Door stone surround',(dx,D-.11,1.37),(1.25,.25,2.74),'stone');box('Dark entry',(dx,D-.25,1.28),(1.0,.03,2.56),'dark');box('Ajar door leaf',(dx+.28,D-.33,1.15),(.44,.12,2.30),'wood');box('Warm transom',(dx,D-.29,2.40),(.84,.04,.23),'glass');box('Hall lamp',(dx-.22,D-.31,1.60),(.14,.10,.29),'light');box('Threshold',(dx,D-.36,.06),(1.26,.44,.12),'stone')
box('Distant fog terrace',(0,15,3),(16,.2,6),'wall')
for x in [107,164,222,281]:
 wx=(x-160)*14/FX
 box('Window frame '+str(x),(wx,14,1.75),(.70,.12,1.39),'stone');box('Dark window '+str(x),(wx,13.92,1.75),(.57,.04,1.24),'dark');box('Sash bar '+str(x),(wx,13.88,1.75),(.57,.02,.035),'wood')
# Cab axis across the stage, a single horse to the right. Two wheels, axle across Y.
cp=floor(190,166);cx,cy=cp.x,cp.y
box('Cab passenger body',(cx,cy,1.22),(1.05,1.02,1.27),'wood');box('Cab roof',(cx,cy,1.92),(1.24,1.23,.14),'dark');box('Near passenger aperture',(cx+.12,cy-.526,1.35),(.63,.025,.72),'dark')
for dy in [-.63,.63]:
 cylinder('Cab wheel '+str(dy),(cx-.14,cy+dy,.63),.63,.07,'dark',(math.pi/2,0,0))
 cylinder('Wheel hub '+str(dy),(cx-.14,cy+dy-.045,.63),.08,.09,'stone',(math.pi/2,0,0))
 box('Cab lamp '+str(dy),(cx+.56,cy+dy*.77,1.63),(.16,.16,.29),'light')
box('Rear driver seat',(cx-.66,cy,2.05),(.39,.7,.12),'wood');box('Rear seated driver',(cx-.69,cy,2.39),(.38,.43,.69),'dark');box('Driver head',(cx-.70,cy,2.82),(.26,.28,.27),'dark');box('Driver hat brim',(cx-.70,cy,2.97),(.40,.35,.06),'dark')
for dy in [-.39,.39]:box('Shaft '+str(dy),(cx+1.03,cy+dy,.87),(1.65,.065,.065),'wood')
hx=cx+1.50
box('Horse barrel',(hx,cy,1.19),(1.22,.52,.64),'horse');box('Horse neck',(hx+.60,cy,1.55),(.31,.40,.75),'horse');box('Horse head',(hx+.77,cy,1.91),(.48,.34,.37),'horse');box('Horse muzzle',(hx+.97,cy,1.74),(.31,.29,.26),'horse')
for ox,oy in [(-.43,-.21),(-.39,.21),(.43,-.21),(.39,.21)]:
 box('Horse leg '+str(ox)+str(oy),(hx+ox,cy+oy,.50),(.10,.105,1.00),'horse')
 box('Hoof '+str(ox)+str(oy),(hx+ox+.025,cy+oy,.055),(.17,.13,.11),'dark')
# The vehicle points diagonally away; camera remains level and square to the entrance.
# This fits its real physical length without shrinking it relative to the actors.
from mathutils import Matrix
turn=Matrix.Rotation(math.radians(40),4,'Z')
for name,o in objects.items():
 if any(name.startswith(prefix) for prefix in ['Cab ','Wheel ','Rear ','Driver ','Shaft ','Horse ','Hoof ']):
  o.location=Vector((cx,cy,0))+turn.to_3x3()@(o.location-Vector((cx,cy,0)))
  o.rotation_euler=(turn.to_3x3()@o.rotation_euler.to_matrix()).to_euler()
# Public lamp, and short near-left railing supply honest floor-anchored occlusion.
lp=floor(89,163)
cylinder('Gas lamp post',(lp.x,lp.y,1.20),.045,2.40,'dark');box('Gas lamp housing',(lp.x,lp.y,2.61),(.33,.33,.46),'light');box('Gas lamp crown',(lp.x,lp.y,2.89),(.43,.43,.10),'dark');box('Lamp base',(lp.x,lp.y,.10),(.23,.23,.20),'dark')
for x in [3,14,25]:
 p=floor(x,190);box('Near railing '+str(x),(p.x,p.y,.46),(.045,.045,.92),'dark')
p=floor(14,190);box('Near railing top',(p.x,p.y,.91),(.68,.045,.055),'dark')
bpy.context.view_layer.update()
standins=[];checks=[]
for i,(x,y) in enumerate([(26,148),(113,148),(55,193),(271,193),(125,173)]):
 p=floor(x,y);o=box('Holmes scale '+str(i),(p.x,p.y,.925),(.43,.23,1.85),'actor');o.hide_render=True;standins.append(o);a=proj(p);b=proj(p+Vector((0,0,1.85)));checks.append({'feet':[x,y],'scale':y/176,'heightPixels':a[1]-b[1],'expectedHeight':106*y/176})
assert max(abs(g['heightPixels']-g['expectedHeight']) for g in checks)<.001
bpy.context.view_layer.update();bounds={}
for name,o in objects.items():
 pts=[proj(o.matrix_world@Vector(v)) for v in o.bound_box];bounds[name]={'vertices':pts,'rect':[min(p[0] for p in pts),min(p[1] for p in pts),max(p[0] for p in pts),max(p[1] for p in pts)]}
data={'camera':{'heightMetres':H,'lensMM':45,'sensorWidthMM':36,'yawDegrees':0,'pitchDegrees':0,'rollDegrees':0,'shiftY':-.375,'horizon':0,'fullSize':176,'vanishingPoint':[160,0],'canvas':[320,200],'pixelAspect':1.2},'objects':bounds,'scaleChecks':checks,'route':[[45,149],[70,158],[113,178],[182,189]],'note':'Frontal terrace and level camera. All walking foot points share the zero ground plane; threshold is nonwalkable. Final painting landmarks measured separately.'}
(HERE/'guides/perspective.json').write_text(json.dumps(data,indent=2)+'\n')
s.render.engine='BLENDER_WORKBENCH';s.display.shading.light='STUDIO';s.display.shading.color_type='MATERIAL';s.display.shading.show_shadows=True;s.display.shading.show_cavity=True;s.display.shading.cavity_type='BOTH';s.display.shading.background_type='WORLD';s.world.color=(.065,.08,.08);s.view_settings.view_transform='Standard';s.render.image_settings.file_format='PNG'
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'source/street-camera.blend'))
s.render.resolution_x=960;s.render.resolution_y=720;s.render.pixel_aspect_y=1;s.render.filepath=str(HERE/'guides/blockout.png');bpy.ops.render.render(write_still=True)
for o in standins:o.hide_render=False
s.render.filepath=str(HERE/'guides/blockout-scale.png');bpy.ops.render.render(write_still=True)
