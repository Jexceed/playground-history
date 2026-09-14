// Pronunciation overrides affect synthesis only; displayed text and voice IDs stay stable.
export function synthesisTextFor(text, entries) {
  const rules = entries.filter(entry => entry.text && entry.synthesisText)
    .sort((a, b) => b.text.length - a.text.length);
  if (!rules.length) return text;
  const replacements = new Map(rules.map(entry => [entry.text, entry.synthesisText]));
  const pattern = new RegExp(rules.map(entry => entry.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gu');
  return text.replace(pattern, match => replacements.get(match));
}
