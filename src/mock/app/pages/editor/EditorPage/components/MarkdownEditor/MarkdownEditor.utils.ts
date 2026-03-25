import { BLOCK_PATTERNS } from "./MarkdownEditor.constants";
import type { Block, BlockType } from "./MarkdownEditor.type";

// ─── ID ────────────────────────────────────────────────────────────────────────

export const generateId = (): string => crypto.randomUUID();

// ─── Block Detection ───────────────────────────────────────────────────────────

export const detectBlockType = (raw: string): BlockType => {
  for (const { pattern, type } of BLOCK_PATTERNS) {
    if (pattern.test(raw)) return type;
  }
  return "paragraph";
};

export const getIndent = (raw: string): number => {
  const match = raw.match(/^(\s+)/);
  if (!match) return 0;
  return Math.floor(match[1].length / 2);
};

export const isTableRow = (line: string): boolean =>
  /^\|.+\|$/.test(line.trim());

// ─── Markdown Parsing ──────────────────────────────────────────────────────────

export const parseMarkdown = (text: string): Block[] => {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block: ``` ~ ```
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      const raw = "```" + lang + "\n" + codeLines.join("\n") + "\n```";
      blocks.push({
        id: generateId(),
        type: "code",
        raw,
        indent: 0,
      });
    } else if (isTableRow(line)) {
      const tableLines: string[] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push({
        id: generateId(),
        type: "table",
        raw: tableLines.join("\n"),
        indent: 0,
      });
    } else {
      blocks.push({
        id: generateId(),
        type: detectBlockType(line.trim()),
        raw: line,
        indent: getIndent(line),
      });
      i++;
    }
  }

  return blocks;
};

export const blocksToMarkdown = (blocks: Block[]): string => {
  return blocks.map(b => b.raw).join("\n");
};

// ─── HTML / XSS Helpers ────────────────────────────────────────────────────────

export const sanitizeUrl = (url: string): string => {
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("/")
  ) {
    return trimmed;
  }
  return "";
};

export const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

// ─── Inline Formatting ─────────────────────────────────────────────────────────

export const applyInlineFormatting = (text: string): string => {
  return (
    text
      // code (must come before bold/italic)
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      // bold
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      // italic
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      // strikethrough
      .replace(/~~([^~]+)~~/g, "<del>$1</del>")
      // highlight
      .replace(/==([^=]+)==/g, '<mark class="inline-highlight">$1</mark>')
      // note link [[Note #N|title]]
      .replace(/\[\[Note #(\d+)\|([^\]]*)\]\]/g, (_match, num, title) => {
        return `<a href="#note-${num}" class="note-link" data-note="${num}">📝 ${title || `Note #${num}`}</a>`;
      })
      // note link [[Note #N]] (without title)
      .replace(/\[\[Note #(\d+)\]\]/g, (_match, num) => {
        return `<a href="#note-${num}" class="note-link" data-note="${num}">📝 Note #${num}</a>`;
      })
      // image ![alt](src)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
        const safe = sanitizeUrl(src);
        if (!safe) return alt || "image";
        const escapedSrc = safe.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
        const escapedAlt = (alt || "image")
          .replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        return `<img src="${escapedSrc}" alt="${escapedAlt}" class="inline-image" />`;
      })
      // link (with URL sanitization + attribute escaping)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
        const safe = sanitizeUrl(url);
        if (!safe) return label;
        const escapedUrl = safe
          .replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        const escapedLabel = label
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        return `<a href="${escapedUrl}" class="inline-link">${escapedLabel}</a>`;
      })
  );
};

