"use client";

import { useState } from "react";

type MuseumCard = {
  id: string;
  image: string;
  alt: string;
  name: string;
  age: string;
  source: string;
  sourceUrl: string;
  story: string;
};

const museumCards: MuseumCard[] = [
  {
    id: "dancer",
    image: "/tang-dancer.jpg",
    alt: "唐代陶制外来舞者俑",
    name: "跳舞的人",
    age: "唐代 · 7世纪",
    source: "美国大都会艺术博物馆",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/49552",
    story: "看，他正在转身跳舞！唐朝的长安能听见许多地方的音乐，也能看到不同的舞蹈。",
  },
  {
    id: "groom",
    image: "/tang-groom.jpg",
    alt: "唐代陶制外来马夫俑",
    name: "照顾马的人",
    age: "唐代 · 7至8世纪",
    source: "美国大都会艺术博物馆",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/63016",
    story: "他在照顾远行的马。古时候没有汽车，马和骆驼帮助人们走过很远的路。",
  },
  {
    id: "cup",
    image: "/tang-cup.jpg",
    alt: "唐代鎏金银八角杯",
    name: "漂亮的银杯",
    age: "唐代 · 8世纪",
    source: "美国大都会艺术博物馆",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/42182",
    story: "这只杯子的样子很特别。唐朝工匠会观察远方来的器物，再做出自己的新作品。",
  },
];

