"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import contentManifestJson from "../content/runtime/content-manifest.json";
import voiceAuditionJson from "../content/runtime/voice-auditions-manifest.json";

type SourceRecord = {
  id: string;
  title: string;
  institution: string;
  url: string;
  factUse: string;
};

type AssetRecord = {
  id: string;
  title: string;
  sourcePage: string | null;
  license: string | null;
  clearance: string;
  caption: string;
  boundary: string;
};

type ChapterDetail = {
  id: string;
  trackId: string;
  trackLabel: string;
  period: { id: string; label: string; years: string };
  order: number;
  title: string;
  coreQuestion: string;
  throughline: string;
  age: string;
  durationMinutes: number;
  conclusion: string[];
  facts: Array<{ number: number; text: string; sourceIds: string[] }>;
  screens: Array<{
    number: number;
    title: string;
    screenText: string;
    voices: Array<{
      number: number;
      label: string;
      text: string;
      segments: Array<{ id: string; order: number; tier: "core" | "extension"; text: string; hanCharacters: number }>;
    }>;
    interactions: Array<{ number: number; title: string; items: string[] }>;
  }>;
  interactions: Array<{ number: number; title: string; items: string[] }>;
  sources: SourceRecord[];
  assets: AssetRecord[];
  thumbnail: string;
};

type ManifestChapter = {
  id: string;
  order: number;
  periodId: string;
  periodLabel: string;
  periodYears: string;
  title: string;
  coreQuestion: string;
  throughline: string;
  durationMinutes: number;
  screens: number;
  audioClips: number;
  audioSegments: number;
  coreAudioSegments: number;
  extensionAudioSegments: number;
  interactions: number;
  factCount: number;
  sourceCount: number;
  assetCount: number;
  thumbnail: string;
  detailUrl: string;
  reviewStatus: string;
};

type ManifestTrack = {
  id: string;
  order: number;
  label: string;
  range: string;
  periods: Array<{ id: string; label: string; years?: string; range?: string }>;
  chapters: ManifestChapter[];
};

type ContentManifest = {
  contentVersion: string;
  totals: {
    tracks: number;
    chapters: number;
    facts: number;
    screens: number;
    audioClips: number;
    audioSegments: number;
    coreAudioSegments: number;
    extensionAudioSegments: number;
    interactions: number;
    sources: number;
    assets: number;
  };
  tracks: ManifestTrack[];
};

type VoiceAuditionManifest = {
  purpose: string;
  profiles: Array<{
    id: string;
    label: string;
    description: string;
    voice: string;
    rate: string;
    pitch: string;
    samples: Array<{ id: string; label: string; chapter: string; text: string; src: string }>;
  }>;
};

type DetailTab = "child" | "conclusion" | "facts" | "sources" | "assets";

const contentManifest = contentManifestJson as ContentManifest;
const voiceAuditions = voiceAuditionJson as VoiceAuditionManifest;

function statusText(value: string) {
  if (value === "approved") return "已确认";
  if (value === "in-progress") return "审核中";
  return "待确认";
}

