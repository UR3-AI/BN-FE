import { useCallback, useEffect, useRef, useState } from "react";

import type { Block, BlockType, MarkdownEditorProps, NoteLinkItem, SlashMenuState } from "./MarkdownEditor.type";
import { BLOCK_PREFIX, SLASH_COMMANDS, SLASH_MENU_INITIAL } from "./MarkdownEditor.constants";
import {
  blocksToMarkdown,
  detectBlockType,
  generateId,
  generateTableMarkdown,
  getDisplayText,
  htmlToMarkdownInline,
  parseMarkdown,
} from "./MarkdownEditor.utils";
import BlockEditor from "./components/BlockEditor";
import SlashMenu from "./components/SlashMenu";

const MarkdownEditor = ({
  value,
  onChange,
  placeholder = "Start writing...",
  onNoteClick,
  notes: notesList = [],
}: MarkdownEditorProps) => {
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
  const [dragState, setDragState] = useState<{ dragging: number; over: number }>({
    dragging: -1,
    over: -1,
  });
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
  }>({
    open: false,
    filter: "",
    selectedIndex: 0,
    blockIndex: -1,
    position: { top: 0, left: 0 },
  });

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
        if (
          (block.type === "ul" || block.type === "ol" || block.type === "todo") &&
          before.trim() === ""
        ) {
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
        const mergedRaw = prevBlock.raw.trimEnd() + currentDisplay;
        const mergeOffset = prevDisplay
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/\*([^*]+)\*/g, "$1")
          .replace(/~~([^~]+)~~/g, "$1")
          .replace(/`([^`]+)`/g, "$1")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").length;

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
      const top = containerRect ? rect.bottom - containerRect.top + 4 : rect.bottom + 4;
      const left = containerRect ? rect.left - containerRect.left : rect.left;

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
      setNoteLinkMenu({
        open: true,
        filter,
        selectedIndex: 0,
        blockIndex: index,
        position: { top, left },
      });
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
      const maxIdx =
        notesList.filter(n =>
          (n.title ?? "").toLowerCase().includes(prev.filter.toLowerCase()),
        ).length - 1;
      return {
        ...prev,
        selectedIndex: Math.min(prev.selectedIndex + 1, Math.max(0, maxIdx)),
      };
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
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      });
    } else {
      setSelectedBlocks(new Set([index]));
    }
    lastClickedRef.current = index;
  }, []);

  const handleDragStart = useCallback(
    (index: number) => {
      // 선택된 블록이 없거나 드래그 대상이 선택에 포함 안 되면, 단일 드래그
      const indices = selectedBlocks.has(index)
        ? [...selectedBlocks].sort((a, b) => a - b)
        : [index];
      dragIndicesRef.current = indices;
      setDragState({ dragging: index, over: -1 });
    },
    [selectedBlocks],
  );

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
        (modifier && e.shiftKey && e.key === "z") || (modifier && !e.shiftKey && e.key === "y");

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
              style={
                block.indent > 0
                  ? {
                      marginLeft: `${block.indent * 2.4}rem`,
                      paddingLeft: "1.2rem",
                      borderLeft: "2px solid var(--color-outline-variant, #444)",
                    }
                  : undefined
              }
              onDragOver={e => {
                e.preventDefault();
                handleDragOver(index);
              }}
              onDrop={e => {
                e.preventDefault();
                handleDrop(index);
              }}>
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
                  <svg
                    width="10"
                    height="14"
                    viewBox="0 0 10 14"
                    fill="currentColor">
                    <circle cx="2.5" cy="2" r="1.2" />
                    <circle cx="7.5" cy="2" r="1.2" />
                    <circle cx="2.5" cy="7" r="1.2" />
                    <circle cx="7.5" cy="7" r="1.2" />
                    <circle cx="2.5" cy="12" r="1.2" />
                    <circle cx="7.5" cy="12" r="1.2" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <BlockEditor
                    block={block}
                    isFocused={focusedIndex === index}
                    onFocus={() => setFocusedIndex(index)}
                    onChange={raw => handleBlockChange(index, raw)}
                    onEnter={(offset, text) => handleEnter(index, offset, text)}
                    onBackspace={(isEmptyBlock, atStart) =>
                      handleBackspace(index, isEmptyBlock, atStart)
                    }
                    onTab={shift => handleTab(index, shift)}
                    onArrowUp={() => handleArrowUp(index)}
                    onArrowDown={() => handleArrowDown(index)}
                    onSlashInput={(filter, anchorEl) => handleSlashInput(index, filter, anchorEl)}
                    onSlashClose={handleSlashClose}
                    isSlashOpen={slashMenu.open && slashMenu.blockIndex === index}
                    onSlashArrowUp={handleSlashArrowUp}
                    onSlashArrowDown={handleSlashArrowDown}
                    onSlashEnter={handleSlashEnter}
                    onNoteLinkInput={(filter, anchorEl) =>
                      handleNoteLinkInput(index, filter, anchorEl)
                    }
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
      {noteLinkMenu.open &&
        notesList.length > 0 &&
        (() => {
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
                    idx === selectedIdx
                      ? "bg-primary/10 text-primary"
                      : "text-on-surface hover:bg-surface-container"
                  }`}
                  onMouseDown={e => {
                    e.preventDefault();
                    handleNoteLinkSelect(note);
                  }}>
                  <span className="text-[1.2rem]">📝</span>
                  <div>
                    <div className="text-[1.3rem] font-medium">{note.title ?? "Untitled"}</div>
                    <div className="text-[1.1rem] text-on-surface-variant/50">
                      Note #{note.note_number}
                    </div>
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
