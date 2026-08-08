import fs from "node:fs";
import process from "node:process";

const registryPath = new URL("../content/sources.json", import.meta.url);
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const concurrency = Math.max(1, Number(process.env.HISTORY_LINK_CONCURRENCY ?? 24));
const timeoutMs = Math.max(1000, Number(process.env.HISTORY_LINK_TIMEOUT_MS ?? 12000));

function classify(status) {
  if (status >= 200 && status < 400) return "reachable";
  if ([401, 403, 405, 406, 409, 412, 416, 418, 429, 451].includes(status)) return "gated";
  if ([404, 410].includes(status)) return "broken";
  if (status >= 500) return "server-error";
  return "other";
}

async function probe(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(source.url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HistoryContentLinkAudit/1.0)",
        Range: "bytes=0-2047",
        Accept: "text/html,application/pdf,image/*,*/*;q=0.8",
      },
    });
    await response.body?.cancel();
    return {
      id: source.id,
      url: source.url,
      finalUrl: response.url,
      status: response.status,
      result: classify(response.status),
    };
  } catch (error) {
    return {
      id: source.id,
      url: source.url,
      status: null,
      result: error?.name === "AbortError" ? "timeout" : "network-error",
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

const results = new Array(registry.sources.length);
let nextIndex = 0;

async function worker() {
  while (nextIndex < registry.sources.length) {
    const index = nextIndex;
    nextIndex += 1;
    results[index] = await probe(registry.sources[index]);
  }
}

await Promise.all(Array.from({ length: Math.min(concurrency, registry.sources.length) }, worker));

const counts = Object.fromEntries(
  [...new Set(results.map((item) => item.result))]
    .sort()
    .map((result) => [result, results.filter((item) => item.result === result).length]),
);

console.log(JSON.stringify({ checkedAt: new Date().toISOString(), total: results.length, counts }));
for (const item of results.filter((entry) => !["reachable", "gated"].includes(entry.result))) {
  console.log(JSON.stringify(item));
}
