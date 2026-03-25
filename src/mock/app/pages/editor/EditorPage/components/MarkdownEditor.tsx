import { memo, useCallback, useEffect, useRef, useState } from "react";

type BlockType =
  | "h1"
  | "h2"
  | "h3"
  | "ul"
  | "ol"
  | "blockquote"
  | "code"
  | "hr"
  | "table"
  | "todo"
  | "callout"
  | "toggle"
  | "paragraph";

interface Block {
  id: string;
  type: BlockType;
  raw: string;
  indent: number;
}

interface NoteLinkItem {
  note_number: number;
  title: string | null;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onNoteClick?: (noteNumber: number) => void;
  notes?: NoteLinkItem[];
}

const generateId = () => crypto.randomUUID();

const BLOCK_PATTERNS: { pattern: RegExp; type: BlockType }[] = [
  { pattern: /^- \[[x ]\] /i, type: "todo" },
  { pattern: /^### /, type: "h3" },
  { pattern: /^## /, type: "h2" },
  { pattern: /^# /, type: "h1" },
  { pattern: /^[-*] /, type: "ul" },
  { pattern: /^\d+\. /, type: "ol" },
  { pattern: /^> \[!callout\] /i, type: "callout" },
  { pattern: /^> \[!toggle\] /i, type: "toggle" },
  { pattern: /^> /, type: "blockquote" },
  { pattern: /^```/, type: "code" },
  { pattern: /^---$/, type: "hr" },
];

const detectBlockType = (raw: string): BlockType => {
  for (const { pattern, type } of BLOCK_PATTERNS) {
    if (pattern.test(raw)) return type;
  }
  return "paragraph";
};

const getIndent = (raw: string): number => {
  const match = raw.match(/^(\s+)/);
  if (!match) return 0;
  return Math.floor(match[1].length / 2);
};

const isTableRow = (line: string): boolean => /^\|.+\|$/.test(line.trim());

const parseMarkdown = (text: string): Block[] => {
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

const blocksToMarkdown = (blocks: Block[]): string => {
  return blocks.map(b => b.raw).join("\n");
};

const sanitizeUrl = (url: string): string => {
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("/")) {
    return trimmed;
  }
  return "";
};

const applyInlineFormatting = (text: string): string => {
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
        const escapedAlt = (alt || "image").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<img src="${escapedSrc}" alt="${escapedAlt}" class="inline-image" />`;
      })
      // link (with URL sanitization + attribute escaping)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
        const safe = sanitizeUrl(url);
        if (!safe) return label;
        const escapedUrl = safe.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const escapedLabel = label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<a href="${escapedUrl}" class="inline-link">${escapedLabel}</a>`;
      })
  );
};

const getDisplayText = (block: Block): string => {
  // indent 공백을 제거하되 trim으로 후행 공백까지 없애지 않음
  const raw = block.raw.replace(/^\s{0,}/, s => {
    const indentSpaces = block.indent * 2;
    return s.length >= indentSpaces ? s.slice(indentSpaces) : "";
  }).trim();
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
        return codeLines.slice(1, codeLines[codeLines.length - 1].trim() === "```" ? -1 : undefined).join("\n");
      }
      return raw.replace(/^```/, "").replace(/```$/, "");
    }
    case "table":
      return raw;
    default:
      return raw;
  }
};

