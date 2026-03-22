import type { ActionItemResponse } from "@/mock/lib/apis/queries/notes/useNoteDetailQuery/useNoteDetailQuery.type";
import type { RelatedNote } from "@/mock/lib/apis/queries/notes/useRelatedNotesQuery/useRelatedNotesQuery.type";

import { useRef, useState } from "react";

import { CloseIcon, DeleteIcon, LinkIcon } from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";
import useAttachmentDownload from "@/mock/lib/apis/mutations/notes/useAttachmentDownload/useAttachmentDownload";
import useDeleteAttachmentMutation from "@/mock/lib/apis/mutations/notes/useDeleteAttachmentMutation/useDeleteAttachmentMutation";
import useNoteExport from "@/mock/lib/apis/mutations/notes/useNoteExport/useNoteExport";
import useUploadAttachmentMutation from "@/mock/lib/apis/mutations/notes/useUploadAttachmentMutation/useUploadAttachmentMutation";
import useAddTagsMutation from "@/mock/lib/apis/mutations/tags/useAddTagsMutation/useAddTagsMutation";
import useRemoveTagsMutation from "@/mock/lib/apis/mutations/tags/useRemoveTagsMutation/useRemoveTagsMutation";
import useCreateNoteMutation from "@/mock/lib/apis/mutations/notes/useCreateNoteMutation/useCreateNoteMutation";
import useDeleteNoteMutation from "@/mock/lib/apis/mutations/notes/useDeleteNoteMutation/useDeleteNoteMutation";
import usePinNoteMutation from "@/mock/lib/apis/mutations/notes/usePinNoteMutation/usePinNoteMutation";
import useReprocessNoteMutation from "@/mock/lib/apis/mutations/notes/useReprocessNoteMutation/useReprocessNoteMutation";
import useAttachmentsQuery from "@/mock/lib/apis/queries/notes/useAttachmentsQuery/useAttachmentsQuery";
import useNoteActionsQuery from "@/mock/lib/apis/queries/notes/useNoteActionsQuery/useNoteActionsQuery";
import useNoteDetailQuery from "@/mock/lib/apis/queries/notes/useNoteDetailQuery/useNoteDetailQuery";
import useRelatedNotesQuery from "@/mock/lib/apis/queries/notes/useRelatedNotesQuery/useRelatedNotesQuery";
import useNoteStream from "@/mock/lib/hooks/useNoteStream/useNoteStream";
import { useQueryClient } from "@tanstack/react-query";

import AISidePanel from "./components/AISidePanel";
import NoteListPanel from "./components/NoteListPanel";
import useEditorNote from "./hooks/useEditorNote";
import useNoteEditor from "./hooks/useNoteEditor";

