"""Camera-first 221B. Blender Z is up; local camera -Z points along world +Y."""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
HERE=Path(__file__).resolve().parent
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
s=bpy.context.scene
s.render.resolution_x=320;s.render.resolution_y=200;s.render.resolution_percentage=100
s.render.pixel_aspect_x=1;s.render.pixel_aspect_y=1.2
H=1.85*176/106;FX=400;FY=FX/1.2
cdata=bpy.data.cameras.new('Level camera - zero scene yaw pitch roll')
c=bpy.data.objects.new('Camera',cdata);s.collection.objects.link(c)
c.location=(0,0,H);c.rotation_euler=(math.pi/2,0,0)
cdata.lens=45;cdata.sensor_width=36;cdata.sensor_fit='HORIZONTAL';cdata.shift_y=-.375;s.camera=c
materials={}
for name,col in {'wall':(.19,.24,.19,1),'wood':(.19,.078,.032,1),'trim':(.29,.14,.058,1),'gold':(.53,.32,.12,1),'floor':(.30,.19,.10,1),'rug':(.23,.054,.045,1),'velvet':(.29,.042,.039,1),'blue':(.17,.30,.48,1),'dark':(.032,.024,.03,1),'paper':(.64,.52,.32,1),'body':(.15,.22,.32,1)}.items():
 m=bpy.data.materials.new(name);m.diffuse_color=col;materials[name]=m
objects={}
def box(name,loc,dim,mat='wood'):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(materials[mat]);objects[name]=o;return o
def floor(x,y):
 d=FY*H/y;return Vector(((x-160)*d/FX,d,0))
def proj(v):
 p=world_to_camera_view(s,c,Vector(v));return [p.x*320,(1-p.y)*200]
def atfloor(name,x,y,w,h,d,mat='wood'):
 p=floor(x,y);return box(name,(p.x,p.y+d/2,h/2),(w,d,h),mat)
D=FY*H/144
box('Back wall',(0,D+.14,1.6),(6.0,.16,3.2),'wall')
box('Floor',(0,6, -.07),(10,10,.14),'floor')
box('Skirting',(0,D-.02,.12),(6,.09,.24),'wood')
box('Picture rail',(0,D-.02,2.89),(6,.10,.06),'trim')
# Frontal sash window, with physically horizontal lintels and vertical jambs.
wx=(45-160)*D/FX
box('Window frame',(wx,D-.04,1.74),(1.21,.16,2.18),'trim')
box('Blue window',(wx,D-.15,1.74),(1.05,.06,2.02),'blue')
box('Window vertical bar',(wx,D-.20,1.74),(.045,.035,2.02),'wood')
box('Window horizontal sash',(wx,D-.20,1.74),(1.05,.035,.045),'wood')
for side in [-1,1]:box('Curtain '+str(side),(wx+side*.67,D-.17,1.70),(.19,.16,2.45),'velvet')
atfloor('Window cabinet',44,144,1.19,.68,.35)
# Fireplace, single plane shared across room.
fx=(159-160)*D/FX
for x in [-.49,.49]:box('Mantel leg '+str(x),(fx+x,D-.21,.52),(.20,.40,1.04),'trim')
box('Mantel lintel',(fx,D-.21,1.08),(1.32,.46,.20),'trim')
box('Mantel shelf',(fx,D-.24,1.25),(1.48,.56,.12),'wood')
box('Hearth dark opening',(fx,D-.075,.50),(.82,.02,.94),'dark')
box('Hearth slab',(fx,D-.43,.04),(1.38,.82,.08),'dark')
box('Overmantel frame',(fx,D-.01,2.04),(1.49,.10,1.04),'gold')
box('Overmantel picture',(fx,D-.07,2.04),(1.33,.03,.88),'paper')
# Chemistry bench, front-parallel.
bx=(226-160)*D/FX
box('Bench top',(bx,D-.29,.94),(1.02,.58,.09),'trim')
for dx in [-.43,.43]:
 for dy in [-.51,-.07]:box('Bench leg '+str(dx)+str(dy),(bx+dx,D+dy,.45),(.08,.08,.90))
box('Bench drawer',(bx,D-.34,.80),(.88,.40,.20))
box('Test tube rack',(bx,D-.26,1.17),(.44,.15,.37),'gold')
# Empty front-facing reading chair, deeper seat projects in perspective.
cp=floor(91,160);cx,cy=cp.x,cp.y
box('Chair back',(cx,cy+.70,.87),(.76,.17,1.32),'velvet')
box('Chair seat',(cx,cy+.38,.47),(.70,.66,.18),'velvet')
for dx in [-.35,.35]:
 box('Chair arm '+str(dx),(cx+dx,cy+.34,.68),(.13,.71,.20),'velvet')
 for dy in [.04,.66]:box('Chair foot '+str(dx)+str(dy),(cx+dx,cy+dy,.21),(.07,.07,.42))
