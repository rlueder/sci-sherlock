"""Orthographic walk construction; complete pose guide, never a sprite deformation rig."""
import bpy,math,json
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
from pathlib import Path
H=Path(__file__).resolve().parent
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.resolution_x=72;s.render.resolution_y=120;s.render.resolution_percentage=100;s.render.pixel_aspect_x=1;s.render.pixel_aspect_y=1.2
d=bpy.data.cameras.new('Native 72x120 orthographic drawing camera');d.type='ORTHO';d.ortho_scale=2.3
c=bpy.data.objects.new('Camera',d);s.collection.objects.link(c);c.location=(0,-7,3.5);target=Vector((0,0,.9));c.rotation_euler=(target-c.location).to_track_quat('-Z','Y').to_euler();s.camera=c;bpy.context.view_layer.update()
def project(v):
 p=world_to_camera_view(s,c,Vector(v));return [p.x*72,(1-p.y)*120]
height=project((0,0,0))[1]-project((0,0,1.85))[1];d.ortho_scale*=height/106
# Camera shifts have a linear effect; solve the baseline numerically once.
d.shift_y=0;a=project((0,0,0))[1];d.shift_y=.01;b=project((0,0,0))[1];d.shift_y=(113-a)/((b-a)/.01)
bpy.context.view_layer.update()
edges=[['head','neck'],['neck','pelvis'],['nearShoulder','farShoulder'],['nearShoulder','nearElbow'],['nearElbow','nearWrist'],['farShoulder','farElbow'],['farElbow','farWrist'],['nearHip','farHip'],['nearHip','nearKnee'],['nearKnee','nearAnkle'],['nearAnkle','nearToe'],['farHip','farKnee'],['farKnee','farAnkle'],['farAnkle','farToe']]
stride=[.17,.085,0,-.085,-.17,-.07,.06,.15];lift=[0,0,0,0,0,.045,.085,.045];bob=[0,-.018,0,.014,0,-.018,0,.014]
def knee(h,a):
 # Equal 0.43m femur/shin, knee bends forward in the sagittal plane.
 dy=a[1]-h[1];dz=a[2]-h[2];dist=math.hypot(dy,dz);bend=math.sqrt(max(0,.43**2-dist**2/4))
 return (h[0],(h[1]+a[1])/2+dz/dist*bend,(h[2]+a[2])/2-dy/dist*bend)
poses={}
for direction,yaw in [('east',70),('toward',0),('away',180)]:
 frames=[];angle=math.radians(yaw)
 def turn(v):
  x,y,z=v;return (x*math.cos(angle)-y*math.sin(angle),x*math.sin(angle)+y*math.cos(angle),z)
 for f in range(8):
  b=bob[f]
  j={'head':(0,-.015,1.69+b),'neck':(0,0,1.50+b),'pelvis':(0,0,.87+b),'nearShoulder':(-.19,0,1.46+b),'farShoulder':(.19,0,1.46+b),
    'nearElbow':(-.23,-stride[(f+4)%8]*.35,1.18+b),'nearWrist':(-.20,-stride[(f+4)%8]*.55,.96+b),
    'farElbow':(.25,-.03,1.21+b),'farWrist':(.11,-.14,1.31+b)}
  for side,sign,phase in [('near',-1,f),('far',1,(f+4)%8)]:
   hip=(sign*.105,0,.87+b);ankle=(sign*.115,-stride[phase],.065+lift[phase])
   j[side+'Hip']=hip;j[side+'Ankle']=ankle;j[side+'Knee']=knee(hip,ankle)
   j[side+'Toe']=(ankle[0],ankle[1]-.13,ankle[2]-.035)
  # Coat envelope trails legs slightly and always covers hips/thighs.
  coat=[(-.20,0,1.46+b),(.20,0,1.46+b),(.24,-.025*math.sin(f*math.pi/4),.47+b),(-.24,.025*math.sin(f*math.pi/4),.47+b)]
  world={n:turn(v)for n,v in j.items()};names=list(world)
  mesh=bpy.data.meshes.new(direction+'-'+str(f));mesh.from_pydata(list(world.values()),[(names.index(a),names.index(b))for a,b in edges],[]);obj=bpy.data.objects.new(direction+'-'+str(f),mesh);s.collection.objects.link(obj);obj.hide_render=True
  frames.append({'phase':['contact A','down A','passing A','up A','contact B','down B','passing B','up B'][f],'joints':{n:project(v)for n,v in world.items()},'coat':[project(turn(v))for v in coat],'world':{n:list(v)for n,v in world.items()},'support':'near'if f<4 else'far'})
 poses[direction]=frames
data={'canvas':[72,120],'anchor':[36,113],'pixelAspect':1.2,'edges':edges,'poses':poses,'camera':{'type':'orthographic','location':list(c.location),'rotation':list(c.rotation_euler),'orthoScale':d.ortho_scale,'shiftY':d.shift_y},'notes':['Guide proportions are construction assumptions; redraw full anatomy and coat, do not deform master.','One fixed camera/scale for all frames and directions.','East uses a three-quarter body/leg plane; knees are not pure profile replacements.','The illustration may depart from the guide; actual export joints must be reviewed separately.']}
(H/'guides/poses.json').write_text(json.dumps(data,indent=2)+'\n')
bpy.ops.wm.save_as_mainfile(filepath=str(H/'source/walk-construction.blend'))
