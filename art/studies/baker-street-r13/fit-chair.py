"""Local chair fit: use the existing 221B camera, physical anatomy and measured chair floor."""
import bpy,json,math
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
HERE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(HERE/'source/221b-construction.blend'))
s=bpy.context.scene;c=s.camera;eye=1.8
def floor(x,y):
 dist=(400/1.2)*eye/(y-72)
 return c.location+c.rotation_euler.to_matrix()@Vector(((x-156)/400,(72-y)*1.2/400,-1))*dist
def project(p):
 q=world_to_camera_view(s,c,p);return [q.x*320,(1-q.y)*200]
origin=floor(94,133)
right=c.rotation_euler.to_matrix()@Vector((1,0,0))
toward=c.rotation_euler.to_matrix()@Vector((0,0,1))
up=Vector((0,1,0))
# Stature 1.75m; seated crown 1.28m. Camera-derived scale, not arbitrary sprite fitting.
local={
 'crown':(0,1.28,0),'head':(.02,1.18,.02),'neck':(0,1.06,0),
 'farShoulder':(-.18,1.01,0),'farElbow':(-.23,.76,.16),'farHand':(-.05,.70,.38),
 'nearShoulder':(.22,1.01,.04),'nearElbow':(.29,.76,.25),'nearHand':(.30,.70,.43),
 'pelvis':(0,.53,0),'farKnee':(-.11,.48,.40),'farAnkle':(-.10,.07,.57),
 'nearKnee':(.22,.48,.43),'nearAnkle':(.24,.07,.63),'toe':(.38,.02,.72)}
world={k:origin+right*x+up*y+toward*z for k,(x,y,z) in local.items()}
edges=[['head','neck'],['neck','farShoulder'],['farShoulder','farElbow'],['farElbow','farHand'],['neck','nearShoulder'],['nearShoulder','nearElbow'],['nearElbow','nearHand'],['neck','pelvis'],['pelvis','farKnee'],['farKnee','farAnkle'],['pelvis','nearKnee'],['nearKnee','nearAnkle']]
mesh=bpy.data.meshes.new('Watson seated joints');keys=list(world)
mesh.from_pydata(list(world.values()),[(keys.index(a),keys.index(b))for a,b in edges],[])
o=bpy.data.objects.new('Watson — camera fitted seated skeleton',mesh);s.collection.objects.link(o)
joints={k:project(v) for k,v in world.items()}
data={'cameraSource':'source/221b-construction.blend','measuredChairFloor':[94,133],'eyeHeight':eye,'statureMetres':1.75,'seatedCrownMetres':1.28,'seatHeightMetres':.50,'joints':joints,'edges':edges,'world':{k:list(v) for k,v in world.items()},'standingHeightAtChair':(133-72)*1.75/eye,'note':'Local fit to the painted chair. Physical measurements are art assumptions. Floor ray and body points are projected by Blender; not a solved camera of the entire painting.'}
data['exportHeight']=round(joints['toe'][1]-joints['crown'][1])
data['footPosition']=[round((joints['farElbow'][0]+joints['toe'][0])/2),round(joints['toe'][1])]
(HERE/'guides/chair-fit.json').write_text(json.dumps(data,indent=2)+'\n')
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'source/watson-chair-fit.blend'))
print(json.dumps(data))
