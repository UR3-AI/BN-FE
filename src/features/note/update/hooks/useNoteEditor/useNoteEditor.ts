import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { SECOND } from "@shared/constants";
import { updateNote, useUpdateNoteMutation } from "@entities/note";

import type { NoteEditorForm, SaveStatus, UseNoteEditorParams } from "./useNoteEditor.type";

const SAVE_DELAY = SECOND * 2.5;
const SAVED_DISPLAY_DURATION = SECOND * 2;
const MAX_UNSAVED_ENTRIES = 20;

/**
 * 모듈 레벨 싱글턴: 노트별 미저장 편집 내용을 메모리에 보관한다.
 * - 노트 전환 시 아직 서버에 반영되지 않은 편집을 보존
 * - 최대 20개까지 유지, 초과 시 가장 오래된 항목 제거
 * - 저장 성공 시 해당 항목 삭제
 */
const unsavedEditsMap = new Map<number, { title: string; content: string }>();

const useNoteEditor = ({ noteNumber, noteDetail, onSaveSuccess }: UseNoteEditorParams) => {
  // ──────────────────────────────────────────────
  // 1. 데이터 소스 & 폼
  // ──────────────────────────────────────────────
  const updateNoteMutation = useUpdateNoteMutation();

  const form = useForm<NoteEditorForm>({
    defaultValues: { title: "", content: "" },
  });

  const { control, reset, getValues } = form;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);
  const onSaveSuccessRef = useRef(onSaveSuccess);

  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess;
  }, [onSaveSuccess]);

  // ──────────────────────────────────────────────
  // 2. 초기화: 서버 데이터 → 폼 동기화
  //    unsavedEditsMap에 로컬 편집이 있으면 우선 사용
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!noteDetail || initializedRef.current) return;

    const unsaved = unsavedEditsMap.get(noteNumber);
    const nextTitle = unsaved?.title ?? noteDetail.title ?? "";
    const nextContent = unsaved?.content ?? noteDetail.content ?? "";

    reset({ title: nextTitle, content: nextContent });
    initializedRef.current = true;
  }, [noteDetail, noteNumber, reset]);

  // ──────────────────────────────────────────────
  // 3. 변경 감지 (React Hook Form → useWatch)
  // ──────────────────────────────────────────────
  const title = useWatch({ control, name: "title" });
  const content = useWatch({ control, name: "content" });

  // ──────────────────────────────────────────────
  // 4. 저장 실행: mutation.mutate + onSuccess/onError 콜백
  //    성공 → "saved" 표시 (2초 후 "idle") + onSaveSuccess 콜백
  //    실패 → "error" 표시
  // ──────────────────────────────────────────────
  const executeSave = useCallback(
    (saveTitle: string, saveContent: string) => {
      setSaveStatus("saving");

      updateNoteMutation.mutate(
        {
          noteNumber,
          title: saveTitle || null,
          // COMMENT-JY : 빈 content를 공백(" ")으로 전송: API가 빈 문자열을 허용하지 않음
          content: saveContent || " ",
        },
        {
          onSuccess: () => {
            setSaveStatus("saved");
            unsavedEditsMap.delete(noteNumber);
            onSaveSuccessRef.current?.();

            savedTimerRef.current = setTimeout(() => {
              setSaveStatus("idle");
            }, SAVED_DISPLAY_DURATION);
          },
          onError: () => {
            setSaveStatus("error");
          },
        },
      );
    },
    [noteNumber, updateNoteMutation],
  );

  // ──────────────────────────────────────────────
  // 5. 디바운스 스케줄러: 2500ms 후 저장 시도
  //    Busy Guard — AI 처리 중이면 저장을 보류하고 재스케줄
  //    scheduleRef로 자기 참조하여 ESLint 선언 전 접근 오류 회피
  // ──────────────────────────────────────────────
  const scheduleRef = useRef<((t: string, c: string) => void) | null>(null);

  const scheduleSave = useCallback(
    (saveTitle: string, saveContent: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        const processingStatus = noteDetail?.processing_status;

        if (processingStatus === "processing" || processingStatus === "pending") {
          scheduleRef.current?.(saveTitle, saveContent);
          return;
        }

        executeSave(saveTitle, saveContent);
      }, SAVE_DELAY);
    },
    [executeSave, noteDetail?.processing_status],
  );

  useEffect(() => {
    scheduleRef.current = scheduleSave;
  }, [scheduleSave]);

  // ──────────────────────────────────────────────
  // 6. 폼 변경 → unsavedEditsMap 갱신 + 디바운스 저장 예약
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!initializedRef.current) return;

    if (unsavedEditsMap.size >= MAX_UNSAVED_ENTRIES && !unsavedEditsMap.has(noteNumber)) {
      const oldestKey = unsavedEditsMap.keys().next().value;

      if (oldestKey !== undefined) {
        unsavedEditsMap.delete(oldestKey);
      }
    }

    unsavedEditsMap.set(noteNumber, { title, content });
    scheduleRef.current?.(title, content);
  }, [title, content, noteNumber]);

  // ──────────────────────────────────────────────
  // 7. flushUnsaved: 미저장 내용 즉시 fire-and-forget 전송
  //    flush(외부 호출)와 cleanup(언마운트) 양쪽에서 재사용
  // ──────────────────────────────────────────────
  const flushUnsaved = useCallback(() => {
    if (!unsavedEditsMap.has(noteNumber)) return;

    const { title: t, content: c } = getValues();
    // 빈 content를 공백(" ")으로 전송: API가 빈 문자열을 허용하지 않음
    updateNote({ noteNumber, title: t || null, content: c || " " });
    unsavedEditsMap.delete(noteNumber);
  }, [noteNumber, getValues]);

  // ──────────────────────────────────────────────
  // 8. flush: 노트 전환 시 외부에서 호출
  //    디바운스 타이머 취소 + flushUnsaved
  // ──────────────────────────────────────────────
  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    flushUnsaved();
  }, [flushUnsaved]);

  // ──────────────────────────────────────────────
  // 9. 언마운트 cleanup: 타이머 정리 + flushUnsaved
  //    key={noteNumber}로 리마운트되므로 노트 전환 시에도 실행됨
  // ──────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);

      flushUnsaved();
    };
  }, [flushUnsaved]);

  return { form, saveStatus, flush };
};

export default useNoteEditor;
