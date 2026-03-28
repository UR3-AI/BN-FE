import { formatRelativeTime } from "@lib/utils";

import type { NotePanelItemProps } from "./NotePanelItem.type";
import { NotePanelItemTags } from "./components";

const NotePanelItem = ({ note, onPin, onDelete }: NotePanelItemProps) => {
  const { note_number, title, tags, is_pinned, created_at } = note;

  return (
    <article className="group px-[1.2rem] py-[1rem] flex cursor-pointer flex-col gap-[0.4rem] rounded-[0.8rem] hover:bg-[var(--color-gray-bg)]">
      <div className="flex items-center gap-[0.6rem]">
        <button
          type="button"
          className={`size-[1.4rem] shrink-0 rounded-[0.2rem] border border-[var(--color-text-disabled)] cursor-pointer ${is_pinned ? "bg-[var(--color-primary)]" : ""}`}
          onClick={e => {
            e.stopPropagation();
            onPin({ noteNumber: note_number, pinned: !is_pinned });
          }}
          aria-label={is_pinned ? "핀 해제" : "핀 고정"}
        />

        <h4 className="min-w-0 flex-1 truncate text-[1.4rem] font-semibold text-[var(--color-text-primary)]">
          {title || "제목 없음"}
        </h4>

        <button
          type="button"
          className="shrink-0 text-[1.2rem] text-[var(--color-text-disabled)] opacity-0 transition-opacity hover:text-[var(--color-error)] group-hover:opacity-100"
          onClick={e => {
            e.stopPropagation();
            onDelete({ noteNumber: note_number });
          }}
          aria-label="노트 삭제"
        >
          ✕
        </button>
      </div>

      <time className="text-[1.2rem] text-[var(--color-text-secondary)]">
        {formatRelativeTime(created_at)}
      </time>

      <NotePanelItemTags tags={tags} />
    </article>
  );
};

export default NotePanelItem;
