import { build } from "esbuild";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outdir = path.join(projectRoot, "output", "audit-worker", "functions");
await mkdir(outdir, { recursive: true });

// Bundle only the worker's server modules. The react-server condition resolves
// the server-only marker to its empty server entry without changing browser code.
await build({
  absWorkingDir: projectRoot,
  entryPoints: {
    audit: "netlify/functions/audit-background.ts",
    "audit-health": "netlify/functions/audit-health.ts",
    "audit-rescue": "netlify/functions/audit-rescue.ts",
  },
  outdir,
  outExtension: { ".js": ".mjs" },
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  conditions: ["react-server"],
  external: ["pg-native"],
  banner: { js: 'import { createRequire as __auditCreateRequire } from "node:module"; const require = __auditCreateRequire(import.meta.url);' },
  logLevel: "info",
});
