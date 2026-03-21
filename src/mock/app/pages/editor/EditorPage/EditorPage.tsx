import type { ActionItemResponse } from "@/mock/lib/apis/queries/notes/useNoteDetailQuery/useNoteDetailQuery.type";
import type { RelatedNote } from "@/mock/lib/apis/queries/notes/useRelatedNotesQuery/useRelatedNotesQuery.type";

import {
  CheckboxBlankIcon,
  CheckboxIcon,
  LinkIcon,
  SparklesIcon,
  TreeIcon,
} from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";
import useCreateNoteMutation from "@/mock/lib/apis/mutations/notes/useCreateNoteMutation/useCreateNoteMutation";
import useNoteActionsQuery from "@/mock/lib/apis/queries/notes/useNoteActionsQuery/useNoteActionsQuery";
import useNoteDetailQuery from "@/mock/lib/apis/queries/notes/useNoteDetailQuery/useNoteDetailQuery";
import useNotesQuery from "@/mock/lib/apis/queries/notes/useNotesQuery/useNotesQuery";
import useRelatedNotesQuery from "@/mock/lib/apis/queries/notes/useRelatedNotesQuery/useRelatedNotesQuery";
import { useQueryClient } from "@tanstack/react-query";

interface AISidePanelProps {
  summary: string | null;
  tags: string[];
  actions: ActionItemResponse[];
  isProcessing: boolean;
}

const AISidePanel = ({ summary, tags, actions, isProcessing }: AISidePanelProps) => {
  return (
    <div className="p-[2.4rem]">
      {/* Header */}
      <div className="mb-[3.2rem] flex items-center justify-between">
        <h2 className="font-headline text-[1.4rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
          AI Synthesis
        </h2>
        {isProcessing && (
          <div className="flex items-center gap-[0.8rem] rounded-[0.125rem] bg-primary/10 px-[0.8rem] py-[0.4rem]">
            <div className="h-[0.6rem] w-[0.6rem] animate-pulse rounded-full bg-primary" />
            <span className="text-[1rem] font-bold uppercase tracking-tighter text-primary">
              Processing
            </span>
          </div>
        )}
      </div>

      {/* Focus Plate: Summary */}
      <div className="mb-[2.4rem] rounded-[0.25rem] border-b border-outline-variant/20 bg-surface-container-highest p-[2.4rem]">
        <h3 className="mb-[1.2rem] flex items-center gap-[0.8rem] text-[1.2rem] font-bold text-primary">
          <SparklesIcon
            size="1.6rem"
            fill="#ffe2ab"
          />
          Executive Summary
        </h3>
        <p className="text-[1.4rem] leading-relaxed text-on-surface/80">
          {summary ?? "No summary available"}
        </p>
      </div>

      {/* Metadata Nodes */}
      <div className="mb-[3.2rem]">
        <h3 className="mb-[1.6rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
          Metadata Nodes
        </h3>
        <div className="flex flex-wrap gap-[0.8rem]">
          {tags.length > 0 ? (
            tags.map(tag => (
              <span
                key={tag}
                className="rounded-full border border-outline-variant/10 bg-surface-container px-[1.2rem] py-[0.4rem] text-[1.2rem] font-medium text-secondary">
                #{tag}
              </span>
            ))
          ) : (
            <span className="text-[1.2rem] text-on-surface-variant">No tags</span>
          )}
        </div>
      </div>

      {/* Extracted Actions */}
      <div>
        <h3 className="mb-[1.6rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
          Extracted Actions
        </h3>
        <div className="space-y-[1.2rem]">
          {actions.length > 0 ? (
            actions.map(action => {
              const isCompleted = action.status === "completed" || action.status === "done";
              return (
                <div
                  key={action.id}
                  className={`flex items-start gap-[1.2rem] rounded-[0.125rem] border-l-2 bg-surface-container/40 p-[1.2rem] ${
                    isCompleted
                      ? "border-outline/20 opacity-60"
                      : "border-primary/40"
                  }`}>
                  {isCompleted ? (
                    <CheckboxIcon
                      size="1.8rem"
                      fill="#9c8f78"
                    />
                  ) : (
                    <CheckboxBlankIcon
                      size="1.8rem"
                      fill="#ffe2ab"
                    />
                  )}
                  <div>
                    <p
                      className={`text-[1.2rem] font-medium text-on-surface ${isCompleted ? "line-through" : ""}`}>
                      {action.summary}
                    </p>
                    <p className="mt-[0.4rem] text-[1rem] text-on-surface-variant">
                      {isCompleted
                        ? "Completed"
                        : action.end_time
                          ? `Due: ${action.end_time}`
                          : action.status}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-[1.2rem] text-on-surface-variant">No action items</p>
          )}
        </div>
      </div>

      {/* Contextual Graph Placeholder */}
      <div className="mt-[4.8rem] flex aspect-square flex-col items-center justify-center rounded-[0.5rem] border border-outline-variant/10 bg-surface-container-lowest p-[1.6rem] text-center">
        <div className="relative mb-[1.6rem] flex h-[12.8rem] w-[12.8rem] items-center justify-center">
          <TreeIcon
            size="3rem"
            fill="#ffe2ab"
          />
        </div>
        <span className="text-[1rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          Contextual Graph
        </span>
        <p className="mt-[0.8rem] px-[1.6rem] text-[1rem] text-outline">
          {actions.length} active nodes identified in current text segment
        </p>
      </div>
    </div>
  );
};

const EditorPage = () => {
  const queryClient = useQueryClient();
  const createNoteMutation = useCreateNoteMutation();

  const { data: notesData, isLoading: isNotesLoading } = useNotesQuery({ limit: 1 });

  const noteNumber = notesData?.items[0]?.note_number ?? 0;
  const hasNote = noteNumber > 0;

  const { data: noteDetail, isLoading: isDetailLoading } = useNoteDetailQuery(noteNumber);

  const { data: relatedNotesData, isLoading: isRelatedLoading } = useRelatedNotesQuery(
    noteNumber,
  );

  const { data: noteActions, isLoading: isActionsLoading } = useNoteActionsQuery(noteNumber);

  const isLoading = isNotesLoading || isDetailLoading || isRelatedLoading || isActionsLoading;

  const handleCreateNote = () => {
    createNoteMutation.mutate(
      { content: "New note created from editor" },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["notes"] });
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
        <div className="flex flex-1 items-center justify-center">
          <p className="text-[1.4rem] text-on-surface-variant">Loading...</p>
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
              Modified {noteDetail.updated_at}
            </span>
          </div>
          <h1 className="mb-[3.2rem] font-headline text-[5rem] font-extrabold leading-tight tracking-tighter text-on-surface">
            {noteDetail.title ?? "Untitled"}
          </h1>
        </div>

        {/* Article Content */}
        <article>
          <div className="space-y-[2.4rem] font-body text-[2rem] leading-relaxed text-on-surface/90">
            {noteDetail.content ? (
              noteDetail.content.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <p className="text-on-surface-variant">No content yet.</p>
            )}
          </div>
        </article>

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
    </GlobalLayout>
  );
};

export default EditorPage;
