"""Blender 4.5 LTS: an editable, perspective-projected clock hinge study.

Run from any directory with Blender --background --python /absolute/path/to/this.py.
This overwrites clock-guide.blend and projection.json, not the Pixelorama master.
The camera is an intentional local construction, not a recovered room calibration.
"""
import bpy
import json
import math
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SOURCE = ROOT / 'art/production/workshop-r3/export/clock-00.png'
REFERENCE = ROOT / 'art/approved/workshop-v6/workshop-320x200.png'
ANGLES = [0, 10, 22, 36, 50, 64, 76, 84]
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.resolution_x = 320
scene.render.resolution_y = 200
scene.render.resolution_percentage = 100
scene.render.pixel_aspect_x = 1
scene.render.pixel_aspect_y = 1.2
scene.render.fps = 8
scene.frame_end = 8
scene.view_settings.view_transform = 'Standard'
scene.render.film_transparent = True

# One world unit = 40 native x-pixels on the closed clock plane.
# Camera looks along -Z, Y is vertical. The image's y includes SCI pixel aspect.
def point(x, y, z=0):
    return Vector(((x - 156) / 40, (72 - y) * 1.2 / 40, z))

camera_data = bpy.data.cameras.new('Local perspective — horizon native y72')
camera = bpy.data.objects.new('Camera', camera_data)
scene.collection.objects.link(camera)
camera.location = (0, 0, 10)
camera_data.type = 'PERSP'
camera_data.lens = 45
camera_data.sensor_width = 36
camera_data.sensor_fit = 'HORIZONTAL'
camera_data.shift_x = 4 / 320
camera_data.shift_y = -28 * 1.2 / 320
camera_data.show_background_images = True
bg = camera_data.background_images.new()
bg.image = bpy.data.images.load(str(REFERENCE))
bg.alpha = .65
bg.display_depth = 'BACK'
scene.camera = camera

hinge = bpy.data.objects.new('HINGE — fixed at native x292', None)
scene.collection.objects.link(hinge)
hinge.location = point(292, 150)
hinge.empty_display_type = 'PLAIN_AXES'
hinge['description'] = 'Only this Y rotation is animated. No animated scale or vertex deformation.'
hinge['angles_degrees'] = ANGLES

texture = bpy.data.images.load(str(SOURCE))
front_mat = bpy.data.materials.new('Approved front pixels — nearest texture')
front_mat.use_nodes = True
nodes = front_mat.node_tree.nodes
nodes.clear()
output = nodes.new('ShaderNodeOutputMaterial')
shader = nodes.new('ShaderNodeBsdfPrincipled')
tex = nodes.new('ShaderNodeTexImage')
tex.image = texture
tex.interpolation = 'Closest'
front_mat.node_tree.links.new(tex.outputs['Color'], shader.inputs['Base Color'])
front_mat.node_tree.links.new(tex.outputs['Alpha'], shader.inputs['Alpha'])
front_mat.node_tree.links.new(shader.outputs['BSDF'], output.inputs['Surface'])
front_mat.diffuse_color = (.25, .1, .05, 1)
wood = bpy.data.materials.new('Walnut side guide — paint over in Pixelorama')
wood.diffuse_color = (.20, .055, .025, 1)

objects = []
def mesh_object(name, vertices, faces, material, kind):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([v - hinge.location for v in vertices], [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    obj.parent = hinge
    obj.data.materials.append(material)
    obj['surface_kind'] = kind
    objects.append(obj)
    return obj

# The front carries original pixels. Three inset volumes supply real side/back faces.
front = mesh_object('Original clock face', [point(238,14), point(302,14),
                    point(302,154), point(238,154)], [(0,1,2,3)], front_mat, 'front')
uv = front.data.uv_layers.new(name='Original 64x140 pixels')
for loop, value in zip(uv.data, [(0,1),(1,1),(1,0),(0,0)]):
    loop.uv = value

def cabinet(name, left, top, right, bottom, depth):
    verts = [point(left,top,-.001),point(right,top,-.001),
             point(right,bottom,-.001),point(left,bottom,-.001),
             point(left,top,-depth),point(right,top,-depth),
             point(right,bottom,-depth),point(left,bottom,-depth)]
    # No solid front: preserve alpha and painted openings in the source texture.
    return mesh_object(name, verts, [(0,4,5,1),(1,5,6,2),(2,6,7,3),
                       (3,7,4,0),(4,7,6,5)], wood, 'wood')

cabinet('Upper case volume',255,35,289,64,.175)
cabinet('Long case volume',256,65,289,140,.225)
cabinet('Plinth volume',254,140,291,147,.25)

for i, angle in enumerate(ANGLES, 1):
    hinge.rotation_euler[1] = math.radians(angle)
    hinge.keyframe_insert(data_path='rotation_euler', frame=i)
    scene.timeline_markers.new(f'{angle} degrees', frame=i)

def project(v):
    c = world_to_camera_view(scene, camera, v)
    return [c.x * 320, (1-c.y) * 200, c.z]

poses = []
for i, angle in enumerate(ANGLES, 1):
    scene.frame_set(i)
    bpy.context.view_layer.update()
    faces = []
    for obj in objects:
        for poly in obj.data.polygons:
            # Front UVs are in native texture coordinates, used by the pixel sampler.
            coords = [project(obj.matrix_world @ obj.data.vertices[n].co) for n in poly.vertices]
            texcoords = [[0,0],[64,0],[64,140],[0,140]] if obj == front else [[0,0],[1,0],[1,1],[0,1]]
            faces.append({'object':obj.name, 'kind':obj['surface_kind'],
                          'vertices':coords, 'uv':texcoords, 'face':poly.index})
    poses.append({'angle':angle, 'faces':faces,
                  'hinge':[project(hinge.matrix_world @ (point(292,y)-point(292,150)))
                           for y in (14,150)]})

scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT')
hinge.select_set(True)
bpy.context.view_layer.objects.active = hinge
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            area.spaces.active.region_3d.view_perspective = 'CAMERA'
            area.spaces.active.shading.type = 'MATERIAL'

readme = bpy.data.texts.new('READ ME — construction and limits')
readme.write('Clock perspective study, not final game art.\n'
             'Frame 1–8: 0–84 degree rigid turn around the right vertical hinge.\n'
             'Camera: local horizon y72; manually chosen, not a whole-room camera solve.\n'
             'Original pixels on the front. Inset boxes are paint-over guides for sides.\n'
             'Native 320x200 with 1:1.2 pixels. Reference and textures packed.\n'
             'Change the hinge rotation, never scale the cabinet to imitate a turn.\n')
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'clock-guide.blend'))
(HERE/'projection.json').write_text(json.dumps({
    'blender':bpy.app.version_string,'camera':{'focalNativePixels':400,
    'principalPoint':[156,72],'pixelAspect':[1,1.2],'distance':10},
    'status':'local construction study; side surfaces need pixel cleanup',
    'poses':poses}, indent=2)+'\n')
print('Wrote editable clock-guide.blend and eight perspective-projected poses')
