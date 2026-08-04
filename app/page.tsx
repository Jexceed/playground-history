"use client";

import { useMemo, useState } from "react";

type Phase =
  | "intro"
  | "briefing"
  | "explore"
  | "dialogue"
  | "verdict"
  | "result";

type Evidence = {
  id: string;
  number: string;
  title: string;
  eyebrow: string;
  short: string;
  detail: string;
  mark: string;
};

type Witness = {
  id: string;
  name: string;
  role: string;
  monogram: string;
  quote: string;
  note: string;
};

const evidence: Evidence[] = [
  {
    id: "glass",
    number: "01",
    title: "杯身的刻纹",
    eyebrow: "器物工艺",
    short: "深刻的椭圆纹，与西亚玻璃器的装饰方式相近。",
    detail:
      "这只杯子的器形和刻纹带有西亚风格。唐代长安确实消费来自远方的精美玻璃器，但‘风格来自西亚’并不能单独证明它在哪里制成。",
    mark: "纹",
  },
  {
    id: "tag",
    number: "02",
    title: "三站货签",
    eyebrow: "游戏化重构",
    short: "货签记录：撒马尔罕、敦煌、长安。字迹并不相同。",
    detail:
      "货物在不同地点被重新登记，说明它很可能经过多次转手。货签为原型虚构线索，设计依据来自丝路商旅文书与唐代过所制度。",
    mark: "签",
  },
  {
    id: "coin",
    number: "03",
    title: "商人的钱袋",
    eyebrow: "流通线索",
    short: "开元通宝旁，还混着一枚来自更西方的钱币。",
    detail:
      "不同地区的钱币会随旅行者远行，但发现一枚外国钱币，不等于长安人人都用它买东西。它只能证明人与物发生过跨地区移动。",
    mark: "钱",
  },
  {
    id: "repair",
    number: "04",
    title: "本地修补痕",
    eyebrow: "隐藏证据",
    short: "杯底有一道新补的金属圈，做法出自长安工坊。",
    detail:
      "外来的器物在长安被使用、修补，甚至启发本地工匠仿制。历史交流不是简单的‘进口’，而是不断改造和再创造。",
    mark: "补",
  },
];

const witnesses: Witness[] = [
  {
    id: "merchant",
    name: "康阿罗",
    role: "粟特商人",
    monogram: "康",
    quote:
      "我只走到撒马尔罕以东。这只杯子到我手里之前，已经换过几位主人。丝路上的货，很少由一个人从头送到尾。",
    note: "他了解自己的交易环节，但不知道杯子最早的制造地点。",
  },
  {
    id: "apprentice",
    name: "阿禾",
    role: "长安工坊学徒",
    monogram: "禾",
    quote:
      "杯底的铜圈是我们师傅补的。客人喜欢这种样式，最近也有人照着它做新的杯子。远方的东西，到了长安也会变。",
    note: "她能确认本地修补，却无法独立判断杯身的产地。",
  },
  {
    id: "clerk",
    name: "杜十二",
    role: "西市市署书手",
    monogram: "杜",
    quote:
      "货签写的是途经地，不一定是产地。商人还会借响亮的地名抬高价钱。要定案，最好让器物、文书和证词互相印证。",
    note: "他提醒你：官方记录也需要结合其他证据解读。",
  },
];

const answers = [
  {
    id: "envoy",
    label: "一位拜占庭使者从故乡把杯子直接带到长安",
    feedback: "这个故事很精彩，但现有证据没有指向某位使者，也没有证明全程直达。",
  },
  {
    id: "network",
    label: "它经由多地、多位商旅接力来到长安，又被本地修补和仿制",
    feedback: "这个结论能同时解释货签、钱币、商人证词与本地修补痕。",
  },
  {
    id: "local",
    label: "它完全产自长安，与外部交流没有关系",
    feedback: "本地修补确实存在，但杯身工艺和跨地区线索无法被这个结论解释。",
  },
];

const timeline = [
  { place: "长安", title: "唐玄宗·天宝元年", text: "西市汇聚来自中亚、西亚与更远地区的商旅和货物。" },
  { place: "中亚", title: "粟特商旅网络", text: "许多商人以绿洲城市为节点，让货物在不同队伍间接力。" },
  { place: "西亚", title: "倭马亚王朝晚期", text: "从地中海东岸到中亚的城市、工艺和贸易网络持续流动。" },
  { place: "日本", title: "奈良时代", text: "遣唐使与海上交通推动制度、宗教、文字和器物交流。" },
  { place: "美洲", title: "玛雅古典期", text: "在欧亚大陆之外，玛雅城邦也在发展各自的政治与文化。" },
];

