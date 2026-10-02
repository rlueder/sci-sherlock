"""Baker Street script-first scene; metre-scale ground, door, horse/cab and actor proxies."""
import bpy, json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
H=Path(__file__).resolve().parent
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.resolution_x=320;s.render.resolution_y=200;s.render.resolution_percentage=100;s.render.pixel_aspect_x=1;s.render.pixel_aspect_y=1.2
cd=bpy.data.cameras.new('Street camera');cam=bpy.data.objects.new('Street camera',cd);s.collection.objects.link(cam);s.camera=cam;cam.location=(0,-6,1.7);cam.rotation_euler=(Vector((0,2,1.3))-cam.location).to_track_quat('-Z','Y').to_euler();cd.lens=45;cd.sensor_width=36;cd.sensor_fit='HORIZONTAL';bpy.context.view_layer.update()
objects=[]
def project(v):
 q=world_to_camera_view(s,cam,Vector(v));return [round(q.x*320,2),round((1-q.y)*200,2)]
def box(name,c,d,kind):
 vs=[(c[0]+a*d[0]/2,c[1]+b*d[1]/2,c[2]+z*d[2]/2) for z in [-1,1] for b in [-1,1] for a in [-1,1]];edges=[[0,1],[0,2],[1,3],[2,3],[4,5],[4,6],[5,7],[6,7],[0,4],[1,5],[2,6],[3,7]];mesh=bpy.data.meshes.new(name);mesh.from_pydata(vs,edges,[]);obj=bpy.data.objects.new(name,mesh);s.collection.objects.link(obj);objects.append(dict(name=name,kind=kind,center=c,dimensions=d,vertices=[project(v) for v in vs],edges=edges))
box('221B wall',(-3.5,4.1,3),(4,.2,6),'architecture');box('Door with lit fanlight',(-2.8,3.9,1.3),(1.2,.1,2.6),'door');box('Entry step',(-2.8,3.3,.1),(1.55,1.1,.2),'ground');box('Pavement kerb',(-1,2.5,.08),(8,.65,.16),'ground')
box('Cab enclosed two-seat body',(1.25,3,1.38),(1.2,1.05,1.6),'cab');box('Near spoked wheel envelope',(1.2,2.36,.65),(1.35,.15,1.3),'cab');box('Far wheel envelope',(1.2,3.62,.65),(1.35,.15,1.3),'cab');box('Driver perched behind',(0.8,3,2.78),(.45,.4,1.05),'driver');box('Near cab lamp',(1.93,2.40,1.5),(.16,.18,.26),'light');box('Far cab lamp',(1.93,3.58,1.5),(.16,.18,.26),'light');box('Shafts',(2.35,3,.82),(1.45,.92,.07),'cab');box('Horse barrel',(2.47,3,1.05),(1.28,.5,.65),'horse');box('Horse head',(3.17,3,1.56),(.38,.4,.64),'horse')
for x,y in [(2.01,2.84),(2.10,3.16),(2.87,2.84),(2.80,3.16)]:box('Horse leg',(x,y,.46),(.12,.12,.92),'horse')
box('Gas lamp post',(-1.3,.9,1.37),(.09,.09,2.74),'lamp');box('Gas lamp housing',(-1.3,.9,2.78),(.34,.34,.5),'lamp')
box('Holmes 1.8m stature',(-.8,-.25,.9),(.38,.3,1.8),'actor');box('Watson 1.78m stature',(.15,-.05,.89),(.47,.3,1.78),'actor')
route=[project(v) for v in [(-2.8,2.65,0),(-1.65,.25,0),(.15,.25,0),(1.75,1.65,0)]]
horizon=project((0,100000,1.7))[1];full=project((0,-.25,0))[1]
data={'canvas':[320,200],'pixelAspect':1.2,'units':'metres','camera':{'location':list(cam.location),'rotationEuler':list(cam.rotation_euler),'lensMM':45,'horizonY':horizon,'referenceFeetY':full},'objects':objects,'route':route,'note':'Prepainting metric construction. Final landmarks must be measured from the painting; do not treat AI output as calibrated geometry.'}
(H/'guides/perspective.json').write_text(json.dumps(data,indent=2)+'\n');bpy.ops.wm.save_as_mainfile(filepath=str(H/'source/street-construction.blend'));print(json.dumps({'horizon':horizon,'actorFeet':full,'route':route}))
