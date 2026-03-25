import type { ActionItemResponse } from "@/mock/lib/apis/queries/notes/useNoteDetailQuery/useNoteDetailQuery.type";
import type { RelatedNote } from "@/mock/lib/apis/queries/notes/useRelatedNotesQuery/useRelatedNotesQuery.type";

import { useCallback, useMemo, useRef, useState } from "react";

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
import MarkdownEditor from "./components/MarkdownEditor";
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
  const [isDragging, setIsDragging] = useState(false);
  const [noteListWidth, setNoteListWidth] = useState(280);
  const noteListDragRef = useRef<{ startX: number; startW: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);

  const { notes, isLoading: isNotesLoading, selectedNoteNumber, setSelectedNoteNumber } =
    useEditorNote();

  const hasNote = selectedNoteNumber > 0;

  const { data: noteDetail, isLoading: isDetailLoading } =
    useNoteDetailQuery(selectedNoteNumber);

  const { title, content, saveStatus, onTitleChange, onContentChange, flush } = useNoteEditor({
    noteDetail,
    noteNumber: selectedNoteNumber,
    onSaveSuccess: (num) => {
      // PATCH 성공 → 백엔드 reprocess 시작 → SSE 재구독
      subscribeNoteStream(num);
    },
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

  const isDetailAreaLoading = hasNote && (isDetailLoading || isRelatedLoading || isActionsLoading);

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

  const [toasts, setToasts] = useState<{ id: number; message: string; undoAction: () => void; displayTimerId: ReturnType<typeof setTimeout> }[]>([]);
  const deleteTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = (id: number) => {
    setToasts(prev => {
      const t = prev.find(x => x.id === id);
      if (t) clearTimeout(t.displayTimerId);
      return prev.filter(x => x.id !== id);
    });
  };

  const handleDeleteNote = (noteNumber: number) => {
    const wasSelected = selectedNoteNumber === noteNumber;
    const deletedNote = notes.find(n => n.note_number === noteNumber);

    // Optimistic: 즉시 UI에서 제거
    queryClient.setQueriesData<{ items: typeof notes; total: number; skip: number; limit: number; has_next: boolean }>(
      { queryKey: ["notes", "list"] },
      old => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter(n => n.note_number !== noteNumber),
          total: old.total - 1,
        };
      },
    );
    if (wasSelected) {
      setSelectedNoteNumber(0);
    }

    // 지연 삭제 타이머 (5초 후 실제 삭제)
    const deleteTimer = setTimeout(() => {
      deleteTimersRef.current.delete(noteNumber);
      deleteNoteMutation.mutate(noteNumber, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
        onError: () => {
          queryClient.invalidateQueries({ queryKey: ["notes"] });
          if (wasSelected) setSelectedNoteNumber(noteNumber);
        },
      });
    }, 5000);
    deleteTimersRef.current.set(noteNumber, deleteTimer);

    // 토스트 표시 — 삭제 실행(5초) 후 0.5초 여유를 두고 제거
    const displayTimerId = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== noteNumber));
    }, 5500);

    setToasts(prev => [
      ...prev,
      {
        id: noteNumber,
        message: `"${deletedNote?.title ?? "Untitled"}" deleted`,
        undoAction: () => {
          // Undo: 삭제 타이머 취소 + UI 복원
          const dt = deleteTimersRef.current.get(noteNumber);
          if (dt) { clearTimeout(dt); deleteTimersRef.current.delete(noteNumber); }
          queryClient.invalidateQueries({ queryKey: ["notes"] });
          if (wasSelected) setSelectedNoteNumber(noteNumber);
          dismissToast(noteNumber);
        },
        displayTimerId,
      },
    ]);
  };

  const onNoteListResizeDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      noteListDragRef.current = { startX: e.clientX, startW: noteListWidth };
    },
    [noteListWidth],
  );

  const onNoteListResizeMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!noteListDragRef.current) return;
    const delta = e.clientX - noteListDragRef.current.startX;
    setNoteListWidth(Math.min(480, Math.max(200, noteListDragRef.current.startW + delta)));
  }, []);

  const onNoteListResizeUp = useCallback(() => {
    noteListDragRef.current = null;
  }, []);

  const handleFileUpload = useCallback(
    (file: File) => {
      if (selectedNoteNumber <= 0) return;
      uploadAttachmentMutation.mutate(
        { noteNumber: selectedNoteNumber, file },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes"] });
            if (fileInputRef.current) fileInputRef.current.value = "";
          },
        },
      );
    },
    [selectedNoteNumber, uploadAttachmentMutation, queryClient],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCountRef.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCountRef.current--;
    if (dragCountRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCountRef.current = 0;
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const relatedNotes: RelatedNote[] = relatedNotesData?.items ?? [];
  const notesForLink = useMemo(
    () => notes.map(n => ({ note_number: n.note_number, title: n.title })),
    [notes],
  );
  const actions: ActionItemResponse[] = noteActions?.length ? noteActions : (noteDetail?.action_items ?? []);

  if (isNotesLoading) {
    return (
      <GlobalLayout
        breadcrumb={[{ label: "Projects" }, { label: "Loading...", active: true }]}
        sidePanel={
          <AISidePanel
            summary={null}
            content={null}
            tags={[]}
            actions={[]}
            relatedNotes={[]}
            noteTitle={null}
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
            width={noteListWidth}
            onResizePointerDown={onNoteListResizeDown}
            onResizePointerMove={onNoteListResizeMove}
            onResizePointerUp={onNoteListResizeUp}
          />
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[1.4rem] text-on-surface-variant">Loading...</p>
          </div>
        </div>
      </GlobalLayout>
    );
  }

  if (!hasNote || (!noteDetail && !isDetailAreaLoading)) {
    return (
      <GlobalLayout
        breadcrumb={[{ label: "Projects" }, { label: "No notes", active: true }]}
        sidePanel={
          <AISidePanel
            summary={null}
            content={null}
            tags={[]}
            actions={[]}
            relatedNotes={[]}
            noteTitle={null}
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
            width={noteListWidth}
            onResizePointerDown={onNoteListResizeDown}
            onResizePointerMove={onNoteListResizeMove}
            onResizePointerUp={onNoteListResizeUp}
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

  if (isDetailAreaLoading || !noteDetail) {
    return (
      <GlobalLayout
        breadcrumb={[{ label: "Projects" }, { label: "Loading...", active: true }]}
        sidePanel={
          <AISidePanel
            summary={null}
            content={null}
            tags={[]}
            actions={[]}
            relatedNotes={[]}
            noteTitle={null}
            isProcessing={false}
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
            width={noteListWidth}
            onResizePointerDown={onNoteListResizeDown}
            onResizePointerMove={onNoteListResizeMove}
            onResizePointerUp={onNoteListResizeUp}
          />
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[1.4rem] text-on-surface-variant">Loading...</p>
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
          content={noteDetail.content}
          tags={noteDetail.tags}
          actions={actions}
          relatedNotes={relatedNotes}
          noteTitle={noteDetail.title}
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
        <div className="mx-auto min-w-0 max-w-[89.6rem] flex-1 px-[3.2rem] pt-[6.4rem] pb-[12.8rem] md:px-[6.4rem]">
          {/* Draft Badge */}
          <div className="mb-[4.8rem]">
            <div className="mb-[1.6rem] flex flex-wrap items-center gap-[0.8rem]">
              <span className={`shrink-0 rounded-[0.125rem] px-[0.8rem] py-[0.2rem] text-[1rem] font-semibold uppercase tracking-[0.3em] ${
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
            <textarea
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") e.preventDefault();
              }}
              placeholder="Untitled"
              rows={1}
              className="mb-[3.2rem] w-full resize-none overflow-hidden bg-transparent font-headline text-[5rem] font-extrabold leading-tight tracking-tighter text-on-surface outline-none placeholder:text-on-surface-variant/30"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
          </div>

          {/* Article Content */}
          <MarkdownEditor
            key={selectedNoteNumber}
            value={content}
            onChange={onContentChange}
            onNoteClick={handleSelectNote}
            notes={notesForLink}
            placeholder="Start writing..."
          />

          {/* Attachments */}
          <section
            className="mt-[6.4rem] border-t border-outline-variant/10 pt-[3.2rem]"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}>
            <h3 className="mb-[2rem] font-headline text-[1.6rem] font-bold text-on-surface">
              Attachments
            </h3>

            {/* Drop Zone */}
            <div
              onClick={() => !uploadAttachmentMutation.isPending && fileInputRef.current?.click()}
              className={`mb-[1.6rem] flex cursor-pointer flex-col items-center justify-center rounded-[0.5rem] border-2 border-dashed py-[2.4rem] transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant/20 hover:border-outline-variant/40 hover:bg-surface-container-low/50"
              }`}>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              {uploadAttachmentMutation.isPending ? (
                <p className="text-[1.2rem] font-medium text-primary">Uploading...</p>
              ) : isDragging ? (
                <p className="text-[1.2rem] font-medium text-primary">Drop file here</p>
              ) : (
                <>
                  <p className="text-[1.2rem] font-medium text-on-surface-variant">
                    Drop file here or click to upload
                  </p>
                </>
              )}
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

      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed bottom-[3.2rem] left-1/2 z-50 flex -translate-x-1/2 flex-col gap-[0.8rem]">
          {toasts.map(t => (
            <div
              key={t.id}
              className="flex items-center gap-[1.6rem] rounded-[0.5rem] bg-surface-container-highest px-[2rem] py-[1.2rem] shadow-2xl">
              <span className="text-[1.3rem] text-on-surface">{t.message}</span>
              <button
                type="button"
                onClick={t.undoAction}
                className="text-[1.3rem] font-bold text-primary transition-colors hover:text-primary/80">
                Undo
              </button>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="text-[1.3rem] text-on-surface-variant/50 transition-colors hover:text-on-surface-variant">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </GlobalLayout>
  );
};

export default EditorPage;
