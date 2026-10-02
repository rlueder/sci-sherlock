"""Fit painted prop planes using the same locked camera; do not change actor scale."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
HERE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(HERE/'source/221b-camera.blend'))
s=bpy.context.scene;c=s.camera;H=c.location.z;FX=400;FY=FX/1.2

def floor(x,y):
 d=FY*H/y;return Vector(((x-160)*d/FX,d,0))
def project(p):
 q=world_to_camera_view(s,c,p);return [q.x*320,(1-q.y)*200,p.y]
# Measured from the final 320x200 painting. The leaf is rectangular and frontal.
rect=[263,36,313,137];l,t,r,b=rect
hinge=floor(r,b);width=(r-l)*hinge.y/FX;height=H*(b-t)/b
poses=[]
for a in [0,16,32,48,64,80]:
 rad=math.radians(a);left=hinge+Vector((-width*math.cos(rad),width*math.sin(rad),0))
 verts=[left,left+Vector((0,0,height)),hinge+Vector((0,0,height)),hinge]
 poses.append({'angle':a,'vertices':[project(v) for v in verts]})
mesh=bpy.data.meshes.new('Measured painted door plane');mesh.from_pydata([floor(l,b),floor(l,b)+Vector((0,0,height)),hinge+Vector((0,0,height)),hinge],[[0,1],[1,2],[2,3],[3,0]],[])
o=bpy.data.objects.new('PAINT FIT - door leaf - do not move camera',mesh);s.collection.objects.link(o)
p=floor(94,142)
local={'crown':(0,.26,1.28),'head':(0,.25,1.14),'neck':(0,.22,1.04),'shoulderLeft':(-.21,.22,1.02),'shoulderRight':(.21,.22,1.02),'elbowLeft':(-.24,.04,.76),'elbowRight':(.24,.04,.76),'handLeft':(-.12,-.06,.77),'handRight':(.19,-.06,.78),'pelvis':(0,.18,.50),'kneeLeft':(-.16,-.12,.46),'kneeRight':(.16,-.12,.46),'ankleLeft':(-.16,-.14,.07),'ankleRight':(.16,-.14,.07),'footLeft':(-.16,-.26,.03),'footRight':(.16,-.26,.03)}
world={k:p+Vector(v) for k,v in local.items()}
edges=[['head','neck'],['neck','pelvis']]
for side in ['Left','Right']:edges += [['neck','shoulder'+side],['shoulder'+side,'elbow'+side],['elbow'+side,'hand'+side],['pelvis','knee'+side],['knee'+side,'ankle'+side],['ankle'+side,'foot'+side]]
keys=list(world);mesh=bpy.data.meshes.new('Seated Watson joint guide');mesh.from_pydata(list(world.values()),[[keys.index(a),keys.index(b)] for a,b in edges],[])
o=bpy.data.objects.new('PAINT FIT - seated Watson anatomical guide',mesh);s.collection.objects.link(o)
data={'cameraSource':'perspective.json','note':'Measured prop fit after paintover; same camera and y-only actor scale. The painting is not claimed to be a pixel-exact Blender render.','door':{'rect':rect,'worldHinge':list(hinge),'widthMetres':width,'heightMetres':height,'opens':'away into landing','poses':poses},'watson':{'joints':{k:project(v)[:2] for k,v in world.items()},'edges':edges,'feet':[94,146],'exportHeight':64,'canvas':[72,120],'anchor':[36,113]},'walkable':[[112,145],[299,145],[308,195],[104,195],[104,160],[112,155]],'arrival':[285,148]}
(HERE/'guides/painted-fit.json').write_text(json.dumps(data,indent=2)+'\n')
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'source/221b-painted-fit.blend'))
