"""Generate geometry-only v3 assets for the ABOUT crystal browser lab."""

from __future__ import annotations

import bmesh
import bpy
import json
import math
import os
import sys
import traceback
from mathutils import Vector


ROOT = os.path.abspath(os.getcwd())
PUBLIC_DIR = os.path.join(ROOT, "public", "experiments", "crystal")
OUTPUT_DIR = os.path.join(ROOT, "output", "crystal-lab")
GLB_PATH = os.path.join(PUBLIC_DIR, "about-crystal-v3.glb")
SDF_PATH = os.path.join(PUBLIC_DIR, "about-user-sdf-v3.png")
REPORT_PATH = os.path.join(OUTPUT_DIR, "geometry-report.json")
LOG_PATH = os.path.join(OUTPUT_DIR, "geometry.log")

OUTER_NAME = "CRY_about_outer_frame_LOD0"
RING_NAME = "CRY_about_inner_ring_LOD0"
PANEL_NAME = "CRY_about_panel_LOD0"
COVER_NAME = "CRY_about_glass_cover_LOD0"
EXPECTED_NAMES = [OUTER_NAME, RING_NAME, PANEL_NAME, COVER_NAME]

SDF_SIZE = 512
OUTLINE_SEGMENTS = 128
LOG_LINES: list[str] = []


for directory in (PUBLIC_DIR, OUTPUT_DIR):
    os.makedirs(directory, exist_ok=True)


def log(message: str) -> None:
    line = f"[about-crystal-v3] {message}"
    LOG_LINES.append(line)
    print(line, flush=True)


