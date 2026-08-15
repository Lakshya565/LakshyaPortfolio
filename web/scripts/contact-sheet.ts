/**
 * Captures the `/lab` workbench as a single PNG.
 *
 * The point of this script is to make the artwork reviewable *by looking at it*.
 * The scene renders 1444px wide, where a duck is about forty pixels across, so
 * checking whether a shape reads means either zooming by hand or guessing — and
 * guessing is how the last duck took eleven attempts before it worked. One image
 * of every object, alone and large, removes the excuse.
 *
 * Drives Chrome over the DevTools protocol using Node's built-in WebSocket, so
 * there is no Puppeteer dependency for what is ultimately one screenshot.
 *
 * Requires `npm run dev` to be running. Usage:
 *
 *   npm run contact-sheet                       # /lab at 1600px wide
 *   npm run contact-sheet -- --width 2200
 *   npm run contact-sheet -- --path /           # any route, e.g. the real scene
 *   npm run contact-sheet -- --toggle Grid      # flip /lab switches before capture
 *   npm run contact-sheet -- --toggle Grid,Labels --name bare
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const port = 9333;

function arg(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : (process.argv[index + 1] ?? fallback);
}

const width = Number(arg("width", "1600"));
const routePath = arg("path", "/lab");
const origin = arg("origin", "http://localhost:3000");
const outDir = arg("out", join(process.cwd(), ".desk-review"));
const name = arg("name", routePath === "/lab" ? "contact-sheet" : "page");
/**
 * `/lab` switches to click before capturing, by their visible label.
 *
 * The toggles are React state behind checkboxes, so there is no URL that renders
 * the workbench without its grid — the only way to capture that view is to drive
 * the control the way a person would.
 */
const toggles = arg("toggle", "")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDevServer(url: string): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (response.ok || response.status === 404) {
        return;
      }
    } catch {
      // Not up yet.
    }
    await sleep(500);
  }
  throw new Error(
    `No dev server at ${origin}. Start one with \`npm run dev\` and try again.`,
  );
}

async function debuggerUrl(): Promise<string> {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      const json = (await response.json()) as { webSocketDebuggerUrl?: string };
      if (json.webSocketDebuggerUrl) {
        return json.webSocketDebuggerUrl;
      }
    } catch {
      // Chrome still starting.
    }
    await sleep(250);
  }
  throw new Error("Chrome did not expose a debugging endpoint");
}

async function main(): Promise<void> {
  const chromePath = chromeCandidates.find((candidate) => existsSync(candidate));
  if (!chromePath) {
    throw new Error(
      `No Chrome found. Looked in:\n${chromeCandidates.map((c) => `  ${c}`).join("\n")}`,
    );
  }

  const url = `${origin}${routePath}`;
  await waitForDevServer(url);
  mkdirSync(outDir, { recursive: true });

  const profile = mkdtempSync(join(tmpdir(), "desk-shot-"));
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ]);

  const socket = new WebSocket(await debuggerUrl());
  await new Promise((resolve) =>
    socket.addEventListener("open", resolve, { once: true }),
  );

  let nextId = 1;
  const pending = new Map<number, (result: unknown) => void>();

  socket.addEventListener("message", (event: MessageEvent) => {
    const message = JSON.parse(String(event.data)) as {
      id?: number;
      result?: unknown;
    };
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)?.(message.result ?? {});
      pending.delete(message.id);
    }
  });

  function send<T>(
    method: string,
    params: Record<string, unknown> = {},
    sessionId?: string,
  ): Promise<T> {
    const id = nextId++;
    return new Promise<T>((resolve) => {
      pending.set(id, resolve as (result: unknown) => void);
      socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }

  const { targetId } = await send<{ targetId: string }>("Target.createTarget", {
    url: "about:blank",
  });
  const { sessionId } = await send<{ sessionId: string }>(
    "Target.attachToTarget",
    { targetId, flatten: true },
  );

  // `--headless=new` ignores a narrow `--window-size`, so the viewport has to be
  // set through emulation rather than on the command line.
  await send(
    "Emulation.setDeviceMetricsOverride",
    { width, height: 1200, deviceScaleFactor: 1, mobile: false },
    sessionId,
  );
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Page.navigate", { url }, sessionId);
  await sleep(2500);

  if (toggles.length > 0) {
    const result = await send<{ result?: { value?: string } }>(
      "Runtime.evaluate",
      {
        expression: `(() => {
          const wanted = ${JSON.stringify(toggles.map((entry) => entry.toLowerCase()))};
          const labels = [...document.querySelectorAll(".lab-controls label")];
          const missed = [];
          for (const want of wanted) {
            const hit = labels.find(
              (label) => label.textContent.trim().toLowerCase() === want,
            );
            if (hit) hit.querySelector("input").click();
            else missed.push(want);
          }
          return missed.join(", ");
        })()`,
        returnByValue: true,
      },
      sessionId,
    );
    const missed = result?.result?.value;
    if (missed) {
      throw new Error(
        `No such /lab toggle: ${missed}. Available: Grid, Wireframe, Labels.`,
      );
    }
    // React has to commit the state change and the browser has to repaint.
    await sleep(400);
  }

  const { data } = await send<{ data: string }>(
    "Page.captureScreenshot",
    { format: "png", captureBeyondViewport: true },
    sessionId,
  );

  const file = join(outDir, `${name}.png`);
  writeFileSync(file, Buffer.from(data, "base64"));

  socket.close();
  chrome.kill();

  console.log(`Wrote ${file} (${width}px wide, full page)`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
