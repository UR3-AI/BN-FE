import { memo, useCallback, useEffect, useRef } from "react";

import { BLOCK_PREFIX } from "../MarkdownEditor.constants";
import type { Block } from "../MarkdownEditor.type";
import {
  applyInlineFormatting,
  escapeHtml,
  getBlockClassName,
  getDisplayText,
  htmlToMarkdownInline,
  mapVisibleToMarkdownOffset,
  sanitizeUrl,
  toggleMarkup,
} from "../MarkdownEditor.utils";
import TableBlock from "./TableBlock";

// ─── BlockEditor Props ─────────────────────────────────────────────────────────

export interface BlockEditorProps {
  block: Block;
  isFocused: boolean;
  onFocus: () => void;
  onChange: (raw: string) => void;
  onEnter: (caretOffset: number, currentText?: string) => void;
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

// ─── BlockEditorInner ──────────────────────────────────────────────────────────

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
    // block.raw 기준으로 재렌더 (htmlToMarkdownInline 경유하지 않아 이중 인코딩 방지)
    const escaped = escapeHtml(displayText);
    const html =
      block.type === "hr"
        ? ""
        : block.type === "code"
          ? escaped
          : applyInlineFormatting(escaped);
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
      const imgRegex =
        /<img[^>]*src="([^"]*)"[^>]*(?:alt="([^"]*)")?[^>]*\/?>/gi;
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
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onNoteLinkArrowUp();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        onNoteLinkArrowDown();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        onNoteLinkEnter();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onNoteLinkClose();
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
      const todoPrefix = block.raw.trim().match(/^- \[x\] /i)
        ? "- [x] "
        : "- [ ] ";
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
    const codeContent = codeLines
      .slice(
        1,
        codeLines[codeLines.length - 1]?.trim() === "```" ? -1 : undefined,
      )
      .join("\n");

    return (
      <div className="group/code my-[0.8rem] overflow-hidden rounded-[0.5rem] bg-surface-container-low">
        {/* Header */}
        <div className="flex items-center justify-between bg-surface-container px-[1.6rem] py-[0.6rem]">
          <input
            type="text"
            value={lang}
            onChange={e => {
              const newLang = e.target.value;
              const bodyLines = codeLines.slice(
                1,
                codeLines[codeLines.length - 1]?.trim() === "```"
                  ? -1
                  : undefined,
              );
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
              const newValue =
                value.substring(0, start) + "  " + value.substring(end);
              onChange("```" + lang + "\n" + newValue + "\n```");
              requestAnimationFrame(() => {
                target.selectionStart = target.selectionEnd = start + 2;
              });
            }
          }}
          spellCheck={false}
          className="w-full resize-none bg-transparent px-[1.6rem] py-[1.2rem] font-mono text-[1.4rem] leading-relaxed text-secondary outline-none"
          style={
            { fieldSizing: "content", minHeight: "4rem" } as React.CSSProperties
          }
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
      <div className="flex items-baseline gap-[0.8rem]">
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
      <div className="flex items-baseline gap-[0.8rem]">
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-on-primary, #fff)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-full w-full">
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
          onCompositionStart={() => {
            isComposing.current = true;
          }}
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
          onCompositionStart={() => {
            isComposing.current = true;
          }}
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
          style={{
            transform: isToggleOpen ? "rotate(90deg)" : "rotate(0deg)",
          }}>
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
          onCompositionStart={() => {
            isComposing.current = true;
          }}
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

export default BlockEditor;
