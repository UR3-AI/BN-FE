import { useEffect, useRef, useState } from "react";

import useUpdateNoteMutation from "@/mock/lib/apis/mutations/notes/useUpdateNoteMutation/useUpdateNoteMutation";
import type { NoteDetailResponse } from "@/mock/lib/apis/queries/notes/useNoteDetailQuery/useNoteDetailQuery.type";
import { api } from "@lib/apis/axios";
import { useQueryClient } from "@tanstack/react-query";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 2500;

// 노트별 미저장 로컬 편집 내용 (모듈 싱글턴 — 단일 에디터 인스턴스 전제, 최대 20개)
const MAX_UNSAVED = 20;
const unsavedEditsMap = new Map<number, { title: string; content: string }>();

const addUnsaved = (
  noteNumber: number,
  data: { title: string; content: string },
) => {
  unsavedEditsMap.set(noteNumber, data);
  // 오래된 항목 정리
  if (unsavedEditsMap.size > MAX_UNSAVED) {
    const firstKey = unsavedEditsMap.keys().next().value;
    if (firstKey !== undefined) unsavedEditsMap.delete(firstKey);
  }
};

const useNoteEditor = ({
  noteDetail,
  noteNumber,
  onSaveSuccess,
}: {
  noteDetail: NoteDetailResponse | undefined;
  noteNumber: number;
  onSaveSuccess?: (noteNumber: number) => void;
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [syncedNoteNumber, setSyncedNoteNumber] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{
    title: string;
    content: string;
    noteNumber: number;
  } | null>(null);
  const updateMutation = useUpdateNoteMutation();
  const queryClient = useQueryClient();

  // noteDetail 미로드 또는 pending/processing 중에는 PATCH 차단
  const isBusy =
    !noteDetail ||
    noteDetail.processing_status === "processing" ||
    noteDetail.processing_status === "pending";
  const isBusyRef = useRef(isBusy);
  isBusyRef.current = isBusy;

  // 렌더 중 동기화: noteDetail이 새 노트로 바뀌면 즉시 content 설정
  if (noteDetail && noteDetail.note_number !== syncedNoteNumber) {
    // 이전 노트의 pending을 unsavedEditsMap에 보관
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pendingRef.current !== null && pendingRef.current.noteNumber > 0) {
      addUnsaved(pendingRef.current.noteNumber, {
        title: pendingRef.current.title,
        content: pendingRef.current.content,
      });
    }

    pendingRef.current = null;
    setSyncedNoteNumber(noteDetail.note_number);

    // 로컬에 미저장 편집이 있으면 서버 데이터 대신 로컬 데이터 사용
    const unsaved = unsavedEditsMap.get(noteDetail.note_number);
    if (unsaved) {
      setTitle(unsaved.title);
      setContent(unsaved.content);
      setSaveStatus("idle");
    } else {
      setTitle(noteDetail.title ?? "");
      setContent(noteDetail.content ?? "");
      setSaveStatus("idle");
    }
  }

  // 노트 전환 시 이전 노트의 pending을 flush 시도
  useEffect(() => {
    // 현재 노트 이외의 모든 미저장 항목을 flush 시도
    for (const [num, data] of unsavedEditsMap.entries()) {
      if (num === noteNumber) continue;
      if (data.title || data.content) {
        api
          .patch(`/api/v1/notes/${num}`, {
            title: data.title || undefined,
            content: data.content || " ",
          })
          .then(() => {
            unsavedEditsMap.delete(num);
          })
          .catch(() => {
            // 409 등 실패 시 맵에 유지 → 나중에 재시도
          });
      }
    }
  }, [syncedNoteNumber, noteNumber]);

  const save = (
    value: { title: string; content: string },
    targetNoteNumber: number,
  ) => {
    if (targetNoteNumber <= 0) return;
    if (!value.title && !value.content) return;

    // busy 중이면 저장하지 않고 pending + unsavedEditsMap에 보관
    if (isBusyRef.current) {
      pendingRef.current = { ...value, noteNumber: targetNoteNumber };
      addUnsaved(targetNoteNumber, {
        title: value.title,
        content: value.content,
      });
      // 이전 재시도 타이머 정리
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        if (pendingRef.current) {
          save(pendingRef.current, pendingRef.current.noteNumber);
        }
      }, DEBOUNCE_MS);
      return;
    }

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
          unsavedEditsMap.delete(targetNoteNumber);
          // PATCH 성공 → 백엔드 reprocess 시작 → SSE 재구독 필요
          onSaveSuccess?.(targetNoteNumber);
          queryClient.setQueryData<NoteDetailResponse>(
            ["notes", "detail", targetNoteNumber],
            old => {
              if (!old) return old;
              // PATCH 성공 → 백엔드가 reprocess 트리거하므로 pending으로 설정
              return {
                ...old,
                title: savedTitle || old.title,
                content: savedContent,
                processing_status: "pending",
              };
            },
          );
        },
        onError: () => {
          setSaveStatus("error");
          // 실패 시 미저장 맵에 보관
          addUnsaved(targetNoteNumber, {
            title: savedTitle,
            content: savedContent,
          });
        },
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

  // ref로 최신 값 추적 (stale closure 방지)
  const titleRef = useRef(title);
  titleRef.current = title;
  const contentRef = useRef(content);
  contentRef.current = content;

  const onTitleChange = (value: string) => {
    setTitle(value);
    titleRef.current = value;
    scheduleSave(value, contentRef.current);
  };

  const onContentChange = (value: string) => {
    setContent(value);
    contentRef.current = value;
    scheduleSave(titleRef.current, value);
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
        addUnsaved(n, { title: t, content: c });
        if (t || c) {
          api
            .patch(`/api/v1/notes/${n}`, {
              title: t || undefined,
              content: c || " ",
            })
            .catch(() => {});
        }
      }
    };
  }, []);

  return { title, content, saveStatus, onTitleChange, onContentChange, flush };
};

export default useNoteEditor;
