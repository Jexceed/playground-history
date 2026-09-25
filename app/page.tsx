"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { ObjectWorkbench, WorkbenchCover, WorkbenchFamily, stepVoiceIds, type WorkbenchPresentation, type WorkbenchInteraction, type ObjectView, type StoryScene } from "./ObjectWorkbench";
import "./workbench.css";
import { ContentOverview } from "./ContentOverview";
import { FinishNavigation } from "./FinishNavigation";
import { canContinueStep } from "./step-flow";
import { PhotoCrop } from "./PhotoCrop";
import { PhotoAlbumButton } from "./PhotoAlbumButton";
import { focusAlbumPhoto, type FocusedImage, type PhotoAlbum } from "./photo-album";
import "./photo-album.css";
import { playVoiceSequence, stopVoice, pauseVoice, resumeVoice, subscribeVoice, getVoiceSnapshot, getServerVoiceSnapshot } from "./speech";
import { emptyProgress, parseProgress, listenOptions, PROGRESS_STORAGE_KEY, LEGACY_COMPLETED_KEY, type LocalProgress } from "./quest-progress";
import { useModal } from "./use-modal";
import contentManifestJson from "../content/runtime/preview-manifest.json";

import progressIndex from "../content/runtime/progress-index.json";

type ChildEntry = {
  childTitle: string;
  prompt: string;
  takeaway: string;
  object: string;
  people: string[];
  place: string;
  culture: string | null;
  care: string;
};

type TextbookConnection = {
  featured: {
    type: string;
    icon: string;
    title: string;
    childBridge: string;
    evidenceBoundary: string;
  };
  companions: Array<{ type: string; label: string; note: string }>;
};

type GlossaryEntry = {
  term: string;
  icon: string;
  plain: string;
};

type ChildStoryStep = {
  id: string;
  icon: string;
  label: string;
  text: string;
};

type GameOption = {
  objectView?: ObjectView;
  image?: string;
  imageAlt?: string;
  id: string;
  label: string;
  correct: boolean;
  audio: VoiceLine;
};

type VoiceLine = { id: string; text: string };

type GameStep = {
  inspection?: { id:string; title:string; image:string; caption:string; boundary:string; label:string; audio:VoiceLine; sourceLinks?:Array<{title:string;url:string}>;placement?:"main"|"supporting";framing?:"landscape"|"panorama"|"object";openAlbum?:boolean;displayHeight?:number } | null;
  concepts?:Array<{term:string;meaning:string}>|null;
  narrative?: StoryScene | null;
  interaction?: WorkbenchInteraction;
  id: string;
  icon: string;
  phase: string;
  title: string;
  prompt: string;
  rightNote: string;
  wrongNote: string;
  story: {
    title: string;
    screenText: string;
    displayText: string;
    narration: string;
  };
  studyImage: string;
  studyImageAlt: string;
  assetId: string;
  image: string;
  imageAlt: string;
  imageCaption: string;
  imageBoundary: string;
  audio: {
    lead?: VoiceLine | null;
    transition: VoiceLine;
    intro: VoiceLine;
    image: VoiceLine;
    question: VoiceLine;
    right: VoiceLine;
    wrong: VoiceLine;
  };
  options: GameOption[];
};

type ExtensionTask = {
  number: number;
  title: string;
  items: string[];
};

type Gameplay = {
  presentation: WorkbenchPresentation | null;
  photoAlbum?: PhotoAlbum | null;
  mode: "authored-picture-quest-v4";
  cta: string;
  anchor: string;
  boundary: string;
  coverImage: string;
  coverImageAlt: string;
  coverImageKind: string;
  evidence: Array<{id:string; title:string; image:string; caption:string; boundary:string; sourcePage:string|null}>;
  finish: {title:string; actions:string[]; parent:string; actionAudio:VoiceLine[]; introAudio:VoiceLine; sceneStepIndexes?:number[]};
  status: "playable-core";
  audioStatus: string;
  hook: {
    kind: string;
    icon: string;
    label: string;
    question: string;
  };
  coverAudio: VoiceLine;
  textbookAudio: VoiceLine | null;
  finishAudio: VoiceLine;
  estimatedMinutes: number;
  badge: { icon: string; label: string };
  steps: GameStep[];
  extensionTasks: ExtensionTask[];
};

type ManifestChapter = {
  id: string;
  periodId: string;
  periodLabel: string;
  periodYears: string;
  title: string;
  coreQuestion: string;
  thumbnail: string;
  childEntry: ChildEntry;
  textbookConnection: TextbookConnection | null;
  childStory: ChildStoryStep[];
  glossary: GlossaryEntry[];
  gameplay: Gameplay;
};

type ManifestTrack = {
  periods:Array<{id:string;years?:string;stationYears?:string}>;
  id: string;
  label: string;
  range: string;
  chapters: ManifestChapter[];
};

const contentManifest = contentManifestJson as unknown as {
  contentVersion: string;
  tracks: ManifestTrack[];
  totals: { chapters: number };
};

// 每一站对应内容包里的一段时期；顺序与 content/timeline.json、product-map.json 一致。
type Station = {
  id: string;
  periodId: string;
  years: string;
  title: string;
  childLine: string;
  iconSrc: string;
};

