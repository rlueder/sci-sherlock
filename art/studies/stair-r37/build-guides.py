"""A complete connected U-return timber stair. Blender geometry precedes painting.
Run from repo root: blender -b --python art/studies/stair-r37/build-guides.py
"""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
HERE=Path(__file__).resolve().parent
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;H=1.85*176/106;FX=400;FY=FX/1.2
mats={}
for name,col in {'wood':(.21,.095,.035,1),'tread':(.42,.26,.105,1),'lower':(.23,.14,.09,1),'wall':(.16,.22,.19,1),'frame':(.34,.18,.065,1),'door':(.27,.12,.055,1),'dark':(.025,.022,.028,1),'light':(.80,.59,.25,1),'route':(.15,.8,.8,1),'text':(.9,.85,.7,1),'actor':(.24,.43,.60,1)}.items():
 m=bpy.data.materials.new(name);m.diffuse_color=col;mats[name]=m
objects={};shell=[];route_objects=[]
def box(name,loc,dim,mat='wood',is_shell=False):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mats[mat]);objects[name]=o
 if is_shell:shell.append(o)
 return o
def beam(name,a,b,w=.07,d=.07,mat='wood'):
 a,b=Vector(a),Vector(b);o=box(name,(a+b)/2,(w,d,(b-a).length),mat);o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o
N=8;RUN=.38;RISE=.15;WIDTH=.95;START=6.7;END=START+N*RUN;LZ=-N*RISE;LANDING_DEPTH=1.0;LX=-.51;RX=.51
# Upper landing is a real slab ending flush at the top stair nosing.
box('Upper landing',(0,(4.7+START)/2,-.07),(5.7,START-4.7,.14),'tread',True)
# The landing behind the flights spans both widths; their entrances stay unrailed.
box('Turning landing',(0,END+LANDING_DEPTH/2,LZ-.065),(2.10,LANDING_DEPTH,.13),'tread')
for x in [-.98,.98]:
 box('Landing support '+str(x),(x,END+.81,-2.21),(.16,.16,2.02),'wood')
beam('Landing front joist',(-1.03,END+.03,LZ-.17),(1.03,END+.03,LZ-.17),.17,.20)
beam('Landing back joist',(-1.03,END+.90,LZ-.17),(1.03,END+.90,LZ-.17),.17,.20)
flights=[]
def flight(name,x,y0,z0,direction,mat):
 treads=[]
 for i in range(N):
  y=y0+direction*(i+.5)*RUN;z=z0-(i+1)*RISE
  box(name+' tread %02d'%i,(x,y,z-.025),(WIDTH,RUN,.05),mat)
  box(name+' riser %02d'%i,(x,y0+direction*i*RUN,z+RISE/2),(WIDTH,.035,RISE),'wood')
  treads.append({'center':[x,y,z],'width':WIDTH,'depth':RUN})
  for side in ([-1] if direction==1 else [1]):
   xx=x+side*(WIDTH/2-.045)
   # Balusters rise from the tread, terminating on the continuous sloped handrail.
   rail_z=z0-(i+.5)*RISE+.88
   beam(name+' baluster '+str(side)+' '+str(i),(xx,y,z),(xx,y,rail_z),.035,.035)
 for side in [-1,1]:
  xx=x+side*(WIDTH/2-.045)
  beam(name+' structural stringer '+str(side),(xx,y0,z0-.12),(xx,y0+direction*N*RUN,z0-N*RISE-.12),.12,.20)
  if side==(-1 if direction==1 else 1):
   beam(name+' outer handrail',(xx,y0,z0+.88),(xx,y0+direction*N*RUN,z0-N*RISE+.88),.065,.065,'frame')
   for yy,zz in [(y0,z0),(y0+direction*N*RUN,z0-N*RISE)]:box(name+' outer newel '+str(yy),(xx,yy,zz+.46),(.11,.11,.92),'frame')
 flights.append({'name':name,'widthMetres':WIDTH,'runMetres':RUN,'riseMetres':RISE,'start':[x,y0,z0],'end':[x,y0+direction*N*RUN,z0-N*RISE],'treads':treads})
