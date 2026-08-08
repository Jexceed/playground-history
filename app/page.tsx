"use client";

import { useEffect, useState } from "react";
import { ContentOverview } from "./ContentOverview";
import { playVoice, stopVoice } from "./speech";

type Era = {
  id: string;
  years: string;
  title: string;
  childLine: string;
  active?: boolean;
};

const eras: Era[] = [
  { id: "early", years: "约200万年前—约前21世纪", title: "远古时期", childLine: "人们学会用火，也开始种庄稼" },
  { id: "states", years: "约前21世纪—前771年", title: "夏商西周", childLine: "早期国家出现了，汉字也慢慢长大" },
  { id: "change", years: "前770年—前221年", title: "春秋战国", childLine: "社会大变化，许多人一起想办法" },
  { id: "united", years: "前221年—220年", title: "秦汉时期", childLine: "更大的统一国家建立起来" },
  { id: "meeting", years: "220年—589年", title: "三国两晋南北朝", childLine: "人们迁徙、生活，也彼此交融" },
  { id: "tang", years: "581年—960年", title: "隋唐五代", childLine: "国家统一，城市繁荣，对外交流活跃", active: true },
  { id: "cities", years: "916年—1368年", title: "辽宋夏金元", childLine: "城市热闹，贸易和科技继续发展" },
  { id: "later", years: "1368年—1911年", title: "明清时期", childLine: "统一多民族国家继续巩固和发展" },
];

const sourceCards = [
  {
    image: "/tang-groom.jpg",
    alt: "唐代陶制胡人马夫俑",
    label: "照料远行的马",
    source: "大都会艺术博物馆藏唐代马夫俑",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/63016",
  },
  {
    image: "/tang-dancer.jpg",
    alt: "唐代陶制外来舞者俑",
    label: "带来新的舞蹈",
    source: "大都会艺术博物馆藏唐代舞者俑",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/49552",
  },
  {
    image: "/tang-cup.jpg",
    alt: "唐代鎏金银八角杯",
    label: "做出新的器物",
    source: "大都会艺术博物馆藏唐代银杯",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/42182",
  },
];

const stepVoice = ["chapter-open", "road-open", "meeting-open", "making-open", "chapter-finish"];

