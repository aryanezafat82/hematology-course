/**
 * Renders text with lightweight inline markup:
 *   **bold**       → <strong>
 *   ==highlight==  → rose
 *   ++success++    → emerald
 *   @@warning@@    → amber
 *   \n             → <br>
 *   \n\n           → new paragraph (only in block mode)
 *
 * Props:
 *   text  — string
 *   className — optional
 *   as    — 'div' (default, block with paragraphs) | 'span' (inline, for titles)
 */
const MARKER_RE =
  /(\*\*[^*\n]+\*\*|==[^=\n]+==|\+\+[^+\n]+\+\+|@@[^@\n]+@@|\n)/g;

function renderToken(part, key) {
  if (part === '\n') return <br key={key} />;

  if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
    return (
      <strong key={key} className="font-bold">
        {part.slice(2, -2)}
      </strong>
    );
  }

  if (part.startsWith('==') && part.endsWith('==') && part.length > 4) {
    return (
      <span
        key={key}
        className="rounded bg-rose-50 px-1 font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
      >
        {part.slice(2, -2)}
      </span>
    );
  }

  if (part.startsWith('++') && part.endsWith('++') && part.length > 4) {
    return (
      <span
        key={key}
        className="font-semibold text-emerald-700 dark:text-emerald-400"
      >
        {part.slice(2, -2)}
      </span>
    );
  }

  if (part.startsWith('@@') && part.endsWith('@@') && part.length > 4) {
    return (
      <span
        key={key}
        className="font-semibold text-amber-700 dark:text-amber-400"
      >
        {part.slice(2, -2)}
      </span>
    );
  }

  return <span key={key}>{part}</span>;
}

export default function RichText({ text, className = '', as = 'div' }) {
  if (!text || typeof text !== 'string') return null;

  // Inline mode: no paragraph wrapping, no outer <div>.
  if (as === 'span' || as === 'p') {
    const Tag = as;
    const tokens = text.split(MARKER_RE).filter((t) => t !== '');
    return (
      <Tag className={className}>
        {tokens.map((t, j) => renderToken(t, j))}
      </Tag>
    );
  }

  // Block mode (default): split on blank lines, wrap each in <p>.
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className={className}>
      {paragraphs.map((para, i) => {
        const tokens = para.split(MARKER_RE).filter((t) => t !== '');
        return (
          <p key={i} className={i > 0 ? 'mt-3' : ''}>
            {tokens.map((t, j) => renderToken(t, j))}
          </p>
        );
      })}
    </div>
  );
}