export const htmlToMarkdownInline = (html: string): string => {
  // 중첩 태그 처리를 위해 내부에 다른 태그를 허용 (.*? non-greedy)
  // 안쪽부터 바깥으로 반복 적용하여 중첩 해소
  let result = html;
  // 최대 3회 반복하여 중첩된 서식 해소
  for (let i = 0; i < 3; i++) {
    const prev = result;
    result = result
      .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
      .replace(/<em>(.*?)<\/em>/g, "*$1*")
      .replace(/<del>(.*?)<\/del>/g, "~~$1~~")
      .replace(/<mark[^>]*>(.*?)<\/mark>/g, "==$1==");
    if (result === prev) break;
  }
  return (
    result
      .replace(/<code[^>]*>([^<]*)<\/code>/g, "`$1`")
      .replace(
        /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/g,
        "![$2]($1)",
      )
      // note link → [[Note #N|title]]
      .replace(/<a[^>]*data-note="(\d+)"[^>]*>[^<]*<\/a>/g, (_, num) => {
        // Try to extract title from the visible text
        const titleMatch = _.match(/>📝\s*(.+?)<\/a>/);
        const title = titleMatch ? titleMatch[1] : "";
        const isDefault = title === `Note #${num}`;
        return isDefault ? `[[Note #${num}]]` : `[[Note #${num}|${title}]]`;
      })
      .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/g, "[$2]($1)")
      .replace(/<br\s*\/?>/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\u00A0/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
  );
};

// ─── Block Display ─────────────────────────────────────────────────────────────

