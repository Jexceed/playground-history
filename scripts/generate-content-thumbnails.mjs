import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "public/content/manifest.json"), "utf8"));
const outputRoot = path.join(root, "public/content/thumbnails");
fs.mkdirSync(outputRoot, { recursive: true });

let generated = 0;
for (const chapter of manifest.tracks.flatMap((track) => track.chapters)) {
  const detail = JSON.parse(fs.readFileSync(path.join(root, `public/content/chapters/${chapter.id}.json`), "utf8"));
  const asset = detail.assets.find((item) => item.localPath && /\.(?:jpe?g|png|tif)$/i.test(item.localPath));
  if (!asset) throw new Error(`${chapter.id} 没有可生成缩略图的本地素材`);
  const input = path.join(root, asset.localPath);
  const output = path.join(outputRoot, `${chapter.id}.jpg`);
  execFileSync("sips", ["-Z", "560", "-s", "format", "jpeg", "-s", "formatOptions", "82", input, "--out", output], {
    stdio: "ignore",
  });
  generated += 1;
}

console.log(`章节缩略图生成完成：${generated} 张。`);
