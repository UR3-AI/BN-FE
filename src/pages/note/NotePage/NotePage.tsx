import type { NoteDetail } from "@entities/note";
import { useNoteDetailQuery, useNoteStore } from "@entities/note";
import { useNoteStream } from "@features/note/stream";
import { NoteAsidePanel } from "@widgets/note/aside-panel";
import { NoteContent } from "@widgets/note/content";
import { NoteInfoPanel } from "@widgets/note/info-panel";

interface NoteWorkspaceProps {
  noteNumber: number;
  noteDetail: NoteDetail | undefined;
}

const NoteWorkspace = ({ noteNumber, noteDetail }: NoteWorkspaceProps) => {
  const { phase, subscribe } = useNoteStream({ noteNumber });

  return (
    <>
      <NoteContent
        noteNumber={noteNumber}
        noteDetail={noteDetail}
        onSaveSuccess={subscribe}
      />

      <NoteInfoPanel
        noteNumber={noteNumber}
        noteDetail={noteDetail}
        streamPhase={phase}
      />
    </>
  );
};

const NotePage = () => {
  const selectedNoteNumber = useNoteStore(state => state.selectedNoteNumber);
  const { data: noteDetail } = useNoteDetailQuery({ noteNumber: selectedNoteNumber });

  return (
    <div className="flex h-full">
      <NoteAsidePanel />

      {selectedNoteNumber === 0 ? (
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <p className="text-[1.4rem] text-[var(--color-text-help)]">노트를 선택해주세요</p>
        </div>
      ) : (
        <NoteWorkspace
          key={selectedNoteNumber}
          noteNumber={selectedNoteNumber}
          noteDetail={noteDetail}
        />
      )}
    </div>
  );
};

export default NotePage;
