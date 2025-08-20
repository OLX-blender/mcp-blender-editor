import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createPythonProjectSchema } from "./templates/create_python_project/createPythonProjectSchema.js";
import { newProjectTemplate } from "./templates/create_python_project/createPythonProjectTemplate.js";
import createPythonFile from "./utils/fileManipulation.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const server = new McpServer({
    name: "blender-editor-mcp",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});

server.tool(
    "create_python_project",
    "Create Python script for video edit that allows for futher modifications with other tools",

    createPythonProjectSchema.shape,

    async ({ videoOutputPath, pythonScriptOutputPath, fps }) => {
        try {
            const pythonCode = newProjectTemplate({ fps, videoOutputPath });
            const finalPath = createPythonFile(
                pythonScriptOutputPath,
                pythonCode
            );

            return {
                content: [
                    {
                        type: "text",
                        text: `Python script created successfully!\n\n**File:** ${finalPath}\n\n**Content:**\n\`\`\`python\n${pythonCode}\`\`\``,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error creating Python script: ${
                            error instanceof Error
                                ? error.message
                                : "Unknown error"
                        }`,
                    },
                ],
            };
        }
    }
);

server.tool(
    "run_blender_script",
    "Execute Blender with Python script using Git Bash",
    {},
    async () => {
        try {
            const command = '"C:\\Program Files\\Git\\bin\\bash.exe" -c \'"C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe" -b -P main.py\'';

            exec(command); // running this in background

            return {
                content: [
                    {
                        type: "text",
                        text: `Blender script started in background!\n\n**Command:** \`"C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe" -b -P main.py\`\n\n**Status:** Running... Check console or output files for progress.\n\n**Note:** This is a non-blocking operation. The script will continue running even after this response.`,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error starting Blender script: ${
                            error instanceof Error
                                ? error.message
                                : "Unknown error"
                        }`,
                    },
                ],
            };
        }
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Blender MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
