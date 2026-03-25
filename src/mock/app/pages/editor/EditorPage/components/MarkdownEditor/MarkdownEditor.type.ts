export type BlockType =
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

export interface Block {
  id: string;
  type: BlockType;
  raw: string;
  indent: number;
}

export interface NoteLinkItem {
  note_number: number;
  title: string | null;
}

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onNoteClick?: (noteNumber: number) => void;
  notes?: NoteLinkItem[];
}

export interface SlashMenuState {
  open: boolean;
  filter: string;
  selectedIndex: number;
  blockIndex: number;
  position: { top: number; left: number };
}
