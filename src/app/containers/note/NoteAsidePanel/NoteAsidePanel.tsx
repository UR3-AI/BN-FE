import { Button, LoadingSpinner } from "@app/components";
import {
  useCreateNoteMutation,
  useDeleteNoteMutation,
  usePinNoteMutation,
} from "@lib/apis/mutations";
import { useNotesInfiniteQuery, useNotesQuery } from "@lib/apis/queries";
import { useIntersectionObserver } from "@lib/hooks";

import { NotePanelItem } from "./components";
import { useNoteSearch } from "./hooks";

const PAGE_LIMIT = 10;

const NoteAsidePanel = () => {
  const createNote = useCreateNoteMutation();
  const deleteNote = useDeleteNoteMutation();
  const pinNote = usePinNoteMutation();

  const { register, searchParam } = useNoteSearch();

  const { data: pinnedData } = useNotesQuery({
    pinned: true,
    search: searchParam,
  });

  const {
    data: recentData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotesInfiniteQuery({
    limit: PAGE_LIMIT,
    search: searchParam,
    pinned: false,
  });

  const handleCreate = () => {
    createNote.mutate({ content: " " });
  };

  const sentinelRef = useIntersectionObserver({
    onIntersect: fetchNextPage,
    enabled: !!hasNextPage && !isFetchingNextPage,
  });

  const pinnedNotes = pinnedData?.items ?? [];
  const recentNotes = recentData?.pages.flatMap(page => page.items) ?? [];

  return (
    <aside className="flex h-full w-[30rem] shrink-0 flex-col border-r border-[var(--color-divider-lighter)]">
      <header className="flex flex-col gap-[1rem] p-[1.6rem]">
        <div className="flex items-center justify-between">
          <h2 className="text-[1.8rem] font-bold text-[var(--color-text-primary)]">
            Note
          </h2>

          <Button
            size="m"
            onClick={handleCreate}
            isLoading={createNote.isPending}>
            + 새 노트
          </Button>
        </div>

        <input
          {...register("search")}
          type="text"
          placeholder="검색..."
          className="rounded-[0.6rem] border border-[var(--color-divider-lighter)] px-[1rem] py-[0.6rem] text-[1.4rem] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-help)] focus:border-[var(--color-primary)]"
        />
      </header>

      <div className="flex-1 overflow-y-auto px-[0.8rem] pb-[1.6rem]">
        {pinnedNotes.length > 0 && (
          <section>
            <h3 className="px-[1.2rem] py-[0.8rem] text-[1.2rem] font-semibold text-[var(--color-text-secondary)]">
              Pin
            </h3>
            {pinnedNotes.map(note => (
              <NotePanelItem
                key={note.note_number}
                note={note}
                onPin={pinNote.mutate}
                onDelete={deleteNote.mutate}
              />
            ))}
          </section>
        )}

        <section>
          <h3 className="px-[1.2rem] py-[0.8rem] text-[1.2rem] font-semibold text-[var(--color-text-secondary)]">
            Recent
          </h3>
          {recentNotes.length === 0 && !isFetchingNextPage && (
            <p className="px-[1.2rem] py-[2rem] text-center text-[1.3rem] text-[var(--color-text-help)]">
              노트가 없습니다
            </p>
          )}
          {recentNotes.map(note => (
            <NotePanelItem
              key={note.note_number}
              note={note}
              onPin={pinNote.mutate}
              onDelete={deleteNote.mutate}
            />
          ))}

          <div ref={sentinelRef} />
          {isFetchingNextPage && (
            <div className="flex justify-center py-[1.2rem]">
              <LoadingSpinner size="2rem" />
            </div>
          )}
        </section>
      </div>
    </aside>
  );
};

export default NoteAsidePanel;
