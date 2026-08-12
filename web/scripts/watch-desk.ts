/**
 * Re-runs the scene generator whenever the scene sources change.
 *
 * This spawns `generate-desk.ts` as a fresh child process rather than calling it
 * in-process. The generator imports the scene through a chain of modules
 * (`scene` → `objects` → `parts` → `projection`), and an ES module graph is
 * cached for the life of a process — cache-busting the entry alone would keep
 * serving a stale `objects.ts`, which is exactly the file being iterated on. A
 * new process has no cache to be wrong about.
 *
 * A failing run must not end the watch. The generator throws on overlapping
 * objects by design, and that is a normal thing to hit halfway through moving
 * something; the child exits non-zero, we say so, and keep watching.
 *
 * Because the generator writes into `lib/desk/`, `next dev` picks the change up
 * on its own. Run this alongside `npm run dev` and edit with the page open.
 */

import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { join } from "node:path";

const webRoot = process.cwd();
const sources = [join(webRoot, "lib", "desk"), join(webRoot, "scripts")];

/** Generated files live in the watched directory; reacting to them would loop. */
const generated = new Set([
  "scene-catalog.ts",
  "scene-geometry.ts",
  "scene-markup.ts",
]);

let running = false;
let queued = false;
let timer: NodeJS.Timeout | null = null;

function run(): void {
  if (running) {
    queued = true;
    return;
  }

  running = true;
  const startedAt = Date.now();

  const child = spawn("npx", ["tsx", "scripts/generate-desk.ts"], {
    cwd: webRoot,
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });

  const lines: string[] = [];
  child.stdout.on("data", (chunk: Buffer) => lines.push(chunk.toString()));
  child.stderr.on("data", (chunk: Buffer) => lines.push(chunk.toString()));

  child.on("close", (code) => {
    running = false;
    const elapsed = Date.now() - startedAt;
    const output = lines.join("").trimEnd();

    if (code === 0) {
      // Only the summary line matters on a good run; the paths are noise once
      // you have seen them once.
      const summary = output.split("\n").filter((line) => line.startsWith("Objects:"));
      console.log(`✓ ${summary.join(" ") || "regenerated"} (${elapsed}ms)`);
    } else {
      console.error(`✗ generate failed\n${output}\n`);
    }

    if (queued) {
      queued = false;
      run();
    }
  });
}

function schedule(filename: string | null): void {
  if (filename && generated.has(filename.replace(/^.*[\\/]/, ""))) {
    return;
  }
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(run, 120);
}

for (const dir of sources) {
  watch(dir, { recursive: true }, (_event, filename) => {
    schedule(typeof filename === "string" ? filename : null);
  });
}

console.log(`Watching ${sources.map((dir) => dir.replace(webRoot, ".")).join(", ")}`);
run();
