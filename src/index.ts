import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createPythonProjectSchema } from "./templates/create_python_project/createPythonProjectSchema.js";
import { newProjectTemplate } from "./templates/create_python_project/createPythonProjectTemplate.js";
import createPythonFile from "./utils/fileManipulation.js";

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

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Blender MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
