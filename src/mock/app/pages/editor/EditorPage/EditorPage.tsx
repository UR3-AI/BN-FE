import type { ActionItemResponse } from "@/mock/lib/apis/queries/notes/useNoteDetailQuery/useNoteDetailQuery.type";
import type { RelatedNote } from "@/mock/lib/apis/queries/notes/useRelatedNotesQuery/useRelatedNotesQuery.type";

import { LinkIcon } from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";
import useCreateNoteMutation from "@/mock/lib/apis/mutations/notes/useCreateNoteMutation/useCreateNoteMutation";
import useNoteActionsQuery from "@/mock/lib/apis/queries/notes/useNoteActionsQuery/useNoteActionsQuery";
import useNoteDetailQuery from "@/mock/lib/apis/queries/notes/useNoteDetailQuery/useNoteDetailQuery";
import useRelatedNotesQuery from "@/mock/lib/apis/queries/notes/useRelatedNotesQuery/useRelatedNotesQuery";
import { useQueryClient } from "@tanstack/react-query";

import AISidePanel from "./components/AISidePanel";
import NoteListPanel from "./components/NoteListPanel";
import useEditorNote from "./hooks/useEditorNote";
import useNoteEditor from "./hooks/useNoteEditor";

const EditorPage = () => {
  const queryClient = useQueryClient();
  const createNoteMutation = useCreateNoteMutation();

  const { notes, isLoading: isNotesLoading, selectedNoteNumber, setSelectedNoteNumber } =
    useEditorNote();

  const hasNote = selectedNoteNumber > 0;

  const { data: noteDetail, isLoading: isDetailLoading } =
    useNoteDetailQuery(selectedNoteNumber);

  const { content, saveStatus, onContentChange, flush } = useNoteEditor({
    noteDetail,
    noteNumber: selectedNoteNumber,
  });

  const handleSelectNote = (noteNumber: number) => {
    flush();
    setSelectedNoteNumber(noteNumber);
  };

  const { data: relatedNotesData, isLoading: isRelatedLoading } =
    useRelatedNotesQuery(selectedNoteNumber);

  const { data: noteActions, isLoading: isActionsLoading } =
    useNoteActionsQuery(selectedNoteNumber);

  const isLoading =
    isNotesLoading || (hasNote && (isDetailLoading || isRelatedLoading || isActionsLoading));

  const handleCreateNote = () => {
    createNoteMutation.mutate(
      { content: "New note created from editor" },
      {
        onSuccess: data => {
          queryClient.invalidateQueries({ queryKey: ["notes"] });
          setSelectedNoteNumber(data.note_number);
        },
      },
    );
  };

  const relatedNotes: RelatedNote[] = relatedNotesData?.items ?? [];
  const actions: ActionItemResponse[] = noteActions ?? [];

  if (isLoading) {
    return (
      <GlobalLayout
        breadcrumb={[{ label: "Projects" }, { label: "Loading...", active: true }]}
        sidePanel={
          <AISidePanel
            summary={null}
            tags={[]}
            actions={[]}
            isProcessing={false}
          />
        }>
        <div className="flex flex-1">
          <NoteListPanel
            notes={[]}
            selectedNoteNumber={0}
            onSelectNote={handleSelectNote}
            onCreateNote={handleCreateNote}
            isCreating={createNoteMutation.isPending}
          />
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[1.4rem] text-on-surface-variant">Loading...</p>
          </div>
        </div>
      </GlobalLayout>
    );
  }

  if (!hasNote || !noteDetail) {
    return (
      <GlobalLayout
        breadcrumb={[{ label: "Projects" }, { label: "No notes", active: true }]}
        sidePanel={
          <AISidePanel
            summary={null}
            tags={[]}
            actions={[]}
            isProcessing={false}
          />
        }>
        <div className="flex flex-1">
          <NoteListPanel
            notes={notes}
            selectedNoteNumber={0}
            onSelectNote={handleSelectNote}
            onCreateNote={handleCreateNote}
            isCreating={createNoteMutation.isPending}
          />
          <div className="flex flex-1 flex-col items-center justify-center gap-[2.4rem]">
            <p className="text-[1.6rem] text-on-surface-variant">
              No notes yet. Create your first note.
            </p>
            <button
              type="button"
              onClick={handleCreateNote}
              disabled={createNoteMutation.isPending}
              className="rounded-[0.375rem] bg-primary px-[2.4rem] py-[1.2rem] font-semibold text-on-primary transition-all hover:brightness-110 active:scale-95 disabled:opacity-50">
              {createNoteMutation.isPending ? "Creating..." : "Create Note"}
            </button>
          </div>
        </div>
      </GlobalLayout>
    );
  }

  const isProcessing = noteDetail.processing_status === "processing";

  return (
    <GlobalLayout
      breadcrumb={[
        { label: "Projects" },
        { label: noteDetail.title ?? "Untitled", active: true },
      ]}
      sidePanel={
        <AISidePanel
          summary={noteDetail.summary}
          tags={noteDetail.tags}
          actions={actions}
          isProcessing={isProcessing}
        />
      }>
      <div className="flex flex-1">
        <NoteListPanel
          notes={notes}
          selectedNoteNumber={selectedNoteNumber}
          onSelectNote={handleSelectNote}
          onCreateNote={handleCreateNote}
          isCreating={createNoteMutation.isPending}
        />

        {/* Distraction-free Writing Area */}
        <div className="mx-auto max-w-[89.6rem] flex-1 px-[3.2rem] pt-[6.4rem] pb-[12.8rem] md:px-[6.4rem]">
          {/* Draft Badge */}
          <div className="mb-[4.8rem]">
            <div className="mb-[1.6rem] flex items-center gap-[1.6rem]">
              <span className="rounded-[0.125rem] bg-secondary-container/30 px-[0.8rem] py-[0.2rem] text-[1rem] font-semibold uppercase tracking-[0.3em] text-secondary">
                Draft
              </span>
              {noteDetail.tags.map(tag => (
                <span
                  key={tag}
                  className="rounded-full border border-outline-variant/10 bg-surface-container px-[1.2rem] py-[0.4rem] text-[1.1rem] font-medium text-secondary">
                  #{tag}
                </span>
              ))}
              <span className="text-[1.1rem] italic text-outline">
                {saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "saved"
                    ? "Saved"
                    : saveStatus === "error"
                      ? "Save failed"
                      : `Modified ${noteDetail.updated_at}`}
              </span>
            </div>
            <h1 className="mb-[3.2rem] font-headline text-[5rem] font-extrabold leading-tight tracking-tighter text-on-surface">
              {noteDetail.title ?? "Untitled"}
            </h1>
          </div>

          {/* Article Content */}
          <textarea
            value={content}
            onChange={e => onContentChange(e.target.value)}
            placeholder="Start writing..."
            className="w-full flex-1 resize-none bg-transparent font-body text-[2rem] leading-relaxed text-on-surface/90 outline-none placeholder:text-on-surface-variant"
            style={{ minHeight: "40rem", fieldSizing: "content" as never }}
          />

          {/* Cognitive Associations */}
          {relatedNotes.length > 0 && (
            <section className="mt-[9.6rem] border-t border-outline-variant/10 pt-[4.8rem]">
              <h3 className="mb-[2.4rem] flex items-center gap-[0.8rem] font-headline text-[1.8rem] font-bold text-primary">
                <LinkIcon
                  size="1.8rem"
                  fill="#ffe2ab"
                />
                Cognitive Associations
              </h3>
              <div className="grid grid-cols-1 gap-[1.6rem] md:grid-cols-2">
                {relatedNotes.map(related => (
                  <div
                    key={related.note_number}
                    className="group cursor-pointer rounded-[0.25rem] bg-surface-container-low p-[2rem] transition-colors hover:bg-surface-container">
                    <span className="mb-[0.8rem] block text-[1rem] font-bold uppercase tracking-[0.15em] text-secondary">
                      NOTE_{related.note_number}.MD
                    </span>
                    <h4 className="font-headline font-semibold text-on-surface transition-colors group-hover:text-primary">
                      {related.title ?? "Untitled"}
                    </h4>
                    <p className="mt-[0.8rem] text-[1.4rem] text-on-surface-variant">
                      Similarity: {Math.round(related.similarity_score * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </GlobalLayout>
  );
};

export default EditorPage;