flight('01 Left descent',LX,START,0,1,'tread')
flight('02 Right lower return',RX,END,LZ,-1,'lower')
# One central guard plane shared by the adjacent flights, not two competing inner rails.
# Its cap follows the upper flight; balusters reach the lower flight's rising stringer.
beam('Shared central handrail',(0,START,.88),(0,END,LZ+.88),.075,.075,'frame')
beam('Shared central lower support',(0,START,2*LZ-.07),(0,END,LZ-.07),.09,.12)
for i in range(N):
 y=START+(i+.5)*RUN;t=(i+.5)/N
 upper=LZ*t+.88;lower=2*LZ-LZ*t
 beam('Shared central baluster %02d'%i,(0,y,lower),(0,y,upper),.045,.045)
for y,base,top in [(START,2*LZ,.92),(END,LZ,LZ+.92)]:
 beam('Shared central newel '+str(y),(0,y,base),(0,y,top),.115,.115,'frame')
# Guard the back and outer sides of the turning landing, leaving both mouths clear.
back=END+LANDING_DEPTH-.04
beam('Back landing guard',(-1.03,back,LZ+.88),(1.03,back,LZ+.88),.065,.065,'frame')
for x in [-1.03,1.03]:
 beam('Outer landing guard '+str(x),(x,END,LZ+.88),(x,back,LZ+.88),.065,.065,'frame')
 for y in [END+.20,END+.46,END+.72,back]:beam('Landing baluster '+str(x)+' '+str(y),(x,y,LZ),(x,y,LZ+.88),.035,.035)
for x in [-1.03,-.85,-.45,0,.45,.85,1.03]:beam('Back baluster '+str(x),(x,back,LZ),(x,back,LZ+.88),.035,.035)
# Surrounding walls are a removable shell for cutaway verification.
box('Left well wall',(-1.44,8.8,-.15),(.16,5.0,5.1),'wall',True)
box('Right well wall',(1.44,8.8,-.15),(.16,5.0,5.1),'wall',True)
box('Far dark wall',(0,11.3,-.2),(3,.1,6),'dark',True)
for x in [-1.53,1.53]:box('Opening upright '+str(x),(x,START-.10,1.6),(.17,.19,3.2),'frame',True)
box('Opening header',(0,START-.1,3.12),(3.25,.20,.22),'frame',True)
# A normal planar entrance door, wholly distinct from the old clock artwork.
DX=-2.22;DY=START-.18
box('Entrance door leaf',(DX,DY,1.15),(.98,.10,2.3),'door',True)
for z,h in [(.59,.72),(1.63,1.00)]:
 box('Door panel '+str(z),(DX,DY-.062,z),(.73,.03,h),'wood',True)
for x in [DX-.56,DX+.56]:box('Door jamb '+str(x),(x,DY-.02,1.19),(.11,.16,2.38),'frame',True)
box('Door head',(DX,DY-.02,2.39),(1.23,.16,.13),'frame',True)
box('Warm door crack',(DX+.495,DY-.06,1.15),(.02,.02,2.27),'light',True)
box('Door handle',(DX+.33,DY-.10,1.05),(.04,.045,.13),'light',True)
# Continuous route: left flight -> full-depth lower landing -> right return.
route=[[LX,START-.45,0],[LX,START,0]]+[t['center'] for t in flights[0]['treads']]+[[LX,END+.50,LZ],[RX,END+.50,LZ],[RX,END,LZ]]+[t['center'] for t in flights[1]['treads']]
for i,(a,b) in enumerate(zip(route,route[1:])):
 aa=Vector(a)+Vector((0,0,.06));bb=Vector(b)+Vector((0,0,.06));route_objects.append(beam('Route %02d'%i,aa,bb,.045,.045,'route'))
