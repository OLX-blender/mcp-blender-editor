import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createPythonProjectSchema } from "./templates/create_python_project/createPythonProjectSchema.js";
import { newProjectTemplate } from "./templates/create_python_project/createPythonProjectTemplate.js";
import createPythonFile from "./utils/fileManipulation.js";
import { exec, ChildProcess } from "child_process";

const runningProcesses = new Map<string, { process: ChildProcess; startTime: Date }>();

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

// in future let's move this and all tools below to another file, like - processes.js
server.tool(
    "run_blender_rendering_script",
    "Execute Blender rendering with Python script using Git Bash",
    {},
    async () => {
        try {
            const command = '"C:\\Program Files\\Git\\bin\\bash.exe" -c \'"C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe" -b -P main.py\'';
            const processId = `blender_${Date.now()}`;

            const childProcess = exec(command, (error, stdout, stderr) => {
                runningProcesses.delete(processId);
                
                if (error) {
                    console.error(`Process ${processId} error:`, error);
                } else {
                    console.error(`Process ${processId} completed successfully`);
                }
            });

            runningProcesses.set(processId, { 
                process: childProcess, 
                startTime: new Date()
            });

            return {
                content: [
                    {
                        type: "text",
                        text: `Blender rendering script started in background!\n\n**Command:** \`"C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe" -b -P main.py\`\n\n**Status:** Running... Check console or output files for progress.\n\n**Note:** This is a non-blocking operation. The script will continue running even after this response.`,
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

server.tool(
    "list_background_processes",
    "List all background processes started by this server",
    {},
    async () => {
        try {
            if (runningProcesses.size === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "No background processes are currently running.",
                        },
                    ],
                };
            }

            let processInfo = "**Background processes:**\n\n";

                for (const [processId, info] of runningProcesses.entries()) {
                    const runtime = Math.floor((Date.now() - info.startTime.getTime()) / 1000);
                    const status = info.process.killed ? "Killed" : "Running";

                    processInfo += `**Process ID:** \`${processId}\`\n`;
                    processInfo += `**Status:** ${status}\n`;
                    processInfo += `**Runtime:** ${runtime} seconds\n`;
                    processInfo += `**Started:** ${info.startTime.toLocaleString()}\n`;
            }

            return {
                content: [
                    {
                        type: "text",
                        text: processInfo,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error listing background processes: ${
                            error instanceof Error
                                ? error.message
                                : "Unknown error"
                        }`,
                    },
                ],
            };
        }
    }
)

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Blender MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
