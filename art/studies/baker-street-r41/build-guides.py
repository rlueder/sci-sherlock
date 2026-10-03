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

# Measured frontal planes of the selected painting, not a surveyed street section.
KIND='street'
panel('Terrace facade',[0,-30,277,134],134,'wall',.10)
for i,(l,r) in enumerate([(15,42),(72,104),(184,212)]):
 panel('Door '+str(i),[l,44,r,116],134,'wood',.15)
 panel('Fanlight '+str(i),[l,27,r,42],134,'paper',.17)
for i,(l,r) in enumerate([(130,159),(234,264)]):panel('Sash '+str(i),[l,26,r,98],134,'blue',.2)
back=floor(160,134).y;front=floor(160,142).y
box('Narrow painted footway',(0,(front+back)/2,-.03),(16,back-front,.06),'floor')
box('Kerb',(0,front,-.10),(16,.07,.20),'paper')
box('Road',(0,front-2.1,-.16),(16,4.2,.08),'dark')
panel('Foreground cab',[246,61,330,200],218,'wood',.3)
panel('Cab lamp',[277,77,294,101],218,'paper',.40)
panel('Driver torso',[255,46,309,67],218,'dark',.5)
panel('Driver head and hat',[268,30,296,47],218,'dark',.52)
D=FY*H/218
bpy.ops.mesh.primitive_cylinder_add(vertices=40,radius=.84,depth=.10,location=((285-160)*D/FX,D,H-188*D/FY),rotation=(math.pi/2,0,0));bpy.context.object.data.materials.append(mats['dark'])
points=[(48,137),(207,137),(48,141),(207,141),(139,139)]
polygon=[[47,136],[211,136],[211,142],[46,142]];arrival=[85,139]
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
