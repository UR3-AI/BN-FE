import { useState } from "react";

import { SLASH_COMMANDS } from "../MarkdownEditor.constants";

// ─── TableGridPicker ───────────────────────────────────────────────────────────

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

// ─── SlashMenu ─────────────────────────────────────────────────────────────────

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

export default SlashMenu;
