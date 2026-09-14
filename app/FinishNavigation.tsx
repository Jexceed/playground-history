"use client";

import "./finish-navigation.css";

type Props = { onHome: () => void; onReplay: () => void };

function FinishIcon({ replay = false }: { replay?: boolean }) {
  return <svg className="finish-navigation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {replay ? <><path d="M4 5v5h5"/><path d="M4.5 10a8 8 0 1 1 1 7"/></> : <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/></>}
  </svg>;
}

export function FinishNavigation({ onHome, onReplay }: Props) {
  return <div className="finish-navigation" role="group" aria-label="本章结束后的选择">
    <button type="button" className="finish-navigation-button finish-navigation-home" onClick={onHome}>
      <span className="finish-navigation-content"><FinishIcon/><span className="finish-navigation-label">返回时间河</span></span>
    </button>
    <button type="button" className="finish-navigation-button finish-navigation-replay" onClick={onReplay}>
      <span className="finish-navigation-content"><FinishIcon replay/><span className="finish-navigation-label">再玩本章</span></span>
    </button>
  </div>;
}
