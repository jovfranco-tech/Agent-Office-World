"""
generate_chars.py v2 — Refined smooth humanoid for Kenney-style match.

Key upgrades from v1:
  - Smooth shaded (not flat) with beveled edges for soft look
  - Rounded limbs (8-sided cylinders, not boxes)
  - Better proportions (head 0.22 units, not 0.34)
  - Subtle skin subsurface for realism
  - Cleaner materials matching Kenney's warm, slightly desaturated palette
  - Character stands ~1.7 units tall, camera ortho_scale tuned to match
    furniture sprite proportions
"""
import bpy
import bmesh
import math
import os
import json
from mathutils import Vector

# ─── CONFIG ────────────────────────────────────────────────────────────────
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "public", "sprites", "agents3d")
OUT_DIR = os.path.abspath(OUT_DIR)
os.makedirs(OUT_DIR, exist_ok=True)

RENDER_SIZE = 128               # higher res for crisp sprites (was 96)
FRAMES_IDLE = 6
FRAMES_WALK = 8
FRAMES_WORK = 6
CAM_ORTHO_SCALE = 1.45          # tighter framing, character ~1.7 units fills ~80% of frame
USE_CYCLES = True               # Cycles for superior lighting/shading quality

# Character faces direction: down-right (NE in iso). For walk, also render left
# (mirror). We render one direction and flip in CSS.

AGENTS = [
    {"id": "ceo",         "shirt": "#5b4a8a", "pants": "#2a2536", "skin": "#e8c4a0", "hair": "#3a2a1a"},
    {"id": "strategy",    "shirt": "#b85c3a", "pants": "#3a2a28", "skin": "#d8a880", "hair": "#1a1410"},
    {"id": "pmo",         "shirt": "#8a5a8a", "pants": "#2e2638", "skin": "#f0d0b0", "hair": "#5a3a2a"},
    {"id": "coding-1",    "shirt": "#3a6a9a", "pants": "#28303a", "skin": "#e0b890", "hair": "#2a1a10"},
    {"id": "coding-2",    "shirt": "#2a7a6a", "pants": "#1a3030", "skin": "#d8a878", "hair": "#4a3020"},
    {"id": "infra",       "shirt": "#3a4a5a", "pants": "#222a32", "skin": "#e8c4a0", "hair": "#1a1a1a"},
    {"id": "automation",  "shirt": "#5a7a3a", "pants": "#2a3420", "skin": "#f0d0b0", "hair": "#6a4a2a"},
    {"id": "ops",         "shirt": "#7a6a4a", "pants": "#38302a", "skin": "#d8a878", "hair": "#3a2a1a"},
    {"id": "support",     "shirt": "#9a5a6a", "pants": "#382a30", "skin": "#e8c4a0", "hair": "#4a2a2a"},
    {"id": "design",      "shirt": "#6a4a8a", "pants": "#2a2536", "skin": "#f0d0b0", "hair": "#2a2a2a"},
    {"id": "product",     "shirt": "#3a7a8a", "pants": "#1a3036", "skin": "#d8a880", "hair": "#5a3a2a"},
    {"id": "research",    "shirt": "#4a6a8a", "pants": "#28303a", "skin": "#e0b890", "hair": "#8a6a3a"},
    {"id": "data",        "shirt": "#3a5a7a", "pants": "#222e3a", "skin": "#e8c4a0", "hair": "#1a1410"},
    {"id": "qa",          "shirt": "#8a7a3a", "pants": "#38322a", "skin": "#d8a878", "hair": "#3a2a20"},
    {"id": "finance",     "shirt": "#4a5a3a", "pants": "#2a2e22", "skin": "#f0d0b0", "hair": "#5a3a2a"},
    {"id": "legal",       "shirt": "#3a3a5a", "pants": "#222236", "skin": "#e0b890", "hair": "#2a1a10"},
    {"id": "security",    "shirt": "#2a2a3a", "pants": "#1a1a26", "skin": "#d8a880", "hair": "#1a1a1a"},
    {"id": "risk",        "shirt": "#5a3a3a", "pants": "#302222", "skin": "#e8c4a0", "hair": "#4a3020"},
    {"id": "docs",        "shirt": "#7a8a5a", "pants": "#36382a", "skin": "#f0d0b0", "hair": "#6a4a3a"},
    {"id": "cs",          "shirt": "#9a7a4a", "pants": "#383026", "skin": "#d8a878", "hair": "#3a2a1a"},
    {"id": "sales",       "shirt": "#8a5a3a", "pants": "#362a22", "skin": "#e8c4a0", "hair": "#5a3a2a"},
]