const EditorPage = () => {
  const queryClient = useQueryClient();
  const createNoteMutation = useCreateNoteMutation();
  const pinNoteMutation = usePinNoteMutation();
  const deleteNoteMutation = useDeleteNoteMutation();
  const reprocessMutation = useReprocessNoteMutation();
  const addTagsMutation = useAddTagsMutation();
  const removeTagsMutation = useRemoveTagsMutation();
  const uploadAttachmentMutation = useUploadAttachmentMutation();
  const deleteAttachmentMutation = useDeleteAttachmentMutation();
  const noteExport = useNoteExport();
  const attachmentDownload = useAttachmentDownload();
  const { subscribe: subscribeNoteStream } = useNoteStream();
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { notes, isLoading: isNotesLoading, selectedNoteNumber, setSelectedNoteNumber } =
    useEditorNote();

  const hasNote = selectedNoteNumber > 0;

  const { data: noteDetail, isLoading: isDetailLoading } =
    useNoteDetailQuery(selectedNoteNumber);

  const { title, content, saveStatus, onTitleChange, onContentChange, flush } = useNoteEditor({
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

  const { data: attachmentsData } = useAttachmentsQuery(selectedNoteNumber);

  const isLoading =
    isNotesLoading || (hasNote && (isDetailLoading || isRelatedLoading || isActionsLoading));

  const handleCreateNote = () => {
    createNoteMutation.mutate(
      { content: " " },
      {
        onSuccess: data => {
          queryClient.invalidateQueries({ queryKey: ["notes"] });
          setSelectedNoteNumber(data.note_number);
          subscribeNoteStream(data.note_number);
        },
      },
    );
  };

  const handlePinToggle = (noteNumber: number, pinned: boolean) => {
    pinNoteMutation.mutate(
      { noteNumber, pinned },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }) },
    );
  };

  const handleDeleteNote = (noteNumber: number) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    const wasSelected = selectedNoteNumber === noteNumber;
    deleteNoteMutation.mutate(noteNumber, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["notes"] });
        if (wasSelected) {
          setSelectedNoteNumber(0);
        }
      },
    });
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
            onPinToggle={handlePinToggle}
            onDelete={handleDeleteNote}
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
            onPinToggle={handlePinToggle}
            onDelete={handleDeleteNote}
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
  const isFailed = noteDetail.processing_status === "failed";

  const handleReprocess = () => {
    reprocessMutation.mutate(selectedNoteNumber, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notes"] });
      },
    });
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (!tag || selectedNoteNumber <= 0) return;
    addTagsMutation.mutate(
      { noteNumber: selectedNoteNumber, tags: [tag] },
      {
        onSuccess: () => {
          setTagInput("");
          queryClient.invalidateQueries({ queryKey: ["notes"] });
        },
      },
    );
  };

  const handleRemoveTag = (tag: string) => {
    if (selectedNoteNumber <= 0) return;
    removeTagsMutation.mutate(
      { noteNumber: selectedNoteNumber, tags: [tag] },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["notes"] });
        },
      },
    );
  };

  const handleExport = (format: "markdown" | "pdf") => {
    noteExport.mutate({ noteNumber: selectedNoteNumber, format });
  };

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
          onPinToggle={handlePinToggle}
          onDelete={handleDeleteNote}
          isCreating={createNoteMutation.isPending}
        />

        {/* Distraction-free Writing Area */}
        <div className="mx-auto max-w-[89.6rem] flex-1 px-[3.2rem] pt-[6.4rem] pb-[12.8rem] md:px-[6.4rem]">
          {/* Draft Badge */}
          <div className="mb-[4.8rem]">
            <div className="mb-[1.6rem] flex items-center gap-[1.6rem]">
              <span className={`rounded-[0.125rem] px-[0.8rem] py-[0.2rem] text-[1rem] font-semibold uppercase tracking-[0.3em] ${
                isFailed
                  ? "bg-error/10 text-error"
                  : "bg-secondary-container/30 text-secondary"
              }`}>
                {isFailed ? "Failed" : "Draft"}
              </span>
              {isFailed && (
                <button
                  type="button"
                  onClick={handleReprocess}
                  disabled={reprocessMutation.isPending}
                  className="rounded-[0.25rem] bg-primary px-[1.2rem] py-[0.4rem] text-[1.1rem] font-semibold text-on-primary transition-all hover:brightness-110 active:scale-95 disabled:opacity-50">
                  {reprocessMutation.isPending ? "Reprocessing..." : "Reprocess"}
                </button>
              )}
              {noteDetail.tags.map(tag => (
                <span
                  key={tag}
                  className="group/tag flex items-center gap-[0.4rem] rounded-full border border-outline-variant/10 bg-surface-container px-[1.2rem] py-[0.4rem] text-[1.1rem] font-medium text-secondary">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="opacity-0 transition-opacity group-hover/tag:opacity-100">
                    <CloseIcon
                      size="1.2rem"
                      stroke="currentColor"
                    />
                  </button>
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
            <div className="mb-[1.6rem] flex items-center gap-[1.2rem]">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag..."
                className="w-[16rem] rounded-[0.25rem] border border-outline-variant/20 bg-surface-container-low px-[1.2rem] py-[0.4rem] text-[1.1rem] text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleExport("markdown")}
                disabled={noteExport.isPending}
                className="rounded-[0.25rem] border border-outline-variant/20 px-[1.2rem] py-[0.4rem] text-[1.1rem] font-medium text-secondary transition-colors hover:bg-surface-container disabled:opacity-50">
                {noteExport.isPending ? "Exporting..." : "Export MD"}
              </button>
              <button
                type="button"
                onClick={() => handleExport("pdf")}
                disabled={noteExport.isPending}
                className="rounded-[0.25rem] border border-outline-variant/20 px-[1.2rem] py-[0.4rem] text-[1.1rem] font-medium text-secondary transition-colors hover:bg-surface-container disabled:opacity-50">
                Export PDF
              </button>
            </div>
            <input
              type="text"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              placeholder="Untitled"
              className="mb-[3.2rem] w-full bg-transparent font-headline text-[5rem] font-extrabold leading-tight tracking-tighter text-on-surface outline-none placeholder:text-on-surface-variant/30"
            />
          </div>

          {/* Article Content */}
          <textarea
            value={content}
            onChange={e => onContentChange(e.target.value)}
            placeholder="Start writing..."
            className="w-full flex-1 resize-none bg-transparent font-body text-[2rem] leading-relaxed text-on-surface/90 outline-none placeholder:text-on-surface-variant"
            style={{ minHeight: "40rem", fieldSizing: "content" as never }}
          />

          {/* Attachments */}
          <section className="mt-[6.4rem] border-t border-outline-variant/10 pt-[3.2rem]">
            <h3 className="mb-[2rem] font-headline text-[1.6rem] font-bold text-on-surface">
              Attachments
            </h3>
            <div className="mb-[1.6rem] flex items-center gap-[1.2rem]">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  uploadAttachmentMutation.mutate(
                    { noteNumber: selectedNoteNumber, file },
                    {
                      onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ["notes"] });
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      },
                    },
                  );
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAttachmentMutation.isPending}
                className="rounded-[0.25rem] border border-outline-variant/20 px-[1.2rem] py-[0.4rem] text-[1.1rem] font-medium text-secondary transition-colors hover:bg-surface-container disabled:opacity-50">
                {uploadAttachmentMutation.isPending ? "Uploading..." : "Upload File"}
              </button>
            </div>
            {(attachmentsData?.items ?? []).length > 0 && (
              <div className="space-y-[0.8rem]">
                {attachmentsData?.items.map(attachment => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between rounded-[0.25rem] bg-surface-container-low px-[1.6rem] py-[1rem]">
                    <button
                      type="button"
                      onClick={() =>
                        attachmentDownload.mutate({
                          noteNumber: selectedNoteNumber,
                          attachmentId: attachment.id,
                          filename: attachment.filename,
                        })
                      }
                      disabled={attachmentDownload.isPending}
                      className="text-[1.3rem] font-medium text-primary hover:underline disabled:opacity-50">
                      {attachment.filename}
                    </button>
                    <div className="flex items-center gap-[1.2rem]">
                      <span className="text-[1.1rem] text-secondary">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          deleteAttachmentMutation.mutate(
                            { noteNumber: selectedNoteNumber, attachmentId: attachment.id },
                            {
                              onSuccess: () => {
                                queryClient.invalidateQueries({ queryKey: ["notes"] });
                              },
                            },
                          )
                        }
                        disabled={deleteAttachmentMutation.isPending}
                        className="text-secondary transition-colors hover:text-error disabled:opacity-50">
                        <DeleteIcon size="1.6rem" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

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
                    onClick={() => handleSelectNote(related.note_number)}
                    className="group cursor-pointer rounded-[0.25rem] bg-surface-container-low p-[2rem] transition-colors hover:bg-surface-container">
                    <span className="mb-[0.8rem] block text-[1rem] font-bold uppercase tracking-[0.15em] text-secondary">
                      NOTE_{related.note_number}.MD
                    </span>
                    <h4 className="font-headline font-semibold text-on-surface transition-colors group-hover:text-primary">
                      {related.title ?? "Untitled"}
                    </h4>
                    <p className="mt-[0.8rem] text-[1.4rem] text-on-surface-variant">
                      Similarity: {Math.round(related.relevance_score * 100)}%
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