const narration = [
  "你好呀！我是一只一千多岁的唐三彩骆驼。今天，跟着我去长安看看吧！",
  "先仔细看看我。数一数，我的背上有几个驼峰？",
  "唐三彩常见黄色、绿色和白色。请找一找，我身上有没有绿色？",
  "长安很热闹。点开三件真正的唐代文物，听听它们的故事吧！",
  "你发现啦！唐朝的长安，像一座热闹的世界大市场。人、商品和新点子，都在这里相遇。",
];

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const line = new SpeechSynthesisUtterance(text);
  line.lang = "zh-CN";
  line.rate = 0.82;
  line.pitch = 1.05;
  line.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const chineseVoice = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith("zh"),
  );
  if (chineseVoice) line.voice = chineseVoice;
  window.speechSynthesis.speak(line);
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [answerOne, setAnswerOne] = useState<string | null>(null);
  const [answerTwo, setAnswerTwo] = useState<string | null>(null);
  const [opened, setOpened] = useState<string[]>([]);
  const [activeCard, setActiveCard] = useState<MuseumCard | null>(null);

  const goTo = (nextStep: number) => {
    setStep(nextStep);
    if (voiceOn) window.setTimeout(() => speak(narration[nextStep]), 180);
  };

  const begin = () => {
    setStarted(true);
    setStep(1);
    if (voiceOn) speak(narration[1]);
  };

  const toggleVoice = () => {
    if (voiceOn) {
      window.speechSynthesis?.cancel();
      setVoiceOn(false);
    } else {
      setVoiceOn(true);
      speak(narration[step]);
    }
  };

  const replay = () => {
    setStarted(false);
    setStep(0);
    setAnswerOne(null);
    setAnswerTwo(null);
    setOpened([]);
    setActiveCard(null);
    window.speechSynthesis?.cancel();
  };

  const openCard = (card: MuseumCard) => {
    setActiveCard(card);
    setOpened((current) =>
      current.includes(card.id) ? current : [...current, card.id],
    );
    if (voiceOn) speak(card.story);
  };

  const chooseHump = (value: string) => {
    setAnswerOne(value);
    if (voiceOn) {
      speak(
        value === "two"
          ? "答对啦！它有两个驼峰，所以叫双峰骆驼。"
          : "再看一看，前面一个，后面还有一个。",
      );
    }
  };

  const chooseColor = (value: string) => {
    setAnswerTwo(value);
    if (voiceOn) {
      speak(
        value === "green"
          ? "你找到绿色啦！唐三彩不只有三种颜色，三彩的三，是多种颜色的意思。"
          : "蓝色很好看，不过这只骆驼身上没有蓝色。再找一找吧。",
      );
    }
  };

  return (
    <main className="little-history">
      <header className="kid-header">
        <button className="kid-brand" onClick={replay} aria-label="回到故事首页">
          <span>史</span>
          <strong>小小历史旅行团</strong>
        </button>

        {started && (
          <div className="star-progress" aria-label={`故事进度 ${step}/4`}>
            {[1, 2, 3, 4].map((item) => (
              <i key={item} className={item <= step ? "done" : ""}>★</i>
            ))}
          </div>
        )}

        <button className="voice-switch" onClick={toggleVoice} aria-pressed={voiceOn}>
          <span>{voiceOn ? "◖))" : "—"}</span>
          {voiceOn ? "声音开" : "声音关"}
        </button>
      </header>

      {!started && (
        <section className="cover-screen pop-in">
          <div className="cover-photo">
            <img src="/tang-camel.jpg" alt="大都会艺术博物馆收藏的唐三彩双峰骆驼俑" />
            <span className="real-badge">真实文物</span>
            <div className="museum-label">
              <strong>唐三彩骆驼</strong>
              <small>唐代 · 普林斯顿大学艺术博物馆</small>
            </div>
          </div>
          <div className="cover-copy">
            <p className="tiny-label">第一站 · 唐朝长安</p>
            <h1>小骆驼<br />去长安</h1>
            <p>跟着一件真正的文物，听一个简单的历史故事。</p>
            <button className="big-play" onClick={begin}>
              <span className="play-dot">▶</span>
              <strong>点一下，听故事</strong>
            </button>
            <small className="age-note">适合 5–8 岁 · 约 4 分钟</small>
          </div>
        </section>
      )}

      {started && step === 1 && (
        <section className="play-screen pop-in">
          <div className="photo-question">
            <img src="/tang-camel.jpg" alt="唐三彩双峰骆驼俑，可以清楚看到两个驼峰" />
            <span className="look-ring ring-a" aria-hidden="true" />
            <span className="look-ring ring-b" aria-hidden="true" />
            <span className="real-badge">真实文物</span>
          </div>
          <div className="simple-question">
            <p className="tiny-label">看一看</p>
            <h2>我有几个驼峰？</h2>
            <button className="listen-button" onClick={() => speak(narration[1])}>◖)) 听一听</button>
            <div className="choice-row">
              <button className={answerOne === "one" ? "wrong" : ""} onClick={() => chooseHump("one")}>
                <strong>1</strong><span>一个</span>
              </button>
              <button className={answerOne === "two" ? "right" : ""} onClick={() => chooseHump("two")}>
                <strong>2</strong><span>两个</span>
              </button>
            </div>
            <div className={`happy-note ${answerOne ? "show" : ""}`}>
              {answerOne === "two" ? "答对啦！我是双峰骆驼。" : "前面一个，后面还有一个。"}
            </div>
            <button className="next-button" disabled={answerOne !== "two"} onClick={() => goTo(2)}>
              下一步 <span>→</span>
            </button>
          </div>
        </section>
      )}

      {started && step === 2 && (
        <section className="play-screen reverse pop-in">
          <div className="photo-question colorful-photo">
            <img src="/tang-camel.jpg" alt="唐三彩骆驼身上有黄色、绿色和白色的釉彩" />
            <span className="color-pointer">绿色在这里</span>
            <span className="real-badge">真实文物</span>
          </div>
          <div className="simple-question">
            <p className="tiny-label">找颜色</p>
            <h2>我的身上<br />有绿色吗？</h2>
            <button className="listen-button" onClick={() => speak(narration[2])}>◖)) 听一听</button>
            <div className="choice-row color-choices">
              <button className={answerTwo === "green" ? "right" : ""} onClick={() => chooseColor("green")}>
                <i className="green-swatch" /><span>有绿色</span>
              </button>
              <button className={answerTwo === "blue" ? "wrong" : ""} onClick={() => chooseColor("blue")}>
                <i className="blue-swatch" /><span>有蓝色</span>
              </button>
            </div>
            <div className={`happy-note ${answerTwo ? "show" : ""}`}>
              {answerTwo === "green" ? "找到了！“三彩”是很多颜色。" : "蓝色不在这只骆驼身上。"}
            </div>
            <button className="next-button" disabled={answerTwo !== "green"} onClick={() => goTo(3)}>
              去长安看看 <span>→</span>
            </button>
          </div>
        </section>
      )}

      {started && step === 3 && (
        <section className="museum-screen pop-in">
          <div className="museum-heading">
            <div>
              <p className="tiny-label">听故事</p>
              <h2>长安来了<br />很多新朋友</h2>
            </div>
            <div className="heading-narration">
              <button className="listen-button" onClick={() => speak(narration[3])}>◖)) 听一听</button>
              <p>每张图片都是真实文物。<br />点开图片，它会讲故事。</p>
            </div>
          </div>

          <div className="museum-grid">
            {museumCards.map((card, index) => (
              <button
                key={card.id}
                className={opened.includes(card.id) ? "opened" : ""}
                onClick={() => openCard(card)}
              >
                <img src={card.image} alt={card.alt} />
                <span className="card-number">0{index + 1}</span>
                <div>
                  <strong>{card.name}</strong>
                  <small>{card.age}</small>
                </div>
                <i>{opened.includes(card.id) ? "听过啦 ✓" : "点我听故事"}</i>
              </button>
            ))}
          </div>

          <div className="museum-footer">
            <span>已经听了 {opened.length} / 3 件文物</span>
            <button className="next-button" disabled={opened.length < 3} onClick={() => goTo(4)}>
              我发现了 <span>→</span>
            </button>
          </div>

          {activeCard && (
            <div className="story-modal" role="dialog" aria-modal="true" aria-label={`${activeCard.name}的故事`}>
              <button className="story-backdrop" onClick={() => setActiveCard(null)} aria-label="关闭故事" />
              <article>
                <img src={activeCard.image} alt={activeCard.alt} />
                <div>
                  <span>真实文物 · {activeCard.age}</span>
                  <h3>{activeCard.name}</h3>
                  <p>{activeCard.story}</p>
                  <button className="listen-button large" onClick={() => speak(activeCard.story)}>◖)) 再听一次</button>
                  <button className="close-story" onClick={() => setActiveCard(null)}>听完啦</button>
                  <a href={activeCard.sourceUrl} target="_blank" rel="noreferrer">图片来源：{activeCard.source}</a>
                </div>
              </article>
            </div>
          )}
        </section>
      )}

      {started && step === 4 && (
        <section className="finish-screen pop-in">
          <div className="finish-camel">
            <img src="/tang-camel.jpg" alt="唐三彩双峰骆驼俑" />
            <span>谢谢你陪我旅行！</span>
          </div>
          <div className="finish-copy">
            <p className="tiny-label">今天的大发现</p>
            <h2>长安像一座<br />热闹的世界大市场</h2>
            <button className="listen-button large" onClick={() => speak(narration[4])}>◖)) 听一听</button>
            <p className="big-lesson">人们带来商品、音乐和新点子。<br />大家见面，又做出了新的东西。</p>
            <div className="kid-badge">
              <span>★</span>
              <div><small>获得称号</small><strong>丝路小发现家</strong></div>
            </div>
            <button className="again-button" onClick={replay}>再玩一次</button>
          </div>
        </section>
      )}

      <footer className="source-footer">
        <span>真实馆藏：普林斯顿大学艺术博物馆 · 大都会艺术博物馆</span>
        <a href="https://artmuseum.princeton.edu/art/collections/objects/138365" target="_blank" rel="noreferrer">查看唐三彩骆驼原件</a>
        <span>低龄体验原型 0.2</span>
      </footer>
    </main>
  );
}
