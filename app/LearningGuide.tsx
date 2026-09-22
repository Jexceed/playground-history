export type LearningGuideData = {
  id: string;
  theme: string;
  learningGoal: string;
  parentQuestion: string;
  observe: string;
  misconception: string;
  sourceIds: string[];
  related: Array<{chapterId:string;relation:string}>;
};

export function LearningGuide({guide,related,onOpen}:{guide:LearningGuideData;related:Array<{id:string;title:string}>;onOpen:(id:string)=>void}) {
  return <section className="review-learning-guide" aria-label="本章学习目标与理解观察">
    <p className="eyebrow">{guide.theme} · 本章想理解的历史关系</p>
    <h2>{guide.learningGoal}</h2>
    <p><strong>可以这样问：</strong>{guide.parentQuestion}</p>
    <p><strong>留意孩子怎样回应：</strong>{guide.observe}</p>
    <p className="review-learning-boundary"><strong>容易混淆：</strong>{guide.misconception}</p>
    <small>可以指图、做动作或用自己的话说。先留时间让孩子尝试，再给提示；是否给过提示要分开记录，完成标记不代表已经理解。</small>
    {guide.related.map(item=>{const target=related.find(c=>c.id===item.chapterId);return target?<div className="review-related-chapter" key={item.chapterId}><p>{item.relation}</p><button onClick={()=>onOpen(item.chapterId)}>关联故事：{target.title} →</button></div>:null;})}
  </section>;
}
