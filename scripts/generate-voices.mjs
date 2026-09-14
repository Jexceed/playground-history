import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const source = JSON.parse(readFileSync("public/audio/voice-lines.json", "utf8"));
const python = resolve(args.python ?? "../playground/local-tts/.venv/bin/python");
const outputDir = join("public", "audio", "voice", "zh-CN", "xiaoxiao");
const manifestPath = join("public", "audio", "voice", "manifest.json");
const stagingDir = join("public", "audio", "voice", `.generation-${process.pid}`);
const stagedFiles = [];
const concurrency = Math.max(1, Math.min(16, Number(args.concurrency ?? 8)));

const previousManifest = readJson(manifestPath);
const previousEntryById = new Map((previousManifest?.entries ?? []).map((entry) => [entry.id, entry]));
const profileChanged = !previousManifest
  || previousManifest.voice !== source.voice
  || previousManifest.rate !== source.rate
  || previousManifest.pitch !== source.pitch;

mkdirSync(outputDir, { recursive: true });
mkdirSync(stagingDir, { recursive: true });

try {
  const jobs = [];
  for (const line of source.lines) {
    const outputPath = join(outputDir, `${line.id}.mp3`);
    const previousEntry = previousEntryById.get(line.id);
    const textChanged = !previousEntry || previousEntry.text !== line.text
      || (previousEntry.synthesisText ?? previousEntry.text) !== (line.synthesisText ?? line.text);
    if (!hasAudio(outputPath) || args.force || profileChanged || textChanged) {
      const stagedPath = join(stagingDir, `${line.id}.mp3`);
      jobs.push({ line, stagedPath, outputPath });
    }
  }

  process.stdout.write(`需要生成 ${jobs.length}/${source.lines.length} 段语音，并发数 ${concurrency}。\n`);
  let completed = 0;
  for (let index = 0; index < jobs.length; index += concurrency) {
    const batch = jobs.slice(index, index + concurrency);
    const results = await Promise.allSettled(batch.map(async ({ line, stagedPath, outputPath }) => {
      await generateWithRetry(python, source, line, stagedPath, 3);
      if (!hasAudio(stagedPath)) throw new Error(`voice generator produced an empty file for ${line.id}`);
      stagedFiles.push({ stagedPath, outputPath });
      completed += 1;
      if (completed === jobs.length || completed % 25 === 0) process.stdout.write(`已生成 ${completed}/${jobs.length} 段。\n`);
    }));
    const failed = results.find((result) => result.status === "rejected");
    if (failed?.status === "rejected") throw failed.reason;
  }

  for (const { stagedPath, outputPath } of stagedFiles) renameSync(stagedPath, outputPath);

  const entries = source.lines.map((line) => ({ id: line.id, text: line.text, ...(line.synthesisText ? { synthesisText: line.synthesisText } : {}), src: `/audio/voice/zh-CN/xiaoxiao/${line.id}.mp3` }));
  const activeFiles = new Set(entries.map((entry) => `${entry.id}.mp3`));
  for (const fileName of readdirSync(outputDir)) {
    if (fileName.endsWith(".mp3") && !activeFiles.has(fileName)) unlinkSync(join(outputDir, fileName));
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
} finally {
  rmSync(stagingDir, { recursive: true, force: true });
}

function hasAudio(path) {
  try { return statSync(path).size > 1024; } catch { return false; }
}

function readJson(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); } catch { return null; }
}

function run(command, values) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, values, { stdio: "inherit" });
    // A stalled provider connection must enter the existing retry path instead of blocking a whole batch.
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; child.kill("SIGTERM"); }, 45000);
    child.on("error", (error) => { clearTimeout(timeout); rejectPromise(error); });
    child.on("exit", (code) => {
      clearTimeout(timeout);
      if (code === 0 && !timedOut) resolvePromise();
      else rejectPromise(new Error(timedOut ? "voice generator timed out after 45 seconds" : `voice generator exited with ${code}`));
    });
  });
}

async function generateWithRetry(command, profile, line, stagedPath, attempts) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await run(command, [
        "-m", "edge_tts",
        "--voice", profile.voice,
        `--rate=${profile.rate}`,
        `--pitch=${profile.pitch}`,
        "--text", line.synthesisText ?? line.text,
        "--write-media", stagedPath,
      ]);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolvePromise) => setTimeout(resolvePromise, attempt * 700));
    }
  }
  throw new Error(`语音 ${line.id} 连续生成失败：${lastError?.message ?? lastError}`);
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