const phaseOrder: Phase[] = [
  "briefing",
  "explore",
  "dialogue",
  "verdict",
  "result",
];

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [collected, setCollected] = useState<string[]>([]);
  const [openEvidence, setOpenEvidence] = useState<Evidence | null>(null);
  const [heard, setHeard] = useState<string[]>([]);
  const [activeWitness, setActiveWitness] = useState<Witness>(witnesses[0]);
  const [answer, setAnswer] = useState<string | null>(null);

  const currentStep = phaseOrder.indexOf(phase);
  const selectedAnswer = answers.find((item) => item.id === answer);
  const caseScore = useMemo(
    () => collected.length * 12 + heard.length * 9 + (answer === "network" ? 25 : 8),
    [collected, heard, answer],
  );

  const collectEvidence = (item: Evidence) => {
    setCollected((current) =>
      current.includes(item.id) ? current : [...current, item.id],
    );
    setOpenEvidence(item);
  };

  const hearWitness = (witness: Witness) => {
    setActiveWitness(witness);
    setHeard((current) =>
      current.includes(witness.id) ? current : [...current, witness.id],
    );
  };

  const resetCase = () => {
    setPhase("intro");
    setCollected([]);
    setOpenEvidence(null);
    setHeard([]);
    setActiveWitness(witnesses[0]);
    setAnswer(null);
  };

  return (
    <main className="game-shell">
      <div className="atmosphere" aria-hidden="true">
        <span className="star star-one" />
        <span className="star star-two" />
        <span className="star star-three" />
        <span className="orbit orbit-one" />
        <span className="orbit orbit-two" />
      </div>

      <header className="topbar">
        <button className="brand" onClick={resetCase} aria-label="返回时空档案局首页">
          <span className="brand-seal">纪</span>
          <span>
            <strong>时空档案局</strong>
            <small>CHRONICLE BUREAU</small>
          </span>
        </button>

        {phase !== "intro" ? (
          <div className="mission-progress" aria-label={`任务进度，第 ${currentStep + 1} 步，共 5 步`}>
            <span className="mission-code">档案 TS-742</span>
            <div className="progress-dots" aria-hidden="true">
              {phaseOrder.map((item, index) => (
                <i key={item} className={index <= currentStep ? "active" : ""} />
              ))}
            </div>
          </div>
        ) : (
          <span className="prototype-tag">可玩原型 · 任务 01</span>
        )}
      </header>

      {phase === "intro" && (
        <section className="intro-screen screen-enter">
          <div className="intro-copy">
            <p className="kicker"><span /> 新档案已抵达</p>
            <h1>
              一只玻璃杯，
              <em>能证明长安连接了世界吗？</em>
            </h1>
            <p className="intro-lead">
              公元 742 年，唐朝长安。你将成为一名少年时空档案员，进入西市寻找证据、询问人物，并给出自己的历史判断。
            </p>
            <div className="intro-actions">
              <button className="primary-button" onClick={() => setPhase("briefing")}>
                <span>接受任务</span><b>→</b>
              </button>
              <div className="session-note">
                <strong>约 10 分钟</strong>
                <span>观察 · 对话 · 推理</span>
              </div>
            </div>
          </div>

          <div className="artifact-stage" aria-label="档案中的蓝色玻璃杯">
            <div className="year-ring">
              <span className="ring-label ring-top">CHANG&apos;AN</span>
              <span className="ring-label ring-bottom">742 C.E.</span>
              <div className="glass-artifact">
                <i className="cup-rim" />
                <i className="cup-body"><span /><span /><span /></i>
                <i className="cup-foot" />
              </div>
            </div>
            <aside className="artifact-caption">
              <small>待鉴定器物</small>
              <strong>蓝色刻纹玻璃杯</strong>
              <span>来源：长安西市旧藏（原型虚构）</span>
            </aside>
          </div>

          <div className="case-strip">
            <span>任务目标</span>
            <strong>用至少三类证据，解释这只杯子如何来到长安</strong>
            <i>01 / 06</i>
          </div>
        </section>
      )}

      {phase === "briefing" && (
        <section className="briefing-screen content-screen screen-enter">
          <div className="section-number">序章</div>
          <div className="briefing-copy">
            <p className="kicker"><span /> 档案员简报</p>
            <h2>历史不是背出答案，<br />而是找到答案的依据。</h2>
            <div className="dispatch-card">
              <span className="dispatch-seal">急</span>
              <p>
                时空坐标已经锁定在<strong>唐玄宗天宝元年</strong>。西市刚收到一只罕见的蓝色玻璃杯，有人说它由西方使者直接带来，也有人说它其实是长安制造。
              </p>
              <p>你的任务不是猜一个故事，而是找出哪种解释最符合现有证据。</p>
            </div>
          </div>
          <aside className="rules-card">
            <p>档案局调查守则</p>
            <ol>
              <li><span>壹</span><div><strong>观察器物</strong><small>细节可能比名字更可靠</small></div></li>
              <li><span>贰</span><div><strong>听取证词</strong><small>每个人只看见历史的一部分</small></div></li>
              <li><span>叁</span><div><strong>交叉印证</strong><small>好结论要解释更多证据</small></div></li>
            </ol>
            <button className="primary-button wide" onClick={() => setPhase("explore")}>
              进入长安西市 <b>→</b>
            </button>
          </aside>
        </section>
      )}

      {phase === "explore" && (
        <section className="explore-screen content-screen screen-enter">
          <div className="scene-heading">
            <div>
              <p className="kicker"><span /> 第一幕 · 西市调查</p>
              <h2>从器物与现场中，<br />找出四条线索。</h2>
            </div>
            <div className="evidence-count">
              <strong>{String(collected.length).padStart(2, "0")}</strong>
              <span>/ 04<br />已归档</span>
            </div>
          </div>

          <div className="market-layout">
            <div className="market-scene">
              <div className="market-sky"><span>长安 · 西市</span><i>天宝元年 / 午时</i></div>
              <div className="market-gates" aria-hidden="true">
                <i /><i /><i /><b /><b /><b />
              </div>
              <div className="market-floor" aria-hidden="true" />
              <p className="scene-hint">点击现场中的档案标记</p>
              {evidence.map((item, index) => (
                <button
                  key={item.id}
                  className={`hotspot hotspot-${index + 1} ${collected.includes(item.id) ? "found" : ""}`}
                  onClick={() => collectEvidence(item)}
                  aria-label={`调查线索：${item.title}`}
                >
                  <span>{collected.includes(item.id) ? "✓" : "+"}</span>
                  <small>{item.title}</small>
                </button>
              ))}
            </div>

            <aside className="evidence-panel">
              <p className="panel-label">证据袋</p>
              <div className="evidence-list">
                {evidence.map((item) => {
                  const isCollected = collected.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      disabled={!isCollected}
                      onClick={() => setOpenEvidence(item)}
                      className={isCollected ? "unlocked" : ""}
                    >
                      <span>{isCollected ? item.mark : "?"}</span>
                      <div><small>{item.eyebrow}</small><strong>{isCollected ? item.title : "尚未发现"}</strong></div>
                    </button>
                  );
                })}
              </div>
              <button
                className="primary-button wide"
                disabled={collected.length < 3}
                onClick={() => setPhase("dialogue")}
              >
                {collected.length < 3 ? `还需 ${3 - collected.length} 条证据` : "前往询问证人"} <b>→</b>
              </button>
            </aside>
          </div>

          {openEvidence && (
            <div className="evidence-modal" role="dialog" aria-modal="true" aria-labelledby="evidence-title">
              <button className="modal-backdrop" onClick={() => setOpenEvidence(null)} aria-label="关闭证据详情" />
              <article>
                <button className="modal-close" onClick={() => setOpenEvidence(null)} aria-label="关闭">×</button>
                <div className="evidence-mark">{openEvidence.mark}</div>
                <p>{openEvidence.eyebrow} · 证据 {openEvidence.number}</p>
                <h3 id="evidence-title">{openEvidence.title}</h3>
                <strong>{openEvidence.short}</strong>
                <span>{openEvidence.detail}</span>
                <button className="text-button" onClick={() => setOpenEvidence(null)}>放入证据袋 ✓</button>
              </article>
            </div>
          )}
        </section>
      )}

      {phase === "dialogue" && (
        <section className="dialogue-screen content-screen screen-enter">
          <div className="scene-heading compact">
            <div>
              <p className="kicker"><span /> 第二幕 · 询问人物</p>
              <h2>同一件事，<br />每个人看见的都不同。</h2>
            </div>
            <div className="evidence-count">
              <strong>{String(heard.length).padStart(2, "0")}</strong>
              <span>/ 03<br />份证词</span>
            </div>
          </div>

          <div className="dialogue-layout">
            <nav className="witness-list" aria-label="选择询问对象">
              {witnesses.map((witness) => (
                <button
                  key={witness.id}
                  className={activeWitness.id === witness.id ? "active" : ""}
                  onClick={() => hearWitness(witness)}
                >
                  <span>{witness.monogram}</span>
                  <div><strong>{witness.name}</strong><small>{witness.role}</small></div>
                  <i>{heard.includes(witness.id) ? "已询问" : "询问"}</i>
                </button>
              ))}
            </nav>

            <article className="testimony-card" key={activeWitness.id}>
              <div className="portrait"><span>{activeWitness.monogram}</span><i /></div>
              <div className="testimony-copy">
                <p><b>{activeWitness.name}</b> · {activeWitness.role}</p>
                <blockquote>“{activeWitness.quote}”</blockquote>
                <div className="analyst-note">
                  <span>档案员提示</span>
                  <p>{activeWitness.note}</p>
                </div>
              </div>
            </article>
          </div>

          <div className="dialogue-footer">
            <p><span>记住：</span>证词不是标准答案，它只是一个人的观察位置。</p>
            <button
              className="primary-button"
              disabled={heard.length < 3}
              onClick={() => setPhase("verdict")}
            >
              {heard.length < 3 ? "听完三份证词" : "整理调查结论"} <b>→</b>
            </button>
          </div>
        </section>
      )}

      {phase === "verdict" && (
        <section className="verdict-screen content-screen screen-enter">
          <div className="verdict-intro">
            <p className="kicker"><span /> 最终研判</p>
            <h2>哪一种解释，<br />能够串起最多证据？</h2>
            <p>历史推理不要求故事最传奇，而要求结论和证据之间的距离最短。</p>
            <div className="mini-evidence-row" aria-label="已经收集的证据">
              {evidence.filter((item) => collected.includes(item.id)).map((item) => (
                <span key={item.id}>{item.mark}<small>{item.title}</small></span>
              ))}
            </div>
          </div>
          <div className="answer-panel">
            <p>请选择你的结案陈词</p>
            {answers.map((item, index) => (
              <button
                key={item.id}
                className={answer === item.id ? "selected" : ""}
                onClick={() => setAnswer(item.id)}
              >
                <span>{String.fromCharCode(65 + index)}</span>
                <strong>{item.label}</strong>
                <i>{answer === item.id ? "✓" : ""}</i>
              </button>
            ))}
            {selectedAnswer && <div className="answer-feedback">{selectedAnswer.feedback}</div>}
            <button
              className="primary-button wide"
              disabled={!answer}
              onClick={() => setPhase("result")}
            >
              提交档案 <b>→</b>
            </button>
          </div>
        </section>
      )}

      {phase === "result" && (
        <section className="result-screen content-screen screen-enter">
          <div className="result-hero">
            <div className="result-score">
              <span>档案完整度</span>
              <strong>{caseScore}</strong>
              <small>/ 100</small>
            </div>
            <div className="result-copy">
              <p className="kicker"><span /> 档案 TS-742 · 已结案</p>
              <h2>{answer === "network" ? "判断成立：这只杯子属于一张网络。" : "档案已收录，但证据还能支持更完整的解释。"}</h2>
              <p>
                最可靠的解释是：器物经过多人、多地的接力来到长安，又在本地被使用、修补和模仿。丝绸之路不是一条从起点直达终点的路，而是一张不断交换商品、技术与观念的网络。
              </p>
              <div className="badges">
                <span>观察者<small>发现 {collected.length} 条器物线索</small></span>
                <span>倾听者<small>比较 3 种人物视角</small></span>
                <span>连接者<small>看见交流背后的网络</small></span>
              </div>
            </div>
          </div>

          <div className="same-year">
            <div className="timeline-heading">
              <p className="kicker"><span /> 世界同一时刻</p>
              <h3>公元 742 年，世界不只有长安。</h3>
            </div>
            <div className="timeline-track">
              {timeline.map((item, index) => (
                <article key={item.place}>
                  <i>{String(index + 1).padStart(2, "0")}</i>
                  <span>{item.place}</span>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="source-note">
            <div>
              <strong>史实与虚构说明</strong>
              <p>长安西市、粟特商旅、外来玻璃器与唐代过所制度均有史料依据；人物、杯子和三站货签为本关游戏化重构。</p>
              <span>
                参考：
                <a href="https://sogdians.si.edu/historic-trade-routes-of-the-sogdians/" target="_blank" rel="noreferrer">史密森尼粟特商路专题</a>
                <a href="https://asia.si.edu/whats-on/exhibitions/center-of-the-world/" target="_blank" rel="noreferrer">美国国立亚洲艺术博物馆长安专题</a>
                <a href="https://museum.mgm.mo/en/audio-guide/silk-roads-beyond-borders/" target="_blank" rel="noreferrer">唐代商人过所资料</a>
              </span>
            </div>
            <button className="secondary-button" onClick={resetCase}>重新调查 ↻</button>
          </div>
        </section>
      )}

      <footer className="global-footer">
        <span>适玩年龄 8–14 岁</span>
        <span>原型版本 0.1</span>
        <span>每一件文物，都是历史留下的问题</span>
      </footer>
    </main>
  );
}