def write_log(status: str, error: str | None = None) -> None:
    lines = [
        f"status={status}",
        f"blender_version={bpy.app.version_string}",
        f"glb={GLB_PATH}",
        f"sdf={SDF_PATH}",
    ]
    if error:
        lines.append(f"error={error}")
    lines.extend(LOG_LINES)
    with open(LOG_PATH, "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n")


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in (
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.materials,
        bpy.data.images,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for datablock in list(collection):
            if datablock.users == 0:
                collection.remove(datablock)


def angular_gaussian(theta: float, center: float, width: float) -> float:
    delta = math.atan2(math.sin(theta - center), math.cos(theta - center))
    return math.exp(-0.5 * (delta / width) ** 2)


def outline_radius(theta: float, calm: float = 1.0) -> float:
    """Asymmetric three-lobed shield profile with a broad upper shoulder."""
    radius = 1.0
    radius += 0.105 * calm * math.cos(3.0 * (theta - 0.12))
    radius += 0.030 * calm * math.cos(2.0 * theta + 0.66)
    radius += 0.020 * calm * math.sin(theta - 0.22)
    radius += 0.038 * calm * angular_gaussian(theta, 1.72, 0.48)
    radius -= 0.045 * calm * angular_gaussian(theta, -0.48, 0.34)
    return radius


def make_outline(scale: float, calm: float, inset_bias: float = 0.0) -> list[tuple[float, float]]:
    points: list[tuple[float, float]] = []
    for index in range(OUTLINE_SEGMENTS):
        theta = 2.0 * math.pi * index / OUTLINE_SEGMENTS
        radius = outline_radius(theta, calm)
        taper = 1.0 - inset_bias * max(0.0, -math.sin(theta))
        x = math.cos(theta) * radius * 1.44 * scale * taper
        y = math.sin(theta) * radius * 1.58 * scale
        x += 0.025 * scale * math.sin(theta)
        y += 0.035 * scale
        points.append((x, y))
    return points


def add_poly_spline(curve: bpy.types.Curve, points: list[tuple[float, float]], reverse: bool) -> None:
    ordered = list(reversed(points)) if reverse else points
    spline = curve.splines.new("POLY")
    spline.points.add(len(ordered) - 1)
    for target, (x, y) in zip(spline.points, ordered):
        target.co = (x, y, 0.0, 1.0)
    spline.use_cyclic_u = True


def recalculate_normals(obj: bpy.types.Object) -> None:
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update(calc_edges=True)


def apply_planar_uv(obj: bpy.types.Object, layer_name: str) -> None:
    mesh = obj.data
    while mesh.uv_layers:
        mesh.uv_layers.remove(mesh.uv_layers[0])
    uv_layer = mesh.uv_layers.new(name=layer_name)
    min_x = min(vertex.co.x for vertex in mesh.vertices)
    max_x = max(vertex.co.x for vertex in mesh.vertices)
    min_z = min(vertex.co.z for vertex in mesh.vertices)
    max_z = max(vertex.co.z for vertex in mesh.vertices)
    span_x = max(max_x - min_x, 1e-6)
    span_z = max(max_z - min_z, 1e-6)
    for loop in mesh.loops:
        vertex = mesh.vertices[loop.vertex_index]
        uv_layer.data[loop.index].uv = (
            (vertex.co.x - min_x) / span_x,
            (vertex.co.z - min_z) / span_z,
        )


def create_layer(
    name: str,
    outer: list[tuple[float, float]],
    inner: list[tuple[float, float]] | None,
    depth: float,
    bevel: float,
    y_offset: float,
) -> bpy.types.Object:
    curve = bpy.data.curves.new(f"{name}_Curve", type="CURVE")
    curve.dimensions = "2D"
    curve.resolution_u = 1
    curve.resolution_v = 1
    curve.fill_mode = "BOTH"
    curve.offset = 0.0
    curve.extrude = depth * 0.5
    curve.bevel_depth = bevel
    curve.bevel_resolution = 3
    curve.resolution_u = 2

    add_poly_spline(curve, outer, reverse=False)
    if inner is not None:
        add_poly_spline(curve, inner, reverse=True)

    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    obj = bpy.context.object
    obj.name = name
    obj.data.name = f"{name}_Mesh"

    # Curve geometry begins in local XY. Rotate it into Blender XZ so the
    # glTF Y-up conversion produces a camera-facing XY badge in Three.js.
    obj.rotation_euler.x = math.radians(90.0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    obj.location.y = y_offset
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)

    recalculate_normals(obj)
    apply_planar_uv(obj, "ABOUT_ICON_UV" if name == PANEL_NAME else "CRYSTAL_UV")
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    obj.select_set(False)
    return obj


def smoothstep(edge0: float, edge1: float, value: float) -> float:
    if edge0 == edge1:
        return 0.0
    value = max(0.0, min(1.0, (value - edge0) / (edge1 - edge0)))
    return value * value * (3.0 - 2.0 * value)


def distance_to_shoulder(x: float, y: float) -> float:
    center_y = -0.29
    radius = 0.355
    dx = x
    dy = y - center_y
    angle = math.atan2(dy, dx)
    if 0.0 <= angle <= math.pi:
        return abs(math.hypot(dx, dy) - radius)
    endpoint_x = radius if x >= 0.0 else -radius
    return math.hypot(x - endpoint_x, y - center_y)


def generate_sdf() -> dict:
    image = bpy.data.images.new(
        "TEX_about_user_sdf_v3",
        width=SDF_SIZE,
        height=SDF_SIZE,
        alpha=False,
        float_buffer=False,
    )
    image.colorspace_settings.name = "Non-Color"
    pixels: list[float] = []
    active = 0
    minimum = 1.0
    maximum = 0.0
    line_width = 0.014
    feather = 0.010

    for row in range(SDF_SIZE):
        y = ((row + 0.5) / SDF_SIZE) * 2.0 - 1.0
        for column in range(SDF_SIZE):
            x = ((column + 0.5) / SDF_SIZE) * 2.0 - 1.0
            head = abs(math.hypot(x, y - 0.285) - 0.165)
            shoulder = distance_to_shoulder(x, y)
            distance = min(head, shoulder)
            mask = 1.0 - smoothstep(line_width - feather, line_width + feather, distance)
            if mask > 0.02:
                active += 1
            minimum = min(minimum, mask)
            maximum = max(maximum, mask)
            pixels.extend((mask, mask, mask, 1.0))

    image.pixels.foreach_set(pixels)
    image.filepath_raw = SDF_PATH
    image.file_format = "PNG"
    image.save()
    return {
        "width": SDF_SIZE,
        "height": SDF_SIZE,
        "min": minimum,
        "max": maximum,
        "coverage": active / (SDF_SIZE * SDF_SIZE),
        "colorspace": image.colorspace_settings.name,
    }


def mesh_stats(obj: bpy.types.Object) -> dict:
    mesh = obj.data
    mesh.calc_loop_triangles()
    bm = bmesh.new()
    bm.from_mesh(mesh)
    boundary = sum(1 for edge in bm.edges if edge.is_boundary)
    non_manifold = sum(1 for edge in bm.edges if not edge.is_manifold)
    bm.free()
    return {
        "vertices": len(mesh.vertices),
        "faces": len(mesh.polygons),
        "triangles": len(mesh.loop_triangles),
        "boundary_edges": boundary,
        "non_manifold_edges": non_manifold,
        "uv_layers": [layer.name for layer in mesh.uv_layers],
    }


def combined_bounds(objects: list[bpy.types.Object]) -> dict:
    points = [obj.matrix_world @ vertex.co for obj in objects for vertex in obj.data.vertices]
    minimum = Vector((min(point.x for point in points), min(point.y for point in points), min(point.z for point in points)))
    maximum = Vector((max(point.x for point in points), max(point.y for point in points), max(point.z for point in points)))
    dimensions = maximum - minimum
    return {
        "min": list(minimum),
        "max": list(maximum),
        "width": dimensions.x,
        "depth": dimensions.y,
        "height": dimensions.z,
        "depth_width_ratio": dimensions.y / max(dimensions.x, 1e-6),
    }


def validate(objects: list[bpy.types.Object]) -> tuple[dict, dict, int]:
    stats = {obj.name: mesh_stats(obj) for obj in objects}
    total_triangles = sum(item["triangles"] for item in stats.values())
    bounds = combined_bounds(objects)

    if sorted(stats) != sorted(EXPECTED_NAMES):
        raise RuntimeError(f"Unexpected node names: {sorted(stats)}")
    if not 8000 <= total_triangles <= 20000:
        raise RuntimeError(f"Triangle budget failed: {total_triangles}")
    if not 0.10 <= bounds["depth_width_ratio"] <= 0.16:
        raise RuntimeError(f"Depth/width ratio failed: {bounds['depth_width_ratio']:.4f}")
    for name, item in stats.items():
        if item["boundary_edges"] or item["non_manifold_edges"]:
            raise RuntimeError(f"Topology failed for {name}: {item}")
    return stats, bounds, total_triangles


def export_glb(objects: list[bpy.types.Object]) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.export_scene.gltf(
        filepath=GLB_PATH,
        export_format="GLB",
        use_selection=True,
        export_cameras=False,
        export_lights=False,
        export_materials="NONE",
        export_apply=True,
        export_yup=True,
    )


def verify_round_trip(expected_triangles: int) -> dict:
    reset_scene()
    bpy.ops.import_scene.gltf(filepath=GLB_PATH)
    imported = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    stats = {obj.name: mesh_stats(obj) for obj in imported}
    triangles = sum(item["triangles"] for item in stats.values())
    passed = sorted(stats) == sorted(EXPECTED_NAMES) and triangles == expected_triangles
    return {
        "passed": passed,
        "node_names": sorted(stats),
        "total_triangles": triangles,
        "meshes": stats,
    }


def main() -> None:
    reset_scene()
    log(f"Blender {bpy.app.version_string}")
    sdf = generate_sdf()

    outer_outline = make_outline(1.0, 1.0)
    outer_hole = make_outline(0.785, 0.86, 0.02)
    ring_outer = make_outline(0.735, 0.79, 0.025)
    ring_hole = make_outline(0.615, 0.64, 0.035)
    panel_outline = make_outline(0.565, 0.52, 0.05)
    cover_outline = make_outline(0.590, 0.55, 0.048)

    outer = create_layer(OUTER_NAME, outer_outline, outer_hole, 0.29, 0.040, 0.00)
    ring = create_layer(RING_NAME, ring_outer, ring_hole, 0.20, 0.026, 0.050)
    panel = create_layer(PANEL_NAME, panel_outline, None, 0.16, 0.045, 0.095)
    cover = create_layer(COVER_NAME, cover_outline, None, 0.050, 0.020, 0.205)
    objects = [outer, ring, panel, cover]

    stats, bounds, triangles = validate(objects)
    log(f"source triangles={triangles}; depth/width={bounds['depth_width_ratio']:.4f}")
    export_glb(objects)
    round_trip = verify_round_trip(triangles)
    if not round_trip["passed"]:
        raise RuntimeError(f"GLB round-trip failed: {round_trip}")

    report = {
        "status": "passed",
        "blender_version": bpy.app.version_string,
        "nodes": EXPECTED_NAMES,
        "meshes": stats,
        "total_triangles": triangles,
        "bounds": bounds,
        "sdf": sdf,
        "glb_round_trip": round_trip,
    }
    with open(REPORT_PATH, "w", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=False, indent=2)
    write_log("passed")
    log("geometry export and round-trip validation passed")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        traceback.print_exc()
        write_log("failed", str(exc))
        sys.exit(1)