const allStations: Station[] = [
  { id: "early", periodId: "ancient-origins", years: "约200万年前—约前21世纪", title: "远古时期", childLine: "从一堆火和一只彩陶盆出发", iconSrc: "/images/history-stations/early.webp" },
  { id: "states", periodId: "xia-shang-western-zhou", years: "约前21世纪—前771年", title: "夏商西周", childLine: "看看大鼎和龟甲会说什么", iconSrc: "/images/history-stations/states.webp" },
  { id: "change", periodId: "spring-autumn-warring-states", years: "前770年—前221年", title: "春秋战国", childLine: "跟着竹简和水渠寻找新办法", iconSrc: "/images/history-stations/change.webp" },
  { id: "qin", periodId: "qin", years: "前221年—前207年", title: "秦朝", childLine: "拿同一把尺，再看长城怎样守卫边地", iconSrc: "/images/history-stations/united.webp" },
  { id: "han", periodId: "han", years: "前202年—220年", title: "汉朝", childLine: "沿驿路走丝路，再看纸怎样把话带远", iconSrc: "/images/history-stations/han.webp" },
  { id: "meeting", periodId: "three-kingdoms-jin-northern-southern", years: "220年—589年", title: "三国两晋南北朝", childLine: "看江南新邻居，听改革、数学和壁画的故事", iconSrc: "/images/history-stations/meeting.webp" },
  { id: "sui", periodId: "sui", years: "581年—618年", title: "隋朝", childLine: "跟着粮船走运河，看南北怎样连起来", iconSrc: "/images/history-stations/sui.webp" },
  { id: "tang", periodId: "tang", years: "618年—907年", title: "唐朝", childLine: "从贞观之治走到长安小骆驼和月亮", iconSrc: "/images/history-stations/tang.webp" },
  { id: "five-dynasties", periodId: "five-dynasties-ten-kingdoms", years: "907年—960年", title: "五代十国", childLine: "从钱镠铁券，走到吴越的水与田", iconSrc: "/images/history-stations/five-dynasties.webp" },
  { id: "song", periodId: "song", years: "916年—1279年 · 宋960年起", title: "宋朝与辽·西夏·金", childLine: "看并立的政权、长卷、技术与月亮", iconSrc: "/images/history-stations/cities.webp" },
  { id: "yuan", periodId: "yuan", years: "1271年—1368年", title: "元朝", childLine: "看地方怎样办事，跟驿马把消息送远", iconSrc: "/images/history-stations/yuan.webp" },
  { id: "ming", periodId: "ming", years: "1368年—1644年", title: "明朝", childLine: "大船、故宫、书坊和游记排成一队", iconSrc: "/images/history-stations/later.webp" },
  { id: "qing", periodId: "qing", years: "1644年—1840年前", title: "清朝", childLine: "到承德会见，再去广州看世界变化", iconSrc: "/images/history-stations/qing.webp" },
  { id: "lateqing", periodId: "late-qing-crisis-and-response", years: "1840—1911年", title: "晚清的危机与救亡", childLine: "一艘轮船送来一封紧急信", iconSrc: "/images/history-stations/lateqing.webp" },
  { id: "republic", periodId: "revolution-and-republic", years: "1894—1916年", title: "辛亥革命与中华民国", childLine: "翻开日历，看皇帝时代结束", iconSrc: "/images/history-stations/republic.webp" },
  { id: "modernlife", periodId: "modern-social-change", years: "19世纪中期—20世纪中期", title: "近代生活变化", childLine: "火车、相机和报纸来到身边", iconSrc: "/images/history-stations/modernlife.webp" },
  { id: "newroad", periodId: "cpc-and-new-democratic-revolution", years: "1919—1936年", title: "革命新道路", childLine: "红船、书本和星光指向新路", iconSrc: "/images/history-stations/newroad.webp" },
  { id: "resistance", periodId: "war-of-resistance", years: "1931—1945年", title: "抗日战争", childLine: "从搬家的课堂和一封家书讲起", iconSrc: "/images/history-stations/resistance.webp" },
  { id: "liberation", periodId: "peoples-liberation-war", years: "1945—1949年", title: "人民解放战争", childLine: "一条渡船驶向亮起来的城门", iconSrc: "/images/history-stations/liberation.webp" },
  { id: "founding", periodId: "founding-and-transition", years: "1949—1956年", title: "新中国成立", childLine: "第一面五星红旗在这里升起", iconSrc: "/images/history-stations/founding.webp" },
  { id: "exploration", periodId: "socialist-exploration", years: "1956—1978年", title: "建设道路的探索", childLine: "原油列车和蓝图一起出发", iconSrc: "/images/history-stations/exploration.webp" },
  { id: "reform", periodId: "reform-and-opening", years: "1978—2012年", title: "改革开放", childLine: "推开门，火车和新生活来了", iconSrc: "/images/history-stations/reform.webp" },
  { id: "newera", periodId: "new-era", years: "2012年至今", title: "新时代", childLine: "高铁穿过青山，卫星飞上天空", iconSrc: "/images/history-stations/newera.webp" },
];

const periodLabels=new Map(contentManifest.tracks.flatMap(t=>t.periods.map(p=>[p.id,p] as const)));
const stations = allStations.filter(station => contentManifest.tracks.some(track=>track.chapters.some(chapter=>chapter.periodId===station.periodId))).map(station=>({...station,years:periodLabels.get(station.periodId)?.stationYears??station.years}));
const allProgressChapters = new Map(progressIndex.map(chapter => [chapter.id, chapter]));

const questStepBadgeById: Record<GameStep["id"], { src: string; alt: string; fallback: string }> = {
  time: { src: "/images/quest-steps/time.webp", alt: "沿着时间河找到年代的旅行徽章", fallback: "🕰️" },
  beginning: { src: "/images/quest-steps/beginning.webp", alt: "用放大镜找到第一条线索的旅行徽章", fallback: "🔎" },
  journey: { src: "/images/quest-steps/journey.webp", alt: "小船沿路线继续旅行的旅行徽章", fallback: "⛵" },
  change: { src: "/images/quest-steps/change.webp", alt: "地图上亮起变化星星的旅行徽章", fallback: "⭐" },
  takeaway: { src: "/images/quest-steps/takeaway.webp", alt: "小小历史旅行员完成地图的旅行徽章", fallback: "🏅" },
};

function QuestStepBadge({ stepId, labelled = false }: { stepId: GameStep["id"]; labelled?: boolean }) {
  const badge = questStepBadgeById[stepId];
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <span className="quest-step-badge-art" role={labelled ? "img" : undefined} aria-label={labelled ? badge.alt : undefined} aria-hidden={labelled ? undefined : true}>
      {imageFailed ? (
        <span className="quest-step-badge-fallback">{badge.fallback}</span>
      ) : (
        <Image unoptimized
          src={badge.src}
          alt=""
          fill
          sizes="82px"
          onError={() => setImageFailed(true)}
        />
      )}
    </span>
  );
}

