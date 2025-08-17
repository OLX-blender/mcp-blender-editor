import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";

export default function createPythonFile(
    fullPath: string | undefined,
    pythonCode: string
): string {
    // TODO: expand function for safety features

    const defaultPath = path.join(
        os.homedir(),
        `video_script_${crypto.randomUUID()}.py`
    );

    const { ext } = path.parse(fullPath || "");
    let finalPath = fullPath || defaultPath;

    if (fullPath && ext === "") {
        const scriptTitle = `video_script_${crypto.randomUUID()}.py`;
        finalPath = path.join(fullPath, scriptTitle);
    }

    const dir = path.dirname(finalPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(finalPath, pythonCode);

    return finalPath;
}
