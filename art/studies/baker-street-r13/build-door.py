"""Fit a planar door leaf to the painted doorway, then rotate a true 3D hinge."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
HERE=Path(__file__).resolve().parent
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.resolution_x=320;s.render.resolution_y=200;s.render.resolution_percentage=100
s.render.pixel_aspect_x=1;s.render.pixel_aspect_y=1.2
d=bpy.data.cameras.new('Local door-fit camera');c=bpy.data.objects.new('Camera',d);s.collection.objects.link(c)
c.location=(0,0,10);d.lens=45;d.sensor_width=36;d.sensor_fit='HORIZONTAL';d.shift_x=4/320;d.shift_y=-28*1.2/320;s.camera=c
# Preserve the drawn quad approximately while enforcing a rigid planar rectangle.
quad=[[290,24],[319,17],[319,153],[290,140]]
depths=[10,10*116/136]
top=sum((72-quad[i][1])*1.2*depths[i]/400 for i in [0,1])/2
bottom=sum((72-quad[i][1])*1.2*depths[0 if i==3 else 1]/400 for i in [2,3])/2
left=(290-156)*10/400;right=(319-156)*depths[1]/400
vertices=[Vector((left,top,0)),Vector((right,top,10-depths[1])),Vector((right,bottom,10-depths[1])),Vector((left,bottom,0))]
hinge=bpy.data.objects.new('Fixed left hinge',None);s.collection.objects.link(hinge);hinge.location=vertices[3]
mesh=bpy.data.meshes.new('Door leaf');mesh.from_pydata([v-hinge.location for v in vertices],[],[(0,1,2,3)]);mesh.update()
leaf=bpy.data.objects.new('Rigid wood leaf',mesh);s.collection.objects.link(leaf);leaf.parent=hinge
leaf['note']='Rigid planar perspective guide; front source sampled at native resolution. Closed cel retains exact extraction.'
uv=[[290,24],[319,17],[319,153],[290,140]]
angles=[0,-5,-15,-30,-50,-70];poses=[]
def project(v):
 q=world_to_camera_view(s,c,v);return [q.x*320,(1-q.y)*200,q.z]
for f,a in enumerate(angles,1):
 hinge.rotation_euler[1]=math.radians(a);hinge.keyframe_insert(data_path='rotation_euler',frame=f)
 s.frame_set(f);bpy.context.view_layer.update()
 poses.append({'angle':a,'vertices':[project(leaf.matrix_world@v.co) for v in mesh.vertices],'uv':uv,'hinge':[project(hinge.location),project(vertices[0])]})
s.frame_end=6;s.render.fps=8
note=bpy.data.texts.new('READ ME — local fit')
note.write('This camera fits the painted door locally; it is distinct from the intended room blockout camera.\nA rigid leaf and fixed hinge supply perspective/occlusion. The closed texture remains exact.\nNo x-squash or per-frame 2D edge drawing.\n')
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'source/door-construction.blend'))
(HERE/'guides/door-projection.json').write_text(json.dumps({'quad':quad,'poses':poses,'status':'Local planar fit to painted doorway; geometry is a guide, closed cel uses exact extraction'},indent=2)+'\n')
