import { useCallback, useEffect, useRef } from "react";

import useAuthStore from "@lib/stores/useAuthStore/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";

export type NoteStreamPhase =
  | "idle"
  | "pending"
  | "processing"
  | "summary_ready"
  | "actions_ready"
  | "entities_ready"
  | "completed"
  | "failed";

const useNoteStream = (onPhaseChange?: (phase: NoteStreamPhase) => void) => {
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);
  // ref로 감싸서 subscribe의 참조 안정성 보장
  const phaseRef = useRef(onPhaseChange);
  phaseRef.current = onPhaseChange;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const subscribe = useCallback(
    async (noteNumber: number) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const token = useAuthStore.getState().accessToken;
        const response = await fetch(`/api/v1/notes/${noteNumber}/stream`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let currentEvent = "";

        const processLines = (lines: string[]) => {
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
            } else if (line === "") {
              console.log(`[NoteStream #${noteNumber}]`, currentEvent);
              switch (currentEvent) {
                case "pending":
                case "processing":
                  phaseRef.current?.(currentEvent);
                  queryClient.invalidateQueries({
                    queryKey: ["notes", "detail", noteNumber],
                  });
                  break;

                case "summary_ready":
                  phaseRef.current?.("summary_ready");
                  queryClient.invalidateQueries({
                    queryKey: ["notes", "detail", noteNumber],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["notes", "list"],
                  });
                  break;

                case "actions_ready":
                  phaseRef.current?.("actions_ready");
                  queryClient.invalidateQueries({
                    queryKey: ["notes", "actions", noteNumber],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["notes", "detail", noteNumber],
                  });
                  break;

                case "entities_ready":
                  phaseRef.current?.("entities_ready");
                  queryClient.invalidateQueries({
                    queryKey: ["notes", "related", noteNumber],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["notes", "detail", noteNumber],
                  });
                  break;

                case "completed":
                case "failed":
                  phaseRef.current?.(currentEvent as NoteStreamPhase);
                  queryClient.invalidateQueries({ queryKey: ["notes"] });
                  currentEvent = "";
                  return true;

                default:
                  // 알 수 없는 이벤트 무시
                  break;
              }
              currentEvent = "";
            }
          }
          return false;
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            if (buffer.trim()) {
              const remaining = buffer.split("\n");
              remaining.push("");
              if (processLines(remaining)) break;
            }
            phaseRef.current?.("completed");
            queryClient.invalidateQueries({ queryKey: ["notes"] });
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          if (processLines(lines)) break;
        }
      } catch {
        // aborted or network error
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [queryClient],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  return { subscribe, abort };
};

export default useNoteStream;
