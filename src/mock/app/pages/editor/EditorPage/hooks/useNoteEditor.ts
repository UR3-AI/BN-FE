import { useEffect, useRef, useState } from "react";

import { api } from "@lib/apis/axios";

import useUpdateNoteMutation from "@/mock/lib/apis/mutations/notes/useUpdateNoteMutation/useUpdateNoteMutation";

import type { NoteDetailResponse } from "@/mock/lib/apis/queries/notes/useNoteDetailQuery/useNoteDetailQuery.type";
import { useQueryClient } from "@tanstack/react-query";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 1500;

const useNoteEditor = ({
  noteDetail,
  noteNumber,
}: {
  noteDetail: NoteDetailResponse | undefined;
  noteNumber: number;
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [syncedNoteNumber, setSyncedNoteNumber] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ title: string; content: string; noteNumber: number } | null>(null);
  const updateMutation = useUpdateNoteMutation();
  const queryClient = useQueryClient();

  // 렌더 중 동기화: noteDetail이 새 노트로 바뀌면 즉시 content 설정
  // (useEffect와 달리 MarkdownEditor 마운트 전에 실행됨)
  // 렌더 중 동기화: setState만 수행 (부수효과 없음)
  const pendingFlushRef = useRef<{ title: string; content: string; noteNumber: number } | null>(null);
  if (noteDetail && noteDetail.note_number !== syncedNoteNumber) {
    // 이전 노트의 pending save를 기록만 해두고, useEffect에서 API 호출
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pendingRef.current !== null && pendingRef.current.noteNumber > 0) {
      pendingFlushRef.current = { ...pendingRef.current };
    }

    pendingRef.current = null;
    setSyncedNoteNumber(noteDetail.note_number);
    setTitle(noteDetail.title ?? "");
    setContent(noteDetail.content ?? "");
    setSaveStatus("idle");
  }

  // 노트 전환 시에만 이전 노트의 pending을 flush
  useEffect(() => {
    const p = pendingFlushRef.current;
    if (p) {
      pendingFlushRef.current = null;
      if (p.title || p.content) {
        api.patch(`/api/v1/notes/${p.noteNumber}`, {
          title: p.title || undefined,
          content: p.content || " ",
        }).catch(() => {});
      }
    }
  }, [syncedNoteNumber]);

  const save = (value: { title: string; content: string }, targetNoteNumber: number) => {
    if (targetNoteNumber <= 0) return;
    if (!value.title && !value.content) return;
    setSaveStatus("saving");
    pendingRef.current = null;
    const savedTitle = value.title;
    const savedContent = value.content || " ";
    updateMutation.mutate(
      {
        noteNumber: targetNoteNumber,
        title: savedTitle || undefined,
        content: savedContent,
      },
      {
        onSuccess: () => {
          setSaveStatus("saved");
          queryClient.setQueryData<NoteDetailResponse>(
            ["notes", "detail", targetNoteNumber],
            old => {
              if (!old) return old;
              return { ...old, title: savedTitle || old.title, content: savedContent };
            },
          );
        },
        onError: () => setSaveStatus("error"),
      },
    );
  };

  const scheduleSave = (newTitle: string, newContent: string) => {
    pendingRef.current = { title: newTitle, content: newContent, noteNumber };

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (pendingRef.current) {
        save(pendingRef.current, pendingRef.current.noteNumber);
      }
    }, DEBOUNCE_MS);
  };

  const onTitleChange = (value: string) => {
    setTitle(value);
    scheduleSave(value, content);
  };

  const onContentChange = (value: string) => {
    setContent(value);
    scheduleSave(title, value);
  };

  const flush = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pendingRef.current !== null) {
      save(pendingRef.current, pendingRef.current.noteNumber);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (pendingRef.current !== null && pendingRef.current.noteNumber > 0) {
        const { title: t, content: c, noteNumber: n } = pendingRef.current;
        if (t || c) {
          api.patch(`/api/v1/notes/${n}`, { title: t || undefined, content: c || " " }).catch(() => {});
        }
      }
    };
  }, []);

  return { title, content, saveStatus, onTitleChange, onContentChange, flush };
};

export default useNoteEditor;
