"""Connected 3-D body construction and world-space foot contacts for a restrained walk."""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
H=Path(__file__).resolve().parent
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.resolution_x=72;s.render.resolution_y=120;s.render.resolution_percentage=100;s.render.pixel_aspect_x=1;s.render.pixel_aspect_y=1.2
cam=bpy.data.cameras.new('Game camera');cam.type='ORTHO';cam.ortho_scale=2.3
c=bpy.data.objects.new('Camera',cam);s.collection.objects.link(c);c.location=(0,-7,3.5);c.rotation_euler=(Vector((0,0,.9))-c.location).to_track_quat('-Z','Y').to_euler();s.camera=c;bpy.context.view_layer.update()
def project(v):
 p=world_to_camera_view(s,c,Vector(v));return [p.x*72,(1-p.y)*120]
cam.ortho_scale*=(project((0,0,0))[1]-project((0,0,1.85))[1])/106
cam.shift_y=0;a=project((0,0,0))[1];cam.shift_y=.01;b=project((0,0,0))[1];cam.shift_y=(113-a)/((b-a)/.01)
def rotate(v,deg):
 a=math.radians(deg);x,y,z=v;return (x*math.cos(a)-y*math.sin(a),x*math.sin(a)+y*math.cos(a),z)
def knee(h,a):
 h,a=Vector(h),Vector(a);delta=a-h;mid=(h+a)/2;axis=delta.normalized();bend=Vector((0,-1,0));bend=(bend-axis*bend.dot(axis)).normalized();return tuple(mid+bend*math.sqrt(max(0,.425**2-delta.length_squared/4)))
edges=[['pelvis','chest'],['chest','neck'],['neck','head'],['leftShoulder','rightShoulder']]
for side in ['left','right']:
 edges += [[side+'Shoulder',side+'Elbow'],[side+'Elbow',side+'Wrist'],['pelvis',side+'Hip'],[side+'Hip',side+'Knee'],[side+'Knee',side+'Ankle'],[side+'Heel',side+'Toe']]
poses={};stride=.64
for direction,yaw in [('east',70),('toward',0),('away',180)]:
 out=[]
 for f in range(8):
  t=f/8;b=-.013*math.sin(t*4*math.pi);hipYaw=3*math.cos(t*2*math.pi);chestYaw=-2*math.cos(t*2*math.pi)
  j={'pelvis':(0,0,.89+b),'chest':(0,0,1.32+b),'neck':(0,-.01,1.53+b),'head':(0,-.018,1.69+b)};contacts={}
  for side,sign,offset in [('left',-1,0),('right',1,.5)]:
   p=(t+offset)%1
   # A fixed heel in world space during stance; root moves forward at constant speed.
   if p<=.6: y=-.16+stride*p;lift=0
   else:
    u=(p-.6)/.4;ease=u*u*(3-2*u);y=.224-.384*ease;lift=.065*math.sin(math.pi*u)
   heel=(sign*.105,y,0+lift);ankle=(heel[0],y-.025,.07+lift);toe=(heel[0],y-.17,.012+lift)
   hip=rotate((sign*.10,0,.89+b),hipYaw)
   j.update({side+'Hip':hip,side+'Knee':knee(hip,ankle),side+'Ankle':ankle,side+'Heel':heel,side+'Toe':toe})
   shoulder=rotate((sign*.205,0,1.46+b),chestYaw);j[side+'Shoulder']=shoulder
   if side=='right':elbow=(sign*.24,-.025,1.19+b);wrist=(sign*.11,-.17,1.31+b)
   else:
    swing=.045*math.cos(t*2*math.pi);elbow=(sign*.225,-swing,1.18+b);wrist=(sign*.23,-swing*1.6,1.00+b)
   j[side+'Elbow']=elbow;j[side+'Wrist']=wrist
   contacts[side]={'stance':p<=.6,'phase':p,'heelWorld':list(rotate((heel[0],heel[1]-stride*t,heel[2]),yaw))}
  chest=[rotate((x,y,z+b),chestYaw) for z,w in [(1.46,.205),(1.03,.155)] for x in [-w,w] for y in [-.13,.13]]
  coat=[rotate((x,y,z+b),chestYaw*.5) for z,w in [(1.46,.205),(.47,.235)] for x in [-w,w] for y in [-.13,.13]]
  world={n:rotate(v,yaw)for n,v in j.items()};names=list(world)
  mesh=bpy.data.meshes.new(direction+str(f));mesh.from_pydata(list(world.values()),[(names.index(a),names.index(b))for a,b in edges],[]);obj=bpy.data.objects.new(direction+str(f),mesh);s.collection.objects.link(obj);obj.hide_render=True
  out.append({'joints':{n:project(v)for n,v in world.items()},'chest':[project(rotate(v,yaw))for v in chest],'coat':[project(rotate(v,yaw))for v in coat],'contacts':contacts,'rootWorld':list(rotate((0,-stride*t,0),yaw)),'world':world})
 poses[direction]=out
root={d:[project(rotate((0,-stride,0),a))[i]-project((0,0,0))[i]for i in range(2)]for d,a in [('east',70),('toward',0),('away',180)]}
(H/'guides/poses.json').write_text(json.dumps({'canvas':[72,120],'anchor':[36,113],'edges':edges,'poses':poses,'rootDisplacementPerCycle':root,'strideMetres':stride,'stanceFraction':.6},indent=2)+'\n')
bpy.ops.wm.save_as_mainfile(filepath=str(H/'source/walk-construction.blend'))
