import { useEffect, useRef, useState } from "react";

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
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingContentRef = useRef<string | null>(null);
  const noteNumberRef = useRef(noteNumber);
  const updateMutation = useUpdateNoteMutation();

  useEffect(() => {
    setContent(noteDetail?.content ?? "");
    setSaveStatus("idle");
    pendingContentRef.current = null;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [noteDetail]);

  useEffect(() => {
    noteNumberRef.current = noteNumber;
  }, [noteNumber]);

  const save = (value: string, targetNoteNumber: number) => {
    if (targetNoteNumber <= 0) return;
    setSaveStatus("saving");
    pendingContentRef.current = null;
    updateMutation.mutate(
      { noteNumber: targetNoteNumber, content: value },
      {
        onSuccess: () => setSaveStatus("saved"),
        onError: () => setSaveStatus("error"),
      },
    );
  };

  const onContentChange = (value: string) => {
    setContent(value);
    pendingContentRef.current = value;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const currentNoteNumber = noteNumberRef.current;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      save(value, currentNoteNumber);
    }, DEBOUNCE_MS);
  };

  const flush = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pendingContentRef.current !== null) {
      save(pendingContentRef.current, noteNumberRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { content, saveStatus, onContentChange, flush };
};

export default useNoteEditor;
