"""Run with Blender --background walk-construction.blend --python this_file.py."""
import bpy,json,math
from pathlib import Path
HERE=Path(__file__).resolve().parent
poses=json.loads((HERE/'motion.json').read_text())['poses']
rig=bpy.data.objects['WALK — eight pose construction']
error=0
for f,pose in enumerate(poses,1):
    bpy.context.scene.frame_set(f)
    bpy.context.view_layer.update()
    for side,leg in pose['legs'].items():
        thigh=rig.pose.bones[side+'.thigh'];shin=rig.pose.bones[side+'.shin']
        for actual,expected in [(thigh.head,leg['hip']),(thigh.tail,leg['knee']),
                                (shin.head,leg['knee']),(shin.tail,leg['ankle'])]:
            pixel=[144+actual.x*40,165-(actual.y*math.cos(math.radians(20))-actual.z*math.sin(math.radians(20)))*40/1.2]
            error=max(error,*(abs(a-b) for a,b in zip(pixel,expected)))
assert error<.001, error
(HERE/'native-motion-check.json').write_text(json.dumps({'blender':bpy.app.version_string,
 'reopenedScene':'walk-construction.blend','poses':8,'maxJointErrorNativePixels':error},indent=2)+'\n')
print('Saved armature matches exported pose joints; max pixel error:',error)
