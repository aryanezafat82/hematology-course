// scripts/break-sentences.js
// Usage: node scripts/break-sentences.js
//
// Adds a real "\n" after every sentence-ending punctuation (. ! ? ؟)
// in every string field of every card, so RichText renders them on
// separate lines.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSIONS_DIR = path.join(__dirname, '..', 'src', 'data', 'sessions');

/**
 * Insert `\n` after sentence-ending punctuation when it is followed
 * by whitespace and another word.
 *
 * - Persian  : . ؟ ! ،   (we do NOT break after «،» / comma)
 * - English  : . ? !
 * - Avoids breaking inside numbers (e.g. "1.5"), abbreviations (e.g. "t(9;22)")
 *   and code-like sequences.
 */
function breakSentences(text) {
  if (!text || typeof text !== 'string') return text;

  // Skip URLs / email-like strings
  if (/^https?:\/\//.test(text) || text.includes('@') && text.includes('.')) {
    // still safe to run on most, but easier to skip when clearly URL/email
    if (/^https?:\/\//.test(text)) return text;
  }

  let out = text;

  // 1. Normalize existing line breaks: collapse repeated blank lines
  //    (we will re-add them uniformly below).
  out = out.replace(/\r\n/g, '\n');

  // 2. Break after punctuation when followed by a space + non-space,
  //    and not inside a decimal number or "t(9;22)" style.
  //    We match:  [.!?؟]  followed by  one or more spaces  and a non-space.
  //    Reject the match if the char before the punctuation is a digit AND
  //    the char after is a digit (decimal like 1.5).
  out = out.replace(
  /([.!?؟؛;])(\s+)(?=\S)/g,
    (match, punct, spaces, offset, whole) => {
      const before = whole[offset - 1];
      const after = whole[offset + punct.length + spaces.length];
      // decimal like 1.5 → don't break
      if (/[0-9۰-۹]/.test(before) && /[0-9۰-۹]/.test(after)) {
        return punct + spaces;
      }
      // Already has a newline right after? Don't double.
      if (spaces.includes('\n')) return punct + spaces;
      return punct + '\n';
    }
  );

  // 3. Clean: no trailing/leading whitespace per line, no double \n
  out = out
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join('\n');

  return out;
}

function walkCard(card) {
  if (!card || typeof card !== 'object') return;

  const fields = ['title', 'content', 'question', 'answer', 'explanation'];
  for (const f of fields) {
    if (typeof card[f] === 'string') {
      card[f] = breakSentences(card[f]);
    }
  }

  if (Array.isArray(card.options)) {
    card.options = card.options.map(breakSentences);
  }
  if (Array.isArray(card.columns)) {
    card.columns = card.columns.map(breakSentences);
  }
  if (Array.isArray(card.headers)) {
    card.headers = card.headers.map(breakSentences);
  }
  if (Array.isArray(card.rows)) {
    card.rows = card.rows.map((row) =>
      Array.isArray(row)
        ? row.map((cell) => (typeof cell === 'string' ? breakSentences(cell) : cell))
        : row
    );
  }
}

function main() {
  const files = fs
    .readdirSync(SESSIONS_DIR)
    .filter((f) => f.endsWith('.json'));

  console.log(`📂 ${files.length} فایل پیدا شد\n`);

  let totalCards = 0;
  let totalChanges = 0;

  for (const file of files) {
    const full = path.join(SESSIONS_DIR, file);
    const original = fs.readFileSync(full, 'utf8');
    const parsed = JSON.parse(original);
    const session = parsed.session ?? parsed;

    let changed = 0;
    for (const sec of session.sections ?? []) {
      for (const card of sec.cards ?? []) {
        const before = JSON.stringify(card);
        walkCard(card);
        const after = JSON.stringify(card);
        if (before !== after) changed++;
        totalCards++;
      }
    }

    fs.writeFileSync(full, JSON.stringify(parsed, null, 2) + '\n', 'utf8');
    totalChanges += changed;
    console.log(`  ✅ ${file} → ${changed} کارت تغییر کرد`);
  }

  console.log('');
  console.log(`🎉 کل: ${totalCards} کارت بررسی شد، ${totalChanges} کارت تغییر کرد`);
  console.log('');
  console.log('نکته: اگه نتیجه خوب نبود، بکاپ رو برگردون:');
  console.log('  rm -rf src/data/sessions && mv src/data/sessions.bak src/data/sessions');
}

main();