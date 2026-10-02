"""Original room blockouts; project actual geometry with Blender, not guessed line slopes."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
H=Path(__file__).resolve().parent

def scene(name,location,target,lens):
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 s=bpy.context.scene;s.render.resolution_x=320;s.render.resolution_y=200;s.render.resolution_percentage=100;s.render.pixel_aspect_x=1;s.render.pixel_aspect_y=1.2
 d=bpy.data.cameras.new(name);c=bpy.data.objects.new('Camera',d);s.collection.objects.link(c);c.location=location;c.rotation_euler=(Vector(target)-c.location).to_track_quat('-Z','Y').to_euler();d.lens=lens;d.sensor_width=36;d.sensor_fit='HORIZONTAL';s.camera=c;bpy.context.view_layer.update();return s,c,[]
def box(s,objects,name,center,size):
 v=[Vector((center[0]+a*size[0]/2,center[1]+b*size[1]/2,center[2]+c*size[2]/2)) for c in [-1,1] for b in [-1,1] for a in [-1,1]]
 e=[[0,1],[0,2],[1,3],[2,3],[4,5],[4,6],[5,7],[6,7],[0,4],[1,5],[2,6],[3,7]];mesh=bpy.data.meshes.new(name);mesh.from_pydata(v,e,[]);o=bpy.data.objects.new(name,mesh);s.collection.objects.link(o);o.display_type='WIRE'
 def project(p):
  q=world_to_camera_view(s,s.camera,p);return [q.x*320,(1-q.y)*200]
 objects.append({'name':name,'vertices':[project(p) for p in v],'edges':e})
def save(name,s,c,objects):
 data={'name':name,'canvas':[320,200],'pixelAspect':1.2,'camera':{'location':list(c.location),'rotationEuler':list(c.rotation_euler),'lensMM':c.data.lens},'objects':objects,'status':'Pre-painting composition and perspective guide. Does not certify every painted edge.'};(H/f'guides/{name}.json').write_text(json.dumps(data,indent=2)+'\n');bpy.ops.wm.save_as_mainfile(filepath=str(H/f'source/{name}-construction.blend'))
s,c,o=scene('Baker Street oblique view',(0,-10,2.8),(0,2,1.7),36)
box(s,o,'221 facade',(-3,4,3.2),(6,.3,6.4));box(s,o,'Warm entry',(-3,3.75,1.2),(1.1,.2,2.4));box(s,o,'Pavement',(-2.5,2.9,.08),(7,2,.16));box(s,o,'Cab body',(1.4,2.6,1.4),(1.15,1,1.65));box(s,o,'Cab wheel envelope',(1.4,2.4,.64),(1.35,1.3,1.28));box(s,o,'Horse body',(3.1,2.6,1.1),(1.55,.55,.65));box(s,o,'Horse head',(4,2.6,1.65),(.5,.4,.65));box(s,o,'Lamp post',(-2.6,-2,1.9),(.13,.13,3.8));box(s,o,'Lamp housing',(-2.6,-2,3.65),(.48,.48,.64));box(s,o,'Actor stature on route',(-.6,.4,.88),(.45,.3,1.76));save('street',s,c,o)
s,c,o=scene('Hidden stair from upper landing',(2,-4.2,4.1),(0,2.6,-1.1),27)
box(s,o,'Upper landing',(0,-.6,-.1),(2.5,1.2,.2))
for i in range(11):box(s,o,'Tread '+str(i+1),(0,i*.44+.22,-i*.23-.12),(2,.44,.24))
box(s,o,'Left wall',(-1.17,2,-.2),(.25,5,3.8));box(s,o,'Right wall',(1.17,2,-.2),(.25,5,3.8));save('stair',s,c,o)
