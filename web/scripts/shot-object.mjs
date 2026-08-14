/**
 * Screenshots one `/lab` tile at high magnification, by object key.
 *
 *   npm run shot -- kirby triforce gym
 *
 * This exists because the whole scene is 1444px wide, where a duck is forty
 * pixels and every defect is invisible. Reviewing the contact sheet only ever
 * confirms that the code did what was intended; it cannot show whether the
 * drawing is any good. An object is not finished until its own tile here has
 * been captured and looked at.
 *
 * Needs the dev server up on :3000 — `/lab` 404s in production by design.
 * Writes to `web/.desk-review/`, which is gitignored.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9455;
const keys = process.argv.slice(2);
const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", ".desk-review");
mkdirSync(outDir, { recursive: true });

if (keys.length === 0) {
  console.error("usage: npm run shot -- <object-key> [...]");
  process.exit(1);
}

const profile = mkdtempSync(join(tmpdir(), "obj-"));
const chrome = spawn(CHROME, [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "about:blank",
]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wsUrl() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const j = await r.json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("no chrome");
}

const socket = new WebSocket(await wsUrl());
await new Promise((r) => socket.addEventListener("open", r, { once: true }));
let id = 1;
const pending = new Map();
socket.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? {}); pending.delete(m.id); }
});
const send = (method, params = {}, sessionId) =>
  new Promise((res) => { const i = id++; pending.set(i, res); socket.send(JSON.stringify({ id: i, method, params, sessionId })); });

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
// Big viewport + 3x scale so a 180px tile lands around 900px of real detail.
await send("Emulation.setDeviceMetricsOverride",
  { width: 1600, height: 1200, deviceScaleFactor: 3, mobile: false }, sessionId);
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);
await send("Page.navigate", { url: "http://localhost:3000/lab" }, sessionId);
await sleep(3500);

for (const key of keys) {
  const rect = await send("Runtime.evaluate", {
    expression: `(() => {
      const caps = [...document.querySelectorAll('.lab-tile figcaption b')];
      const hit = caps.find((b) => b.textContent.trim() === ${JSON.stringify(key)});
      if (!hit) return null;
      const r = hit.closest('.lab-tile').getBoundingClientRect();
      return JSON.stringify({ x: r.x, y: r.y, width: r.width, height: r.height });
    })()`,
    returnByValue: true,
  }, sessionId);

  const value = rect?.result?.value;
  if (!value) { console.log(`${key}: NOT FOUND`); continue; }
  const box = JSON.parse(value);

  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    clip: { ...box, scale: 3 },
  }, sessionId);
  writeFileSync(join(outDir, `obj-${key}.png`), Buffer.from(data, "base64"));
  console.log(`wrote obj-${key}.png (${Math.round(box.width * 3)}px wide)`);
}

socket.close();
chrome.kill();
