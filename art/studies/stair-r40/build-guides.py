"""A complete connected U-return timber stair. Blender geometry precedes painting.
Run from repo root: blender -b --python art/studies/stair-r40/build-guides.py
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
N=8;RUN=.38;RISE=.21;WIDTH=.95;START=6.7;END=START+N*RUN;LZ=-N*RISE;LANDING_DEPTH=1.0;LX=-.51;RX=.51
# Upper landing is a real slab ending flush at the top stair nosing.
box('Upper landing',(0,(4.7+START)/2,-.07),(5.7,START-4.7,.14),'tread',True)
# The landing behind the flights spans both widths; their entrances stay unrailed.
box('Turning landing',(0,END+LANDING_DEPTH/2,LZ-.065),(2.10,LANDING_DEPTH,.13),'tread')
for x in [-.98,.98]:
 box('Landing support '+str(x),(x,END+.81,(LZ+2*LZ-.8)/2),(.16,.16,-LZ+.8),'wood')
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
 for side in [-1,1]:
  xx=x+side*(WIDTH/2-.045)
  beam(name+' structural stringer '+str(side),(xx,y0,z0-.12),(xx,y0+direction*N*RUN,z0-N*RISE-.12),.12,.20)
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
# Plain box enclosure, with no outer rails, back guards, panelling or timber frame.
# Inner faces meet the outer tread edges and the back of the turning landing.
WELL_X=abs(LX)+WIDTH/2
BACK_Y=END+LANDING_DEPTH
WALL_BOTTOM=2*LZ-.8;WALL_TOP=3.1;WALL_Z=(WALL_BOTTOM+WALL_TOP)/2;WALL_H=WALL_TOP-WALL_BOTTOM
box('Left plain well wall',(-WELL_X-.08,(START+BACK_Y)/2,WALL_Z),(.16,BACK_Y-START+.16,WALL_H),'wall',True)
box('Right plain well wall',(WELL_X+.08,(START+BACK_Y)/2,WALL_Z),(.16,BACK_Y-START+.16,WALL_H),'wall',True)
box('Back plain well wall',(0,BACK_Y+.08,WALL_Z),(2*WELL_X+.32,.16,WALL_H),'wall',True)
# Plaster cheeks connect the narrower shaft to the foreground room opening.
for side in [-1,1]:
 box('Plain entrance cheek '+str(side),(side*(WELL_X+1.44)/2,START-.03,1.55),(1.44-WELL_X,.16,3.10),'wall',True)
box('Plain lintel',(0,START-.03,3.13),(2.88,.16,.16),'wall',True)
# A normal planar entrance door, wholly distinct from the old clock artwork.
DX=-2.22;DY=START-.18
box('Entrance door leaf',(DX,DY,1.15),(.98,.10,2.3),'door',True)
for z,h in [(.59,.72),(1.63,1.00)]:
 box('Door panel '+str(z),(DX,DY-.062,z),(.73,.03,h),'wood',True)
for x in [DX-.56,DX+.56]:box('Door jamb '+str(x),(x,DY-.02,1.19),(.11,.16,2.38),'frame',True)
box('Door head',(DX,DY-.02,2.39),(1.23,.16,.13),'frame',True)
box('Warm door crack',(DX+.495,DY-.06,1.15),(.02,.02,2.27),'light',True)
box('Door handle',(DX+.33,DY-.10,1.05),(.04,.045,.13),'light',True)
# Restrained hallway furnishings, placed before paint to check scale and clearance.
# These reference boxes establish planes, not final decorative detailing.
box('Outer right plaster wall',(2.2,START+.06,1.55),(1.52,.12,3.10),'wall',True)
box('Lamp backplate',(0,BACK_Y-.03,.72),(.17,.06,.30),'dark',True)
box('Lamp bracket',(0,BACK_Y-.16,.65),(.055,.28,.055),'frame',True)
box('Lamp glass',(0,BACK_Y-.27,.94),(.24,.18,.34),'light',True)
box('Lamp hood',(0,BACK_Y-.27,1.13),(.31,.24,.065),'dark',True)
box('Runner rug',(.575,5.95,.009),(4.55,1.10,.018),'door',True)
TX=2.17;TY=6.40;TW=.80;TD=.34;TH=.80
box('Hall table top',(TX,TY,TH),(TW,TD,.055),'frame',True)
box('Hall table drawer',(TX,TY,TH-.12),(TW-.04,TD-.02,.18),'door',True)
for xx in [TX-TW/2+.045,TX+TW/2-.045]:
 for yy in [TY-TD/2+.04,TY+TD/2-.04]:box('Table leg '+str(xx)+str(yy),(xx,yy,(TH-.22)/2),(.055,.055,TH-.22),'wood',True)
box('Letters',(TX+.19,TY-.03,TH+.07),(.20,.13,.06),'light',True)
box('Small brass tray',(TX-.16,TY-.02,TH+.035),(.20,.13,.015),'light',True)
box('Umbrella stand',(1.82,6.44,.22),(.18,.18,.44),'dark',True)
shell.append(beam('Umbrella reference',(1.82,6.44,.10),(1.86,6.47,1.03),.025,.025,'wood'))
box('Small coat peg board',(TX,START-.055,1.62),(.55,.055,.09),'wood',True)
for x in [TX-.19,TX,TX+.19]:box('Coat peg '+str(x),(x,START-.105,1.61),(.035,.09,.035),'frame',True)
box('Scarf fold on middle hook',(TX,START-.155,1.62),(.10,.075,.09),'door',True)
box('Scarf left end',(TX-.035,START-.14,1.29),(.07,.035,.61),'door',True)
box('Scarf right end',(TX+.035,START-.16,1.23),(.07,.035,.72),'door',True)
assert TX-TW/2>1.7 # furniture stays right of the walk corridor
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
assert not any('outer handrail' in n or 'outer newel' in n or 'landing guard' in n or 'Back baluster' in n for n in objects)
assert len([n for n in objects if 'plain well wall' in n])==3
checks={'sameLandingLevel':True,'bothFlightMouthsMeetLanding':True,'noSidewaysTreads':True,'secondFlightBelowFirst':True,'clearFlightWidth':WIDTH-.09,'flightPitchDegrees':math.degrees(math.atan(RISE/RUN)),'totalDropMetres':-2*LZ,'centralGuardRows':1,'centralHandrailCount':1,'outerRailCount':0,'backGuardCount':0,'plainWallCount':3,'turningLandingDepth':LANDING_DEPTH,'lowestFloorVisibleInGame':False}
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
(HERE/'guides/stair.json').write_text(json.dumps({'camera':{'horizon':0,'fullSize':176,'heightMetres':H,'lensMM':45,'shiftY':-.375,'pixelAspect':1.2},'scaleChecks':scales,'walkable':[[78,160],[258,160],[263,195],[71,195]],'arrival':[90,174],'furnishings':{'lamp':{'plane':'back wall','centreWorld':[0,BACK_Y-.27,.94],'sizeMetres':[.31,.34]},'runner':{'centreWorld':[.575,5.95,.009],'sizeMetres':[4.55,1.10],'direction':'left-right'},'table':{'centreWorld':[TX,TY,TH/2],'sizeMetres':[TW,TD,TH],'walkCorridorClear':True}}},indent=2)+'\n')
s.render.engine='BLENDER_WORKBENCH';s.display.shading.light='STUDIO';s.display.shading.color_type='MATERIAL';s.display.shading.show_shadows=True;s.display.shading.show_cavity=True;s.display.shading.cavity_type='BOTH';s.display.shading.background_type='WORLD';s.world.color=(.035,.04,.045);s.view_settings.view_transform='Standard';s.render.image_settings.file_format='PNG';bpy.context.preferences.filepaths.save_version=0
# Keep all camera views in the editable file.
def camera(name,loc,target,scale):
 data=bpy.data.cameras.new(name);o=bpy.data.objects.new(name,data);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();data.type='ORTHO';data.ortho_scale=scale;return o
cut=camera('Cutaway camera',(5,2.5,4.8),(0,8.4,-1.0),9.0)
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
# Box enclosure inspection: expose stair from the near/right side, retaining left/back walls.
for name in ['Left plain well wall','Back plain well wall']:objects[name].hide_render=False
s.camera=cut;s.render.filepath=str(HERE/'guides/stair-walls.png');bpy.ops.render.render(write_still=True)