# Door dimensions fixed; front face is on plane Y=D-.12.
doorx=(285-160)*D/FX;doorW=.96;doorH=2.18;doorY=D-.12
for dx in [-doorW/2-.05,doorW/2+.05]:box('Door jamb '+str(dx),(doorx+dx,doorY,doorH/2),(.10,.16,doorH+.12),'trim')
box('Door lintel',(doorx,doorY,doorH+.05),(doorW+.20,.16,.10),'trim')
box('Door leaf',(doorx,doorY-.03,doorH/2),(doorW,.045,doorH),'wood')
for z,h in [(.55,.77),(1.60,.79)]:box('Door panel '+str(z),(doorx,doorY-.06,z),(.72,.02,h),'trim')
# Foreground desk clipped by left/bottom edges; never inside the walking band.
tp=floor(19,240)
box('Foreground desk top',(tp.x,tp.y+.44,.80),(1.25,.92,.10),'trim')
box('Foreground desk apron',(tp.x,tp.y+.42,.63),(1.15,.82,.26))
for dx in [-.52,.52]:
 for dy in [.08,.79]:box('Foreground desk leg '+str(dx)+str(dy),(tp.x+dx,tp.y+dy,.34),(.11,.11,.68))
# Rug edges are aligned with the room, not independently skewed.
box('Rug',(0,5.75,.006),(3.2,1.35,.012),'rug')
bpy.context.view_layer.update()
standins=[];scale=[]
for i,(x,y) in enumerate([(120,145),(280,145),(120,195),(280,195),(200,170)]):
 p=floor(x,y);o=box('Scale stand-in '+str(i),(p.x,p.y,.925),(.43,.22,1.85),'body');o.hide_render=True;standins.append(o)
 bottom=proj(p);top=proj(p+Vector((0,0,1.85)))
 scale.append({'feet':[x,y],'world':list(p),'projectedFeet':bottom,'projectedCrown':top,'scale':y/176,'heightPixels':bottom[1]-top[1],'expectedHeight':106*y/176})
assert max(abs(a['heightPixels']-a['expectedHeight']) for a in scale)<.001
bpy.context.view_layer.update()
bounds={}
for name,o in objects.items():
 pts=[proj(o.matrix_world@Vector(v)) for v in o.bound_box]
 bounds[name]={'corners':pts,'rect':[min(p[0] for p in pts),min(p[1] for p in pts),max(p[0] for p in pts),max(p[1] for p in pts)]}
# Same camera, fixed right hinge; positive swing goes into the room and leftward on screen.
hinge=Vector((doorx+doorW/2,doorY-.055,0));poses=[]
for a in [0,16,32,48,64,80]:
 r=math.radians(a);left=hinge+Vector((-doorW*math.cos(r),-doorW*math.sin(r),0))
 verts=[left,left+Vector((0,0,doorH)),hinge+Vector((0,0,doorH)),hinge]
 poses.append({'angle':a,'vertices':[[*proj(v),v.y] for v in verts]})
chairJoints={k:proj((cx+dx,cy+dy,z)) for k,(dx,dy,z) in {'crown':(0,.56,1.30),'neck':(0,.51,1.10),'shoulderLeft':(-.22,.50,1.05),'shoulderRight':(.22,.50,1.05),'elbowLeft':(-.24,.22,.78),'elbowRight':(.24,.22,.78),'handLeft':(-.12,.05,.79),'handRight':(.15,.05,.79),'pelvis':(0,.48,.51),'kneeLeft':(-.17,-.03,.46),'kneeRight':(.17,-.03,.46),'ankleLeft':(-.17,-.07,.08),'ankleRight':(.17,-.07,.08),'footLeft':(-.17,-.25,.03),'footRight':(.17,-.25,.03)}.items()}
data={'camera':{'lensMM':45,'sensorWidthMM':36,'heightMetres':H,'yawDegrees':0,'pitchDegrees':0,'rollDegrees':0,'blenderRotationRadians':[math.pi/2,0,0],'shiftY':-.375,'horizon':0,'fullSize':176,'vanishingPoint':[160,0],'pixelAspect':1.2,'canvas':[320,200]},'scaleChecks':scale,'objects':bounds,'door':{'hinge':list(hinge),'poses':poses,'closedUV':[[p[0],p[1]] for p in poses[0]['vertices']]},'seatedWatson':{'joints':chairJoints,'feet':proj((cx,cy-.25,0)),'statureMetres':1.75,'seatedCrownMetres':1.30},'walkable':[[112,145],[299,145],[308,195],[91,195],[91,170],[112,157]],'arrival':[285,148]}
(HERE/'guides/perspective.json').write_text(json.dumps(data,indent=2)+'\n')
s.render.engine='BLENDER_WORKBENCH';s.display.shading.light='STUDIO';s.display.shading.color_type='MATERIAL';s.display.shading.show_shadows=True;s.display.shading.show_cavity=True;s.display.shading.cavity_type='BOTH';s.display.shading.background_type='WORLD';s.world.color=(.08,.08,.08)
s.view_settings.view_transform='Standard';s.render.image_settings.file_format='PNG'
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'source/221b-camera.blend'))
# Equivalent square-pixel 4:3 guide for image generation; native projection remains in JSON/blend.
s.render.resolution_x=960;s.render.resolution_y=720;s.render.pixel_aspect_y=1
s.render.filepath=str(HERE/'guides/blockout.png');bpy.ops.render.render(write_still=True)
for o in standins:o.hide_render=False
s.render.filepath=str(HERE/'guides/blockout-scale.png');bpy.ops.render.render(write_still=True)
