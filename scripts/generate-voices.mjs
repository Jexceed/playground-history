import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const source = JSON.parse(readFileSync("public/audio/voice-lines.json", "utf8"));
const python = resolve(args.python ?? "../playground/local-tts/.venv/bin/python");
const outputDir = join("public", "audio", "voice", "zh-CN", "xiaoxiao");
const manifestPath = join("public", "audio", "voice", "manifest.json");
const entries = [];

mkdirSync(outputDir, { recursive: true });

for (const [index, line] of source.lines.entries()) {
  const outputPath = join(outputDir, `${line.id}.mp3`);
  if (!hasAudio(outputPath) || args.force) {
    await run(python, [
      "-m", "edge_tts",
      "--voice", source.voice,
      `--rate=${source.rate}`,
      `--pitch=${source.pitch}`,
      "--text", line.text,
      "--write-media", outputPath,
    ]);
  }
  process.stdout.write(`Voice ${index + 1}/${source.lines.length}: ${line.id}\n`);
  entries.push({ id: line.id, text: line.text, src: `/audio/voice/zh-CN/xiaoxiao/${line.id}.mp3` });
}

writeFileSync(manifestPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  provider: "edge-tts Python package",
  voice: source.voice,
  rate: source.rate,
  pitch: source.pitch,
  format: "mp3",
  count: entries.length,
  failures: [],
  entries,
}, null, 2));

function hasAudio(path) {
  try { return statSync(path).size > 1024; } catch { return false; }
}

function run(command, values) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, values, { stdio: "inherit" });
    child.on("error", rejectPromise);
    child.on("exit", (code) => code === 0 ? resolvePromise() : rejectPromise(new Error(`voice generator exited with ${code}`)));
  });
}

function parseArgs(values) {
  const result = {};
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = values[i + 1];
    if (next && !next.startsWith("--")) { result[key] = next; i += 1; }
    else result[key] = true;
  }
  return result;
}
