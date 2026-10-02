"""221B construction: the workshop's 45mm camera and 1:1.2 native pixel aspect."""
import bpy,json,math
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
HERE=Path(__file__).resolve().parent
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene
s.render.resolution_x=320;s.render.resolution_y=200;s.render.resolution_percentage=100
s.render.pixel_aspect_x=1;s.render.pixel_aspect_y=1.2
d=bpy.data.cameras.new('Workshop camera convention — horizon y72')
c=bpy.data.objects.new('Camera',d);s.collection.objects.link(c)
c.location=(0,0,10);c.rotation_euler[1]=math.radians(26);d.lens=45;d.sensor_width=36;d.sensor_fit='HORIZONTAL'
d.shift_x=4/320;d.shift_y=-28*1.2/320;s.camera=c
bpy.context.view_layer.update()
def floor(x,y):
 distance=(400/1.2)*1.8/(y-72)
 ray=c.rotation_euler.to_matrix() @ Vector(((x-156)/400,(72-y)*1.2/400,-1))
 return c.location+ray*distance
def project(p):
 q=world_to_camera_view(s,c,p);return [q.x*320,(1-q.y)*200]
objects=[]
def box(name,x,y,width,height,depth,raise_px=0):
 p=floor(x,y);dist=(400/1.2)*1.8/(y-72);w=width*dist/400;h=height*dist*1.2/400
 p.y+=raise_px*dist*1.2/400
 v=[p+Vector((a*w/2,b*h,z)) for z in [0,-depth] for b in [0,1] for a in [-1,1]]
 edges=[[0,1],[0,2],[1,3],[2,3],[4,5],[4,6],[5,7],[6,7],[0,4],[1,5],[2,6],[3,7]]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(v,edges,[]);mesh.update()
 o=bpy.data.objects.new(name,mesh);s.collection.objects.link(o);o.display_type='WIRE'
 objects.append({'name':name,'vertices':[project(q) for q in v],'edges':edges,'floor':[x,y]})
box('Rear wall',156,136,400,140,.01)
box('Window',54,140,80,91,.08,31)
box('Fireplace and mantel',163,136,68,58,.28)
box('Watson chair envelope',96,168,49,88,.8)
box('Chemistry bench',235,148,49,42,.6)
box('Entry frame',292,145,38,100,.1)
box('Foreground table',28,198,102,33,1.2)
# floor edges run to the same vanishing point, no independent furniture shears.
lines=[]
for x in range(-12,5):lines.append([project(Vector((x,-1.8,-5))),project(Vector((x,-1.8,6)))])
for z in range(-5,7):lines.append([project(Vector((-12,-1.8,z))),project(Vector((4,-1.8,z)))])
data={'camera':{'lensMM':45,'focalNativePixels':400,'horizon':72,'yawDegrees':26,'vanishingPoints':[[156+400/math.tan(math.radians(26)),72],[156-400*math.tan(math.radians(26)),72]],'pixelAspect':1.2,'eyeHeight':1.8},'objects':objects,'floorGuides':lines,'status':'Proposed drawing construction; not a solved camera from generated art'}
(HERE/'guides').mkdir(exist_ok=True)
(HERE/'guides/perspective.json').write_text(json.dumps(data,indent=2)+'\n')
notes=bpy.data.texts.new('READ ME — 221B construction')
notes.write('Use the same native-pixel lens and aspect convention as workshop r4/r5, but yaw the 221B camera 26 degrees.\nThe camera is an intended drawing guide, not an image-calibration claim.\nRoom art, collision polygons and runtime placement are separate.\n')
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'source/221b-construction.blend'))
