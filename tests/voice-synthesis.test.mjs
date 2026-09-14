import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { synthesisTextFor } from '../scripts/lib/voice-synthesis.mjs';

test('the measuring phrase gets its chosen tones without changing the noun 度量衡', () => {
  const { entries } = JSON.parse(readFileSync(new URL('../content/voice-pronunciations.json', import.meta.url)));
  const text = '秦统一度量衡。小伙伴来量一量，再量一量。';
  assert.equal(synthesisTextFor(text, entries), '秦统一度量衡。小伙伴来良衣良，再良衣良。');
  assert.equal(synthesisTextFor('用尺子测量长度；量器测量容量。', entries), '用尺子测量长度；量器测量容量。');
  const lines = JSON.parse(readFileSync(new URL('../public/audio/voice-lines.json', import.meta.url))).lines;
  for (const line of lines.filter(line => line.text.includes('量一量'))) {
    assert.equal(line.synthesisText, synthesisTextFor(line.text, entries));
    assert.ok(!line.text.includes('良衣良'));
  }
});
