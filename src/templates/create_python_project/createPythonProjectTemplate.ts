import { z } from "zod";
import { createPythonProjectSchema } from "./createPythonProjectSchema.js";

export const createPythonProjectTemplateSchema = createPythonProjectSchema.omit(
    {
        pythonScriptOutputPath: true,
    }
);

export type CreatePythonProjectTemplateProps = z.infer<
    typeof createPythonProjectTemplateSchema
>;

export const newProjectTemplate = (props: CreatePythonProjectTemplateProps) => {
    const validated = createPythonProjectTemplateSchema.safeParse(props);

    if (!validated.success) {
        throw new Error("Invalid props");
    }

    return `#!/usr/bin/env python3
# <import_section
import os
import traceback
import bpy
# import_section>

try:
    # <video_path_section
    # video_path_section>

    # <settings_section
    fps = ${validated.data.fps}
    output_path = ${
        validated.data.videoOutputPath
            ? `r"""${validated.data.videoOutputPath.replace(/\\/g, "\\\\")}"""`
            : 'os.path.join(os.path.dirname(__file__), "output.mp4")'
    }

    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.sequence_editor_create()
    scene.render.fps = fps
    # settings_section>

    # <video_editing_section
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
`;
};
