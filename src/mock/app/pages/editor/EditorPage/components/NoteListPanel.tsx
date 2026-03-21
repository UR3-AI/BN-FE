import type { NoteListItem } from "@/mock/lib/apis/queries/notes/useNotesQuery/useNotesQuery.type";

import { PlusCircleIcon, PushPinIcon } from "@/mock/app/components/Icons";

interface NoteListPanelProps {
  notes: NoteListItem[];
  selectedNoteNumber: number;
  onSelectNote: (noteNumber: number) => void;
  onCreateNote: () => void;
  isCreating: boolean;
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
};

const NoteListPanel = ({
  notes,
  selectedNoteNumber,
  onSelectNote,
  onCreateNote,
  isCreating,
}: NoteListPanelProps) => {
  const pinnedNotes = notes.filter(n => n.is_pinned);
  const recentNotes = notes.filter(n => !n.is_pinned);

  return (
    <div className="hidden w-[28rem] shrink-0 flex-col border-r border-outline-variant/10 bg-surface-container-lowest lg:flex">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/10 px-[1.6rem] py-[1.6rem]">
        <h2 className="text-[1.2rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
          Notes
        </h2>
        <button
          type="button"
          onClick={onCreateNote}
          disabled={isCreating}
          className="flex items-center gap-[0.6rem] rounded-[0.375rem] bg-primary px-[1.2rem] py-[0.6rem] text-[1.1rem] font-semibold text-on-primary transition-all hover:brightness-110 active:scale-95 disabled:opacity-50">
          <PlusCircleIcon
            size="1.4rem"
            fill="currentColor"
          />
          {isCreating ? "Creating..." : "New"}
        </button>
      </div>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto">
        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div>
            <div className="flex items-center gap-[0.6rem] px-[1.6rem] pt-[1.6rem] pb-[0.8rem]">
              <PushPinIcon
                size="1.2rem"
                fill="#9c8f78"
              />
              <span className="text-[1rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                Pinned
              </span>
            </div>
            {pinnedNotes.map(note => (
              <NoteItem
                key={note.note_number}
                note={note}
                isSelected={note.note_number === selectedNoteNumber}
                onSelect={onSelectNote}
              />
            ))}
          </div>
        )}

        {/* Recent Notes */}
        {recentNotes.length > 0 && (
          <div>
            <div className="px-[1.6rem] pt-[1.6rem] pb-[0.8rem]">
              <span className="text-[1rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                Recent
              </span>
            </div>
            {recentNotes.map(note => (
              <NoteItem
                key={note.note_number}
                note={note}
                isSelected={note.note_number === selectedNoteNumber}
                onSelect={onSelectNote}
              />
            ))}
          </div>
        )}

        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center px-[1.6rem] py-[4.8rem]">
            <p className="text-[1.2rem] text-on-surface-variant">No notes yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface NoteItemProps {
  note: NoteListItem;
  isSelected: boolean;
  onSelect: (noteNumber: number) => void;
}

const NoteItem = ({ note, isSelected, onSelect }: NoteItemProps) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(note.note_number)}
      className={`w-full cursor-pointer px-[1.6rem] py-[1.2rem] text-left transition-colors hover:bg-surface-container ${
        isSelected
          ? "border-l-2 border-primary bg-surface-container-highest"
          : "border-l-2 border-transparent"
      }`}>
      <p className="truncate text-[1.3rem] font-semibold text-on-surface">
        {note.title ?? "Untitled"}
      </p>
      <div className="mt-[0.4rem] flex items-center gap-[0.8rem]">
        <span className="text-[1rem] text-on-surface-variant">
          {formatRelativeTime(note.created_at)}
        </span>
        {note.tags.length > 0 && (
          <span className="text-[1rem] text-outline">
            {note.tags.length} tag{note.tags.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </button>
  );
};

export default NoteListPanel;
