import { useNoteStore } from "@entities/note";

import type { NoteInfoPanelRelatedProps } from "./NoteInfoPanelRelated.type";

const NoteInfoPanelRelated = ({ relatedNotes }: NoteInfoPanelRelatedProps) => {
  const selectNote = useNoteStore(state => state.selectNote);

  return (
    <section className="flex flex-col gap-[0.8rem] px-[2rem] py-[1.6rem]">
      <h4 className="text-[1.2rem] font-semibold text-[var(--color-text-secondary)]">
        관련 노트 ({relatedNotes.length})
      </h4>

      {relatedNotes.length === 0 ? (
        <p className="text-[1.2rem] text-[var(--color-text-help)]">관련 노트가 없습니다</p>
      ) : (
        <ul className="flex flex-col gap-[0.4rem]">
          {relatedNotes.map(note => (
            <li key={note.note_number}>
              <button
                type="button"
                className="flex w-full cursor-pointer flex-col gap-[0.2rem] rounded-[0.8rem] px-[1.2rem] py-[0.8rem] text-left hover:bg-[var(--color-gray-bg)]"
                onClick={() => selectNote(note.note_number)}
              >
                <span className="truncate text-[1.3rem] font-medium text-[var(--color-text-primary)]">
                  {note.title ?? "제목 없음"}
                </span>
                <span className="text-[1.1rem] text-[var(--color-text-help)]">
                  {note.connection_type} | 관련도 {Math.round(note.relevance_score * 100)}%
                </span>
                {note.shared_entities.length > 0 && (
                  <span className="truncate text-[1.1rem] text-[var(--color-text-secondary)]">
                    공통: {note.shared_entities.map(e => e.name).join(", ")}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default NoteInfoPanelRelated;
