import { useCallback, useEffect, useRef, useState } from "react";

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
  | "paragraph";

interface Block {
  id: string;
  type: BlockType;
  raw: string;
  indent: number;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const generateId = () => crypto.randomUUID();

const BLOCK_PATTERNS: { pattern: RegExp; type: BlockType }[] = [
  { pattern: /^### /, type: "h3" },
  { pattern: /^## /, type: "h2" },
  { pattern: /^# /, type: "h1" },
  { pattern: /^[-*] /, type: "ul" },
  { pattern: /^\d+\. /, type: "ol" },
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
    if (isTableRow(line)) {
      // Collect consecutive table rows into one table block
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
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return url;
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
      // link (with URL sanitization)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
        const safe = sanitizeUrl(url);
        return safe ? `<a href="${safe}" class="inline-link">${label}</a>` : label;
      })
  );
};

const getDisplayText = (block: Block): string => {
  const raw = block.raw.trim();
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
    case "blockquote":
      return raw.replace(/^> /, "");
    case "code":
      return raw.replace(/^```/, "").replace(/```$/, "");
    case "table":
      return raw;
    default:
      return raw;
  }
};

const getBlockClassName = (block: Block): string => {
  const baseClasses = "w-full bg-transparent outline-none break-words";
  const indentClass = block.indent > 0 ? `pl-[${block.indent * 2.4}rem]` : "";

  switch (block.type) {
    case "h1":
      return `${baseClasses} ${indentClass} text-[3.6rem] font-extrabold leading-tight text-on-surface`;
    case "h2":
      return `${baseClasses} ${indentClass} text-[2.8rem] font-bold leading-snug text-on-surface`;
    case "h3":
      return `${baseClasses} ${indentClass} text-[2.2rem] font-semibold leading-snug text-on-surface`;
    case "ul":
      return `${baseClasses} ${indentClass} text-[2rem] leading-relaxed text-on-surface/90`;
    case "ol":
      return `${baseClasses} ${indentClass} text-[2rem] leading-relaxed text-on-surface/90`;
    case "blockquote":
      return `${baseClasses} ${indentClass} border-l-4 border-primary/30 pl-[1.6rem] text-[2rem] leading-relaxed text-on-surface-variant italic`;
    case "code":
      return `${baseClasses} rounded-[0.5rem] bg-surface-container-low p-[1.6rem] font-mono text-[1.4rem] leading-relaxed text-secondary`;
    default:
      return `${baseClasses} ${indentClass} text-[2rem] leading-relaxed text-on-surface/90`;
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
  { id: "blockquote", label: "Quote", icon: "❝", description: "Quote block" },
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
      .map(cell => cell.trim()),
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
    onChange(rebuildTableRaw(allRows));
  };

  const removeColumn = () => {
    const allRows = parseTableRows(block.raw);
    if (allRows[0].length <= 1) return;
    allRows.forEach(row => row.pop());
    onChange(rebuildTableRaw(allRows));
  };

  return (
    <div className="group/table my-[0.8rem]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {headerRow.map((cell, ci) => (
                <th
                  key={ci}
                  className="border border-outline-variant/20 bg-surface-container px-[1.2rem] py-[0.8rem] text-left text-[1.4rem] font-semibold text-on-surface">
                  <input
                    type="text"
                    value={cell}
                    onChange={e => handleCellChange(-1, ci, e.target.value)}
                    className="w-full bg-transparent outline-none"
                  />
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
  onEnter: (caretOffset: number) => void;
  onBackspace: (isEmpty: boolean, atStart: boolean) => void;
  onTab: (shift: boolean) => void;
  onArrowUp: () => void;
  onArrowDown: () => void;
  onSlashInput: (filter: string, anchorEl: HTMLDivElement) => void;
  onSlashClose: () => void;
  isSlashOpen: boolean;
  onSlashArrowUp: () => void;
  onSlashArrowDown: () => void;
  onSlashEnter: () => void;
  editorRef: (el: HTMLDivElement | null) => void;
}

const BlockEditor = ({
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
  useEffect(() => {
    const el = divRef.current;
    if (!el || block.type === "table") return;
    const typeChanged = prevTypeRef.current !== block.type;
    prevTypeRef.current = block.type;

    // Always update when not focused, or when block type changed (prefix stripped)
    if (!isFocused || typeChanged) {
      const escaped = escapeHtml(displayText);
      const html = block.type === "hr" ? "" : block.type === "code" ? escaped : applyInlineFormatting(escaped);
      if (el.innerHTML !== html) {
        el.innerHTML = html;
        // Restore caret to end after type change
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
  }, [block, block.type, displayText, isFocused]);

  const handleFocus = () => {
    onFocus();
  };

  const handleBlur = () => {
    const el = divRef.current;
    if (!el) return;
    const rawText = htmlToMarkdownInline(el.innerHTML);
    const escaped = escapeHtml(rawText);
    const html = block.type === "hr" ? "" : block.type === "code" ? escaped : applyInlineFormatting(escaped);
    if (el.innerHTML !== html) {
      el.innerHTML = html;
    }
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

    const html = el.innerHTML;
    const text = htmlToMarkdownInline(html);
    const prefix = BLOCK_PREFIX[block.type] ?? "";
    const indent = "  ".repeat(block.indent);
    onChange(indent + prefix + text);

    // Slash command detection
    const filter = getSlashFilter(el);
    if (filter !== null) {
      onSlashInput(filter, el);
    } else {
      onSlashClose();
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
      onEnter(offset);
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
  };

  if (block.type === "table") {
    return (
      <TableBlock
        block={block}
        onChange={onChange}
      />
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
        className="flex items-baseline gap-[0.8rem]"
        style={{ paddingLeft: `${block.indent * 2.4}rem` }}>
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
          onCompositionStart={() => {
            isComposing.current = true;
          }}
          onCompositionEnd={() => {
            isComposing.current = false;
            handleInput();
          }}
          className="min-w-0 flex-1 bg-transparent text-[2rem] leading-relaxed text-on-surface/90 outline-none"
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
      onCompositionStart={() => {
        isComposing.current = true;
      }}
      onCompositionEnd={() => {
        isComposing.current = false;
        handleInput();
      }}
      className={getBlockClassName(block)}
    />
  );
};

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
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
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
    for (const [pattern, groupFn] of [
      [/^\*\*([^*]+)\*\*/, (m: RegExpMatchArray) => m[1]],
      [/^\*([^*]+)\*/, (m: RegExpMatchArray) => m[1]],
      [/^~~([^~]+)~~/, (m: RegExpMatchArray) => m[1]],
      [/^`([^`]+)`/, (m: RegExpMatchArray) => m[1]],
      [/^\[([^\]]+)\]\([^)]+\)/, (m: RegExpMatchArray) => m[1]],
    ] as [RegExp, (m: RegExpMatchArray) => string][]) {
      const match = remaining.match(pattern);
      if (match) {
        const visiblePart = groupFn(match);
        const charsNeeded = visibleOffset - visIdx;
        if (charsNeeded <= visiblePart.length) {
          // Offset falls within this formatted segment
          // Find start of visible content within the match
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

const htmlToMarkdownInline = (html: string): string => {
  return html
    .replace(/<strong>([^<]*)<\/strong>/g, "**$1**")
    .replace(/<em>([^<]*)<\/em>/g, "*$1*")
    .replace(/<del>([^<]*)<\/del>/g, "~~$1~~")
    .replace(/<code[^>]*>([^<]*)<\/code>/g, "`$1`")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/g, "[$2]($1)")
    .replace(/<br\s*\/?>/g, "")
    .replace(/<[^>]+>/g, "")
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

const MarkdownEditor = ({ value, onChange, placeholder = "Start writing..." }: MarkdownEditorProps) => {
  // Initial blocks are derived from `value` once on mount.
  // For external value resets (e.g. note switching), pass a new `key` to this component
  // so it remounts and re-initializes state cleanly.
  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (!value || value.trim() === "") {
      return [{ id: generateId(), type: "paragraph", raw: "", indent: 0 }];
    }
    return parseMarkdown(value);
  });
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pendingFocusIndex = useRef<number | null>(null);
  // -1 = start, -2 = end, >= 0 = specific visible character offset
  const pendingFocusOffset = useRef<number>(-1);

  const [slashMenu, setSlashMenu] = useState<SlashMenuState>(SLASH_MENU_INITIAL);

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
    },
    [onChange],
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
    (index: number, caretOffset: number) => {
      setBlocks(prev => {
        const block = prev[index];
        const displayText = getDisplayText(block);
        const before = displayText.slice(0, caretOffset);
        const after = displayText.slice(caretOffset);

        const prefix = BLOCK_PREFIX[block.type] ?? "";
        const indent = "  ".repeat(block.indent);

        // Update current block
        const updatedCurrent: Block = { ...block, raw: indent + prefix + before };

        // New block: for list items, continue list; otherwise paragraph
        let newRaw: string;
        let newType: BlockType;
        if ((block.type === "ul" || block.type === "ol") && before.trim() === "") {
          // Empty list item -> exit list
          newRaw = "";
          newType = "paragraph";
        } else if (block.type === "ul") {
          newRaw = indent + "- " + after;
          newType = "ul";
        } else if (block.type === "ol") {
          newRaw = indent + "1. " + after;
          newType = "ol";
        } else {
          newRaw = after;
          newType = detectBlockType(after.trim());
        }

        const newBlock: Block = {
          id: generateId(),
          type: newType,
          raw: newRaw,
          indent: block.indent,
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
        const newRaw = block.raw.replace(new RegExp(`^${oldIndentStr}`), newIndentStr);
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
    setBlocks(prev => {
      pendingFocusIndex.current = index - 1;
      pendingFocusOffset.current = -2;
      return prev;
    });
  }, []);

  const handleArrowDown = useCallback((index: number) => {
    setBlocks(prev => {
      if (index >= prev.length - 1) return prev;
      pendingFocusIndex.current = index + 1;
      pendingFocusOffset.current = -1;
      return prev;
    });
  }, []);

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
      const next = (prev.selectedIndex - 1 + filtered.length) % filtered.length;
      return { ...prev, selectedIndex: next };
    });
  }, []);

  const handleSlashArrowDown = useCallback(() => {
    setSlashMenu(prev => {
      const filtered = SLASH_COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(prev.filter.toLowerCase()),
      );
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
        blockquote: "> ",
        code: "```",
        hr: "---",
      };

      const newPrefix = prefixMap[commandId] ?? "";

      setBlocks(prev => {
        const block = prev[blockIndex];
        // Get current raw without slash command text
        const displayText = getDisplayText(block);
        const slashIdx = displayText.lastIndexOf("/");
        const textBefore = slashIdx !== -1 ? displayText.slice(0, slashIdx) : displayText;

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

        for (const line of tableLines) {
          newBlocks.push({
            id: generateId(),
            type: "paragraph",
            raw: line,
            indent: 0,
          });
        }

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

  return (
    <div
      className="markdown-editor-root relative w-full"
      style={{ minHeight: "40rem" }}
      onClick={() => {
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
        {blocks.map((block, index) => (
          <BlockEditor
            key={block.id}
            block={block}
            isFocused={focusedIndex === index}
            onFocus={() => setFocusedIndex(index)}
            onChange={raw => handleBlockChange(index, raw)}
            onEnter={offset => handleEnter(index, offset)}
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
            editorRef={el => {
              blockRefs.current[index] = el;
            }}
          />
        ))}
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
      `}</style>
    </div>
  );
};

export default MarkdownEditor;
