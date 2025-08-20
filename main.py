#!/usr/bin/env python3
# <import_section
import os
import traceback
import bpy
# import_section>

try:
    # <video_path_section
    video1_path = os.path.join(os.path.dirname(__file__), "v2.mp4")
    video2_path = os.path.join(os.path.dirname(__file__), "v3.mp4")
    # video_path_section>

    # <settings_section
    fps = 30
    output_path = os.path.join(os.path.dirname(__file__), "output.mp4")

    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.sequence_editor_create()
    scene.render.fps = fps
    # settings_section>

    # <video_editing_section
    seq1 = scene.sequence_editor.sequences.new_movie(
        name="v2",
        filepath=video1_path,
        channel=1,
        frame_start=1
    )
    
    # Dodaj drugi filmik po pierwszym
    seq2 = scene.sequence_editor.sequences.new_movie(
        name="v3",
        filepath=video2_path,
        channel=1,
        frame_start=seq1.frame_final_end + 1
    )

    scene.frame_end = seq2.frame_final_end
    # video_editing_section>

    # <video_rendering_section
    scene.render.filepath = output_path
    scene.render.image_settings.file_format = "FFMPEG"
    scene.render.ffmpeg.format = "MPEG4"
    scene.render.ffmpeg.codec = "H264"
    scene.render.ffmpeg.constant_rate_factor = "MEDIUM"
    scene.render.ffmpeg.ffmpeg_preset = "GOOD"
    scene.render.ffmpeg.audio_codec = "AAC"
    scene.render.ffmpeg.audio_bitrate = 192

    bpy.ops.render.render(animation=True)

    # video_rendering_section>

except Exception as e:
    with open("error_log.txt", "w") as f:
        f.write(traceback.format_exc())
