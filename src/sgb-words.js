// Auto-generated helper: exports the words from sgb-words.txt as a JS array.
// Uses Vite's `?raw` import to keep this file small and in sync with the source list.
import wordsRaw from './sgb-words.txt?raw';

const WORDS = wordsRaw
  .split(/\r?\n/)
  .map((w) => w.trim())
  .filter(Boolean);

export default WORDS;
