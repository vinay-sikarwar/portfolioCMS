import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(serverDir, "../..");
dotenv.config({ path: path.join(projectRoot, ".env") });

const prismaCli = path.join(
  projectRoot,
  "node_modules",
  "prisma",
  "build",
  "index.js"
);
const result = spawnSync(
  process.execPath,
  [prismaCli, ...process.argv.slice(2)],
  {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
  }
);

process.exit(result.status ?? 1);
