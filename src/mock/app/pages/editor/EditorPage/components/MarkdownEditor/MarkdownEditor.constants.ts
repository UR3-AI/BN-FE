import type { BlockType, SlashMenuState } from "./MarkdownEditor.type";

// ─── Block Pattern Detection ────────────────────────────────────────────────────

export const BLOCK_PATTERNS: { pattern: RegExp; type: BlockType }[] = [
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

export const BLOCK_PREFIX: Partial<Record<BlockType, string>> = {
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

// ─── Slash Commands ─────────────────────────────────────────────────────────────

export interface SlashCommand {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
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

// ─── Slash Menu State ───────────────────────────────────────────────────────────

export const SLASH_MENU_INITIAL: SlashMenuState = {
  open: false,
  filter: "",
  selectedIndex: 0,
  blockIndex: -1,
  position: { top: 0, left: 0 },
};

// ─── Golden Angle (for natural layout) ──────────────────────────────────────────

export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
