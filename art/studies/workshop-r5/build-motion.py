"""Blender 4.5.14: editable eight-pose walk construction, with planted-foot targets.
Only exports guide geometry. Pixel drawing is a separate, reproducible step.
"""
import bpy, math, json
from pathlib import Path
from mathutils import Vector, Matrix
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.frame_end=8
scene.render.fps=8
scene.render.resolution_x=320
scene.render.resolution_y=200
scene.render.resolution_percentage=100
scene.render.pixel_aspect_y=1.2

pitch=math.radians(20)
yaw=math.radians(30)
forward=Vector((math.cos(yaw),0,math.sin(yaw)))
lateral=Vector((-math.sin(yaw),0,math.cos(yaw)))
step=forward*(4/40/math.cos(yaw))
def pixel(v): return [144+v.x*40,165-(v.y*math.cos(pitch)-v.z*math.sin(pitch))*40/1.2]
leg_length=.675

arm=bpy.data.armatures.new('Holmes constant-length leg construction')
rig=bpy.data.objects.new('WALK — eight pose construction',arm)
scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active=rig
rig.select_set(True)
rig.show_in_front=True
bpy.ops.object.mode_set(mode='EDIT')
for leg,sign in [('near',1),('far',-1)]:
    hip=Vector((-.05,1.405,0))+lateral*(sign*.16)
    thigh=arm.edit_bones.new(leg+'.thigh')
    thigh.head=hip; thigh.tail=hip+Vector((0,-leg_length,0))
    shin=arm.edit_bones.new(leg+'.shin')
    shin.head=thigh.tail; shin.tail=shin.head+Vector((0,-leg_length,0))
    shin.parent=thigh; shin.use_connect=True
bpy.ops.object.mode_set(mode='OBJECT')

foot_x=[10,6,2,-2,-6,-10,-2,7]
foot_lift=[0,0,0,0,0,2,4,3]
bob=[0,1,-1,-1,0,1,-1,-1]
names=['contact','down','passing','up','contact','down','passing','up']
poses=[]
for frame in range(8):
    travel=frame*4
    rig.location=step*frame
    rig.keyframe_insert(data_path='location',frame=frame+1)
    pose={'phase':names[frame], 'travel':travel,'travelY':pixel(step*frame)[1]-165,'bob':bob[frame], 'legs':{}}
    for leg,offset in [('near',0),('far',4)]:
        phase=(frame+offset)%8
        side=lateral*(.16 if leg=='near' else -.16)
        hip=Vector((-.05,1.405-bob[frame]*1.2/40/math.cos(pitch),0))+side
        sole=forward*(foot_x[phase]/40/math.cos(yaw))+side
        sole.y=foot_lift[phase]*1.2/40/math.cos(pitch)
        ankle=sole+Vector((0,.10,0))
        axis=(ankle-hip).normalized()
        distance=(ankle-hip).length
        assert distance<2*leg_length
        # Knee bends within the actual three-quarter walking plane. The legs have
        # separate depth, rather than two profile limbs on the same screen line.
        normal=(forward-axis*forward.dot(axis)).normalized()
        knee=(hip+ankle)/2 + normal*math.sqrt(leg_length**2-(distance/2)**2)
        for suffix,a,b in [('thigh',hip,knee),('shin',knee,ankle)]:
            bone=rig.pose.bones[leg+'.'+suffix]
            rotation=(b-a).to_track_quat('Y','Z').to_matrix().to_4x4()
            rotation.translation=a
            bone.matrix=rotation
            bone.keyframe_insert(data_path='location',frame=frame+1)
            bone.keyframe_insert(data_path='rotation_quaternion',frame=frame+1)
            bone.keyframe_insert(data_path='scale',frame=frame+1)
            bpy.context.view_layer.update()
        pose['legs'][leg]={'phase':phase,'hip':pixel(hip),'knee':pixel(knee),
          'ankle':pixel(ankle),'sole':pixel(sole),
          'toe':pixel(sole+forward*.20),'heel':pixel(sole-forward*.08),
          'flatContact':phase in (1,2,3),'lengths':[(hip-knee).length,(knee-ankle).length]}
    poses.append(pose)
    scene.timeline_markers.new(names[frame],frame=frame+1)

camdata=bpy.data.cameras.new('Side-on pose camera')
cam=bpy.data.objects.new('Camera',camdata);scene.collection.objects.link(cam)
cam.location=(.4,1.95*math.cos(pitch)+10*math.sin(pitch),-1.95*math.sin(pitch)+10*math.cos(pitch));camdata.type='ORTHO';camdata.ortho_scale=8
cam.rotation_euler[0]=-pitch
scene.camera=cam
ref=bpy.data.images.load(str(ROOT/'art/approved/workshop-v6/workshop-320x200.png'))
camdata.show_background_images=True
bg=camdata.background_images.new();bg.image=ref;bg.alpha=.3

# Floor is a construction line, not part of any production sprite.
mesh=bpy.data.meshes.new('Ground contact line')
mesh.from_pydata([(-3,0,0),(4,0,0)],[(0,1)],[])
ground=bpy.data.objects.new('GROUND — soles must contact here',mesh)
scene.collection.objects.link(ground)
scene.frame_set(1)
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':area.spaces.active.region_3d.view_perspective='CAMERA'
note=bpy.data.texts.new('READ ME — walk construction')
note.write('Eight poses, 4 native x-pixels travel per pose, 8 fps = 32 px/sec.\n'
 'Each thigh and shin is 0.675 units; joints solved from sole targets.\n'
 'Walking plane turns 30 degrees toward the camera; view pitch is 20 degrees.\n'
 'Near and far legs have separate depth. Shoes and coat must follow this turn.\n'
 'Frames: contact, down, passing, up, opposite contact, down, passing, up.\n'
 'The armature is a drawing guide, not a cutout sprite deformation rig.\n'
 'Edit build-motion.py to regenerate motion.json and the packed Blender source.\n')
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'walk-construction.blend'))
(HERE/'motion.json').write_text(json.dumps({'blender':bpy.app.version_string,
 'fps':8,'stepPixels':4,'stepY':pixel(step)[1]-165,'stridePixels':32,
 'cameraPitchDegrees':20,'bodyYawDegrees':30,'legLength':leg_length,'poses':poses},indent=2)+'\n')
print('Saved eight-pose armature, constant-length joint guides and contact targets')