for o in route_objects:o.hide_render=True
assert flights[0]['end'][2]==LZ==flights[1]['start'][2]
assert flights[0]['end'][1]==flights[1]['start'][1]==END
assert flights[1]['end'][2]<LZ<0
assert LX+WIDTH/2<RX-WIDTH/2
assert len([n for n in objects if n=='Shared central handrail'])==1
assert not any('handrail -1' in n or 'handrail 1' in n for n in objects)
checks={'sameLandingLevel':True,'bothFlightMouthsMeetLanding':True,'noSidewaysTreads':True,'secondFlightBelowFirst':True,'clearFlightWidth':WIDTH-.09,'centralGuardRows':1,'centralHandrailCount':1,'turningLandingDepth':LANDING_DEPTH,'lowestFloorVisibleInGame':False}
(HERE/'guides/flight-layout.json').write_text(json.dumps({'flights':flights,'route':route,'checks':checks,'note':'Actual timber risers, stringers and supported turning landing. Remove shell in cutaway to inspect.'},indent=2)+'\n')
# Fixed game camera and actor scale validation.
cd=bpy.data.cameras.new('Game camera');cam=bpy.data.objects.new('Game camera',cd);s.collection.objects.link(cam);cam.location=(0,0,H);cam.rotation_euler=(math.pi/2,0,0);cd.lens=45;cd.sensor_width=36;cd.sensor_fit='HORIZONTAL';cd.shift_y=-.375;s.camera=cam
s.render.resolution_x=320;s.render.resolution_y=200;s.render.resolution_percentage=100;s.render.pixel_aspect_x=1;s.render.pixel_aspect_y=1.2
bpy.context.view_layer.update()
def proj(v):
 p=world_to_camera_view(s,cam,Vector(v));return[p.x*320,(1-p.y)*200]
def floor(x,y):
 d=FY*H/y;return Vector(((x-160)*d/FX,d,0))
points=[(93,165),(233,165),(86,194),(243,194),(164,176)];scales=[];actors=[]
for i,(x,y) in enumerate(points):
 p=floor(x,y);height=proj(p)[1]-proj(p+Vector((0,0,1.85)))[1];assert abs(height-106*y/176)<.001
 o=box('Scale person '+str(i),p+Vector((0,0,.925)),(.43,.22,1.85),'actor');o.hide_render=True;actors.append(o);scales.append({'feet':[x,y],'heightPixels':height,'scale':y/176})
(HERE/'guides/stair.json').write_text(json.dumps({'camera':{'horizon':0,'fullSize':176,'heightMetres':H,'lensMM':45,'shiftY':-.375,'pixelAspect':1.2},'scaleChecks':scales,'walkable':[[78,160],[258,160],[263,195],[71,195]],'arrival':[90,174]},indent=2)+'\n')
s.render.engine='BLENDER_WORKBENCH';s.display.shading.light='STUDIO';s.display.shading.color_type='MATERIAL';s.display.shading.show_shadows=True;s.display.shading.show_cavity=True;s.display.shading.cavity_type='BOTH';s.display.shading.background_type='WORLD';s.world.color=(.035,.04,.045);s.view_settings.view_transform='Standard';s.render.image_settings.file_format='PNG';bpy.context.preferences.filepaths.save_version=0
# Keep all camera views in the editable file.
def camera(name,loc,target,scale):
 data=bpy.data.cameras.new(name);o=bpy.data.objects.new(name,data);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();data.type='ORTHO';data.ortho_scale=scale;return o
cut=camera('Cutaway camera',(5,2.5,4.8),(0,8.4,-.6),7.8)
top=camera('Top plan camera',(0,8.25,12),(0,8.25,0),7.2)
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'source/stair-planes.blend'))
s.render.resolution_x=960;s.render.resolution_y=720;s.render.pixel_aspect_y=1
s.render.filepath=str(HERE/'guides/stair-blockout.png');bpy.ops.render.render(write_still=True)
for o in actors:o.hide_render=False
s.render.filepath=str(HERE/'guides/stair-scale.png');bpy.ops.render.render(write_still=True)
for o in actors:o.hide_render=True
for o in shell:o.hide_render=True
for o in route_objects:o.hide_render=False
s.camera=cut;s.render.filepath=str(HERE/'guides/stair-cutaway.png');bpy.ops.render.render(write_still=True)
s.camera=top;s.render.filepath=str(HERE/'guides/stair-plan.png');bpy.ops.render.render(write_still=True)
