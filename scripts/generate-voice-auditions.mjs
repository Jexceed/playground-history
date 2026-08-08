import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const config = JSON.parse(await readFile(join(root, "content", "voice-auditions.json"), "utf8"));
const outputDir = join(root, "public", "audio", "auditions");
const sourceDataDir = join(root, "content", "runtime");
const siblingPython = resolve(root, "..", "playground", "local-tts", ".venv", "bin", "python");
const python = process.env.HISTORY_EDGE_TTS_PYTHON || (existsSync(siblingPython) ? siblingPython : "python3");
const temporaryDir = await mkdtemp(join(tmpdir(), "history-voice-auditions-"));

await mkdir(outputDir, { recursive: true });
await mkdir(sourceDataDir, { recursive: true });

const profiles = [];
try {
  for (const profile of config.profiles) {
    const samples = [];
    for (const sample of config.samples) {
      const filename = `${profile.id}-${sample.id}.mp3`;
      const outputPath = join(outputDir, filename);
      const textPath = join(temporaryDir, `${profile.id}-${sample.id}.txt`);
      await writeFile(textPath, sample.text);
      await run(python, [
        "-m", "edge_tts",
        "--voice", profile.voice,
        `--rate=${profile.rate}`,
        `--pitch=${profile.pitch}`,
        "--file", textPath,
        "--write-media", outputPath,
      ]);
      const file = await stat(outputPath);
      if (file.size < 1024) throw new Error(`${filename} 生成失败：文件过小`);
      samples.push({
        id: sample.id,
        label: sample.label,
        chapter: sample.chapter,
        text: sample.text,
        src: `/audio/auditions/${encodeURIComponent(basename(outputPath))}`,
        bytes: file.size,
      });
      process.stdout.write(`生成试听：${profile.label} / ${sample.label}\n`);
    }
    profiles.push({ ...profile, samples });
  }
} finally {
  await rm(temporaryDir, { recursive: true, force: true });
}

const manifestText = JSON.stringify({
  generatedAt: new Date().toISOString(),
  provider: "edge-tts Python package",
  sourceWorkflow: "../playground/scripts/generate-edge-voices.mjs",
  version: config.version,
  purpose: config.purpose,
  profiles,
}, null, 2);
await writeFile(join(outputDir, "manifest.json"), manifestText);
await writeFile(join(sourceDataDir, "voice-auditions-manifest.json"), manifestText);

console.log(`语音试听生成完成：${profiles.length} 种方案，${profiles.flatMap((profile) => profile.samples).length} 个文件。`);

function run(command, args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", rejectRun);
    child.on("exit", (code) => {
      if (code === 0) resolveRun();
      else rejectRun(new Error(stderr.trim() || `${command} 退出码 ${code}`));
    });
  });
}
