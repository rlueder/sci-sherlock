"""Construct the foreground desk as perpendicular planes with the r4 camera.
Export local corrected quads for repainting with the original pixel texture.
"""
import bpy,json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene
s.render.resolution_x=320;s.render.resolution_y=200;s.render.resolution_percentage=100
s.render.pixel_aspect_x=1;s.render.pixel_aspect_y=1.2
d=bpy.data.cameras.new('Same local perspective as clock r4')
c=bpy.data.objects.new('Camera',d);s.collection.objects.link(c)
c.location=(0,0,10);d.lens=45;d.sensor_width=36;d.sensor_fit='HORIZONTAL'
d.shift_x=4/320;d.shift_y=-28*1.2/320;s.camera=c
bpy.context.view_layer.update()
d.show_background_images=True
bg=d.background_images.new();bg.image=bpy.data.images.load(str(ROOT/'art/approved/workshop-v6/workshop-320x200.png'));bg.alpha=.7
def on_top(x,y):
    distance=(400/1.2)*1.6/(y-72)
    return Vector(((x-156)*distance/400,-1.6,10-distance))
near=on_top(65,176);far=on_top(102,151)
side=(far-near).normalized()
across=Vector((side.z,0,-side.x)).normalized()
assert across.x<0
leftnear=near+across*2.2;leftfar=far+across*2.2
def project(v):
    q=world_to_camera_view(s,c,v);return [q.x*320,(1-q.y)*200]
def at_left(a,b):
    t=-a[0]/(b[0]-a[0]);return [0,a[1]+t*(b[1]-a[1])]
def plane(name,vertices):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],[(0,1,2,3)]);mesh.update()
    obj=bpy.data.objects.new(name,mesh);s.collection.objects.link(obj)
    obj.display_type='WIRE'
    return [project(v) for v in vertices]
top=plane('Tabletop — perpendicular edges',[leftfar,far,near,leftnear])
assert max(abs(top[1][i]-[102,151][i]) for i in (0,1))<.001
assert max(abs(top[2][i]-[65,176][i]) for i in (0,1))<.001
drop=Vector((0,-.21,0))
front=plane('Front apron — one level lower edge',[leftnear,near,near+drop,leftnear+drop])
right=plane('Right apron',[near,far,far+drop,near+drop])
for name,position in [('near',near),('far',far),('left-near',leftnear),('left-far',leftfar)]:
    mesh=bpy.data.meshes.new(name+' leg')
    mesh.from_pydata([position+drop,position+Vector((0,-1.6,0))],[(0,1)],[])
    obj=bpy.data.objects.new(name+' vertical leg',mesh);s.collection.objects.link(obj)
def clip_left(q):return [at_left(q[0],q[1]),q[1],q[2],at_left(q[3],q[2])]
source={
 'top':[[0,148],[102,151],[65,176],[0,176]],
 'front':[[0,176],[65,176],[65,191],[0,198]],
 'right':[[65,176],[102,151],[98,165],[65,191]]}
targets={'top':clip_left(top),'front':clip_left(front),'right':right}
vp_across=[156+400*across.x/(-across.z),72]
vp_side=[156+400*side.x/(-side.z),72]
note=bpy.data.texts.new('READ ME — desk correction')
note.write('Same 45 mm shifted perspective camera and 1:1.2 pixels as the clock.\n'
 'Near-right and far-right tabletop corners stay at native [65,176], [102,151].\n'
 'Other corners, apron edges and vertical legs derive from perpendicular planes.\n'
 'The front apron originally bulged downward on the left; its lower edge now\n'
 'converges to the same vanishing point as the tabletop. Texture work is separate.\n')
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'desk-construction.blend'))
(HERE/'desk.json').write_text(json.dumps({'blender':bpy.app.version_string,
 'horizon':72,'vanishingPoints':[vp_across,vp_side],'perpendicularDot':side.dot(across),
 'sourceQuads':source,'targetQuads':targets},indent=2)+'\n')
print('Saved desk planes, vanishing points and texture-transfer quads')