# ─── HELPERS ───────────────────────────────────────────────────────────────

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)) + (1.0,)

def boost_saturation(hex_color, factor=1.25):
    """Increase color saturation to match Kenney's punchy palette."""
    h = hex_color.lstrip('#')
    r, g, b = [int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    # Convert to HSL, boost saturation, convert back
    import colorsys
    h_, l_, s_ = colorsys.rgb_to_hls(r, g, b)
    s_ = min(1.0, s_ * factor)
    r, g, b = colorsys.hls_to_rgb(h_, l_, s_)
    return (r, g, b, 1.0)

def make_material(name, hex_color, roughness=0.65, subsurface=0.0, sat_boost=1.3):
    """Smooth material with Kenney-style punchy warm shading."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = boost_saturation(hex_color, sat_boost)
        if 'Roughness' in bsdf.inputs:
            bsdf.inputs['Roughness'].default_value = roughness
        if 'Specular IOR Level' in bsdf.inputs:
            bsdf.inputs['Specular IOR Level'].default_value = 0.4
        elif 'Specular' in bsdf.inputs:
            bsdf.inputs['Specular'].default_value = 0.4
        # Subsurface for skin (slight warmth)
        if subsurface > 0 and 'Subsurface Weight' in bsdf.inputs:
            bsdf.inputs['Subsurface Weight'].default_value = subsurface
            if 'Subsurface Radius' in bsdf.inputs:
                bsdf.inputs['Subsurface Radius'].default_value = (0.4, 0.3, 0.25)
    return mat

def add_smooth_cylinder(name, location, radius, depth, material, collection, segments=12):
    """Vertical cylinder with smooth shading."""
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=segments, radius=radius, depth=depth, location=location
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(material)
    # Shade smooth
    for poly in obj.data.polygons:
        poly.use_smooth = True
    _move_to_collection(obj, collection)
    return obj

def add_smooth_cube(name, location, scale, material, collection, bevel=0.04):
    """Rounded-edge cube (smooth look like Kenney)."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    # Apply scale so bevel works on actual dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    # Add bevel modifier for rounded edges
    bev = obj.modifiers.new(name="Bevel", type='BEVEL')
    bev.width = bevel
    bev.segments = 3
    bev.limit_method = 'ANGLE'
    bpy.ops.object.modifier_apply(modifier=bev.name)
    # Shade smooth on bevel edges, flat on faces — use auto smooth via modifier
    obj.data.materials.append(material)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    # Blender 5.x: use shade_auto_smooth operator if available
    try:
        bpy.ops.object.shade_auto_smooth(angle=math.radians(40))
    except Exception:
        pass  # fallback: just leave all smooth
    _move_to_collection(obj, collection)
    return obj

def add_sphere(name, location, radius, material, collection, segments=16):
    """UV sphere, smooth shaded."""
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=segments, ring_count=segments // 2, radius=radius, location=location
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(material)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    _move_to_collection(obj, collection)
    return obj

def _move_to_collection(obj, collection):
    for c in obj.users_collection:
        c.objects.unlink(obj)
    collection.objects.link(obj)

# Shared outline material (created once)
_outline_mat = None
def get_outline_mat():
    global _outline_mat
    if _outline_mat is None:
        _outline_mat = bpy.data.materials.new("OutlineMat")
        _outline_mat.use_nodes = True
        nt = _outline_mat.node_tree
        bsdf = nt.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs['Base Color'].default_value = (0.08, 0.06, 0.03, 1.0)
            if 'Roughness' in bsdf.inputs:
                bsdf.inputs['Roughness'].default_value = 1.0
    return _outline_mat

def add_outline(obj, thickness=0.012):
    """Add an inverted-shell outline to an object (subtle dark rim)."""
    # Duplicate the object
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.duplicate()
    outline = bpy.context.active_object
    outline.name = obj.name + "_outline"
    # Remove all materials, add outline material
    outline.data.materials.clear()
    outline.data.materials.append(get_outline_mat())
    # Invert normals so the shell faces inward
    bpy.context.view_layer.objects.active = outline
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.flip_normals()
    bpy.ops.object.mode_set(mode='OBJECT')
    # Add solidify modifier with negative thickness (expands outward)
    bev = outline.modifiers.new(name="Solidify", type='SOLIDIFY')
    bev.thickness = thickness
    bev.offset = 1.0
    bpy.ops.object.modifier_apply(modifier=bev.name)
    # Parent outline to the original so it follows animations
    outline.parent = obj
    outline.matrix_parent_inverse = obj.matrix_world.inverted()
    obj.select_set(False)
    outline.select_set(False)
    return outline

# ─── CHARACTER ──────────────────────────────────────────────────────────────

def build_character(agent):
    cid = agent["id"]
    coll = bpy.data.collections.new(f"Agent_{cid}")
    bpy.context.scene.collection.children.link(coll)

    mat_shirt = make_material(f"{cid}_shirt", agent["shirt"], 0.5, sat_boost=1.35)
    mat_pants = make_material(f"{cid}_pants", agent["pants"], 0.65, sat_boost=1.2)
    mat_skin = make_material(f"{cid}_skin", agent["skin"], 0.45, subsurface=0.2, sat_boost=1.15)
    mat_hair = make_material(f"{cid}_hair", agent["hair"], 0.3, sat_boost=1.2)
    mat_shoe = make_material(f"{cid}_shoe", "#1a1a1a", 0.2, sat_boost=1.0)
    mat_belt = make_material(f"{cid}_belt", "#2a1a10", 0.5, sat_boost=1.0)

    parts = {}

    # Character ~1.65 units tall (slightly shorter for better furniture ratio)
    # Torso: smooth rounded box, slight taper (wider at shoulders)
    parts["torso"] = add_smooth_cube(f"{cid}_torso", (0, 0, 0.98), (0.34, 0.23, 0.48), mat_shirt, coll, bevel=0.06)
    # Belt
    parts["belt"] = add_smooth_cube(f"{cid}_belt", (0, 0, 0.72), (0.33, 0.22, 0.06), mat_belt, coll, bevel=0.02)
    # Hips
    parts["hips"] = add_smooth_cube(f"{cid}_hips", (0, 0, 0.65), (0.31, 0.21, 0.14), mat_pants, coll, bevel=0.04)
    # Neck (small skin cylinder)
    parts["neck"] = add_smooth_cylinder(f"{cid}_neck", (0, 0.01, 1.30), 0.07, 0.08, mat_skin, coll)

    # Head — smooth sphere, slightly elongated
    parts["head"] = add_sphere(f"{cid}_head", (0, 0.01, 1.45), 0.14, mat_skin, coll, segments=20)
    parts["head"].scale = (0.95, 0.95, 1.1)
    bpy.context.view_layer.objects.active = parts["head"]
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Hair — rounded cap covering top 2/3 of head
    parts["hair"] = add_sphere(f"{cid}_hair", (0, -0.01, 1.50), 0.155, mat_hair, coll, segments=18)
    parts["hair"].scale = (1.02, 1.08, 0.65)
    bpy.context.view_layer.objects.active = parts["hair"]
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Eyes — two small dark spheres on the front of the head (facing +Y)
    # These make the character read as a person, not a mannequin.
    mat_eye = make_material(f"{cid}_eye", "#1a1410", 0.2, sat_boost=1.0)
    parts["eye_l"] = add_sphere(f"{cid}_eye_l", (0.06, 0.115, 1.46), 0.022, mat_eye, coll, segments=10)
    parts["eye_r"] = add_sphere(f"{cid}_eye_r", (-0.06, 0.115, 1.46), 0.022, mat_eye, coll, segments=10)

    # Arms — cylinders (upper shirt sleeve + lower skin forearm)
    parts["arm_l_up"] = add_smooth_cylinder(f"{cid}_alm_l_up", (0.37, 0, 1.08), 0.075, 0.30, mat_shirt, coll)
    parts["arm_l_lo"] = add_smooth_cylinder(f"{cid}_arm_l_lo", (0.37, 0, 0.74), 0.065, 0.26, mat_skin, coll)
    parts["arm_r_up"] = add_smooth_cylinder(f"{cid}_arm_r_up", (-0.37, 0, 1.08), 0.075, 0.30, mat_shirt, coll)
    parts["arm_r_lo"] = add_smooth_cylinder(f"{cid}_arm_r_lo", (-0.37, 0, 0.74), 0.065, 0.26, mat_skin, coll)
    # Hands (small spheres at wrist)
    parts["hand_l"] = add_sphere(f"{cid}_hand_l", (0.37, 0, 0.59), 0.07, mat_skin, coll, segments=12)
    parts["hand_r"] = add_sphere(f"{cid}_hand_r", (-0.37, 0, 0.59), 0.07, mat_skin, coll, segments=12)

    # Legs — cylinders
    parts["leg_l"] = add_smooth_cylinder(f"{cid}_leg_l", (0.11, 0, 0.33), 0.085, 0.48, mat_pants, coll)
    parts["leg_r"] = add_smooth_cylinder(f"{cid}_leg_r", (-0.11, 0, 0.33), 0.085, 0.48, mat_pants, coll)
    # Shoes — slightly elongated rounded boxes pointing forward (+Y)
    parts["shoe_l"] = add_smooth_cube(f"{cid}_shoe_l", (0.11, 0.04, 0.06), (0.10, 0.17, 0.06), mat_shoe, coll, bevel=0.025)
    parts["shoe_r"] = add_smooth_cube(f"{cid}_shoe_r", (-0.11, 0.04, 0.06), (0.10, 0.17, 0.06), mat_shoe, coll, bevel=0.025)

    # Ground shadow
    bpy.ops.mesh.primitive_circle_add(vertices=24, radius=0.30, location=(0, 0, 0.01), fill_type='NGON')
    shadow = bpy.context.active_object
    shadow.name = f"{cid}_shadow"
    mat_shadow = bpy.data.materials.new(f"{cid}_shadow_mat")
    mat_shadow.use_nodes = True
    bsdf = mat_shadow.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (0.12, 0.09, 0.05, 1.0)
        if 'Alpha' in bsdf.inputs:
            bsdf.inputs['Alpha'].default_value = 0.28
        if 'Roughness' in bsdf.inputs:
            bsdf.inputs['Roughness'].default_value = 1.0
    mat_shadow.blend_method = 'BLEND'
    shadow.data.materials.append(mat_shadow)
    _move_to_collection(shadow, coll)
    parts["shadow"] = shadow

    # Add subtle outlines to body parts (not shadow/eyes) for definition
    outline_parts = ["torso", "hips", "head", "hair", "arm_l_up", "arm_l_lo",
                     "arm_r_up", "arm_r_lo", "leg_l", "leg_r", "shoe_l", "shoe_r", "neck"]
    for key in outline_parts:
        if key in parts:
            try:
                add_outline(parts[key], thickness=0.010)
            except Exception as e:
                print(f"  outline skipped for {key}: {e}")

    return coll, parts


# ─── ANIMATION ──────────────────────────────────────────────────────────────

def store_base_transforms(parts):
    """Capture the rest pose so we can restore between anims."""
    base = {}
    for key, obj in parts.items():
        base[key] = {
            "loc": obj.location.copy(),
            "rot": obj.rotation_euler.copy(),
        }
    return base

def clear_all_keyframes(parts):
    for obj in parts.values():
        if obj.animation_data:
            obj.animation_data_clear()

def restore_transforms(parts, base):
    for key, obj in parts.items():
        if key in base:
            obj.location = base[key]["loc"].copy()
            obj.rotation_euler = base[key]["rot"].copy()

def animate_idle(parts, base):
    """Gentle breathing — subtle vertical bob on head + torso + neck."""
    scene = bpy.context.scene
    torso = parts["torso"]
    head = parts["head"]
    hair = parts["hair"]
    neck = parts["neck"]
    eye_l = parts.get("eye_l")
    eye_r = parts.get("eye_r")
    base_tz = base["torso"]["loc"].z
    base_hz = base["head"]["loc"].z
    base_hrz = base["hair"]["loc"].z
    base_nz = base["neck"]["loc"].z
    base_elz = base["eye_l"]["loc"].z if eye_l else 0
    base_erz = base["eye_r"]["loc"].z if eye_r else 0

    for f in range(1, FRAMES_IDLE + 1):
        t = f / FRAMES_IDLE
        bob = math.sin(t * 2 * math.pi) * 0.012
        scene.frame_set(f)
        torso.location.z = base_tz + bob
        head.location.z = base_hz + bob
        hair.location.z = base_hrz + bob
        neck.location.z = base_nz + bob
        if eye_l: eye_l.location.z = base_elz + bob
        if eye_r: eye_r.location.z = base_erz + bob
        torso.keyframe_insert(data_path="location", index=2, frame=f)
        head.keyframe_insert(data_path="location", index=2, frame=f)
        hair.keyframe_insert(data_path="location", index=2, frame=f)
        neck.keyframe_insert(data_path="location", index=2, frame=f)
        if eye_l: eye_l.keyframe_insert(data_path="location", index=2, frame=f)
        if eye_r: eye_r.keyframe_insert(data_path="location", index=2, frame=f)

def animate_walk(parts, base):
    """Walk cycle: legs and arms swing in opposition, slight bob."""
    scene = bpy.context.scene
    # Pivot correction: move leg/arm origins to their top for natural rotation.
    # We do this by setting the object's origin to its top, then rotating.
    limb_keys = ["leg_l", "leg_r", "arm_l_up", "arm_r_up", "arm_l_lo", "arm_r_lo", "hand_l", "hand_r"]

    # Set 3D cursor to top of each limb and set origin there
    for key in limb_keys:
        obj = parts[key]
        top_z = obj.location.z + obj.dimensions.z / 2
        bpy.context.scene.cursor.location = (obj.location.x, obj.location.y, top_z)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.origin_set(type='ORIGIN_CURSOR')

    leg_l = parts["leg_l"]
    leg_r = parts["leg_r"]
    arm_l = parts["arm_l_up"]
    arm_r = parts["arm_r_up"]
    arm_l_lo = parts["arm_l_lo"]
    arm_r_lo = parts["arm_r_lo"]
    torso = parts["torso"]
    head = parts["head"]
    hair = parts["hair"]
    eye_l = parts.get("eye_l")
    eye_r = parts.get("eye_r")
    base_tz = torso.location.z
    base_hz = head.location.z
    base_hrz = hair.location.z
    base_elz = eye_l.location.z if eye_l else 0
    base_erz = eye_r.location.z if eye_r else 0

    for f in range(1, FRAMES_WALK + 1):
        t = f / FRAMES_WALK
        phase = t * 2 * math.pi
        # Legs opposite
        leg_l_rot = math.sin(phase) * math.radians(28)
        leg_r_rot = math.sin(phase + math.pi) * math.radians(28)
        # Arms opposite to legs
        arm_l_rot = math.sin(phase + math.pi) * math.radians(22)
        arm_r_rot = math.sin(phase) * math.radians(22)
        # Elbow bend
        arm_l_lo_rot = -abs(math.sin(phase + math.pi)) * math.radians(15)
        arm_r_lo_rot = -abs(math.sin(phase)) * math.radians(15)
        # Bob
        bob = abs(math.sin(phase * 2)) * 0.025

        scene.frame_set(f)
        leg_l.rotation_euler = (leg_l_rot, 0, 0)
        leg_r.rotation_euler = (leg_r_rot, 0, 0)
        arm_l.rotation_euler = (arm_l_rot, 0, 0)
        arm_r.rotation_euler = (arm_r_rot, 0, 0)
        arm_l_lo.rotation_euler = (arm_l_lo_rot, 0, 0)
        arm_r_lo.rotation_euler = (arm_r_lo_rot, 0, 0)
        torso.location.z = base_tz + bob
        head.location.z = base_hz + bob
        hair.location.z = base_hrz + bob
        if eye_l: eye_l.location.z = base_elz + bob
        if eye_r: eye_r.location.z = base_erz + bob

        for obj in [leg_l, leg_r, arm_l, arm_r, arm_l_lo, arm_r_lo]:
            obj.keyframe_insert(data_path="rotation_euler", frame=f)
        torso.keyframe_insert(data_path="location", index=2, frame=f)
        head.keyframe_insert(data_path="location", index=2, frame=f)
        hair.keyframe_insert(data_path="location", index=2, frame=f)
        if eye_l: eye_l.keyframe_insert(data_path="location", index=2, frame=f)
        if eye_r: eye_r.keyframe_insert(data_path="location", index=2, frame=f)

# ─── SCENE SETUP ────────────────────────────────────────────────────────────

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    bpy.context.scene.cursor.location = (0, 0, 0)
    for col in list(bpy.data.collections):
        if col.name != "Collection":
            bpy.data.collections.remove(col)
    for block in list(bpy.data.meshes): bpy.data.meshes.remove(block)
    for block in list(bpy.data.materials): bpy.data.materials.remove(block)
    for block in list(bpy.data.cameras): bpy.data.cameras.remove(block)
    for block in list(bpy.data.lights): bpy.data.lights.remove(block)
    for block in list(bpy.data.actions): bpy.data.actions.remove(block)

def setup_render():
    scene = bpy.context.scene
    if USE_CYCLES:
        try:
            scene.render.engine = 'CYCLES'
            scene.cycles.samples = 32
            scene.cycles.use_denoising = True
            print("Using render engine: CYCLES (32 samples)")
        except Exception:
            scene.render.engine = 'BLENDER_EEVEE'
            print("Using render engine: BLENDER_EEVEE (Cycles fallback)")
    else:
        engines = ['BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE']
        for eng in engines:
            try:
                scene.render.engine = eng
                print(f"Using render engine: {eng}")
                break
            except Exception:
                continue
    scene.render.resolution_x = RENDER_SIZE
    scene.render.resolution_y = RENDER_SIZE
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    world = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = (0.0, 0.0, 0.0, 0.0)
        bg.inputs[1].default_value = 0.0

def setup_lighting():
    # Key (warm, upper-left front)
    bpy.ops.object.light_add(type='SUN', location=(5, -5, 8))
    key = bpy.context.active_object
    key.name = "KeyLight"
    key.data.energy = 3.0
    key.data.color = (1.0, 0.95, 0.85)
    key.data.angle = math.radians(10)
    key.rotation_euler = (math.radians(55), math.radians(10), math.radians(35))

    # Fill (cool, right)
    bpy.ops.object.light_add(type='SUN', location=(-4, 3, 4))
    fill = bpy.context.active_object
    fill.name = "FillLight"
    fill.data.energy = 1.2
    fill.data.color = (0.78, 0.85, 1.0)
    fill.rotation_euler = (math.radians(60), math.radians(-15), math.radians(-30))

    # Rim (back-top)
    bpy.ops.object.light_add(type='SUN', location=(0, 5, 6))
    rim = bpy.context.active_object
    rim.name = "RimLight"
    rim.data.energy = 1.8
    rim.data.color = (1.0, 0.92, 0.8)
    rim.rotation_euler = (math.radians(120), 0, math.radians(180))

def setup_isometric_camera():
    bpy.ops.object.camera_add(location=(0, 0, 0))
    cam = bpy.context.active_object
    cam.name = "IsoCam"
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = CAM_ORTHO_SCALE
    # Standard iso view
    cam.location = (6, -6, 6)
    direction = Vector((0, 0, 0.6)) - cam.location
    cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.camera = cam
    return cam

# ─── RENDER ─────────────────────────────────────────────────────────────────

def render_frames(parts, cid, anim, num_frames):
    scene = bpy.context.scene
    paths = []
    for f in range(1, num_frames + 1):
        scene.frame_set(f)
        out_path = os.path.join(OUT_DIR, f"{cid}_{anim}_{f:02d}.png")
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        paths.append(os.path.basename(out_path))
    return paths

# ─── MAIN ───────────────────────────────────────────────────────────────────

def main():
    clear_scene()
    setup_render()
    setup_lighting()
    setup_isometric_camera()
    scene = bpy.context.scene
    scene.render.fps = 12

    manifest = {}
    all_agents = AGENTS  # generate all 21
    print(f"=== Generating {len(all_agents)} character(s) ===")

    for agent in all_agents:
        cid = agent["id"]
        print(f"\n--- Building {cid} ---")
        coll, parts = build_character(agent)
        base = store_base_transforms(parts)

        # IDLE
        print("Idle...")
        scene.frame_start = 1; scene.frame_end = FRAMES_IDLE
        animate_idle(parts, base)
        idle_paths = render_frames(parts, cid, "idle", FRAMES_IDLE)
        clear_all_keyframes(parts)
        restore_transforms(parts, base)

        # WALK
        print("Walk...")
        scene.frame_start = 1; scene.frame_end = FRAMES_WALK
        animate_walk(parts, base)
        walk_paths = render_frames(parts, cid, "walk", FRAMES_WALK)
        clear_all_keyframes(parts)
        restore_transforms(parts, base)

        manifest[cid] = {
            "colors": agent,
            "idle": {"frames": FRAMES_IDLE, "fps": 12, "files": idle_paths},
            "walk": {"frames": FRAMES_WALK, "fps": 12, "files": walk_paths},
        }

    manifest_path = os.path.join(OUT_DIR, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n=== Done. Manifest: {manifest_path} ===")

if __name__ == "__main__":
    main()
