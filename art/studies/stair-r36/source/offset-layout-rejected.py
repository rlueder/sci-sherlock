"""Three planes, one fixed level camera. No image manipulation: Blender scene construction."""
import bpy, math, json, sys
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
HERE=Path(__file__).resolve().parent
KIND='stair'
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

# Two offset narrow flights: left to a lower cross-landing, then right and back beneath the upper landing.
start=floor(112,150);near=floor(160,205);width=.94;run=.45;rise=.15
box('Upper safe landing',(0,(near.y+start.y)/2,-.06),(6,start.y-near.y,.12),'floor')
panel('Entrance surround',[0,5,61,157],157,'trim',.2)
panel('Plain flat entrance door',[5,16,55,151],157,'wood',.35)
panel('Top door panel',[12,26,47,74],157,'dark',.4)
panel('Bottom door panel',[12,84,47,137],157,'dark',.4)
panel('Warm return crack',[53,19,56,149],157,'paper',.4)
panel('Opening left jamb',[65,3,74,152],152,'wood',.3)
panel('Opening lintel',[64,0,305,13],152,'trim',.3)
panel('Opening right jamb',[296,10,307,152],152,'wood',.3)
flights=[]
def flight(label,x,begin,z0,count,direction=1):
 treads=[]
 for i in range(count):
  y=begin+direction*(i+.5)*run;z=z0-(i+1)*rise
  box(label+' tread '+str(i),(x,y,z-.025),(width,run,.05),'trim' if label=='First flight' else 'wood')
  box(label+' riser '+str(i),(x,begin+direction*i*run,z+rise/2),(width,.025,rise),'wood')
  treads.append({'center':[x,y,z],'projectedCenter':proj((x,y,z))})
  for side in [-1,1]:
   xx=x+side*(width/2-.025)
   box(label+' baluster '+str(side)+' '+str(i),(xx,y,z+.40),(.035,.035,.80),'wood')
   o=box(label+' rail '+str(side)+' '+str(i),(xx,y,z+.85),(.065,(run*run+rise*rise)**.5,.065),'trim');o.rotation_euler.x=-direction*math.atan2(rise,run)
 for side in [-1,1]:box(label+' newel '+str(side),(x+side*width/2,begin-.035,z0+.46),(.115,.115,.92),'trim')
 flights.append({'name':label,'widthMetres':width,'start':[x,begin,z0],'end':[x,begin+direction*count*run,z0-count*rise],'treads':treads})
 return begin+count*run,z0-count*rise
firstX=start.x;firstEnd,lowerZ=flight('First flight',firstX,start.y,0,7)
rightX=1.15;landingDepth=.9
box('Lower connecting landing',((firstX+rightX)/2,firstEnd+landingDepth/2,lowerZ-.04),(rightX-firstX+width,landingDepth,.08),'floor')
# The inner corner is open to the right continuation, never sealed by a rail.
box('Lower landing back rail',((firstX+rightX)/2,firstEnd+landingDepth-.03,lowerZ+.78),(rightX-firstX-width,.065,.065),'wood')
flight('Second flight',rightX,firstEnd+.04,lowerZ,10,direction=-1)
box('Left stairwell wall',(-2.15,start.y+4.7,-.4),(.16,9.5,5.5),'wall')
box('Right stairwell wall',(2.3,start.y+4.7,-.4),(.16,9.5,5.5),'wall')
box('Deep shadow beyond stairs',(0,18,-.2),(4.5,.1,7),'dark')
points=[(91,163),(238,163),(83,193),(243,193),(163,176)]
polygon=[[78,160],[258,160],[263,195],[71,195]];arrival=[90,174]
(HERE/'guides/flight-layout.json').write_text(json.dumps({'flights':flights,'connectingLandingZ':lowerZ,'firstFlightOnLeft':True,'secondFlightFartherRight':True,'bothDescend':all(f['end'][2]<f['start'][2] for f in flights)},indent=2)+'\n')
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
