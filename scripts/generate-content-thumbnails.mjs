import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "public/content/manifest.json"), "utf8"));
const outputRoot = path.join(root, "public/content/thumbnails");
const stepOutputRoot = path.join(root, "public/content/step-images");
fs.mkdirSync(outputRoot, { recursive: true });
fs.mkdirSync(stepOutputRoot, { recursive: true });

let generated = 0;
const generatedStepAssets = new Set();
for (const chapter of manifest.tracks.flatMap((track) => track.chapters)) {
  const detail = JSON.parse(fs.readFileSync(path.join(root, `public/content/chapters/${chapter.id}.json`), "utf8"));
  const imageAssets = detail.assets.filter((item) => item.localPath && /\.(?:jpe?g|png|tif)$/i.test(item.localPath));
  const stepImageAssets = detail.assets.filter((item) => item.localPath && /\.(?:jpe?g|png|tif|svg)$/i.test(item.localPath));
  const asset = imageAssets.find((item) => item.id === detail.childEntry?.preferredAssetId) ?? imageAssets[0];
  if (!asset) throw new Error(`${chapter.id} 没有可生成缩略图的本地素材`);
  const input = path.join(root, asset.localPath);
  const output = path.join(outputRoot, `${chapter.id}.jpg`);
  execFileSync("sips", ["-Z", "560", "-s", "format", "jpeg", "-s", "formatOptions", "82", input, "--out", output], {
    stdio: "ignore",
  });
  for (const step of [...detail.gameplay.steps, ...[...(detail.gameplay.evidence ?? []),...(detail.gameplay.narrativeAssets ?? []),...([detail.gameplay.coverAsset,detail.gameplay.sceneAsset].filter(Boolean))].map(a=>({assetId:a.id}))]) {
    if (step.assetId.startsWith("study-")) continue;
    if (generatedStepAssets.has(step.assetId)) continue;
    const stepAsset = stepImageAssets.find((item) => item.id === step.assetId);
    if (!stepAsset) throw new Error(`${chapter.id}/${step.id} 的步骤素材不存在或不是图片：${step.assetId}`);
    if (/\.svg$/i.test(stepAsset.localPath)) {
      fs.copyFileSync(path.join(root, stepAsset.localPath), path.join(stepOutputRoot, `${stepAsset.id}.svg`));
    } else {
      execFileSync("sips", ["-Z", "900", "-s", "format", "jpeg", "-s", "formatOptions", "84", path.join(root, stepAsset.localPath), "--out", path.join(stepOutputRoot, `${stepAsset.id}.jpg`)], {
        stdio: "ignore",
      });
    }
    generatedStepAssets.add(stepAsset.id);
  }
  generated += 1;
}

for (const fileName of fs.readdirSync(stepOutputRoot)) {
  const match = fileName.match(/^(.*)\.(?:jpg|svg)$/i);
  if (match && !generatedStepAssets.has(match[1])) fs.unlinkSync(path.join(stepOutputRoot, fileName));
}

console.log(`章节缩略图生成完成：${generated} 张；步骤图片 ${generatedStepAssets.size} 张。`);
