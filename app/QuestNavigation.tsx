import "./quest-navigation.css";

export function ReturnToRiverButton({ onClick, className = "", panelReturn = false }: { onClick: () => void; className?: string; panelReturn?: boolean }) {
  return <button className={`return-to-river ${className}`} data-panel-return={panelReturn || undefined} onClick={onClick}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/></svg>
    <span>回到时间河</span>
  </button>;
}

export function QuestNavigation({ title, steps, activeIndex, completedStepIds, onSelect }: {
  title: string;
  steps: { id: string; title: string }[];
  activeIndex: number;
  completedStepIds: string[];
  onSelect: (index: number) => void;
}) {
  return <nav className="quest-stage-navigation" aria-label="故事阶段，可自由选择">
    <span className="quest-stage-title"><span aria-hidden="true">🔎</span>{title}</span>
    <div className="quest-stage-progress"><ol>{steps.map((step, index) => {
      const done = completedStepIds.includes(step.id);
      return <li key={step.id}><button
        className={done ? "completed" : ""}
        aria-current={index === activeIndex ? "step" : undefined}
        aria-label={`第${index + 1}步：${step.title}${done ? "，已完成" : ""}`}
        title={step.title}
        onClick={() => onSelect(index)}
      ><span className="quest-stage-pill" aria-hidden="true"/></button></li>;
    })}</ol><span className="quest-stage-caption">{activeIndex<steps.length?`第${activeIndex+1}步`:'完成啦'}</span></div>
  </nav>;
}
