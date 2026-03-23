import { useEffect, useRef, useState } from "react";

import { api } from "@lib/apis/axios";

import useUpdateNoteMutation from "@/mock/lib/apis/mutations/notes/useUpdateNoteMutation/useUpdateNoteMutation";

import type { NoteDetailResponse } from "@/mock/lib/apis/queries/notes/useNoteDetailQuery/useNoteDetailQuery.type";

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ title: string; content: string } | null>(null);
  const noteNumberRef = useRef(noteNumber);
  const updateMutation = useUpdateNoteMutation();

  useEffect(() => {
    setTitle(noteDetail?.title ?? "");
    setContent(noteDetail?.content ?? "");
    setSaveStatus("idle");
    pendingRef.current = null;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [noteDetail]);

  useEffect(() => {
    noteNumberRef.current = noteNumber;
  }, [noteNumber]);

  const save = (value: { title: string; content: string }, targetNoteNumber: number) => {
    if (targetNoteNumber <= 0 || !value.content) return;
    setSaveStatus("saving");
    pendingRef.current = null;
    updateMutation.mutate(
      {
        noteNumber: targetNoteNumber,
        title: value.title || undefined,
        content: value.content,
      },
      {
        onSuccess: () => setSaveStatus("saved"),
        onError: () => setSaveStatus("error"),
      },
    );
  };

  const scheduleSave = (newTitle: string, newContent: string) => {
    pendingRef.current = { title: newTitle, content: newContent };

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const currentNoteNumber = noteNumberRef.current;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (pendingRef.current) {
        save(pendingRef.current, currentNoteNumber);
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
      save(pendingRef.current, noteNumberRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (pendingRef.current !== null && noteNumberRef.current > 0) {
        const { title: t, content: c } = pendingRef.current;
        const n = noteNumberRef.current;
        if (c) {
          api.patch(`/api/v1/notes/${n}`, { title: t || undefined, content: c }).catch(() => {});
        }
      }
    };
  }, []);

  return { title, content, saveStatus, onTitleChange, onContentChange, flush };
};

export default useNoteEditor;