export default function Home() {
  const [screen, setScreen] = useState<"river" | "chapter" | "overview">("river");
  const [step, setStep] = useState(0);
  const [voiceOn, setVoiceOn] = useState(true);
  const [answer, setAnswer] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => stopVoice(), []);

  const speak = async (id: string) => {
    if (!voiceOn) return;
    setPlaying(true);
    await playVoice(id);
    setPlaying(false);
  };

  const enterChapter = () => {
    setScreen("chapter");
    setStep(0);
    setAnswer(null);
    window.setTimeout(() => void speak("chapter-open"), 120);
  };

  const goHome = () => {
    stopVoice();
    setPlaying(false);
    setScreen("river");
    setStep(0);
    setAnswer(null);
  };

  const openOverview = () => {
    stopVoice();
    setPlaying(false);
    setScreen("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goTo = (next: number) => {
    stopVoice();
    setPlaying(false);
    setAnswer(null);
    setStep(next);
    window.setTimeout(() => void speak(stepVoice[next]), 140);
  };

  const choose = (value: string, correct: string, rightVoice: string, wrongVoice: string) => {
    setAnswer(value);
    void speak(value === correct ? rightVoice : wrongVoice);
  };

  const toggleVoice = () => {
    if (voiceOn) {
      stopVoice();
      setPlaying(false);
      setVoiceOn(false);
      return;
    }
    setVoiceOn(true);
    window.setTimeout(() => {
      void playVoice(screen === "river" ? "river-intro" : stepVoice[step]);
    }, 80);
  };

  return (
    <main className="history-app">
      <header className="app-header">
        <button className="brand" onClick={goHome} aria-label="回到中华文明时间河">
          <span>史</span>
          <div><strong>小小历史旅行团</strong><small>沿着中国历史，认识世界</small></div>
        </button>

        {screen === "chapter" && (
          <div className="chapter-progress" aria-label={`故事进度 ${step + 1}/5`}>
            {[0, 1, 2, 3, 4].map((item) => <i key={item} className={item <= step ? "done" : ""} />)}
            <span>{step + 1} / 5</span>
          </div>
        )}

        {screen !== "overview" && (
          <button className={`voice-switch ${playing ? "playing" : ""}`} onClick={toggleVoice} aria-pressed={voiceOn}>
            <span>{voiceOn ? "●))" : "—"}</span>
            {voiceOn ? "本地语音开" : "声音关"}
          </button>
        )}
      </header>

      {screen === "overview" && <ContentOverview onBack={goHome} />}

      {screen === "river" && (
        <section className="river-screen pop-in">
          <div className="river-hero">
            <div>
              <p className="eyebrow">中国历史主轴 · 第一季</p>
              <h1>沿着中华文明<br /><em>时间河</em>出发</h1>
              <p className="hero-copy">先看清中国历史怎样一步步走来，<br />再去认识同一时间的世界。</p>
              <div className="hero-actions">
                <button className="primary-action" onClick={enterChapter}><span>▶</span> 开始隋唐第一章</button>
                <button className="audio-action" onClick={() => void speak("river-intro")}>●)) 听一听</button>
                <button className="overview-action" onClick={openOverview}>查看完整91章</button>
              </div>
              <small className="basis-note">主轴依据：中国义务教育历史课程标准、中国国家博物馆“古代中国”基本陈列</small>
            </div>
            <div className="hero-object">
              <img src="/tang-camel.jpg" alt="唐三彩双峰骆驼俑" />
              <span className="real-badge">真实文物</span>
              <div className="object-label"><strong>我们的第一位向导</strong><span>唐三彩双峰骆驼</span></div>
            </div>
          </div>

          <div className="river-guide">
            <div><span>1</span><p><strong>沿时间走</strong><small>先知道前后发生了什么</small></p></div>
            <div><span>2</span><p><strong>跟故事走</strong><small>每章只回答一个大问题</small></p></div>
            <div><span>3</span><p><strong>向世界看</strong><small>最后看看同时的世界</small></p></div>
          </div>

          <div className="timeline-wrap">
            <div className="timeline-heading">
              <div><p className="eyebrow">八段中国历史</p><h2>每一段，都从上一段走来</h2></div>
              <span>互动试玩：隋唐五代</span>
            </div>
            <div className="timeline" aria-label="中国古代历史时间轴">
              {eras.map((era, index) => (
                <article key={era.id} className={era.active ? "active" : ""}>
                  <div className="era-marker"><span>{index + 1}</span></div>
                  <small>{era.years}</small>
                  <h3>{era.title}</h3>
                  <p>{era.childLine}</p>
                  {era.active ? <button onClick={enterChapter}>进入这一章 →</button> : <i>内容稿已完成</i>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {screen === "chapter" && step === 0 && (
        <section className="chapter-cover pop-in">
          <div className="chapter-photo">
            <img src="/tang-camel.jpg" alt="唐三彩双峰骆驼俑" />
            <span className="real-badge">真实文物</span>
            <div className="museum-tag">唐代 · 普林斯顿大学艺术博物馆藏</div>
          </div>
          <div className="chapter-intro">
            <button className="back-link" onClick={goHome}>← 返回时间河</button>
            <p className="eyebrow">第六段 · 隋唐五代</p>
            <h1>小骆驼<br />为什么要去长安？</h1>
            <p className="chapter-question">我们要找到一条完整的答案：</p>
            <div className="cause-preview"><span>路通了</span><b>→</b><span>人来了</span><b>→</b><span>长安变了</span></div>
            <button className="listen-button" onClick={() => void speak("chapter-open")}>●)) 听故事开头</button>
            <button className="next-button" onClick={() => goTo(1)}>跟小骆驼出发 <span>→</span></button>
          </div>
        </section>
      )}

      {screen === "chapter" && step === 1 && (
        <section className="story-step pop-in">
          <div className="story-visual split-artifacts">
            <figure><img src="/tang-camel.jpg" alt="唐三彩双峰骆驼俑" /><figcaption>骆驼能驮着东西走远路</figcaption></figure>
            <figure><img src="/tang-groom.jpg" alt="唐代陶制马夫俑" /><figcaption>人们也要一路照料牲畜</figcaption></figure>
            <span className="step-stamp">起因 01</span>
          </div>
          <div className="story-copy">
            <p className="eyebrow">路通了</p>
            <h2>人们为什么<br />带骆驼出发？</h2>
            <p className="story-line">长安很远。商队要带着货物和消息，走过漫长的路。</p>
            <button className="listen-button" onClick={() => void speak("road-open")}>●)) 再听一次</button>
            <div className="choice-stack">
              <button className={answer === "carry" ? "right" : ""} onClick={() => choose("carry", "carry", "road-right", "road-wrong")}>能驮东西，也能走远路</button>
              <button className={answer === "pretty" ? "wrong" : ""} onClick={() => choose("pretty", "carry", "road-right", "road-wrong")}>只是因为骆驼很好看</button>
            </div>
            <p className={`answer-note ${answer ? "show" : ""}`}>{answer === "carry" ? "对！先有远行，才会有后面的相遇。" : "再想想：那么远的路，货物要怎样带过去？"}</p>
            <button className="next-button" disabled={answer !== "carry"} onClick={() => goTo(2)}>到长安城门 <span>→</span></button>
          </div>
        </section>
      )}

      {screen === "chapter" && step === 2 && (
        <section className="story-step reverse pop-in">
          <div className="story-visual dancer-visual">
            <img src="/tang-dancer.jpg" alt="唐代陶制外来舞者俑" />
            <span className="step-stamp">经过 02</span>
            <div className="visual-caption"><strong>人来了</strong><span>商品、音乐、舞蹈和新消息也来了</span></div>
          </div>
          <div className="story-copy">
            <p className="eyebrow">人来了</p>
            <h2>远方的人<br />只带货物吗？</h2>
            <p className="story-line">不只。长安还能听见不同的音乐，看见不同的舞蹈。</p>
            <button className="listen-button" onClick={() => void speak("meeting-open")}>●)) 再听一次</button>
            <div className="choice-stack">
              <button className={answer === "more" ? "right" : ""} onClick={() => choose("more", "more", "meeting-right", "meeting-wrong")}>不只，还有音乐和新消息</button>
              <button className={answer === "goods" ? "wrong" : ""} onClick={() => choose("goods", "more", "meeting-right", "meeting-wrong")}>是的，他们只带货物</button>
            </div>
            <p className={`answer-note ${answer ? "show" : ""}`}>{answer === "more" ? "对！人见面，生活里的许多东西也会相遇。" : "看看舞者俑：他提醒我们，来的不只是货物。"}</p>
            <button className="next-button" disabled={answer !== "more"} onClick={() => goTo(3)}>去看看新变化 <span>→</span></button>
          </div>
        </section>
      )}

      {screen === "chapter" && step === 3 && (
        <section className="story-step pop-in">
          <div className="story-visual cup-visual">
            <img src="/tang-cup.jpg" alt="唐代鎏金银八角杯" />
            <span className="step-stamp">结果 03</span>
            <div className="visual-caption"><strong>新的器物出现了</strong><span>外来的样式，遇见唐朝工匠的手艺</span></div>
          </div>
          <div className="story-copy">
            <p className="eyebrow">长安变了</p>
            <h2>相遇以后<br />发生了什么？</h2>
            <p className="story-line">工匠观察新的样式，再用自己的手艺，做出新的东西。</p>
            <button className="listen-button" onClick={() => void speak("making-open")}>●)) 再听一次</button>
            <div className="choice-stack">
              <button className={answer === "create" ? "right" : ""} onClick={() => choose("create", "create", "making-right", "making-wrong")}>互相学习，做出新的东西</button>
              <button className={answer === "ignore" ? "wrong" : ""} onClick={() => choose("ignore", "create", "making-right", "making-wrong")}>大家见面，却谁也不理谁</button>
            </div>
            <p className={`answer-note ${answer ? "show" : ""}`}>{answer === "create" ? "答对了！交流会让生活长出新的样子。" : "再看看银杯：它把不同地方的特点放在了一起。"}</p>
            <button className="next-button" disabled={answer !== "create"} onClick={() => goTo(4)}>说出完整答案 <span>→</span></button>
          </div>
        </section>
      )}

      {screen === "chapter" && step === 4 && (
        <section className="chapter-finish pop-in">
          <div className="finish-heading">
            <div><p className="eyebrow">这一章的完整答案</p><h1>为什么唐朝长安<br />那么热闹？</h1></div>
            <button className="listen-button large" onClick={() => void speak("chapter-finish")}>●)) 听完整答案</button>
          </div>
          <div className="cause-chain">
            {sourceCards.map((card, index) => (
              <article key={card.label}>
                <span>0{index + 1}</span>
                <img src={card.image} alt={card.alt} />
                <div><small>{index === 0 ? "路通了" : index === 1 ? "人来了" : "长安变了"}</small><h2>{card.label}</h2></div>
                <a href={card.sourceUrl} target="_blank" rel="noreferrer">查看文物来源</a>
              </article>
            ))}
          </div>
          <div className="final-answer">
            <p><strong>路把人们带到一起。</strong>人们带来商品、音乐和新想法；大家相遇、学习，又创造出新的东西。</p>
            <div className="kid-badge"><span>★</span><div><small>获得称号</small><strong>长安故事小侦探</strong></div></div>
          </div>
          <div className="finish-actions"><button className="secondary-action" onClick={goHome}>回到时间河</button><button className="primary-action" onClick={() => goTo(0)}><span>↻</span> 再听一遍</button></div>
        </section>
      )}

      <footer className="source-footer">
        <span>历史主轴：教育部《义务教育历史课程标准（2022年版）》与中国国家博物馆“古代中国”</span>
        <span>文物图片：普林斯顿大学艺术博物馆、大都会艺术博物馆公开馆藏</span>
        <span>原型 0.4 · 91章审核入口 · 预生成普通话音频</span>
      </footer>
    </main>
  );
}
