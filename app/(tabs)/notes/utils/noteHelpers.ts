import * as Haptics from 'expo-haptics';
import { formatClock } from '@/utils/time';

export const triggerHaptic = (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
) => {
  try {
    void Haptics.impactAsync(style);
  } catch {
    // Ignored on web/unsupported platforms
  }
};

export const triggerSuccessHaptic = () => {
  try {
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    );
  } catch {
    // Ignored on web/unsupported platforms
  }
};

export const formatNoteDate = (timestamp: number): string => {
  const noteDate = new Date(timestamp);
  const now = new Date();

  // If today
  if (noteDate.toDateString() === now.toDateString()) {
    return formatClock(noteDate);
  }

  // If this year
  if (noteDate.getFullYear() === now.getFullYear()) {
    return noteDate.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  }

  return noteDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  });
};

export const countWords = (text: string): { words: number; chars: number } => {
  const trimmed = text.trim();

  const words = trimmed
    ? trimmed.split(/\s+/).length
    : 0;

  const chars = text.length;
  return { words, chars };
};

/* ------------------------------------------------------------------ */
/* Rich editor content helpers                                        */
/* ------------------------------------------------------------------ */

const HTML_BLOCK_PATTERN =
  /<\/?(p|div|br|h[1-6]|ul|ol|li|blockquote|pre|b|i|u|strong|em|span|code)[\s>/]/i;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/*
 * Inline markdown -> HTML. Code spans are cut out first so their
 * contents are never formatted, then bold / italic / strike are applied
 * outermost-first so nesting such as ***both*** or **bold _italic_** works.
 */