export function ContentOverview({ onBack }: { onBack: () => void }) {
  const [trackId, setTrackId] = useState(contentManifest.tracks[0].id);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ChapterDetail | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("child");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeTrack = contentManifest.tracks.find((track) => track.id === trackId) ?? contentManifest.tracks[0];
  const normalizedQuery = query.trim().toLowerCase();
  const visibleChapters = useMemo(() => activeTrack.chapters.filter((chapter) => {
    if (!normalizedQuery) return true;
    return `${chapter.title} ${chapter.coreQuestion} ${chapter.throughline} ${chapter.periodLabel}`.toLowerCase().includes(normalizedQuery);
  }), [activeTrack, normalizedQuery]);

  const openChapter = async (chapter: ManifestChapter) => {
    setSelectedId(chapter.id);
    setDetail(null);
    setError("");
    setLoading(true);
    setDetailTab("child");
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const response = await fetch(chapter.detailUrl);
      if (!response.ok) throw new Error(`读取失败：${response.status}`);
      setDetail(await response.json() as ChapterDetail);
    } catch {
      setError("这一章暂时没有打开，请返回后重试。");
    } finally {
      setLoading(false);
    }
  };

  const closeChapter = () => {
    setSelectedId(null);
    setDetail(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const moveChapter = (offset: number) => {
    if (!selectedId) return;
    const index = activeTrack.chapters.findIndex((chapter) => chapter.id === selectedId);
    const next = activeTrack.chapters[index + offset];
    if (next) void openChapter(next);
  };

  const selectTrack = (nextTrackId: string) => {
    setTrackId(nextTrackId);
    setSelectedId(null);
    setDetail(null);
    setQuery("");
  };

  if (selectedId) {
    return (
      <section className="review-detail pop-in" aria-live="polite">
        <div className="review-detail-topbar">
          <button onClick={closeChapter}>← 返回章节目录</button>
          <button onClick={onBack}>回到儿童游戏</button>
        </div>

        {loading && <div className="review-loading"><span />正在打开这一章……</div>}
        {error && <div className="review-error">{error}<button onClick={closeChapter}>返回目录</button></div>}

        {detail && (
          <>
            <header className="review-detail-hero">
              <div className="review-detail-image">
                <Image src={detail.thumbnail} alt={`${detail.title}的真实素材缩略图`} width={560} height={420} priority unoptimized />
                <span>本章真实素材</span>
              </div>
              <div>
                <p className="eyebrow">{detail.trackLabel} · {detail.period.label} · {detail.period.years}</p>
                <h1>{detail.title}</h1>
                <p className="review-question"><small>本章只回答一个问题</small>{detail.coreQuestion}</p>
                <p className="review-throughline">{detail.throughline}</p>
                <div className="review-detail-metrics">
                  <span>{detail.durationMinutes}分钟</span>
                  <span>{detail.screens.length}屏</span>
                  <span>{detail.screens.flatMap((screen) => screen.voices).length}段语音稿</span>
                  <span>{detail.screens.flatMap((screen) => screen.voices.flatMap((voice) => voice.segments.filter((segment) => segment.tier === "core"))).length}段主线音频</span>
                  <span>{detail.screens.flatMap((screen) => screen.voices.flatMap((voice) => voice.segments.filter((segment) => segment.tier === "extension"))).length}段“想听更多”</span>
                  <span>{detail.interactions.length}个互动</span>
                </div>
                <p className="review-state"><b>内容状态</b> 事实研究完成，儿童稿和语音稿待最终确认</p>
              </div>
            </header>

            <nav className="review-tabs" aria-label="章节审核内容">
              {([
                ["child", "儿童页面与语音"],
                ["conclusion", "脉络与结论"],
                ["facts", `事实卡 ${detail.facts.length}`],
                ["sources", `来源 ${detail.sources.length}`],
                ["assets", `素材 ${detail.assets.length}`],
              ] as Array<[DetailTab, string]>).map(([id, label]) => (
                <button key={id} className={detailTab === id ? "active" : ""} onClick={() => setDetailTab(id)}>{label}</button>
              ))}
            </nav>

            {detailTab === "child" && (
              <div className="review-screens">
                {detail.screens.map((screen) => (
                  <article key={screen.number}>
                    <header><span>{String(screen.number).padStart(2, "0")}</span><div><small>{screen.number === 1 ? "先看时间线" : "儿童页面"}</small><h2>{screen.title}</h2></div></header>
                    <p className="review-screen-copy">{screen.screenText}</p>
                    {screen.voices.map((voice) => (
                      <div className="review-voice-script" key={voice.number}>
                        <strong>●)) 语音{voice.number}</strong>
                        <p>{voice.text}</p>
                        {voice.segments.length > 1 && (
                          <div className="review-voice-segments">
                            <small>低龄播放拆成 {voice.segments.length} 段，每段不超过90个汉字：</small>
                            {voice.segments.map((segment) => <span key={segment.id}><b>{segment.order}</b><i>{segment.tier === "core" ? "主线" : "想听更多"}</i>{segment.text}</span>)}
                          </div>
                        )}
                      </div>
                    ))}
                    {screen.interactions.map((interaction) => (
                      <div className="review-interaction" key={interaction.number}>
                        <strong>互动{interaction.number} · {interaction.title}</strong>
                        {interaction.items.length > 0 && <ul>{interaction.items.map((item) => <li key={item}>{item}</li>)}</ul>}
                      </div>
                    ))}
                  </article>
                ))}
              </div>
            )}

            {detailTab === "conclusion" && (
              <div className="review-reading-card">
                <p className="eyebrow">前后逻辑</p>
                <h2>这一章怎样接进完整历史</h2>
                <p className="review-reading-lead">{detail.throughline}</p>
                <div className="review-conclusion-list">{detail.conclusion.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
                <div className="review-check-note"><b>确认时请检查：</b>第一屏是否先定位时间？原因、经过和影响是否连续？孩子听完能不能复述“什么时候、发生了什么、我们凭什么知道”？</div>
              </div>
            )}

            {detailTab === "facts" && (
              <div className="review-facts">
                {detail.facts.map((fact) => (
                  <article key={fact.number}>
                    <span>{fact.number}</span>
                    <p>{fact.text}</p>
                    <div>{fact.sourceIds.map((sourceId) => {
                      const source = detail.sources.find((item) => item.id === sourceId);
                      return source ? <a key={sourceId} href={source.url} target="_blank" rel="noreferrer">{sourceId}</a> : <i key={sourceId}>{sourceId}</i>;
                    })}</div>
                  </article>
                ))}
              </div>
            )}

            {detailTab === "sources" && (
              <div className="review-sources">
                {detail.sources.map((source) => (
                  <article key={source.id}>
                    <small>{source.id}</small>
                    <h2>{source.title}</h2>
                    <p className="source-institution">{source.institution}</p>
                    <p>{source.factUse}</p>
                    <a href={source.url} target="_blank" rel="noreferrer">打开原始资料 ↗</a>
                  </article>
                ))}
              </div>
            )}

            {detailTab === "assets" && (
              <div className="review-assets">
                {detail.assets.map((asset) => (
                  <article key={asset.id}>
                    <span>{asset.clearance.startsWith("cleared-") ? "已核许可" : "仅供参考"}</span>
                    <h2>{asset.title}</h2>
                    {asset.caption && <p>{asset.caption}</p>}
                    {asset.boundary && <small>{asset.boundary}</small>}
                    <div>{asset.license && <b>{asset.license}</b>}{asset.sourcePage && <a href={asset.sourcePage} target="_blank" rel="noreferrer">查看素材来源 ↗</a>}</div>
                  </article>
                ))}
              </div>
            )}

            <div className="review-detail-nav">
              <button disabled={activeTrack.chapters[0].id === selectedId} onClick={() => moveChapter(-1)}>← 上一章</button>
              <button onClick={closeChapter}>回到目录</button>
              <button disabled={activeTrack.chapters.at(-1)?.id === selectedId} onClick={() => moveChapter(1)}>下一章 →</button>
            </div>
          </>
        )}
      </section>
    );
  }

  return (
    <section className="content-overview pop-in">
      <div className="overview-topbar">
        <button onClick={onBack}>← 回到儿童游戏</button>
        <span>家长与编辑查看</span>
      </div>

      <header className="overview-hero">
        <div>
          <p className="eyebrow">完整内容地图 · 当前为审核稿</p>
          <h1>七条时间线，<br />九十一章历史故事</h1>
          <p>中国史是主体脉络，世界史保持自己的完整时间线；每一章都先定位时间，再用真实资料讲清前后逻辑。</p>
        </div>
        <div className="overview-summary">
          <strong>{contentManifest.totals.chapters}</strong><span>章内容</span>
          <div><b>{contentManifest.totals.facts}</b><small>条事实卡</small></div>
          <div><b>{contentManifest.totals.audioClips}</b><small>段语音稿</small></div>
          <div><b>{contentManifest.totals.audioSegments}</b><small>段短音频</small></div>
          <div><b>{contentManifest.totals.assets}</b><small>项素材</small></div>
        </div>
      </header>

      <section className="voice-auditions" aria-labelledby="voice-audition-title">
        <header>
          <div><p className="eyebrow">本地语音小样 · 请先定音</p><h2 id="voice-audition-title">同三段内容，两种讲述感觉</h2></div>
          <p>{voiceAuditions.purpose}试听文件已经生成到本地，孩子不需要登录，也不需要实时调用语音服务。</p>
        </header>
        <div className="voice-audition-grid">
          {voiceAuditions.profiles.map((profile) => (
            <article key={profile.id}>
              <div className="voice-profile-heading"><span>{profile.label.slice(0, 1)}</span><div><h3>{profile.label}</h3><p>{profile.description}</p></div></div>
              {profile.samples.map((sample) => (
                <div className="voice-sample" key={sample.id}>
                  <div><strong>{sample.label}</strong><small>{sample.chapter}</small></div>
                  <audio controls preload="none" src={sample.src}>您的浏览器暂不支持音频播放。</audio>
                  <details><summary>查看朗读文字</summary><p>{sample.text}</p></details>
                </div>
              ))}
            </article>
          ))}
        </div>
        <p className="voice-audition-note">两种方案都来自您在 playground 中使用的预生成本地音频流程。确定音色、语速和停顿后，将653段主线音频与{contentManifest.totals.extensionAudioSegments}段“想听更多”音频分别生成；孩子不必连续听完整篇讲稿。</p>
      </section>

      <div className="overview-note"><b>怎么查看：</b>先选择一条历史线，再打开一章。儿童页面保持大字和语音；事实、来源与素材许可放在家长展开层。</div>

      <nav className="track-tabs" aria-label="七个历史内容板块">
        {contentManifest.tracks.map((track) => (
          <button key={track.id} className={track.id === trackId ? "active" : ""} onClick={() => selectTrack(track.id)}>
            <span>0{track.order}</span><strong>{track.label}</strong><small>{track.chapters.length}章</small>
          </button>
        ))}
      </nav>

      <section className="track-heading">
        <div><p className="eyebrow">{activeTrack.label}</p><h2>{activeTrack.range}</h2></div>
        <label><span>搜索本板块</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入人物、事件或问题" /></label>
      </section>

      <div className="period-ribbon" aria-label={`${activeTrack.label}时期`}>
        {activeTrack.periods.map((period) => <span key={period.id}><b>{period.label}</b><small>{period.years ?? period.range}</small></span>)}
      </div>

      <div className="chapter-review-grid">
        {visibleChapters.map((chapter) => (
          <article key={chapter.id}>
            <div className="chapter-review-image"><Image src={chapter.thumbnail} alt="" width={560} height={360} unoptimized /><span>{chapter.periodLabel}</span></div>
            <div className="chapter-review-body">
              <div className="chapter-review-meta"><small>第{chapter.order}章 · {chapter.periodYears}</small><i>{statusText(chapter.reviewStatus)}</i></div>
              <h3>{chapter.title}</h3>
              <p className="chapter-review-question">{chapter.coreQuestion}</p>
              <p className="chapter-review-line">{chapter.throughline}</p>
              <div className="chapter-review-counts"><span>{chapter.screens}屏</span><span>{chapter.coreAudioSegments}主线音频</span><span>{chapter.extensionAudioSegments}加深音频</span><span>{chapter.factCount}事实</span><span>{chapter.assetCount}素材</span></div>
              <button onClick={() => void openChapter(chapter)}>查看本章内容 →</button>
            </div>
          </article>
        ))}
      </div>

      {visibleChapters.length === 0 && <div className="overview-empty">没有找到相关章节，换一个词试试。</div>}
    </section>
  );
}
