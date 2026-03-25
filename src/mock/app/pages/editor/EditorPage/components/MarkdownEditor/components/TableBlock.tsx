import { useEffect, useRef, useState } from "react";

import type { Block } from "../MarkdownEditor.type";

// ─── Table Helpers ─────────────────────────────────────────────────────────────

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

// ─── TableBlock Component ──────────────────────────────────────────────────────

interface TableBlockProps {
  block: Block;
  onChange: (raw: string) => void;
}

const TableBlock = ({ block, onChange }: TableBlockProps) => {
  const rows = parseTableRows(block.raw);
  const headerRow = rows[0] ?? [];
  const separatorIdx = rows.findIndex(r => isSeparatorRow(r));
  const dataRows =
    separatorIdx >= 0 ? rows.slice(separatorIdx + 1) : rows.slice(1);
  const colCount = headerRow.length;

  // Column resize: store per-column width overrides (colIdx -> pct)
  const [colWidthOverrides, setColWidthOverrides] = useState<
    Record<number, number>
  >({});
  const resizeRef = useRef<{
    colIdx: number;
    startX: number;
    startWidth: number;
  } | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const colWidths = Array.from(
    { length: colCount },
    (_, i) => colWidthOverrides[i] ?? Math.floor(100 / colCount),
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
        setColWidthOverrides(prev => ({
          ...prev,
          [resizeRef.current!.colIdx]: newPct,
        }));
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
    const targetIdx =
      separatorIdx >= 0 ? rowIdx + separatorIdx + 1 : rowIdx + 1;
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
      row.push(
        isSeparatorRow(row) ? "---" : i === 0 ? `Column ${row.length + 1}` : "",
      );
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

export default TableBlock;