const getBlockClassName = (block: Block): string => {
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

const BLOCK_PREFIX: Partial<Record<BlockType, string>> = {
  h1: "# ",
  h2: "## ",
  h3: "### ",
  ul: "- ",
  ol: "1. ",
  blockquote: "> ",
  code: "```",
  todo: "- [ ] ",
  callout: "> [!callout] ",
  toggle: "> [!toggle] ",
};

// ─── Slash Command Types ───────────────────────────────────────────────────────

interface SlashCommand {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  { id: "table", label: "Table", icon: "⊞", description: "Insert a table" },
  { id: "h1", label: "Heading 1", icon: "H₁", description: "Large heading" },
  { id: "h2", label: "Heading 2", icon: "H₂", description: "Medium heading" },
  { id: "h3", label: "Heading 3", icon: "H₃", description: "Small heading" },
  { id: "ul", label: "Bullet List", icon: "•", description: "Unordered list" },
  { id: "ol", label: "Numbered List", icon: "1.", description: "Ordered list" },
  { id: "todo", label: "To-do", icon: "☐", description: "Checkbox item" },
  { id: "blockquote", label: "Quote", icon: "❝", description: "Quote block" },
  { id: "callout", label: "Callout", icon: "💡", description: "Callout block" },
  { id: "toggle", label: "Toggle", icon: "▶", description: "Collapsible block" },
  { id: "code", label: "Code Block", icon: "</>", description: "Code block" },
  { id: "hr", label: "Divider", icon: "—", description: "Horizontal rule" },
];

// ─── Table Grid Picker ─────────────────────────────────────────────────────────

interface TableGridPickerProps {
  onSelect: (rows: number, cols: number) => void;
}

const TableGridPicker = ({ onSelect }: TableGridPickerProps) => {
  const [hovered, setHovered] = useState<{ rows: number; cols: number }>({ rows: 0, cols: 0 });
  const MAX_ROWS = 6;
  const MAX_COLS = 6;

  return (
    <div className="p-[1.2rem]">
      <div
        className="grid gap-[0.3rem]"
        style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)` }}>
        {Array.from({ length: MAX_ROWS }, (_, rowIdx) =>
          Array.from({ length: MAX_COLS }, (_, colIdx) => {
            const row = rowIdx + 1;
            const col = colIdx + 1;
            const isSelected = row <= hovered.rows && col <= hovered.cols;
            return (
              <div
                key={`${row}-${col}`}
                className={`h-[2.4rem] w-[2.4rem] cursor-pointer rounded-[0.2rem] border transition-colors ${
                  isSelected
                    ? "border-primary/50 bg-primary/30"
                    : "border-outline-variant/20 bg-surface-container hover:bg-surface-container-high"
                }`}
                onMouseEnter={() => setHovered({ rows: row, cols: col })}
                onMouseLeave={() => setHovered({ rows: 0, cols: 0 })}
                onClick={() => onSelect(row, col)}
              />
            );
          }),
        )}
      </div>
      <div className="mt-[0.8rem] text-center text-[1.2rem] text-on-surface-variant/70">
        {hovered.rows > 0 && hovered.cols > 0
          ? `${hovered.rows} × ${hovered.cols}`
          : "Hover to select size"}
      </div>
    </div>
  );
};

// ─── Slash Command Menu ────────────────────────────────────────────────────────

interface SlashMenuProps {
  filter: string;
  selectedIndex: number;
  position: { top: number; left: number };
  onSelect: (commandId: string) => void;
  onTableSelect: (rows: number, cols: number) => void;
}

const SlashMenu = ({ filter, selectedIndex, position, onSelect, onTableSelect }: SlashMenuProps) => {
  const filtered = SLASH_COMMANDS.filter(cmd =>
    cmd.label.toLowerCase().includes(filter.toLowerCase()),
  );

  const [showTablePicker, setShowTablePicker] = useState(false);

  const handleSelect = (commandId: string) => {
    if (commandId === "table") {
      setShowTablePicker(true);
    } else {
      onSelect(commandId);
    }
  };

  const handleTableSelect = (rows: number, cols: number) => {
    setShowTablePicker(false);
    onTableSelect(rows, cols);
  };

  if (filtered.length === 0) return null;

  return (
    <div
      className="absolute z-50 min-w-[22rem] overflow-hidden rounded-[0.5rem] border border-outline-variant/10 bg-surface-container-highest shadow-xl"
      style={{ top: position.top, left: position.left }}>
      {showTablePicker ? (
        <TableGridPicker onSelect={handleTableSelect} />
      ) : (
        <div className="py-[0.4rem]">
          {filtered.map((cmd, idx) => (
            <div
              key={cmd.id}
              className={`flex cursor-pointer items-center gap-[1.2rem] px-[1.6rem] py-[1rem] transition-colors ${
                idx === selectedIndex
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface hover:bg-surface-container"
              }`}
              onMouseDown={e => {
                e.preventDefault();
                handleSelect(cmd.id);
              }}>
              <span className="w-[2rem] text-center text-[1.4rem] font-medium">{cmd.icon}</span>
              <div>
                <div className="text-[1.4rem] font-medium leading-tight">{cmd.label}</div>
                <div className="text-[1.2rem] text-on-surface-variant/60">{cmd.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Block Editor ──────────────────────────────────────────────────────────────

const parseTableRows = (raw: string): string[][] => {
  return raw.split("\n").map(row =>
    row
      .trim()
      .replace(/^\||\|$/g, "")
      .split("|")
      .map(cell => cell.replace(/^ | $/g, "")),
  );
};

const isSeparatorRow = (cells: string[]): boolean =>
  cells.every(cell => /^-{2,}$/.test(cell.trim()));

const rebuildTableRaw = (allRows: string[][]): string =>
  allRows.map(r => `| ${r.join(" | ")} |`).join("\n");

const TableBlock = ({
  block,
  onChange,
}: {
  block: Block;
  onChange: (raw: string) => void;
}) => {
  const rows = parseTableRows(block.raw);
  const headerRow = rows[0] ?? [];
  const separatorIdx = rows.findIndex(r => isSeparatorRow(r));
  const dataRows = separatorIdx >= 0 ? rows.slice(separatorIdx + 1) : rows.slice(1);
  const colCount = headerRow.length;

  // Column resize: store per-column width overrides (colIdx -> pct)
  const [colWidthOverrides, setColWidthOverrides] = useState<Record<number, number>>({});
  const resizeRef = useRef<{ colIdx: number; startX: number; startWidth: number } | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const colWidths = Array.from({ length: colCount }, (_, i) =>
    colWidthOverrides[i] ?? Math.floor(100 / colCount),
  );

  // Cleanup resize listeners on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const handleResizeStart = (colIdx: number, e: React.MouseEvent) => {
    e.preventDefault();
    const tableEl = (e.target as HTMLElement).closest("table");
    if (!tableEl) return;
    const tableWidth = tableEl.clientWidth;
    const startWidth = (colWidths[colIdx] / 100) * tableWidth;
    resizeRef.current = { colIdx, startX: e.clientX, startWidth };

    const onMouseMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const delta = ev.clientX - resizeRef.current.startX;
      const newPx = Math.max(40, resizeRef.current.startWidth + delta);
      const newPct = Math.round((newPx / tableWidth) * 100);
      if (resizeRef.current) {
        setColWidthOverrides(prev => ({ ...prev, [resizeRef.current!.colIdx]: newPct }));
      }
    };

    const cleanup = () => {
      resizeRef.current = null;
      cleanupRef.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseUp = () => cleanup();

    cleanupRef.current = cleanup;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    const allRows = parseTableRows(block.raw);
    const targetIdx = separatorIdx >= 0 ? rowIdx + separatorIdx + 1 : rowIdx + 1;
    if (rowIdx === -1) {
      allRows[0][colIdx] = value;
    } else if (allRows[targetIdx]) {
      allRows[targetIdx][colIdx] = value;
    }
    onChange(rebuildTableRaw(allRows));
  };

  const addRow = () => {
    const allRows = parseTableRows(block.raw);
    allRows.push(Array(colCount).fill(""));
    onChange(rebuildTableRaw(allRows));
  };

  const removeRow = () => {
    const allRows = parseTableRows(block.raw);
    const lastDataIdx = allRows.length - 1;
    if (lastDataIdx <= (separatorIdx >= 0 ? separatorIdx + 1 : 1)) return;
    allRows.splice(lastDataIdx, 1);
    onChange(rebuildTableRaw(allRows));
  };

  const addColumn = () => {
    const allRows = parseTableRows(block.raw);
    allRows.forEach((row, i) => {
      row.push(isSeparatorRow(row) ? "---" : i === 0 ? `Column ${row.length + 1}` : "");
    });
    setColWidthOverrides({});
    onChange(rebuildTableRaw(allRows));
  };

  const removeColumn = () => {
    const allRows = parseTableRows(block.raw);
    if (allRows[0].length <= 1) return;
    allRows.forEach(row => row.pop());
    setColWidthOverrides({});
    onChange(rebuildTableRaw(allRows));
  };

  return (
    <div className="group/table my-[0.8rem]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            {colWidths.map((w, i) => (
              <col
                key={i}
                style={{ width: `${w}%` }}
              />
            ))}
          </colgroup>
          <thead>
            <tr>
              {headerRow.map((cell, ci) => (
                <th
                  key={ci}
                  className="relative border border-outline-variant/20 bg-surface-container px-[1.2rem] py-[0.8rem] text-left text-[1.4rem] font-semibold text-on-surface">
                  <input
                    type="text"
                    value={cell}
                    onChange={e => handleCellChange(-1, ci, e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
                  {ci < colCount - 1 && (
                    <div
                      className="absolute top-0 right-[-0.3rem] h-full w-[0.6rem] cursor-col-resize hover:bg-primary/30"
                      onMouseDown={e => handleResizeStart(ci, e)}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => (
              <tr key={ri}>
                {Array.from({ length: colCount }, (_, ci) => (
                  <td
                    key={ci}
                    className="border border-outline-variant/20 px-[1.2rem] py-[0.8rem] text-[1.4rem] text-on-surface/90">
                    <input
                      type="text"
                      value={row[ci] ?? ""}
                      onChange={e => handleCellChange(ri, ci, e.target.value)}
                      className="w-full bg-transparent outline-none"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Row/Column controls */}
      <div className="mt-[0.6rem] flex items-center gap-[0.8rem] opacity-0 transition-opacity group-hover/table:opacity-100">
        <button
          type="button"
          onClick={addRow}
          className="rounded-[0.25rem] border border-outline-variant/20 px-[1rem] py-[0.3rem] text-[1.1rem] text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface">
          + Row
        </button>
        <button
          type="button"
          onClick={removeRow}
          disabled={dataRows.length <= 1}
          className="rounded-[0.25rem] border border-outline-variant/20 px-[1rem] py-[0.3rem] text-[1.1rem] text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error disabled:opacity-30">
          − Row
        </button>
        <div className="h-[1.4rem] w-px bg-outline-variant/20" />
        <button
          type="button"
          onClick={addColumn}
          className="rounded-[0.25rem] border border-outline-variant/20 px-[1rem] py-[0.3rem] text-[1.1rem] text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface">
          + Column
        </button>
        <button
          type="button"
          onClick={removeColumn}
          disabled={colCount <= 1}
          className="rounded-[0.25rem] border border-outline-variant/20 px-[1rem] py-[0.3rem] text-[1.1rem] text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error disabled:opacity-30">
          − Column
        </button>
        <div className="ml-auto text-[1rem] text-outline">
          {dataRows.length} × {colCount}
        </div>
      </div>
    </div>
  );
};

interface BlockEditorProps {
  block: Block;
  isFocused: boolean;
  onFocus: () => void;
  onChange: (raw: string) => void;
  onEnter: (caretOffset: number, currentText?: string) => void;
  onBackspace: (isEmpty: boolean, atStart: boolean) => void;
  onDelete: () => void;
  onTab: (shift: boolean) => void;
  onArrowUp: () => void;
  onArrowDown: () => void;
  onSlashInput: (filter: string, anchorEl: HTMLDivElement) => void;
  onSlashClose: () => void;
  isSlashOpen: boolean;
  onSlashArrowUp: () => void;
  onSlashArrowDown: () => void;
  onSlashEnter: () => void;
  onNoteLinkInput: (filter: string, anchorEl: HTMLDivElement) => void;
  onNoteLinkClose: () => void;
  isNoteLinkOpen: boolean;
  onNoteLinkArrowUp: () => void;
  onNoteLinkArrowDown: () => void;
  onNoteLinkEnter: () => void;
  onPaste: (lines: string[]) => void;
  onToggle?: (blockId: string) => void;
  isToggleOpenProp?: boolean;
  editorRef: (el: HTMLDivElement | null) => void;
}

// ─── Toggle Block ─────────────────────────────────────────────────────────────

// ToggleBlock은 제목만 렌더링. 하위 내용은 indent된 일반 블록으로 관리됨.

const BlockEditorInner = ({
  block,
  isFocused,
  onFocus,
  onChange,
  onEnter,
  onBackspace,
  onTab,
  onArrowUp,
  onArrowDown,
  onSlashInput,
  onSlashClose,
  isSlashOpen,
  onSlashArrowUp,
  onSlashArrowDown,
  onSlashEnter,
  onNoteLinkInput,
  onNoteLinkClose,
  isNoteLinkOpen,
  onNoteLinkArrowUp,
  onNoteLinkArrowDown,
  onNoteLinkEnter,
  onPaste,
  onToggle,
  isToggleOpenProp,
  editorRef,
}: BlockEditorProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      (divRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      editorRef(el);
    },
    [editorRef],
  );

  const displayText = getDisplayText(block);
  const prevTypeRef = useRef(block.type);

  // Sync rendered HTML when block changes (DOM-only update, no setState)
  // 한글 IME 조합 중에는 절대 DOM을 건드리지 않음
  const blockRef = useRef(block);
  const displayTextRef = useRef(displayText);
  blockRef.current = block;
  displayTextRef.current = displayText;

  useEffect(() => {
    if (isComposing.current) return; // IME 조합 중 → skip
    const el = divRef.current;
    if (!el || block.type === "table" || block.type === "code") return;
    const typeChanged = prevTypeRef.current !== block.type;
    prevTypeRef.current = block.type;

    // focused 상태에서는 type 변경 시에만 sync
    if (!isFocused || typeChanged) {
      const escaped = escapeHtml(displayText);
      const html = block.type === "hr" ? "" : applyInlineFormatting(escaped);
      if (el.innerHTML !== html) {
        el.innerHTML = html;
        if (isFocused && typeChanged) {
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(el);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }
    }
  }, [block.type, displayText, isFocused]);

  const handleFocus = () => {
    onFocus();
  };

  const handleBlur = () => {
    const el = divRef.current;
    if (!el) return;
    const rawText = htmlToMarkdownInline(el.innerHTML.replace(/&nbsp;/g, " ")).replace(/\u00A0/g, " ");
    const escaped = escapeHtml(rawText);
    const html = block.type === "hr" ? "" : block.type === "code" ? escaped : applyInlineFormatting(escaped);
    if (el.innerHTML !== html) {
      el.innerHTML = html;
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    // HTML에서 이미지 추출 → 마크다운 이미지로 변환
    const html = e.clipboardData.getData("text/html");
    let text = e.clipboardData.getData("text/plain").replace(/\u00A0/g, " ");

    if (html) {
      // <img> 태그를 마크다운 이미지로 변환하여 text에 삽입
      const imgRegex = /<img[^>]*src="([^"]*)"[^>]*(?:alt="([^"]*)")?[^>]*\/?>/gi;
      const images: string[] = [];
      let match;
      while ((match = imgRegex.exec(html)) !== null) {
        const src = sanitizeUrl(match[1]);
        if (!src) continue;
        // 마크다운 특수문자 이스케이프
        const alt = (match[2] ?? "image").replace(/[[\]()]/g, "\\$&");
        images.push(`![${alt}](${src})`);
      }
      if (images.length > 0 && !text.trim()) {
        // 텍스트 없이 이미지만 붙여넣기
        text = images.join("\n");
      } else if (images.length > 0) {
        // 텍스트 + 이미지: 이미지를 텍스트 끝에 추가
        text = text + "\n" + images.join("\n");
      }
    }

    let lines = text.split("\n");
    if (lines.length > 1 && lines[lines.length - 1] === "") {
      lines = lines.slice(0, -1);
    }
    if (lines.length <= 1) {
      document.execCommand("insertText", false, lines[0] ?? "");
      return;
    }
    onPaste(lines);
  };

  const getSlashFilter = (el: HTMLDivElement): string | null => {
    const text = el.textContent ?? "";
    const slashIdx = text.lastIndexOf("/");
    if (slashIdx === -1) return null;
    // Only trigger slash menu at the beginning of a block (nothing before slash, or only whitespace)
    const before = text.slice(0, slashIdx);
    if (before.trim() !== "") return null;
    return text.slice(slashIdx + 1);
  };

  const handleInput = () => {
    if (isComposing.current) {
      return;
    }
    const el = divRef.current;
    if (!el) return;

    const html = el.innerHTML.replace(/&nbsp;/g, " ");
    const text = htmlToMarkdownInline(html).replace(/\u00A0/g, " ");
    let prefix = BLOCK_PREFIX[block.type] ?? "";
    // todo: checked 상태 유지
    if (block.type === "todo") {
      prefix = block.raw.trim().match(/^- \[x\] /i) ? "- [x] " : "- [ ] ";
    }
    const indent = "  ".repeat(block.indent);
    onChange(indent + prefix + text);

    // Slash command detection
    const filter = getSlashFilter(el);
    if (filter !== null) {
      onSlashInput(filter, el);
    } else {
      onSlashClose();
    }

    // [[ note link detection
    const plainText = el.textContent ?? "";
    const bracketIdx = plainText.lastIndexOf("[[");
    if (bracketIdx !== -1 && !plainText.slice(bracketIdx).includes("]]")) {
      const noteLinkFilter = plainText.slice(bracketIdx + 2);
      onNoteLinkInput(noteLinkFilter, el);
    } else {
      onNoteLinkClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isComposing.current) return;

    // When slash menu is open, intercept navigation keys
    if (isSlashOpen) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onSlashArrowUp();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        onSlashArrowDown();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        onSlashEnter();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onSlashClose();
        return;
      }
    }

    // Note link menu navigation
    if (isNoteLinkOpen) {
      if (e.key === "ArrowUp") { e.preventDefault(); onNoteLinkArrowUp(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); onNoteLinkArrowDown(); return; }
      if (e.key === "Enter") { e.preventDefault(); onNoteLinkEnter(); return; }
      if (e.key === "Escape") { e.preventDefault(); onNoteLinkClose(); return; }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const el = divRef.current;
      if (!el) return;
      const text = htmlToMarkdownInline(el.innerHTML);
      const sel = window.getSelection();
      let offset = text.length;
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const preRange = range.cloneRange();
        preRange.selectNodeContents(el);
        preRange.setEnd(range.startContainer, range.startOffset);
        const visibleOffset = preRange.toString().length;
        offset = mapVisibleToMarkdownOffset(text, visibleOffset);
      }
      onEnter(offset, text);
      return;
    }

    if (e.key === "Backspace" || e.key === "Delete") {
      const el = divRef.current;
      if (!el) return;
      const sel = window.getSelection();
      // If text is selected (not collapsed), let browser handle deletion
      if (sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed) {
        return;
      }
      const text = el.textContent ?? "";
      const isEmpty = text.length === 0;
      let atStart = isEmpty;
      if (!isEmpty && sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const preRange = range.cloneRange();
        preRange.selectNodeContents(el);
        preRange.setEnd(range.startContainer, range.startOffset);
        atStart = preRange.toString().length === 0;
      }
      if (atStart && e.key === "Backspace") {
        e.preventDefault();
        onBackspace(isEmpty, atStart);
      }
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      onTab(e.shiftKey);
      return;
    }

    if (e.key === "ArrowUp") {
      const el = divRef.current;
      if (!el) return;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const preRange = range.cloneRange();
        preRange.selectNodeContents(el);
        preRange.setEnd(range.startContainer, range.startOffset);
        const offset = preRange.toString().length;
        if (offset === 0) {
          e.preventDefault();
          onArrowUp();
        }
      }
      return;
    }

    if (e.key === "ArrowDown") {
      const el = divRef.current;
      if (!el) return;
      const text = el.textContent ?? "";
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const preRange = range.cloneRange();
        preRange.selectNodeContents(el);
        preRange.setEnd(range.startContainer, range.startOffset);
        const offset = preRange.toString().length;
        if (offset >= text.length) {
          e.preventDefault();
          onArrowDown();
        }
      }
      return;
    }

    // ─── Format shortcuts ──────────────────────────────────────────────────────
    const isMod = e.metaKey || e.ctrlKey;
    if (isMod && block.type !== "code") {
      const formatMap: Record<string, [string, string]> = {
        b: ["**", "**"],
        i: ["*", "*"],
        e: ["`", "`"],
      };

      // Ctrl+Shift+S → strikethrough, Ctrl+Shift+H → highlight
      if (e.shiftKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        applyFormat("~~", "~~");
        return;
      }
      if (e.shiftKey && (e.key === "h" || e.key === "H")) {
        e.preventDefault();
        applyFormat("==", "==");
        return;
      }

      const fmt = formatMap[e.key.toLowerCase()];
      if (fmt) {
        e.preventDefault();
        applyFormat(fmt[0], fmt[1]);
        return;
      }

      // Ctrl+K → link
      if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        applyFormat("[", "](url)");
        return;
      }
    }
  };

  const applyFormat = (prefix: string, suffix: string) => {
    const el = divRef.current;
    if (!el) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;

    // Get visible selection offsets
    const preRange = range.cloneRange();
    preRange.selectNodeContents(el);
    preRange.setEnd(range.startContainer, range.startOffset);
    const visStart = preRange.toString().length;
    const visEnd = visStart + range.toString().length;

    // Convert to markdown offsets
    const text = htmlToMarkdownInline(el.innerHTML);
    const mdStart = mapVisibleToMarkdownOffset(text, visStart);
    const mdEnd = mapVisibleToMarkdownOffset(text, visEnd);

    const result = toggleMarkup(text, mdStart, mdEnd, prefix, suffix);

    const blockPrefix = BLOCK_PREFIX[block.type] ?? "";
    if (block.type === "todo") {
      const todoPrefix = block.raw.trim().match(/^- \[x\] /i) ? "- [x] " : "- [ ] ";
      onChange("  ".repeat(block.indent) + todoPrefix + result.text);
    } else {
      onChange("  ".repeat(block.indent) + blockPrefix + result.text);
    }
  };

  if (block.type === "table") {
    return (
      <TableBlock
        block={block}
        onChange={onChange}
      />
    );
  }

  if (block.type === "code") {
    const codeLines = block.raw.split("\n");
    const lang = codeLines[0]?.replace(/^```/, "").trim() || "";
    const codeContent = codeLines.slice(1, codeLines[codeLines.length - 1]?.trim() === "```" ? -1 : undefined).join("\n");

    return (
      <div className="group/code my-[0.8rem] overflow-hidden rounded-[0.5rem] bg-surface-container-low">
        {/* Header */}
        <div className="flex items-center justify-between bg-surface-container px-[1.6rem] py-[0.6rem]">
          <input
            type="text"
            value={lang}
            onChange={e => {
              const newLang = e.target.value;
              const bodyLines = codeLines.slice(1, codeLines[codeLines.length - 1]?.trim() === "```" ? -1 : undefined);
              onChange("```" + newLang + "\n" + bodyLines.join("\n") + "\n```");
            }}
            placeholder="language"
            className="bg-transparent text-[1.1rem] font-mono text-on-surface-variant/60 outline-none placeholder:text-on-surface-variant/30"
          />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(codeContent);
            }}
            className="text-[1rem] text-on-surface-variant/40 opacity-0 transition-opacity hover:text-on-surface-variant group-hover/code:opacity-100">
            Copy
          </button>
        </div>
        {/* Code Area */}
        <textarea
          value={codeContent}
          onChange={e => {
            onChange("```" + lang + "\n" + e.target.value + "\n```");
          }}
          onKeyDown={e => {
            if (e.key === "Tab") {
              e.preventDefault();
              const target = e.currentTarget;
              const start = target.selectionStart;
              const end = target.selectionEnd;
              const value = target.value;
              const newValue = value.substring(0, start) + "  " + value.substring(end);
              onChange("```" + lang + "\n" + newValue + "\n```");
              requestAnimationFrame(() => {
                target.selectionStart = target.selectionEnd = start + 2;
              });
            }
          }}
          spellCheck={false}
          className="w-full resize-none bg-transparent px-[1.6rem] py-[1.2rem] font-mono text-[1.4rem] leading-relaxed text-secondary outline-none"
          style={{ fieldSizing: "content", minHeight: "4rem" } as React.CSSProperties}
        />
      </div>
    );
  }

  if (block.type === "hr") {
    return (
      <div className="py-[0.8rem]">
        <hr className="border-outline-variant/20" />
      </div>
    );
  }

  if (block.type === "ul" || block.type === "ol") {
    return (
      <div
        className="flex items-baseline gap-[0.8rem]">
        <span className="flex-shrink-0 select-none text-[2rem] leading-relaxed text-on-surface/60">
          {block.type === "ul" ? "•" : "1."}
        </span>
        <div
          ref={setRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCompositionStart={() => {
            isComposing.current = true;
          }}
          onCompositionEnd={() => {
            isComposing.current = false;
            requestAnimationFrame(() => handleInput());
          }}
          className="min-w-0 flex-1 bg-transparent text-[2rem] leading-relaxed text-on-surface/90 outline-none"
        />
      </div>
    );
  }

  if (block.type === "todo") {
    const isChecked = /^- \[x\] /i.test(block.raw.trim());
    return (
      <div
        className="flex items-baseline gap-[0.8rem]">
        <button
          type="button"
          onMouseDown={e => {
            e.preventDefault();
            const newRaw = isChecked
              ? block.raw.replace(/^(\s*)- \[x\] /i, "$1- [ ] ")
              : block.raw.replace(/^(\s*)- \[ \] /, "$1- [x] ");
            onChange(newRaw);
          }}
          className={`flex-shrink-0 mt-[0.4rem] h-[2rem] w-[2rem] rounded-[0.25rem] border-2 transition-colors ${
            isChecked
              ? "border-primary bg-primary"
              : "border-on-surface-variant/30 hover:border-primary"
          }`}>
          {isChecked && (
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-on-primary, #fff)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div
          ref={setRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCompositionStart={() => { isComposing.current = true; }}
          onCompositionEnd={() => {
            isComposing.current = false;
            // 한글 IME: 브라우저가 DOM을 최종 업데이트한 후 처리
            requestAnimationFrame(() => handleInput());
          }}
          className={`min-w-0 flex-1 bg-transparent text-[2rem] leading-relaxed outline-none ${
            isChecked ? "text-on-surface/40 line-through" : "text-on-surface/90"
          }`}
        />
      </div>
    );
  }

  if (block.type === "callout") {
    return (
      <div className="my-[0.8rem] flex gap-[1.2rem] rounded-[0.5rem] bg-primary/5 border border-primary/10 p-[1.6rem]">
        <span className="flex-shrink-0 text-[2rem] select-none">💡</span>
        <div
          ref={setRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCompositionStart={() => { isComposing.current = true; }}
          onCompositionEnd={() => {
            isComposing.current = false;
            // 한글 IME: 브라우저가 DOM을 최종 업데이트한 후 처리
            requestAnimationFrame(() => handleInput());
          }}
          className="min-w-0 flex-1 bg-transparent text-[2rem] leading-relaxed text-on-surface/90 outline-none"
        />
      </div>
    );
  }

  if (block.type === "toggle") {
    const isToggleOpen = onToggle ? isToggleOpenProp : false;
    return (
      <div className="flex items-baseline gap-[0.8rem]">
        <button
          type="button"
          onMouseDown={e => {
            e.preventDefault();
            onToggle?.(block.id);
          }}
          className="flex-shrink-0 mt-[0.2rem] text-[1.6rem] text-on-surface-variant/50 transition-transform hover:text-on-surface-variant"
          style={{ transform: isToggleOpen ? "rotate(90deg)" : "rotate(0deg)" }}>
          ▶
        </button>
        <div
          ref={setRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCompositionStart={() => { isComposing.current = true; }}
          onCompositionEnd={() => {
            isComposing.current = false;
            // 한글 IME: 브라우저가 DOM을 최종 업데이트한 후 처리
            requestAnimationFrame(() => handleInput());
          }}
          className="min-w-0 flex-1 bg-transparent text-[2rem] font-medium leading-relaxed text-on-surface/90 outline-none"
        />
      </div>
    );
  }

  return (
    <div
      ref={setRef}
      contentEditable
      suppressContentEditableWarning
      onFocus={handleFocus}
      onBlur={handleBlur}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onCompositionStart={() => {
        isComposing.current = true;
      }}
      onCompositionEnd={() => {
        isComposing.current = false;
        requestAnimationFrame(() => handleInput());
      }}
      className={getBlockClassName(block)}
    />
  );
};

const BlockEditor = memo(BlockEditorInner);

// ─── Pure helper functions ─────────────────────────────────────────────────────

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

const mapVisibleToMarkdownOffset = (mdText: string, visibleOffset: number): number => {
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
      [/^\[\[Note #(\d+)\|([^\]]*)\]\]/, (m) => `📝 ${m[2]}`, true],
      [/^\[\[Note #(\d+)\]\]/, (m) => `📝 Note #${m[1]}`, true],
      [/^\*\*([^*]+)\*\*/, (m) => m[1], false],
      [/^\*([^*]+)\*/, (m) => m[1], false],
      [/^~~([^~]+)~~/, (m) => m[1], false],
      [/^==([^=]+)==/, (m) => m[1], false],
      [/^`([^`]+)`/, (m) => m[1], false],
      [/^\[([^\]]+)\]\([^)]+\)/, (m) => m[1], false],
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

const toggleMarkup = (
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

const htmlToMarkdownInline = (html: string): string => {
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
  return result
    .replace(/<code[^>]*>([^<]*)<\/code>/g, "`$1`")
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/g, "![$2]($1)")
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
    .replace(/&quot;/g, '"');
};

const generateTableMarkdown = (rows: number, cols: number): string[] => {
  const colNames = Array.from({ length: cols }, (_, i) => ` Column ${i + 1} `);
  const header = `|${colNames.join("|")}|`;
  const separator = `|${Array.from({ length: cols }, () => " --- ").join("|")}|`;
  const dataRow = `|${Array.from({ length: cols }, () => "  ").join("|")}|`;
  // rows includes header row, so data rows = rows - 1
  const dataRows = Array.from({ length: Math.max(1, rows - 1) }, () => dataRow);
  return [header, separator, ...dataRows];
};

// ─── Markdown Editor ──────────────────────────────────────────────────────────

interface SlashMenuState {
  open: boolean;
  filter: string;
  selectedIndex: number;
  blockIndex: number;
  position: { top: number; left: number };
}

const SLASH_MENU_INITIAL: SlashMenuState = {
  open: false,
  filter: "",
  selectedIndex: 0,
  blockIndex: -1,
  position: { top: 0, left: 0 },
};

const MarkdownEditor = ({ value, onChange, placeholder = "Start writing...", onNoteClick, notes: notesList = [] }: MarkdownEditorProps) => {
  // Initial blocks are derived from `value` once on mount.
  // For external value resets (e.g. note switching), pass a new `key` to this component
  // so it remounts and re-initializes state cleanly.
  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (!value || value.trim() === "") {
      return [{ id: generateId(), type: "paragraph" as BlockType, raw: "", indent: 0 }];
    }
    return parseMarkdown(value);
  });
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pendingFocusIndex = useRef<number | null>(null);
  // -1 = start, -2 = end, >= 0 = specific visible character offset
  const pendingFocusOffset = useRef<number>(-1);

  // ─── Undo / Redo ────────────────────────────────────────────────────────────
  const historyRef = useRef<{ stack: Block[][]; index: number }>(undefined!);
  if (!historyRef.current) {
    historyRef.current = { stack: [blocks], index: 0 };
  }
  const isUndoRedoRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushHistory = useCallback((newBlocks: Block[]) => {
    if (isUndoRedoRef.current) return;

    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      const history = historyRef.current;
      // Discard redo stack
      history.stack = history.stack.slice(0, history.index + 1);
      history.stack.push(newBlocks);
      // Limit to 50 entries
      if (history.stack.length > 50) {
        history.stack.shift();
      }
      history.index = history.stack.length - 1;
    }, 300);
  }, []);

  const [slashMenu, setSlashMenu] = useState<SlashMenuState>(SLASH_MENU_INITIAL);
  const [dragState, setDragState] = useState<{ dragging: number; over: number }>({ dragging: -1, over: -1 });
  const [selectedBlocks, setSelectedBlocks] = useState<Set<number>>(new Set());
  const [collapsedToggles, setCollapsedToggles] = useState<Set<string>>(new Set());

  const handleToggle = useCallback((blockId: string) => {
    setCollapsedToggles(prev => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      return next;
    });
  }, []);
  const [noteLinkMenu, setNoteLinkMenu] = useState<{
    open: boolean;
    filter: string;
    selectedIndex: number;
    blockIndex: number;
    position: { top: number; left: number };
  }>({ open: false, filter: "", selectedIndex: 0, blockIndex: -1, position: { top: 0, left: 0 } });

  // Focus pending block after render
  useEffect(() => {
    const idx = pendingFocusIndex.current;
    if (idx === null) return;
    pendingFocusIndex.current = null;
    const el = blockRefs.current[idx];
    if (!el) return;
    el.focus();
    const offset = pendingFocusOffset.current;
    pendingFocusOffset.current = -1;

    const range = document.createRange();
    const sel = window.getSelection();

    if (offset === -2) {
      // End of text
      range.selectNodeContents(el);
      range.collapse(false);
    } else if (offset > 0) {
      // Specific character offset — walk text nodes
      let remaining = offset;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const len = node.textContent?.length ?? 0;
        if (remaining <= len) {
          range.setStart(node, remaining);
          range.collapse(true);
          break;
        }
        remaining -= len;
        node = walker.nextNode();
      }
      if (!node) {
        range.selectNodeContents(el);
        range.collapse(false);
      }
    } else {
      // Start of text
      range.selectNodeContents(el);
      range.collapse(true);
    }
    sel?.removeAllRanges();
    sel?.addRange(range);
  });

  const notifyChange = useCallback(
    (newBlocks: Block[]) => {
      onChange(blocksToMarkdown(newBlocks));
      pushHistory(newBlocks);
    },
    [onChange, pushHistory],
  );

  const handleBlockChange = useCallback(
    (index: number, raw: string) => {
      setBlocks(prev => {
        const updated = prev.map((b, i) => {
          if (i !== index) return b;
          // Table blocks keep their type (multi-line raw with \n)
          const newType = b.type === "table" ? "table" : detectBlockType(raw.trim());
          return { ...b, raw, type: newType };
        });
        notifyChange(updated);
        return updated;
      });
    },
    [notifyChange],
  );

  const handleEnter = useCallback(
    (index: number, caretOffset: number, currentText?: string) => {
      setBlocks(prev => {
        const block = prev[index];
        // currentText가 있으면 DOM의 최신 텍스트 사용 (stale block.raw 방지)
        const displayText = currentText ?? getDisplayText(block);
        const before = displayText.slice(0, caretOffset);
        const after = displayText.slice(caretOffset);

        const prefix = BLOCK_PREFIX[block.type] ?? "";
        const indent = "  ".repeat(block.indent);

        // Update current block
        const updatedCurrent: Block = { ...block, raw: indent + prefix + before };

        // Empty list/todo item -> convert to paragraph (no new block)
        if ((block.type === "ul" || block.type === "ol" || block.type === "todo") && before.trim() === "") {
          const converted: Block = { ...block, type: "paragraph", raw: "", indent: 0 };
          const updated = prev.map((b, i) => (i === index ? converted : b));
          pendingFocusIndex.current = index;
          pendingFocusOffset.current = -1;
          notifyChange(updated);
          return updated;
        }

        // New block: for list/todo items, continue; otherwise paragraph
        let newRaw: string;
        let newType: BlockType;
        if (block.type === "ul") {
          newRaw = indent + "- " + after;
          newType = "ul";
        } else if (block.type === "ol") {
          newRaw = indent + "1. " + after;
          newType = "ol";
        } else if (block.type === "todo") {
          newRaw = indent + "- [ ] " + after;
          newType = "todo";
        } else if (block.type === "toggle") {
          // 토글에서 Enter → indent된 paragraph 생성 + 토글 열기
          newRaw = "  " + after;
          newType = detectBlockType(after.trim());
          setCollapsedToggles(prev => {
            const next = new Set(prev);
            next.delete(block.id);
            return next;
          });
        } else {
          newRaw = after;
          newType = detectBlockType(after.trim());
        }

        const newBlock: Block = {
          id: generateId(),
          type: newType,
          raw: newRaw,
          indent: block.type === "toggle" ? block.indent + 1 : block.indent,
        };

        const updated = [
          ...prev.slice(0, index),
          updatedCurrent,
          newBlock,
          ...prev.slice(index + 1),
        ];

        pendingFocusIndex.current = index + 1;
        pendingFocusOffset.current = -1;
        notifyChange(updated);
        return updated;
      });
    },
    [notifyChange],
  );

  const handleBackspace = useCallback(
    (index: number, isEmpty: boolean, atStart: boolean) => {
      if (!atStart || index === 0) return;
      setBlocks(prev => {
        const current = prev[index];
        const prevBlock = prev[index - 1];

        // If current block has a type and is empty, convert to paragraph
        if (isEmpty && current.type !== "paragraph") {
          const updated = prev.map((b, i) =>
            i === index ? { ...b, type: "paragraph" as BlockType, raw: "" } : b,
          );
          pendingFocusIndex.current = index;
          notifyChange(updated);
          return updated;
        }

        // Merge with previous block
        const prevDisplay = getDisplayText(prevBlock);
        const currentDisplay = getDisplayText(current);
        const mergedRaw =
          prevBlock.raw.trimEnd() + currentDisplay;
        const mergeOffset = prevDisplay
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/\*([^*]+)\*/g, "$1")
          .replace(/~~([^~]+)~~/g, "$1")
          .replace(/`([^`]+)`/g, "$1")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .length;

        const updated = prev
          .map((b, i) => (i === index - 1 ? { ...b, raw: mergedRaw } : b))
          .filter((_, i) => i !== index);

        pendingFocusIndex.current = index - 1;
        pendingFocusOffset.current = mergeOffset > 0 ? mergeOffset : -1;
        notifyChange(updated);
        return updated;
      });
    },
    [notifyChange],
  );

  const handleTab = useCallback(
    (index: number, shift: boolean) => {
      setBlocks(prev => {
        const block = prev[index];
        const newIndent = shift ? Math.max(0, block.indent - 1) : block.indent + 1;
        const oldIndentStr = "  ".repeat(block.indent);
        const newIndentStr = "  ".repeat(newIndent);
        const newRaw = block.raw.startsWith(oldIndentStr)
          ? newIndentStr + block.raw.slice(oldIndentStr.length)
          : newIndentStr + block.raw;
        const updated = prev.map((b, i) =>
          i === index ? { ...b, indent: newIndent, raw: newRaw } : b,
        );
        pendingFocusIndex.current = index;
        pendingFocusOffset.current = -2;
        notifyChange(updated);
        return updated;
      });
    },
    [notifyChange],
  );

  const handleArrowUp = useCallback((index: number) => {
    if (index <= 0) return;
    const el = blockRefs.current[index - 1];
    if (!el) return;
    el.focus();
    // 캐럿을 끝으로
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, []);

  const handleArrowDown = useCallback((index: number) => {
    const el = blockRefs.current[index + 1];
    if (!el) return;
    el.focus();
    // 캐럿을 처음으로
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, []);

  const handlePasteMultiline = useCallback(
    (index: number, lines: string[]) => {
      setBlocks(prev => {
        const currentBlock = prev[index];
        const el = blockRefs.current[index];

        // 현재 블록의 캐럿 위치에서 텍스트 분할
        let beforeCaret = getDisplayText(currentBlock);
        let afterCaret = "";
        if (el) {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const preRange = range.cloneRange();
            preRange.selectNodeContents(el);
            preRange.setEnd(range.startContainer, range.startOffset);
            const caretPos = preRange.toString().length;
            const fullText = getDisplayText(currentBlock);
            beforeCaret = fullText.slice(0, caretPos);
            afterCaret = fullText.slice(caretPos);
          }
        }

        const prefix = BLOCK_PREFIX[currentBlock.type] ?? "";
        const indent = "  ".repeat(currentBlock.indent);

        // 첫 번째 줄: 현재 블록의 커서 앞 텍스트 + 첫 번째 줄
        const firstLine = beforeCaret + lines[0];
        const updatedCurrent: Block = {
          ...currentBlock,
          raw: indent + prefix + firstLine,
          type: detectBlockType((indent + prefix + firstLine).trim()),
        };

        // 중간 + 마지막 줄을 parseMarkdown으로 파싱 (테이블/코드블록 그룹핑)
        const remainingText = lines.slice(1, -1).join("\n");
        const lastLineRaw = (lines[lines.length - 1] ?? "") + afterCaret;
        const fullPasteText = remainingText ? remainingText + "\n" + lastLineRaw : lastLineRaw;
        const parsedBlocks = parseMarkdown(fullPasteText);

        // 마지막 파싱 블록의 raw에 afterCaret가 포함되어 있음
        const newBlocks = parsedBlocks.slice(0, -1);
        const lastBlock = parsedBlocks[parsedBlocks.length - 1] ?? {
          id: generateId(),
          type: "paragraph" as BlockType,
          raw: lastLineRaw,
          indent: 0,
        };

        const result = [
          ...prev.slice(0, index),
          updatedCurrent,
          ...newBlocks,
          lastBlock,
          ...prev.slice(index + 1),
        ];

        // 마지막 붙여넣기 블록에 포커스
        const focusIdx = index + newBlocks.length + 1;
        pendingFocusIndex.current = focusIdx;
        pendingFocusOffset.current = -2; // 끝으로

        notifyChange(result);
        return result;
      });
    },
    [notifyChange],
  );

  // ─── Slash Command Handlers ────────────────────────────────────────────────

  const handleSlashInput = useCallback(
    (index: number, filter: string, anchorEl: HTMLDivElement) => {
      const rect = anchorEl.getBoundingClientRect();
      const containerRect = anchorEl.closest(".markdown-editor-root")?.getBoundingClientRect();
      const top = containerRect
        ? rect.bottom - containerRect.top + 4
        : rect.bottom + 4;
      const left = containerRect
        ? rect.left - containerRect.left
        : rect.left;

      setSlashMenu({
        open: true,
        filter,
        selectedIndex: 0,
        blockIndex: index,
        position: { top, left },
      });
    },
    [],
  );

  const handleSlashClose = useCallback(() => {
    setSlashMenu(SLASH_MENU_INITIAL);
  }, []);

  const handleSlashArrowUp = useCallback(() => {
    setSlashMenu(prev => {
      const filtered = SLASH_COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(prev.filter.toLowerCase()),
      );
      if (filtered.length === 0) return prev;
      const next = (prev.selectedIndex - 1 + filtered.length) % filtered.length;
      return { ...prev, selectedIndex: next };
    });
  }, []);

  const handleSlashArrowDown = useCallback(() => {
    setSlashMenu(prev => {
      const filtered = SLASH_COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(prev.filter.toLowerCase()),
      );
      if (filtered.length === 0) return prev;
      const next = (prev.selectedIndex + 1) % filtered.length;
      return { ...prev, selectedIndex: next };
    });
  }, []);

  const applySlashCommand = useCallback(
    (commandId: string, blockIndex: number) => {
      const el = blockRefs.current[blockIndex];

      // Clear the slash + filter text from the DOM element
      if (el) {
        const text = el.textContent ?? "";
        const slashIdx = text.lastIndexOf("/");
        const cleaned = slashIdx !== -1 ? text.slice(0, slashIdx) : text;
        el.textContent = cleaned;
      }

      const prefixMap: Record<string, string> = {
        h1: "# ",
        h2: "## ",
        h3: "### ",
        ul: "- ",
        ol: "1. ",
        todo: "- [ ] ",
        blockquote: "> ",
        callout: "> [!callout] ",
        toggle: "> [!toggle] ",
        code: "```",
        hr: "---",
      };

      const newPrefix = prefixMap[commandId] ?? "";

      setBlocks(prev => {
        const block = prev[blockIndex];
        const displayText = getDisplayText(block);
        const slashIdx = displayText.lastIndexOf("/");
        const textBefore = slashIdx !== -1 ? displayText.slice(0, slashIdx) : displayText;

        // 코드블록은 멀티라인 블록으로 생성
        if (commandId === "code") {
          const newBlock: Block = {
            ...block,
            raw: "```\n" + textBefore + "\n```",
            type: "code",
          };
          const updated = prev.map((b, i) => (i === blockIndex ? newBlock : b));
          notifyChange(updated);
          return updated;
        }

        const newRaw = newPrefix + textBefore;
        const newType = detectBlockType(newRaw.trim()) || ("paragraph" as BlockType);

        const updated = prev.map((b, i) =>
          i === blockIndex ? { ...b, raw: newRaw, type: newType } : b,
        );
        pendingFocusIndex.current = blockIndex;
        pendingFocusOffset.current = -2;
        notifyChange(updated);
        return updated;
      });

      setSlashMenu(SLASH_MENU_INITIAL);
    },
    [notifyChange],
  );

  const applyTableCommand = useCallback(
    (rows: number, cols: number, blockIndex: number) => {
      const tableLines = generateTableMarkdown(rows, cols);

      setBlocks(prev => {
        const block = prev[blockIndex];
        // Get text before slash to preserve it
        const displayText = getDisplayText(block);
        const slashIdx = displayText.lastIndexOf("/");
        const textBefore = slashIdx !== -1 ? displayText.slice(0, slashIdx) : displayText;

        // If there's text before the slash, keep it as a paragraph; otherwise replace the block
        const newBlocks: Block[] = [];

        if (textBefore.trim() !== "") {
          newBlocks.push({ ...block, raw: textBefore, type: "paragraph" });
        }

        newBlocks.push({
          id: generateId(),
          type: "table",
          raw: tableLines.join("\n"),
          indent: 0,
        });

        const before = prev.slice(0, blockIndex);
        const after = prev.slice(blockIndex + 1);
        const updated = [...before, ...newBlocks, ...after];

        pendingFocusIndex.current = before.length + newBlocks.length - 1;
        pendingFocusOffset.current = -2;
        notifyChange(updated);
        return updated;
      });

      setSlashMenu(SLASH_MENU_INITIAL);
    },
    [notifyChange],
  );

  const handleSlashEnter = useCallback(() => {
    const filtered = SLASH_COMMANDS.filter(cmd =>
      cmd.label.toLowerCase().includes(slashMenu.filter.toLowerCase()),
    );
    const selected = filtered[slashMenu.selectedIndex];
    if (!selected) return;

    if (selected.id === "table") {
      // Table requires grid picker — open it via menu's internal state
      // We re-open the menu signaling table mode via a special filter value
      // Instead, we directly open table picker by calling applyTableCommand with default 3x3
      // But the spec says show grid picker. We handle this by keeping the menu open
      // and letting the SlashMenu component show the TableGridPicker.
      // We trigger "table" select on the menu via a ref approach.
      // Simplest: just apply a 3x3 default on Enter, grid picker available via mouse.
      applyTableCommand(3, 3, slashMenu.blockIndex);
    } else {
      applySlashCommand(selected.id, slashMenu.blockIndex);
    }
  }, [slashMenu, applySlashCommand, applyTableCommand]);

  // Trim stale refs when blocks shrink
  useEffect(() => {
    blockRefs.current.length = blocks.length;
  }, [blocks.length]);

  const isEmpty = blocks.length === 0 || (blocks.length === 1 && blocks[0].raw.trim() === "");

  // ─── Note Link Menu Handlers ──────────────────────────────────────────────

  const handleNoteLinkInput = useCallback(
    (index: number, filter: string, anchorEl: HTMLDivElement) => {
      const rect = anchorEl.getBoundingClientRect();
      const containerRect = anchorEl.closest(".markdown-editor-root")?.getBoundingClientRect();
      const top = containerRect ? rect.bottom - containerRect.top + 4 : rect.bottom + 4;
      const left = containerRect ? rect.left - containerRect.left : rect.left;
      setNoteLinkMenu({ open: true, filter, selectedIndex: 0, blockIndex: index, position: { top, left } });
    },
    [],
  );

  const handleNoteLinkClose = useCallback(() => {
    setNoteLinkMenu(prev => (prev.open ? { ...prev, open: false } : prev));
  }, []);

  const handleNoteLinkArrowUp = useCallback(() => {
    setNoteLinkMenu(prev => ({ ...prev, selectedIndex: Math.max(0, prev.selectedIndex - 1) }));
  }, []);

  const handleNoteLinkArrowDown = useCallback(() => {
    setNoteLinkMenu(prev => {
      const maxIdx = notesList.filter(n =>
        (n.title ?? "").toLowerCase().includes(prev.filter.toLowerCase()),
      ).length - 1;
      return { ...prev, selectedIndex: Math.min(prev.selectedIndex + 1, Math.max(0, maxIdx)) };
    });
  }, [notesList]);

  const handleNoteLinkSelect = useCallback(
    (note: NoteLinkItem) => {
      const blockIndex = noteLinkMenu.blockIndex;
      const el = blockRefs.current[blockIndex];
      if (!el) return;

      const text = htmlToMarkdownInline(el.innerHTML);
      const bracketIdx = text.lastIndexOf("[[");
      if (bracketIdx === -1) return;

      const before = text.slice(0, bracketIdx);
      const after = text.slice(bracketIdx).replace(/\[\[[^\]]*$/, "");
      const linkText = `[[Note #${note.note_number}|${note.title ?? "Untitled"}]]`;
      const newText = before + linkText + after;

      setBlocks(prev => {
        const block = prev[blockIndex];
        const prefix = BLOCK_PREFIX[block.type] ?? "";
        const indent = "  ".repeat(block.indent);
        const updated = prev.map((b, i) =>
          i === blockIndex ? { ...b, raw: indent + prefix + newText } : b,
        );
        notifyChange(updated);
        return updated;
      });

      setNoteLinkMenu(prev => ({ ...prev, open: false }));
    },
    [noteLinkMenu.blockIndex, notifyChange],
  );

  const handleNoteLinkEnter = useCallback(() => {
    const filtered = notesList.filter(n =>
      (n.title ?? "").toLowerCase().includes(noteLinkMenu.filter.toLowerCase()),
    );
    const idx = Math.min(noteLinkMenu.selectedIndex, filtered.length - 1);
    if (filtered[idx]) handleNoteLinkSelect(filtered[idx]);
  }, [noteLinkMenu, notesList, handleNoteLinkSelect]);

  const dragIndicesRef = useRef<number[]>([]);
  const lastClickedRef = useRef(-1);

  const handleDragHandleClick = useCallback((index: number, e: React.MouseEvent) => {
    if (e.shiftKey && lastClickedRef.current !== -1) {
      // Shift+클릭: 범위 선택
      const from = Math.min(lastClickedRef.current, index);
      const to = Math.max(lastClickedRef.current, index);
      const range = new Set<number>();
      for (let i = from; i <= to; i++) range.add(i);
      setSelectedBlocks(range);
    } else if (e.metaKey || e.ctrlKey) {
      // Cmd/Ctrl+클릭: 토글 선택
      setSelectedBlocks(prev => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index); else next.add(index);
        return next;
      });
    } else {
      setSelectedBlocks(new Set([index]));
    }
    lastClickedRef.current = index;
  }, []);

  const handleDragStart = useCallback((index: number) => {
    // 선택된 블록이 없거나 드래그 대상이 선택에 포함 안 되면, 단일 드래그
    const indices = selectedBlocks.has(index)
      ? [...selectedBlocks].sort((a, b) => a - b)
      : [index];
    dragIndicesRef.current = indices;
    setDragState({ dragging: index, over: -1 });
  }, [selectedBlocks]);

  const handleDragOver = useCallback((index: number) => {
    setDragState(prev => (prev.dragging === index ? prev : { ...prev, over: index }));
  }, []);

  const handleDrop = useCallback(
    (dropIndex: number) => {
      const indices = dragIndicesRef.current;
      if (indices.length === 0 || indices.includes(dropIndex)) {
        setDragState({ dragging: -1, over: -1 });
        dragIndicesRef.current = [];
        return;
      }
      setBlocks(prev => {
        // 이동할 블록들을 추출
        const moving = indices.map(i => prev[i]);
        // 나머지 블록들
        const remaining = prev.filter((_, i) => !indices.includes(i));
        // 드롭 위치 계산 (제거된 블록 수 반영)
        const removedBefore = indices.filter(i => i < dropIndex).length;
        const insertAt = Math.min(dropIndex - removedBefore, remaining.length);
        // 삽입
        remaining.splice(insertAt, 0, ...moving);
        notifyChange(remaining);
        return remaining;
      });
      setDragState({ dragging: -1, over: -1 });
      setSelectedBlocks(new Set());
      dragIndicesRef.current = [];
    },
    [notifyChange],
  );

  const handleDragEnd = useCallback(() => {
    setDragState({ dragging: -1, over: -1 });
    dragIndicesRef.current = [];
  }, []);

  // blocks를 ref로 추적하여 stale closure 방지
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  const handleUndoRedo = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      const isUndo = modifier && !e.shiftKey && e.key === "z";
      const isRedo =
        (modifier && e.shiftKey && e.key === "z") ||
        (modifier && !e.shiftKey && e.key === "y");

      if (!isUndo && !isRedo) return;

      e.preventDefault();
      e.stopPropagation();

      // Flush pending debounce immediately before undo/redo
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
        const history = historyRef.current;
        history.stack = history.stack.slice(0, history.index + 1);
        history.stack.push(blocksRef.current);
        if (history.stack.length > 50) {
          history.stack.shift();
        }
        history.index = history.stack.length - 1;
      }

      const history = historyRef.current;

      if (isUndo) {
        if (history.index <= 0) return;
        history.index -= 1;
      } else {
        if (history.index >= history.stack.length - 1) return;
        history.index += 1;
      }

      const targetBlocks = history.stack[history.index];
      if (!targetBlocks) return;

      isUndoRedoRef.current = true;
      setBlocks(targetBlocks);
      onChange(blocksToMarkdown(targetBlocks));
      // 다음 렌더 사이클에서 pushHistory가 호출될 수 있으므로 rAF로 해제
      requestAnimationFrame(() => {
        isUndoRedoRef.current = false;
      });
    },
    [onChange],
  );

  return (
    <div
      className="markdown-editor-root relative w-full"
      style={{ minHeight: "40rem" }}
      onKeyDown={handleUndoRedo}
      onClick={e => {
        // Handle note link clicks
        const target = e.target as HTMLElement;
        const noteLink = target.closest<HTMLAnchorElement>(".note-link");
        if (noteLink) {
          e.preventDefault();
          e.stopPropagation();
          const noteNum = noteLink.dataset.note;
          if (noteNum && onNoteClick) {
            onNoteClick(Number(noteNum));
          }
          return;
        }
        // 블록 선택 해제
        if (selectedBlocks.size > 0) setSelectedBlocks(new Set());
        if (focusedIndex === -1 && blockRefs.current.length > 0) {
          const lastIdx = blocks.length - 1;
          blockRefs.current[lastIdx]?.focus();
        }
      }}>
      {isEmpty && focusedIndex === -1 && (
        <div
          className="pointer-events-none absolute top-0 left-0 select-none text-[2rem] leading-relaxed text-on-surface-variant/50"
          aria-hidden="true">
          {placeholder}
        </div>
      )}
      <div className="space-y-[0.4rem]">
        {blocks.map((block, index) => {
          // 토글 접힘: 접힌 토글 다음의 indent > 0 블록 숨김
          if (block.indent > 0) {
            // 부모 토글 중 하나라도 접혀있으면 숨김
            let checkIndent = block.indent;
            for (let j = index - 1; j >= 0; j--) {
              if (blocks[j].indent < checkIndent) {
                if (blocks[j].type === "toggle" && collapsedToggles.has(blocks[j].id)) {
                  return null;
                }
                checkIndent = blocks[j].indent;
                if (checkIndent === 0) break;
              }
            }
          }
          return (
          <div
            key={block.id}
            className={`group/block relative ${dragState.over === index && dragState.dragging !== index ? "border-t-2 border-primary" : ""} ${dragIndicesRef.current.includes(index) && dragState.dragging !== -1 ? "opacity-40" : ""} ${selectedBlocks.has(index) ? "bg-primary/5 rounded-[0.25rem]" : ""}`}
            style={block.indent > 0 ? { marginLeft: `${block.indent * 2.4}rem`, paddingLeft: "1.2rem", borderLeft: "2px solid var(--color-outline-variant, #444)" } : undefined}
            onDragOver={e => { e.preventDefault(); handleDragOver(index); }}
            onDrop={e => { e.preventDefault(); handleDrop(index); }}>
            {/* Drag Handle + Block */}
            <div className="flex items-start">
              <div
                draggable
                onClick={e => handleDragHandleClick(index, e)}
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                className={`mt-[0.6rem] mr-[0.4rem] flex h-[2rem] w-[1.6rem] shrink-0 cursor-grab items-center justify-center rounded-[0.25rem] transition-colors active:cursor-grabbing ${
                  selectedBlocks.has(index)
                    ? "text-primary/60"
                    : "text-on-surface-variant/0 group-hover/block:text-on-surface-variant/30 hover:!text-on-surface-variant/60 hover:bg-surface-container"
                }`}
                title="Click to select, Shift+click for range, drag to reorder">
                <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                  <circle cx="2.5" cy="2" r="1.2"/><circle cx="7.5" cy="2" r="1.2"/>
                  <circle cx="2.5" cy="7" r="1.2"/><circle cx="7.5" cy="7" r="1.2"/>
                  <circle cx="2.5" cy="12" r="1.2"/><circle cx="7.5" cy="12" r="1.2"/>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
            <BlockEditor
              block={block}
              isFocused={focusedIndex === index}
              onFocus={() => setFocusedIndex(index)}
              onChange={raw => handleBlockChange(index, raw)}
              onEnter={(offset, text) => handleEnter(index, offset, text)}
              onBackspace={(isEmptyBlock, atStart) => handleBackspace(index, isEmptyBlock, atStart)}
              onTab={shift => handleTab(index, shift)}
              onArrowUp={() => handleArrowUp(index)}
              onArrowDown={() => handleArrowDown(index)}
              onSlashInput={(filter, anchorEl) => handleSlashInput(index, filter, anchorEl)}
              onSlashClose={handleSlashClose}
              isSlashOpen={slashMenu.open && slashMenu.blockIndex === index}
              onSlashArrowUp={handleSlashArrowUp}
              onSlashArrowDown={handleSlashArrowDown}
              onSlashEnter={handleSlashEnter}
              onNoteLinkInput={(filter, anchorEl) => handleNoteLinkInput(index, filter, anchorEl)}
              onNoteLinkClose={handleNoteLinkClose}
              isNoteLinkOpen={noteLinkMenu.open && noteLinkMenu.blockIndex === index}
              onNoteLinkArrowUp={handleNoteLinkArrowUp}
              onNoteLinkArrowDown={handleNoteLinkArrowDown}
              onNoteLinkEnter={handleNoteLinkEnter}
              onPaste={lines => handlePasteMultiline(index, lines)}
              onToggle={handleToggle}
              isToggleOpenProp={!collapsedToggles.has(block.id)}
              editorRef={el => {
                blockRefs.current[index] = el;
              }}
            />
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {slashMenu.open && (
        <SlashMenu
          filter={slashMenu.filter}
          selectedIndex={slashMenu.selectedIndex}
          position={slashMenu.position}
          onSelect={commandId => applySlashCommand(commandId, slashMenu.blockIndex)}
          onTableSelect={(rows, cols) => applyTableCommand(rows, cols, slashMenu.blockIndex)}
        />
      )}

      {/* Note Link Menu */}
      {noteLinkMenu.open && notesList.length > 0 && (() => {
        const filtered = notesList.filter(n =>
          (n.title ?? "").toLowerCase().includes(noteLinkMenu.filter.toLowerCase()),
        );
        if (filtered.length === 0) return null;
        const selectedIdx = Math.min(noteLinkMenu.selectedIndex, filtered.length - 1);
        return (
          <div
            className="absolute z-50 min-w-[24rem] max-h-[24rem] overflow-y-auto rounded-[0.5rem] border border-outline-variant/10 bg-surface-container-highest shadow-xl"
            style={{ top: noteLinkMenu.position.top, left: noteLinkMenu.position.left }}>
            <div className="px-[1.2rem] py-[0.6rem] text-[1rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant/50">
              Link to note
            </div>
            {filtered.map((note, idx) => (
              <div
                key={note.note_number}
                className={`flex cursor-pointer items-center gap-[1.2rem] px-[1.6rem] py-[1rem] transition-colors ${
                  idx === selectedIdx ? "bg-primary/10 text-primary" : "text-on-surface hover:bg-surface-container"
                }`}
                onMouseDown={e => {
                  e.preventDefault();
                  handleNoteLinkSelect(note);
                }}>
                <span className="text-[1.2rem]">📝</span>
                <div>
                  <div className="text-[1.3rem] font-medium">{note.title ?? "Untitled"}</div>
                  <div className="text-[1.1rem] text-on-surface-variant/50">Note #{note.note_number}</div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      <style>{`
        .inline-code {
          background: var(--color-surface-container, #f1f5f9);
          border-radius: 0.25rem;
          padding: 0 0.4rem;
          font-family: monospace;
          font-size: 0.9em;
          color: var(--color-secondary, #0f766e);
        }
        .inline-link {
          color: var(--color-primary, #0ea5e9);
          text-decoration: underline;
        }
        .note-link {
          color: var(--color-primary, #0ea5e9);
          background: color-mix(in srgb, var(--color-primary, #0ea5e9) 10%, transparent);
          border-radius: 0.25rem;
          padding: 0 0.4rem;
          text-decoration: none;
          cursor: pointer;
        }
        .note-link:hover {
          background: color-mix(in srgb, var(--color-primary, #0ea5e9) 20%, transparent);
        }
        .inline-image {
          max-width: 100%;
          border-radius: 0.5rem;
          margin: 0.8rem 0;
          display: block;
        }
        .inline-highlight {
          background: rgba(255, 226, 171, 0.3);
          border-radius: 0.2rem;
          padding: 0 0.2rem;
          color: inherit;
        }
      `}</style>
    </div>
  );
};

export default MarkdownEditor;