export const getDisplayText = (block: Block): string => {
  // indent 공백을 제거하되 trim으로 후행 공백까지 없애지 않음
  const raw = block.raw
    .replace(/^\s{0,}/, s => {
      const indentSpaces = block.indent * 2;
      return s.length >= indentSpaces ? s.slice(indentSpaces) : "";
    })
    .trim();
  switch (block.type) {
    case "h1":
      return raw.replace(/^# /, "");
    case "h2":
      return raw.replace(/^## /, "");
    case "h3":
      return raw.replace(/^### /, "");
    case "ul":
      return raw.replace(/^[-*] /, "");
    case "ol":
      return raw.replace(/^\d+\. /, "");
    case "todo":
      return raw.replace(/^- \[[x ]\] /i, "");
    case "blockquote":
      return raw.replace(/^> /, "");
    case "callout":
      return raw.replace(/^> \[!callout\] /i, "");
    case "toggle":
      return raw.replace(/^> \[!toggle\] /i, "");
    case "code": {
      // 멀티라인 코드블록: ```lang\n...\n``` → 내용만 추출
      const codeLines = block.raw.split("\n");
      if (codeLines.length >= 2) {
        return codeLines
          .slice(
            1,
            codeLines[codeLines.length - 1].trim() === "```" ? -1 : undefined,
          )
          .join("\n");
      }
      return raw.replace(/^```/, "").replace(/```$/, "");
    }
    case "table":
      return raw;
    default:
      return raw;
  }
};

export const getBlockClassName = (block: Block): string => {
  const baseClasses = "w-full bg-transparent outline-none break-words";

  switch (block.type) {
    case "h1":
      return `${baseClasses} text-[3.6rem] font-extrabold leading-tight text-on-surface`;
    case "h2":
      return `${baseClasses} text-[2.8rem] font-bold leading-snug text-on-surface`;
    case "h3":
      return `${baseClasses} text-[2.2rem] font-semibold leading-snug text-on-surface`;
    case "ul":
      return `${baseClasses} text-[2rem] leading-relaxed text-on-surface/90`;
    case "ol":
      return `${baseClasses} text-[2rem] leading-relaxed text-on-surface/90`;
    case "blockquote":
      return `${baseClasses} border-l-4 border-primary/30 pl-[1.6rem] text-[2rem] leading-relaxed text-on-surface-variant italic`;
    case "todo":
      return `${baseClasses} text-[2rem] leading-relaxed text-on-surface/90`;
    case "callout":
      return `${baseClasses} text-[2rem] leading-relaxed text-on-surface/90`;
    case "toggle":
      return `${baseClasses} text-[2rem] leading-relaxed text-on-surface/90`;
    case "code":
      return `${baseClasses} rounded-[0.5rem] bg-surface-container-low p-[1.6rem] font-mono text-[1.4rem] leading-relaxed text-secondary`;
    default:
      return `${baseClasses} text-[2rem] leading-relaxed text-on-surface/90`;
  }
};

// ─── Caret / Offset Helpers ────────────────────────────────────────────────────

export const mapVisibleToMarkdownOffset = (
  mdText: string,
  visibleOffset: number,
): number => {
  // Strip markdown syntax to get visible text, then map offset back
  const visible = mdText
    .replace(/\[\[Note #(\d+)\|([^\]]*)\]\]/g, "📝 $2")
    .replace(/\[\[Note #(\d+)\]\]/g, "📝 Note #$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/==([^=]+)==/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  if (visibleOffset >= visible.length) return mdText.length;
  if (visibleOffset <= 0) return 0;

  // Walk through markdown text, counting visible characters
  let mdIdx = 0;
  let visIdx = 0;
  while (mdIdx < mdText.length && visIdx < visibleOffset) {
    // Check for markdown patterns at current position
    const remaining = mdText.slice(mdIdx);
    let matched = false;
    // 각 패턴: [regex, visibleFn, skipEntireMatch?]
    // note link는 전체 매치를 skip (내부 오프셋 계산 불가)
    const patterns: [RegExp, (m: RegExpMatchArray) => string, boolean][] = [
      [/^\[\[Note #(\d+)\|([^\]]*)\]\]/, m => `📝 ${m[2]}`, true],
      [/^\[\[Note #(\d+)\]\]/, m => `📝 Note #${m[1]}`, true],
      [/^\*\*([^*]+)\*\*/, m => m[1], false],
      [/^\*([^*]+)\*/, m => m[1], false],
      [/^~~([^~]+)~~/, m => m[1], false],
      [/^==([^=]+)==/, m => m[1], false],
      [/^`([^`]+)`/, m => m[1], false],
      [/^\[([^\]]+)\]\([^)]+\)/, m => m[1], false],
    ];
    for (const [pattern, groupFn, skipEntire] of patterns) {
      const match = remaining.match(pattern);
      if (match) {
        const visiblePart = groupFn(match);
        const charsNeeded = visibleOffset - visIdx;
        if (charsNeeded <= visiblePart.length) {
          if (skipEntire) {
            // note link 등: visible offset에 매핑 불가 → 매치 끝으로 이동
            return mdIdx + match[0].length;
          }
          const prefixLen = match[0].indexOf(visiblePart);
          return mdIdx + prefixLen + charsNeeded;
        }
        visIdx += visiblePart.length;
        mdIdx += match[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      visIdx++;
      mdIdx++;
    }
  }
  return mdIdx;
};

export const toggleMarkup = (
  text: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string,
): { text: string; newStart: number; newEnd: number } => {
  const selected = text.slice(start, end);
  // Check if already wrapped
  const wrappedStart = start - prefix.length;
  const wrappedEnd = end + suffix.length;
  if (
    wrappedStart >= 0 &&
    wrappedEnd <= text.length &&
    text.slice(wrappedStart, start) === prefix &&
    text.slice(end, wrappedEnd) === suffix
  ) {
    // Unwrap
    return {
      text: text.slice(0, wrappedStart) + selected + text.slice(wrappedEnd),
      newStart: wrappedStart,
      newEnd: wrappedStart + selected.length,
    };
  }
  // Wrap
  return {
    text: text.slice(0, start) + prefix + selected + suffix + text.slice(end),
    newStart: start + prefix.length,
    newEnd: end + prefix.length,
  };
};

// ─── Table Markdown Generation ─────────────────────────────────────────────────

export const generateTableMarkdown = (rows: number, cols: number): string[] => {
  const colNames = Array.from({ length: cols }, (_, i) => ` Column ${i + 1} `);
  const header = `|${colNames.join("|")}|`;
  const separator = `|${Array.from({ length: cols }, () => " --- ").join("|")}|`;
  const dataRow = `|${Array.from({ length: cols }, () => "  ").join("|")}|`;
  // rows includes header row, so data rows = rows - 1
  const dataRows = Array.from({ length: Math.max(1, rows - 1) }, () => dataRow);
  return [header, separator, ...dataRows];
};