const chaptersByPeriod = new Map<string, ManifestChapter[]>();
const chaptersById = new Map<string, ManifestChapter>();
for (const track of contentManifest.tracks) {
  for (const chapter of track.chapters) {
    chaptersById.set(chapter.id, chapter);
    const list = chaptersByPeriod.get(chapter.periodId) ?? [];
    list.push(chapter);
    chaptersByPeriod.set(chapter.periodId, list);
  }
}

type PanelData = {
  kicker: string;
  iconSrc: string;
  title: string;
  years: string;
  line: string;
  chapters: ManifestChapter[];
};

function PauseButton() {
  const voice = useSyncExternalStore(subscribeVoice, getVoiceSnapshot, getServerVoiceSnapshot);
  const paused = voice.status === "paused";
  const available = ["playing", "loading", "paused"].includes(voice.status);
  return <button className="voice-pause" disabled={!available} onClick={() => paused ? resumeVoice() : pauseVoice()} aria-label={paused ? "继续播放声音" : "暂停声音"}>
    <span aria-hidden="true">{paused ? "▶" : "⏸"}</span><span>{paused ? "继续听" : "暂停"}</span>
  </button>;
}

function QuestQuestion({ step, seed, speak, listen, onSolved }: {
  step: GameStep; seed: string; speak: (ids: string[]) => Promise<unknown>;
  listen: (ids: string[]) => void; onSolved: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const voice = useSyncExternalStore(subscribeVoice, getVoiceSnapshot, getServerVoiceSnapshot);
  const options = listenOptions(step.options, seed);
  const cues = ["choice-circle", "choice-square"];
  const submit = () => {
    if (solved) return;
    if (!picked) { listen(["choice-first"]); return; }
    const choice = options.find((option) => option.id === picked);
    if (choice?.correct) {
      setSolved(true); setWrong(null); onSolved();
      void speak([step.audio.right.id]);
    } else {
      setWrong(picked);
      void speak([step.audio.wrong.id]);
    }
  };
  return <div className="choice-question quest-question" data-right-voice-id={step.audio.right.id} data-wrong-voice-id={step.audio.wrong.id}>
    <div className="choice-toolbar">
      <button className="listen-options" disabled={solved} onClick={() => listen(options.flatMap((option, i) => [cues[i], option.audio.id]))}>🔊 两张都听</button>
      <button className="choice-help" onClick={() => listen(["choice-help"])} aria-label="听一听怎样选择">❔ 怎么选</button>
    </div>
    <div className="choice-stack listen-cards" role="group" aria-label={step.prompt}>
      {options.map((option, index) => {
        const state = solved && option.correct ? "right" : wrong === option.id ? "wrong" : picked === option.id ? "picked" : "";
        const sounding = ["loading", "playing", "paused"].includes(voice.status) && [option.audio.id, cues[index]].includes(voice.id ?? "");
        return <button key={option.id} className={`listen-card ${state} ${sounding ? "sounding" : ""}`} data-option-id={option.id} data-voice-id={option.audio.id}
          disabled={solved} aria-pressed={picked === option.id} aria-label={`${index === 0 ? "圆圈" : "方块"}卡，${option.label}`}
          onClick={() => { setPicked(option.id); setWrong(null); listen([cues[index], option.audio.id]); }}>
          <span className="choice-card-heading"><span className={`choice-shape ${index === 0 ? "circle" : "square"}`} aria-hidden="true" /><small>{state === "right" ? "找到了" : sounding ? voice.status === "paused" ? "暂停了" : "正在听" : state === "wrong" ? "再看看" : picked === option.id ? "选中了" : "点我听"}</small><span aria-hidden="true">{state === "right" ? "✓" : "🔊"}</span></span>
          {option.image && <Image className="choice-picture" src={option.image} alt={option.imageAlt ?? ""} width={420} height={242} unoptimized />}
          <span className="choice-option-text">{option.label}</span>
        </button>;
      })}
    </div>
    {!solved && <button className="submit-choice" aria-disabled={!picked} onClick={submit}>✋ 选好啦！</button>}
    {(solved || wrong) && <p className="choice-feedback" role="status" data-feedback={solved ? "right" : "wrong"}>{solved ? `✓ ${step.rightNote}` : step.wrongNote}</p>}
  </div>;
}

export default function Home() {
  const [screen, setScreen] = useState<"river" | "quest" | "overview">("river");
  const [voiceOn, setVoiceOn] = useState(true);
  const voice = useSyncExternalStore(subscribeVoice, getVoiceSnapshot, getServerVoiceSnapshot);
  const playing = voice.status === "playing" || voice.status === "loading";
  const [panel, setPanel] = useState<PanelData | null>(null);
  const [questChapter, setQuestChapter] = useState<ManifestChapter | null>(null);
  const [questStarted, setQuestStarted] = useState(false);
  const [questStep, setQuestStep] = useState(0);
  const [questSolved, setQuestSolved] = useState(false);
  const workbenchNarrationRef = useRef<{key:string;ids:string[]}|null>(null);
  const [progress, setProgress] = useState<LocalProgress>(emptyProgress);
  const progressRef = useRef(progress);
  const completedChapterIds = new Set(progress.completed);
  const [completedExtensionIds, setCompletedExtensionIds] = useState<Set<string>>(new Set());
  const [focusedImage, setFocusedImage] = useState<FocusedImage | null>(null);
  const [savedCoverStep, setSavedCoverStep] = useState<string | null>(null);
  const [finishRevealed, setFinishRevealed] = useState(false);
  const [storageNotice, setStorageNotice] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const voiceNotice = voice.status === "blocked" ? "点一下喇叭，就能继续听。" : voice.status === "error" ? "这段声音没准备好，点喇叭再试一次。" : "";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const loaded = parseProgress(window.localStorage.getItem(PROGRESS_STORAGE_KEY), window.localStorage.getItem(LEGACY_COMPLETED_KEY), allProgressChapters, contentManifest.contentVersion);
        progressRef.current = loaded;
        setProgress(loaded);
      } catch { setStorageNotice("浏览器暂时不能保存，仍可以继续试玩。"); }
    });
    return () => { window.cancelAnimationFrame(frame); stopVoice(); };
  }, []);

  const saveProgress = (next: LocalProgress) => {
    progressRef.current = next;
    setProgress(next);
    try { window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next)); setStorageNotice(""); }
    catch { setStorageNotice("这次还能继续玩，但浏览器没有保存进度。"); }
  };
  const saveCurrent = (chapter: ManifestChapter, step: number) => saveProgress({
    ...progressRef.current,
    current: { chapterId: chapter.id, stepId: chapter.gameplay.steps[step].id, contentVersion: contentManifest.contentVersion },
  });
  const clearProgress = () => {
    try {
      window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_COMPLETED_KEY);
      progressRef.current = emptyProgress(); setProgress(progressRef.current);
      setConfirmClear(false); setStorageNotice("本机记录已清空。");
    } catch { setStorageNotice("浏览器未能清空记录，请稍后再试。"); }
  };
  const speakSequence = (ids: string[], force = false) => {
    if (!voiceOn && !force) return Promise.resolve("muted");
    return playVoiceSequence(ids);
  };
  const listenSequence = (ids: string[]) => { setVoiceOn(true); void speakSequence(ids, true); };
  const listen = (id: string) => listenSequence([id]);
  const haltVoice = () => stopVoice();
  const openImage = (image: FocusedImage) => { setFocusedImage(image); void speakSequence([image.voice.id]); };
  const openPhotoAlbum = (album: PhotoAlbum, index = 0) => openImage(focusAlbumPhoto(album, index));
  const closeImage = () => { haltVoice(); setFocusedImage(null); };
  const closePanel = () => { haltVoice(); setPanel(null); };
  const imageDialogRef = useModal(Boolean(focusedImage), closeImage);
  const stationDialogRef = useModal(Boolean(panel), closePanel);
  const goHome = () => {
    haltVoice(); setFocusedImage(null); setQuestChapter(null); setPanel(null); setScreen("river");
    window.scrollTo({ top: 0 });
  };
  const openOverview = () => {
    haltVoice(); setFocusedImage(null); setQuestChapter(null); setPanel(null); setScreen("overview");
    setConfirmClear(false); window.scrollTo({ top: 0 });
  };

  const openStation = (station: Station, index: number) => {
    haltVoice();
    const welcome=(chaptersByPeriod.get(station.periodId)??[]).find(c=>c.gameplay.presentation?.story)?.gameplay.presentation?.story;
    if(welcome)void speakSequence([welcome.stationAudio.id]);
    setPanel({
      kicker: `第${index + 1}站 · 中华文明时间河`,
      iconSrc: station.iconSrc,
      title: station.title,
      years: station.years,
      line: station.childLine,
      chapters: chaptersByPeriod.get(station.periodId) ?? [],
    });
  };

  const openQuest = (chapter: ManifestChapter, restart = false) => {
    workbenchNarrationRef.current=null;
    haltVoice(); setFocusedImage(null); setPanel(null); setQuestChapter(chapter);
    setQuestStarted(false); setQuestStep(0); setQuestSolved(false); setFinishRevealed(false);
    setCompletedExtensionIds(new Set());
    const saved = !restart && progressRef.current.current?.chapterId === chapter.id ? progressRef.current.current.stepId : null;
    setSavedCoverStep(saved); setScreen("quest"); window.scrollTo({ top: 0 });
    void speakSequence([chapter.gameplay.coverAudio.id, saved ? "resume-hint" : null].filter((id): id is string => Boolean(id)));
  };
  const startQuest = (resume = true) => {
    if (!questChapter) return;
    workbenchNarrationRef.current=null;
    const savedIndex = resume && savedCoverStep ? questChapter.gameplay.steps.findIndex((step) => step.id === savedCoverStep) : 0;
    const index = Math.max(0, savedIndex);
    setQuestStarted(true); setQuestStep(index); setQuestSolved(false); setFinishRevealed(false);
    saveCurrent(questChapter, index); window.scrollTo({ top: 0 });
    const step = questChapter.gameplay.steps[index];
    void speakSequence([...stepVoiceIds(step), ...(!step.audio.lead && index === 0 ? ["choice-help"] : [])]);
  };
  const completeQuest = (chapterId: string) => saveProgress({
    schemaVersion: 2, completed: [...new Set([...progressRef.current.completed, chapterId])], current: null,
  });

  const toggleVoice = () => {
    if (voiceOn) {
      haltVoice();
      setVoiceOn(false);
      return;
    }
    setVoiceOn(true);
    const narrationOverride=workbenchNarrationRef.current;
    const questVoiceIds = focusedImage
      ? [focusedImage.voice.id]
      : questChapter
      ? !questStarted
        ? [questChapter.gameplay.coverAudio.id, questChapter.gameplay.textbookAudio?.id].filter((id): id is string => Boolean(id))
        : questStep < questChapter.gameplay.steps.length
          ? narrationOverride?.key===`${questChapter.id}:${questChapter.gameplay.steps[questStep].id}`?narrationOverride.ids:stepVoiceIds(questChapter.gameplay.steps[questStep])
          : [finishRevealed ? questChapter.gameplay.finishAudio.id : questChapter.gameplay.finish.introAudio.id]
      : null;
    if (screen === "quest" && questVoiceIds) void speakSequence(questVoiceIds, true);
    else if (screen === "river") void speakSequence(["river-intro"], true);
  };

  const activeQuestStep = questChapter?.gameplay.steps[questStep] ?? null;
  const isLastQuestStep = Boolean(questChapter && questStep === questChapter.gameplay.steps.length - 1);
  const nextQuestStep = () => {
    if (!questChapter || !canContinueStep(activeQuestStep, questSolved)) return;
    workbenchNarrationRef.current=null;
    setQuestSolved(false);
    if (isLastQuestStep) completeQuest(questChapter.id);
    const ids = isLastQuestStep ? [questChapter.gameplay.finish.introAudio.id] : stepVoiceIds(questChapter.gameplay.steps[questStep+1]);
    if (!isLastQuestStep) saveCurrent(questChapter,questStep+1);
    setQuestStep(value=>value+1);window.scrollTo({top:0});void speakSequence(ids);
  };
  const taskStepActive = screen === "quest" && questStarted && Boolean(activeQuestStep);
  const resumeChapter = progress.current ? chaptersById.get(progress.current.chapterId) : null;

  return (
    <main className={`history-app ${screen === "river" ? "river-restored" : "focused-preview"} ${questChapter?.gameplay.presentation ? "workbench-active" : ""} ${taskStepActive ? "task-step-active" : ""} ${focusedImage ? "image-focus-active" : ""}`} data-playing-voice-id={voice.id??undefined}>
      <header className="app-header">
        <button className="brand" onClick={goHome} aria-label="回到小小历史旅行团首页">
          <span aria-hidden="true">🏠</span>
          <div><strong>小小历史旅行团</strong><small>适合4—6岁 · 亲子共学</small></div>
        </button>

        {screen === "quest" && questChapter && questStarted && questStep < questChapter.gameplay.steps.length && (
          <div className="chapter-nav quest-nav">
            <div className="quest-title-mini"><span>🔎</span><strong>{questChapter.childEntry.childTitle}</strong></div>
            <div className="chapter-progress" aria-label={`任务进度 ${questStep + 1}/5`}>
              {questChapter.gameplay.steps.map((item, index) => <i key={item.id} className={index <= questStep ? "done" : ""} />)}
              <span>第{questStep + 1}步</span>
            </div>
          </div>
        )}

        {screen !== "overview" && (
          <div className="voice-controls"><PauseButton /><button
            className={`voice-switch ${playing ? "playing" : ""} ${voiceOn ? "" : "muted"}`}
            onClick={toggleVoice}
            aria-pressed={voiceOn}
            aria-label={voiceOn ? "声音已开启，点按静音" : "声音已静音，点按开启声音"}
            title={voiceOn ? "静音" : "打开声音"}
          >
            <span aria-hidden="true">{voiceOn ? "🔊" : "🔇"}</span>
            {!voiceOn && <em>已静音</em>}
          </button></div>
        )}
      </header>

      {voiceNotice && screen !== "overview" && <p className="voice-notice" role="status">{voiceNotice}</p>}

      {screen === "overview" && <>
        <section className="local-progress-controls" aria-label="本机学习记录">
          <div><strong>本机学习记录</strong><p>本轮已走完 {progress.completed.filter(id=>chaptersById.has(id)).length} 个任务，本机共保存 {progress.completed.length} 个完成标记。完成标记记录玩法进度，不代表已经理解。{resumeChapter ? `正在探索：${resumeChapter.childEntry.childTitle}` : "可以从任意历史站出发。"}</p></div>
          {confirmClear ? <div><p>清空这台浏览器中的完成标记和进行中故事？</p><button onClick={clearProgress}>确认清空</button><button onClick={() => setConfirmClear(false)}>保留记录</button></div> : <button onClick={() => setConfirmClear(true)}>清空本机记录</button>}
          {storageNotice && <p role="status">{storageNotice}</p>}
        </section>
        <ContentOverview onBack={goHome} />
      </>}

      {screen === "river" && (
        <section className="river-screen pop-in">
          {resumeChapter && <button className="resume-story" onClick={() => openQuest(resumeChapter)}>
            <Image src={resumeChapter.thumbnail} alt="" width={68} height={68} unoptimized /><span><small>地图帮你记着呢</small><strong>继续 · {resumeChapter.childEntry.childTitle}</strong></span><b aria-hidden="true">▶</b>
          </button>}
          <div className="river-hero">
            <div className="river-hero-copy">
              <p className="eyebrow">小小历史旅行团 · 集合啦</p>
              <h1>沿着时间河<br /><em>去历史里探险！</em></h1>
              <p className="hero-copy">到秦朝量一量布，去长安看唐三彩，再跟着李白抬头望月。每一站，都有<strong>人物、地点和真文物</strong>，还有一个等你解开的谜。</p>
              <div className="hero-river-teaser" aria-label="旅行线索：秦朝、唐三彩、李白的月亮和泉州大船">
                <span><Image unoptimized src="/images/history-stations/united.webp" alt="" width={450} height={650} /><small>秦朝小工坊</small></span>
                <span><Image unoptimized src="/images/history-clue-camel-v2.webp" alt="" width={400} height={650} /><small>长安骆驼</small></span>
                <span><Image unoptimized src="/images/history-clue-moon-v2.webp" alt="" width={400} height={650} /><small>李白的月亮</small></span>
                <span><Image unoptimized src="/images/history-clue-ship-v2.webp" alt="" width={440} height={650} /><small>泉州大船</small></span>
              </div>
              <div className="hero-actions">
                <button className="primary-action" onClick={() => openStation(stations[0], 0)}><span>🧭</span> 拿上地图，出发！</button>
                <button className="audio-action" onClick={() => listen("river-intro")}>🔊 听出发口令</button>
              </div>
              <small className="basis-note">历史主轴依据：中国义务教育历史课程标准、中国国家博物馆“古代中国”基本陈列</small>
            </div>
            <figure className="hero-zine">
              <div className="hero-zine-frame">
                <Image unoptimized
                  src="/images/history-tour-river-v4.webp"
                  alt="黄衣男孩、戴圆框眼镜的绿衣男孩和马尾女孩，拿着地图沿时间河出发"
                  width={971}
                  height={1619}
                  priority
                  sizes="(max-width: 700px) 88vw, 430px"
                />
                <span className="hero-zine-stamp">沿着河，出发！</span>
              </div>
              <figcaption><strong>旅行团插画地图</strong><span>洞穴、文物、诗歌和港口在时间河边等你发现；它不是历史现场复原。</span></figcaption>
            </figure>
          </div>

          <div className="river-map">
            <div className="river-map-heading">
              <h2>下一站，<span className="keep-together">谁在河边等你？</span></h2>
              <span className="river-direction">秦汉 ⟶ 明清</span>
            </div>
            <ol className="river-path" style={{gridTemplateColumns:`repeat(${stations.length}, minmax(138px, 1fr)) auto`}} aria-label="秦汉至明清时间河十站">
              {stations.map((station, index) => {
                const count = chaptersByPeriod.get(station.periodId)?.length ?? 0;
                return (
                  <li key={station.id} className="station available">
                    <button
                      data-period-id={station.periodId} onClick={() => openStation(station, index)}
                      aria-label={`第${index + 1}站，${station.title}，看看这一站的${count}个故事`}
                    >
                      <span className="station-number">{index + 1}</span>
                      <span className="station-emoji" aria-hidden="true"><Image unoptimized src={station.iconSrc} alt="" fill sizes="88px" /></span>
                      <strong>{station.title}</strong>
                      <small>{station.years}</small>
                      <em>{station.childLine}</em>
                      <span className="station-status">▶ {count}个小任务</span>
                    </button>
                  </li>
                );
              })}
              <li className="river-end" aria-hidden="true"><span>🏠</span><small>下次再探险</small></li>
            </ol>
            <p className="river-hint">👆 点一站，挑一个想试的小任务。</p>
          </div>


        </section>
      )}

      {panel && (
        <div className="station-panel-backdrop" onClick={closePanel}>
          <section ref={stationDialogRef} className="station-panel pop-in" role="dialog" aria-modal="true" aria-label={panel.title} onClick={(event) => event.stopPropagation()}>
            <header className="panel-head">
              <span className="panel-emoji" aria-hidden="true"><Image unoptimized src={panel.iconSrc} alt="" fill sizes="96px" /></span>
              <div>
                <small>{panel.kicker}</small>
                <h2>{panel.title}</h2>
                <p><span className="panel-years">{panel.years.split(" · ").map((token, i, arr) => <span key={token} className="year-token">{token}{i < arr.length - 1 ? " · " : ""}</span>)}</span><span className="panel-line">{panel.line}</span></p>
              </div>
              <button className="panel-close" onClick={closePanel} aria-label="关闭">✕</button>
            </header>
            {panel.chapters[0]?.gameplay.presentation?.story ? <div className="trip-station-welcome"><p>{panel.chapters[0].gameplay.presentation.story.stationLine}</p></div> : <p className="panel-count">挑一个你想试的小任务。</p>}
            <div className="panel-grid">
              {panel.chapters.map((chapter) => {
                const completed = completedChapterIds.has(chapter.id);
                return (
                  <button
                    key={chapter.id}
                    data-chapter-id={chapter.id}
                    className={`panel-card playable ${completed ? "completed" : ""}`}
                    onClick={() => openQuest(chapter)}
                  >
                    <Image src={chapter.gameplay.coverImage} alt="" width={600} height={300} unoptimized />
                    <span className="panel-card-hook">{chapter.gameplay.anchor}</span>
                    <strong>{chapter.childEntry.childTitle}</strong>
                    <small>{chapter.childEntry.prompt}</small>
                    <span className="panel-card-status">
                      {completed ? "✓ 已完成 · 再玩一次" : `▶ ${chapter.gameplay.cta}`}
                    </span>
                  </button>
                );
              })}
            </div>
            <button className="panel-back" onClick={closePanel}>⬅ 回到时间河</button>
          </section>
        </div>
      )}

      {screen === "quest" && questChapter && !questStarted && (
        <section className={`quest-cover focus-cover pop-in ${questChapter.gameplay.presentation?.story?"trip-cover":""}`} data-voice-id={questChapter.gameplay.coverAudio.id}>
          <div className="trip-cover-artwork">
            {questChapter.gameplay.presentation?.story ? <WorkbenchCover presentation={questChapter.gameplay.presentation}/> : <div className="quest-cover-photo"><Image src={questChapter.gameplay.coverImage} alt={questChapter.gameplay.coverImageAlt} width={900} height={430} loading="eager" unoptimized/><span className="real-badge">{questChapter.gameplay.coverImageKind}</span></div>}
            {questChapter.gameplay.photoAlbum&&<PhotoAlbumButton album={questChapter.gameplay.photoAlbum} onOpen={()=>openPhotoAlbum(questChapter.gameplay.photoAlbum!)}/>}
          </div>
          <div className="quest-cover-copy">
            <button className="back-link" onClick={goHome}>⬅ 回到时间河</button>
            <p className="quest-time-location">🕰️ {questChapter.periodLabel} · {questChapter.periodYears}</p>
            <h1>{questChapter.gameplay.presentation?.title??questChapter.childEntry.childTitle}</h1>
            <p className="focus-hook">{questChapter.gameplay.hook.question}</p>
            {questChapter.gameplay.presentation&&!questChapter.gameplay.presentation.story&&<div className="workbench-cover-strip"><Image src={questChapter.gameplay.presentation.sceneImage} alt={questChapter.gameplay.presentation.sceneAlt} width={600} height={240} unoptimized/><span>到工坊里亲手试试</span></div>}
            <div className="quest-start-actions"><button className="next-button ready" onClick={()=>startQuest()}>{savedCoverStep?"接着玩":questChapter.gameplay.cta} →</button>{savedCoverStep&&<button className="restart-story" onClick={()=>startQuest(false)}>从头再试</button>}</div>
            <button className="listen-button" onClick={()=>listen(questChapter.gameplay.coverAudio.id)}>{questChapter.gameplay.presentation?.story?"🔊 再听出发故事":"🔊 听任务"}</button>
          </div>
          <details className="focus-parent-note"><summary>👪 家长陪玩提示与材料说明</summary><p><strong>这次会遇见：</strong>{questChapter.gameplay.anchor}</p><p>{questChapter.gameplay.finish.parent}</p><p>{questChapter.gameplay.boundary}</p>{questChapter.textbookConnection&&<p><strong>可以延伸聊：</strong>{questChapter.textbookConnection.companions.map(c=>c.label).join("、")}</p>}{questChapter.gameplay.evidence.length>0&&<div className="focus-evidence-list">{questChapter.gameplay.evidence.map(e=><figure key={e.id}><Image src={e.image} alt={e.title} width={360} height={220} unoptimized/><figcaption>{e.title}</figcaption><p>{e.boundary}</p></figure>)}</div>}</details>
        </section>
      )}

      {screen === "quest" && questChapter?.gameplay.presentation && questStarted && activeQuestStep && (
        <ObjectWorkbench key={`${questChapter.id}:${activeQuestStep.id}`} step={activeQuestStep} seed={`${questChapter.id}:${activeQuestStep.id}`} presentation={questChapter.gameplay.presentation} photoAlbum={questChapter.gameplay.photoAlbum} periodLabel={questChapter.periodLabel} solved={questSolved} isLast={isLastQuestStep} speak={speakSequence} listen={listenSequence} onSolved={()=>setQuestSolved(true)} onNext={nextQuestStep} onNarrationChange={ids=>{workbenchNarrationRef.current={key:`${questChapter.id}:${activeQuestStep.id}`,ids};}} onInspect={()=>{const evidence=activeQuestStep.inspection,album=questChapter.gameplay.photoAlbum;if(!evidence)return;if(evidence.openAlbum&&album){openPhotoAlbum(album,album.photos.findIndex(photo=>photo.assetId===evidence.id));return;}openImage({title:evidence.title,boundary:evidence.boundary,images:[{src:evidence.image,alt:evidence.title,caption:evidence.caption}],voice:evidence.audio,sourceLinks:evidence.sourceLinks})}}/>
      )}

      {screen === "quest" && questChapter && questStarted && activeQuestStep && !questChapter.gameplay.presentation && questStep < questChapter.gameplay.steps.length && (
          <section className="quest-step story-step pop-in" data-voice-id={`${activeQuestStep.audio.transition.id},${activeQuestStep.audio.intro.id},${activeQuestStep.audio.question.id}`} data-asset-id={activeQuestStep.assetId}>
            <button
              className="quest-story-visual image-trigger"
              type="button"
              data-image-voice-id={activeQuestStep.audio.image.id}
              aria-label={`放大${activeQuestStep.imageAlt}并听图片说明`}
              onClick={() => openImage({
                title: activeQuestStep.story.title,
                boundary: activeQuestStep.imageBoundary,
                images: [{ src: activeQuestStep.image, alt: activeQuestStep.imageAlt, caption: activeQuestStep.imageCaption }],
                voice: activeQuestStep.audio.image,
              })}
            >
              <Image src={activeQuestStep.image} alt={activeQuestStep.imageAlt} width={1200} height={900} loading="eager" unoptimized />
              <span className="step-stamp">{activeQuestStep.image.startsWith("/content/study-scenes/")?"学习示意":"历史材料"}</span>
              <div className="visual-caption"><strong>{activeQuestStep.story.title}</strong><span>{activeQuestStep.imageCaption || activeQuestStep.story.screenText}</span><span className="compact-image-caption">{activeQuestStep.imageAlt}</span></div>
              <span className="image-listen-hint">🔊 点图放大并听说明</span>
            </button>
            <div className="story-copy quest-story-copy">
              <button className="back-link" onClick={goHome}>⬅ 回到时间河</button>
              <p className="quest-step-hook">{questChapter.periodLabel} · {activeQuestStep.title}</p>
              <div className="quest-step-heading">
                <QuestStepBadge key={`heading-${activeQuestStep.id}`} stepId={activeQuestStep.id} labelled />
                <p className="eyebrow">第{questStep + 1}步 · {activeQuestStep.phase}</p>
              </div>
              <h2>{activeQuestStep.prompt}</h2>
              <div className="quest-read-card"><p>{activeQuestStep.story.displayText}</p></div>
              <button className="listen-button quest-listen" onClick={() => listenSequence([activeQuestStep.audio.transition.id, activeQuestStep.audio.intro.id, activeQuestStep.audio.question.id])}>🔊 重听这一页</button>
              <QuestQuestion key={`${questChapter.id}-${activeQuestStep.id}`} step={activeQuestStep} seed={`${questChapter.id}:${activeQuestStep.id}`} speak={speakSequence} listen={listenSequence} onSolved={() => setQuestSolved(true)} />
              {questSolved && (
                <button
                  className="next-button ready"
                  onClick={nextQuestStep}
                >
                  {isLastQuestStep ? "和家人试一试" : "接着看看"} <span>→</span>
                </button>
              )}
            </div>
          </section>
      )}

      {screen === "quest" && questChapter && questStarted && questStep >= questChapter.gameplay.steps.length && (
        <section className={`quest-finish focus-finish pop-in ${questChapter.gameplay.presentation?"workbench-finish":""}`} data-retell-state={finishRevealed?"answer":"first"} data-voice-id={questChapter.gameplay.finish.introAudio.id}>
          <p className="eyebrow">{questChapter.gameplay.presentation?.story?"小小旅行团 · 带着发现回家":"🌟 你找到这次的小发现啦"}</p><h1>{questChapter.gameplay.finish.title}</h1>
          {questChapter.gameplay.presentation ? <div className="workbench-finish-picture"><Image src={questChapter.gameplay.presentation.story?.reunionImage??questChapter.gameplay.presentation.sceneImage} alt={questChapter.gameplay.presentation.story?.reunionAlt??questChapter.gameplay.presentation.sceneAlt} width={1536} height={1024} style={questChapter.gameplay.presentation.story?.reunionAspectRatio?{height:'auto',aspectRatio:questChapter.gameplay.presentation.story.reunionAspectRatio,objectFit:questChapter.gameplay.presentation.story.reunionFit,background:questChapter.gameplay.presentation.story.reunionFit==='contain'?'#f4ead3':undefined}:undefined} unoptimized/><p>{questChapter.gameplay.presentation.story?.closingLine}</p></div> : <>
          <p className="finish-instruction">不用背答案，和家人试这两个动作。</p>
          <div className="finish-action-cards">{questChapter.gameplay.finish.actions.map((action,index)=>{const step=questChapter.gameplay.steps[questChapter.gameplay.finish.sceneStepIndexes?.[index]??index+2];const done=completedExtensionIds.has(`finish-${index}`);return <article key={action}><Image src={step.studyImage} alt={step.studyImageAlt} width={900} height={430} unoptimized/><span className="finish-action-number">{index+1}</span><p>{action}</p><button className="listen-button" onClick={()=>listen(questChapter.gameplay.finish.actionAudio[index].id)}>🔊 听这个动作</button><button className={`tried-action ${done?"done":""}`} aria-pressed={done} onClick={()=>setCompletedExtensionIds(current=>{const next=new Set(current);if(done)next.delete(`finish-${index}`);else next.add(`finish-${index}`);return next})}>{done?"✓ 试过啦":"✋ 我试过啦"}</button></article>})}</div>
          </>}
          <button className="listen-button quest-finish-listen" onClick={()=>{setFinishRevealed(true);listen(questChapter.gameplay.finishAudio.id)}}>🔊 听听这次发现</button>
          <FinishNavigation onHome={goHome} onReplay={()=>openQuest(questChapter,true)}/>
          {finishRevealed&&<p className="final-answer">{questChapter.childEntry.takeaway}</p>}
          {questChapter.gameplay.presentation&&<details className="family-extra"><summary>{questChapter.gameplay.presentation.familyLabel??"和家人再量一量"} <span>＋</span></summary><WorkbenchFamily presentation={questChapter.gameplay.presentation} onRefine={sides=>{const step=questChapter.gameplay.steps.find(s=>s.interaction?.kind==='circle-refine');const stage=step?.interaction?.refinements?.find(r=>r.sides===sides);if(stage)listen(stage.audio.id);else if(step)listen(step.audio.lead?.id??step.audio.intro.id);}}>{questChapter.gameplay.presentation.familyMode==='actions'&&questChapter.gameplay.photoAlbum&&<PhotoAlbumButton album={questChapter.gameplay.photoAlbum} onOpen={()=>openPhotoAlbum(questChapter.gameplay.photoAlbum!)} />}<div className="workbench-family-directions">{questChapter.gameplay.finish.actions.map((action,index)=><p key={action}><button className="workbench-sound" aria-label={`听第${index+1}个动作`} onClick={()=>listen(questChapter.gameplay.finish.actionAudio[index].id)}><span aria-hidden="true">▶</span></button>{action}</p>)}</div></WorkbenchFamily></details>}
          <details className="focus-parent-note"><summary>👪 家长怎么接话？</summary><p>{questChapter.gameplay.finish.parent}</p><p>{questChapter.gameplay.boundary}</p></details>
        </section>
      )}

      {focusedImage && (
        <div className="image-lightbox-backdrop" onClick={closeImage}>
          <section
            ref={imageDialogRef}
            className={`image-lightbox pop-in ${focusedImage.album ? "photo-album-dialog" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={`${focusedImage.album?.data.title??focusedImage.title}图片说明`}
            data-voice-id={focusedImage.voice.id}
            data-album-index={focusedImage.album?.index}
            onClick={(event) => event.stopPropagation()}
          >
            <button className="image-lightbox-close" type="button" onClick={closeImage} aria-label="关闭大图">✕</button>
            <div className={`image-lightbox-visual ${focusedImage.images.length > 1 ? "multiple" : ""} ${focusedImage.album ? "photo-album-visual" : ""}`}>
              {focusedImage.images.map((item) => (
                <figure key={item.src}>
                  {item.crop?<PhotoCrop src={item.src} alt={item.alt} crop={item.crop}/>:<Image src={item.src} alt={item.alt} width={1600} height={1200} unoptimized />}
                  <figcaption>{item.caption}</figcaption>
                </figure>
              ))}
              {focusedImage.album&&<div className="photo-album-thumbnails" role="group" aria-label="选择一张照片">{focusedImage.album.data.photos.map((photo,index)=><button key={photo.assetId} onClick={()=>openPhotoAlbum(focusedImage.album!.data,index)} aria-pressed={index===focusedImage.album!.index} aria-label={`看${photo.label}，${photo.period}`}>{photo.crop?<PhotoCrop src={photo.image} alt="" crop={photo.crop}/>:<Image src={photo.image} alt="" style={{objectPosition:photo.thumbnailPosition}} width={120} height={80} unoptimized/>}<span>{photo.label}</span></button>)}</div>}
            </div>
            <div className="image-lightbox-copy">
              <small>{focusedImage.album?`${focusedImage.album.data.title} · 第${focusedImage.album.index+1}/${focusedImage.album.data.photos.length}张`:'🔎 图片说明'}</small>
              {focusedImage.period&&<span className="photo-album-period">{focusedImage.period}</span>}
              <h2>{focusedImage.title}</h2>
              <p>{focusedImage.observation??focusedImage.voice.text}</p>
              {focusedImage.album&&<div className="photo-album-pager"><button disabled={focusedImage.album.index===0} onClick={()=>openPhotoAlbum(focusedImage.album!.data,focusedImage.album!.index-1)}>← 前一张</button><button disabled={focusedImage.album.index===focusedImage.album.data.photos.length-1} onClick={()=>openPhotoAlbum(focusedImage.album!.data,focusedImage.album!.index+1)}>后一张 →</button></div>}
              <button className="listen-button" type="button" onClick={() => listen(focusedImage.voice.id)}>🔊 再听一次图片说明</button>
              <PauseButton />
              <details className="image-evidence-boundary"><summary>家长看史料来源与图片说明</summary><p>{focusedImage.boundary}</p>{focusedImage.sourceLinks?.map(source=><p key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></p>)}</details>

            </div>
          </section>
        </div>
      )}

      <footer className="source-footer">
        <span>秦汉至明清 · 本机亲子试玩</span>
        {screen === "overview" ? (
          <span>家长与编辑审核层</span>
        ) : (
          <button className="parent-entry" onClick={openOverview}>👪 家长入口 · {contentManifest.totals.chapters}章材料与说明</button>
        )}
      </footer>
    </main>
  );
}
