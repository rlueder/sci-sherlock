"""Render a solid, textured door with real hinge rotation and camera-ray frame occlusion."""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
HERE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(HERE/'source/221b-planes.blend'))
s=bpy.context.scene;c=s.camera
for o in list(bpy.data.objects):
 if o!=c:bpy.data.objects.remove(o,do_unlink=True)
fit=json.loads((HERE/'guides/painted-fit.json').read_text());door=fit['door']
W=door['widthMetres'];H=door['heightMetres'];depth=.045
hinge=Vector(door['worldHinge']);angles=[0,20,40,60,80,100,120,140,160,175]
# Front/back are separate faces of one 45mm thick wooden leaf.
verts=[(-W,0,0),(0,0,0),(0,0,H),(-W,0,H),(-W,depth,0),(0,depth,0),(0,depth,H),(-W,depth,H)]
faces=[(0,1,2,3),(5,4,7,6),(4,0,3,7),(1,5,6,2),(3,2,6,7),(4,5,1,0)]
mesh=bpy.data.meshes.new('Solid door leaf');mesh.from_pydata(verts,[],faces);mesh.update()
leaf=bpy.data.objects.new('45mm walnut leaf',mesh);s.collection.objects.link(leaf);leaf.location=hinge

def emission(name,color=None,texture=False):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;n.clear();out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');m.node_tree.links.new(em.outputs[0],out.inputs['Surface'])
 if texture:
  t=n.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(HERE/'source/room-native.png'));t.interpolation='Closest';t.extension='EXTEND';m.node_tree.links.new(t.outputs['Color'],em.inputs['Color'])
 else:em.inputs['Color'].default_value=color
 return m
front=emission('Original native door pixels',texture=True)
edge=emission('Solid end grain edge',(0.22,.083,.029,1));back=emission('Shadowed reverse',(0.095,.035,.017,1))
mesh.materials.append(front);mesh.materials.append(edge);mesh.materials.append(back)
uv=mesh.uv_layers.new(name='Native texture projection')
for poly in mesh.polygons:
 poly.material_index=0 if poly.index==0 else 2 if poly.index==1 else 1
 for li in poly.loop_indices:
  v=mesh.vertices[mesh.loops[li].vertex_index].co
  u=(273+(v.x+W)/W*42)/320;vv=1-(137-v.z/H*103)/200
  uv.data[li].uv=(u,vv)
# Alpha holdouts model the static wall/frame in front of the receding leaf.
hold=bpy.data.materials.new('Static frame holdout');hold.use_nodes=True;hold.node_tree.nodes.clear();out=hold.node_tree.nodes.new('ShaderNodeOutputMaterial');node=hold.node_tree.nodes.new('ShaderNodeHoldout');hold.node_tree.links.new(node.outputs[0],out.inputs[0])
D=hinge.y-.004

def world(x,y):return ((x-160)*D/400,D,c.location.z-y*D/(400/1.2))
for i,(l,t,r,b) in enumerate([(-400,-400,273,600),(315,-400,800,600),(273,-400,315,34),(273,137,315,600)]):
 me=bpy.data.meshes.new('Occluder');me.from_pydata([world(l,b),world(r,b),world(r,t),world(l,t)],[],[(0,1,2,3)]);me.materials.append(hold)
 ob=bpy.data.objects.new('Static jamb/lintel occlusion '+str(i),me);s.collection.objects.link(ob)
s.render.engine='CYCLES';s.cycles.device='CPU';s.cycles.samples=1;s.cycles.use_denoising=False;s.cycles.pixel_filter_type='BOX'
s.render.film_transparent=True;s.render.resolution_x=320;s.render.resolution_y=200;s.render.resolution_percentage=100;s.render.pixel_aspect_x=1;s.render.pixel_aspect_y=1.2
s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA'
s.view_settings.view_transform='Standard';s.view_settings.look='None';s.view_settings.exposure=0;s.view_settings.gamma=1
s.world.color=(0,0,0)
(HERE/'generated/door-renders').mkdir(exist_ok=True)
frames=[]
for i,a in enumerate(angles):
 s.frame_set(i+1);leaf.rotation_euler.z=-math.radians(a);leaf.keyframe_insert(data_path='rotation_euler',frame=i+1);bpy.context.view_layer.update()
 axis=[]
 for z in [0,H]:
  p=world_to_camera_view(s,c,hinge+Vector((0,0,z)));axis.append([p.x*320,(1-p.y)*200])
 frames.append({'angle':a,'hinge':axis,'file':f'generated/door-renders/{i}.png'})
 s.render.filepath=str(HERE/f'generated/door-renders/{i}.png');bpy.ops.render.render(write_still=True)
s.frame_start=1;s.frame_end=len(angles);s.frame_set(1)
for image in bpy.data.images:
 if image.source=='FILE':image.pack()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'source/door-solid.blend'))
(HERE/'guides/door-solid.json').write_text(json.dumps({'renderer':'Blender 4.5.14 Cycles CPU','camera':'source/221b-planes.blend','thicknessMetres':depth,'hinge':list(hinge),'frameOcclusion':'camera-ray holdout meshes; jamb and lintel remain in front','frames':frames},indent=2)+'\n')
