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

const parseMarkdown = (text: string): Block[] => {
  const lines = text.split("\n");
  return lines.map(line => ({
    id: generateId(),
    type: detectBlockType(line.trim()),
    raw: line,
    indent: getIndent(line),
  }));
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
    if (!el) return;
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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isComposing.current) return;

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

    if (e.key === "Backspace") {
      const el = divRef.current;
      if (!el) return;
      const text = el.textContent ?? "";
      const isEmpty = text.length === 0;
      let atStart = isEmpty;
      if (!isEmpty) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const preRange = range.cloneRange();
          preRange.selectNodeContents(el);
          preRange.setEnd(range.startContainer, range.startOffset);
          atStart = preRange.toString().length === 0;
        }
      }
      if (atStart) {
        e.preventDefault();
      }
      onBackspace(isEmpty, atStart);
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
          const newType = detectBlockType(raw.trim());
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

  // Trim stale refs when blocks shrink
  useEffect(() => {
    blockRefs.current.length = blocks.length;
  }, [blocks.length]);

  const isEmpty = blocks.length === 0 || (blocks.length === 1 && blocks[0].raw.trim() === "");

  return (
    <div
      className="relative w-full"
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
            onBackspace={(isEmpty, atStart) => handleBackspace(index, isEmpty, atStart)}
            onTab={shift => handleTab(index, shift)}
            onArrowUp={() => handleArrowUp(index)}
            onArrowDown={() => handleArrowDown(index)}
            editorRef={el => {
              blockRefs.current[index] = el;
            }}
          />
        ))}
      </div>

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
