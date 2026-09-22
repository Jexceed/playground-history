export function validateLearningMap(map, focused, sourceIds, glossaryTerms) {
  const ids=new Set(focused.chapters.map(c=>c.id));
  const rows=map.chapters??[];
  if(rows.length!==ids.size||new Set(rows.map(c=>c.id)).size!==ids.size)throw new Error('Learning map must cover every focused chapter exactly once');
  for(const row of rows){
    if(!ids.has(row.id))throw new Error(`Unknown learning chapter: ${row.id}`);
    for(const key of ['theme','learningGoal','parentQuestion','observe','misconception'])if(typeof row[key]!=='string'||!row[key].trim())throw new Error(`${row.id}: missing learning ${key}`);
    if(!row.glossaryTerms?.length||new Set(row.glossaryTerms).size!==row.glossaryTerms.length||row.glossaryTerms.some(term=>!glossaryTerms.has(term)))throw new Error(`${row.id}: invalid curated glossary`);
    if(!row.sourceIds?.length||row.sourceIds.some(id=>!sourceIds.has(id)))throw new Error(`${row.id}: missing learning sources`);
    if(!row.related?.length||row.related.some(link=>!ids.has(link.chapterId)||link.chapterId===row.id||!link.relation?.trim()))throw new Error(`${row.id}: invalid related chapter`);
    if(!row.evidenceStepIds?.length||row.evidenceStepIds.some(id=>!['time','beginning','journey','change','takeaway'].includes(id)))throw new Error(`${row.id}: invalid learning evidence step`);
  }
  return rows.length;
}
