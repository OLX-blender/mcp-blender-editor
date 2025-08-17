import z from "zod";

export const createPythonProjectSchema = z.object({
    videoOutputPath: z
        .string()
        .describe(
            "Path where to save the output video after Python script execution"
        )
        .optional(),
    pythonScriptOutputPath: z
        .string()
        .describe("Path where to save the Python file")
        .optional(),
    fps: z
        .union([z.literal(15), z.literal(30), z.literal(60)])
        .default(30)
        .describe("How many fps should output film have")
        .optional(),
});