const inlineMarkdownToHtml = (text: string): string => {
  const codeSpans: string[] = [];
  let out = escapeHtml(text).replace(/`([^`]+)`/g, (_match, code: string) => {
    codeSpans.push(`<code>${code}</code>`);
    return `\u0000${codeSpans.length - 1}\u0000`;
  });

  out = out
    .replace(/(\*\*\*|___)(?=\S)([\s\S]*?\S)\1/g, '<strong><em>$2</em></strong>')
    .replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, '<strong>$2</strong>')
    .replace(/(^|[^*\w])\*(?=\S)([^*]*?\S)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/(^|[^_\w])_(?=\S)([^_]*?\S)_(?!\w)/g, '$1<em>$2</em>')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<s>$1</s>');

  return out.replace(/\u0000(\d+)\u0000/g, (_match, index: string) => codeSpans[Number(index)]);
};

/*
 * The editor stores HTML, but templates and older notes are markdown.
 * Converts markdown into the HTML shape react-native-pell-rich-editor
 * produces (div lines, x-todo checklists) so both render correctly.
 * Content that already looks like HTML is returned untouched.
 */
export const toEditorHtml = (content: string): string => {
  if (!content) return '';
  if (HTML_BLOCK_PATTERN.test(content)) return content;

  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  const html: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    // Fenced code block (an empty block still renders as one line).
    if (/^\s*```/.test(line)) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !/^\s*```/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1; // closing fence
      const body = code.length ? escapeHtml(code.join('\n')) : '<br>';
      html.push(`<pre><code>${body}</code></pre>`);
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdownToHtml(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) {
        quote.push(inlineMarkdownToHtml(lines[index].replace(/^\s*>\s?/, '')) || '<br>');
        index += 1;
      }
      html.push(`<blockquote>${quote.join('<br>')}</blockquote>`);
      continue;
    }

    if (/^\s*[-*+]\s+\[[ xX]\]/.test(line)) {
      const items: string[] = [];
      let match: RegExpExecArray | null;
      while (
        index < lines.length &&
        (match = /^\s*[-*+]\s+\[([ xX])\]\s?(.*)$/.exec(lines[index]))
      ) {
        const checked = match[1].toLowerCase() === 'x' ? ' checked' : '';
        items.push(
          `<li><span contenteditable="false" class="x-todo-box"><input type="checkbox"${checked}></span>${
            inlineMarkdownToHtml(match[2]) || '<br>'
          }</li>`,
        );
        index += 1;
      }
      html.push(`<ol class="x-todo">${items.join('')}</ol>`);
      continue;
    }

    const listMatch = /^\s*([-*+]|\d+[.)])\s+/.exec(line);
    if (listMatch) {
      const ordered = /\d/.test(listMatch[1]);
      const itemPattern = ordered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*+]\s+(?!\[[ xX]\])(.*)$/;
      const items: string[] = [];
      let match: RegExpExecArray | null;
      while (index < lines.length && (match = itemPattern.exec(lines[index]))) {
        items.push(`<li>${inlineMarkdownToHtml(match[1]) || '<br>'}</li>`);
        index += 1;
      }
      const tag = ordered ? 'ol' : 'ul';
      html.push(`<${tag}>${items.join('')}</${tag}>`);
      continue;
    }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      html.push('<hr>');
      index += 1;
      continue;
    }

    html.push(`<div>${inlineMarkdownToHtml(line) || '<br>'}</div>`);
    index += 1;
  }

  return html.join('');
};

/* ------------------------------------------------------------------ */
/* Display-only plain text (cards, search, share, task/event text)    */
/* ------------------------------------------------------------------ */

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  bull: '•',
};

/*
 * Decodes entities in a single pass, so "&amp;lt;" becomes the literal
 * text "&lt;" instead of being decoded twice into "<".
 */
const decodeEntities = (text: string): string =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    const key = entity.toLowerCase();
    if (key in NAMED_ENTITIES) return NAMED_ENTITIES[key];
    if (key.startsWith('#')) {
      const code = key.startsWith('#x')
        ? parseInt(key.slice(2), 16)
        : parseInt(key.slice(1), 10);
      if (Number.isFinite(code) && code > 0 && code <= 0x10ffff) {
        return code === 160 ? ' ' : String.fromCodePoint(code);
      }
    }
    return match;
  });

/* Private-use placeholders that survive whitespace collapsing. */
const BLANK_LINE = '';
const LINE_BREAK = '';

const BLOCK_TAG_PATTERN =
  /<\/?(p|div|h[1-6]|ul|ol|li|blockquote|pre|hr|tr|table|section|article|header|footer)\b[^>]*>/gi;

/*
 * Readable plain text of a note for DISPLAY ONLY. Never pass the result
 * back into the editor or save it: the stored note stays rich HTML.
 *
 * Accepts editor HTML, legacy markdown, plain text, null or undefined.
 * Block tags become line breaks; inline tags are removed without adding
 * spaces (so "<b>Hel</b>lo" stays "Hello"); checklist boxes become ☐ / ☑;
 * list items get a bullet. Uses string processing only (no DOM APIs).
 */
export const getNotePlainText = (content?: string | null): string => {
  if (!content || typeof content !== 'string') return '';

  // Editor output can be bare text with entities and no tags ("Tom &amp; Jerry"),
  // so only route content through the markdown converter when it has neither.
  const isHtml = /<[a-z!/][^>]*>/i.test(content) || /&(#x?[0-9a-f]+|[a-z]+);/i.test(content);
  const html = isHtml ? content : toEditorHtml(content);

  const text = html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    // pell checklist item: <li><span class="x-todo-box"><input type="checkbox" [checked]></span>
    .replace(
      /<li[^>]*>\s*<span[^>]*x-todo-box[^>]*>\s*<input([^>]*)>\s*<\/span>/gi,
      (_match, attrs: string) => (/\bchecked\b/i.test(attrs) ? '\n☑ ' : '\n☐ '),
    )
    .replace(/<input\b[^>]*>/gi, (tag) =>
      /type=["']?checkbox/i.test(tag) ? (/\bchecked\b/i.test(tag) ? '☑ ' : '☐ ') : '',
    )
    // An empty paragraph (<div><br></div>) is an intentional blank line.
    .replace(/<(div|p)\b[^>]*>\s*(<br\s*\/?>)?\s*<\/\1>/gi, BLANK_LINE)
    // A trailing <br> right before a block close is just pell's filler.
    .replace(/<br\s*\/?>\s*(?=<\/(div|p|li|h[1-6]|blockquote|pre)>)/gi, '')
    .replace(/<br\s*\/?>/gi, LINE_BREAK)
    .replace(/<li\b[^>]*>/gi, '\n• ')
    .replace(BLOCK_TAG_PATTERN, '\n')
    // Remaining inline tags, then an unterminated tag at the very end.
    .replace(/<[^>]*>/g, '')
    .replace(/<[^>]*$/, '');

  return decodeEntities(text)
    .replace(/ /g, ' ')
    .replace(/[ \t\f\v\r]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '•') // empty list item
    .join('\n')
    // Adjacent block boundaries collapse to one line break; explicit
    // <br> and empty paragraphs are then restored as real line breaks.
    .replace(/\n+/g, '\n')
    .replace(new RegExp(`\\n?${BLANK_LINE}\\n?`, 'g'), '\n\n')
    .replace(new RegExp(LINE_BREAK, 'g'), '\n')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/*
 * Short card preview: plain text without blank lines, truncated on a
 * word boundary. Returns '' when the note has no readable text.
 */
export const getNotePreview = (content?: string | null, maxLen = 120): string => {
  const text = getNotePlainText(content).replace(/\n+/g, '\n');
  if (text.length <= maxLen) return text;

  const cut = text.slice(0, maxLen);
  const lastSpace = cut.search(/\s\S*$/);
  const trimmed = lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed.trim()}…`;
};

/* Single-line plain text, used for word counts and empty checks in the editor. */
export const htmlToPlainText = (content: string): string =>
  getNotePlainText(content).replace(/\s+/g, ' ').trim();

/* ------------------------------------------------------------------ */
/* Theme colour helpers (derive from theme values, never hardcode)    */
/* ------------------------------------------------------------------ */

const parseHex = (hex: string): [number, number, number] | null => {
  const match = /^#?([0-9a-f]{6})/i.exec(hex.trim());
  if (!match) return null;
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const toHex = (channels: number[]): string =>
  `#${channels
    .map((channel) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, '0'))
    .join('')}`;

/* Appends an alpha channel to a #RRGGBB colour. */
export const withAlpha = (hex: string, alpha: number): string => {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  return `${toHex(rgb)}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
};

/* Darkens a #RRGGBB colour by scaling each channel (factor 0–1). */
export const shadeHex = (hex: string, factor: number): string => {
  const rgb = parseHex(hex);
  return rgb ? toHex(rgb.map((channel) => channel * factor)) : hex;
};

/* True when a #RRGGBB background is light (relative luminance > 0.5). */
export const isLightColor = (hex: string): boolean => {
  const rgb = parseHex(hex);
  if (!rgb) return false;
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5;
};
