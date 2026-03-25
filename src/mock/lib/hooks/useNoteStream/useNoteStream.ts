import { useCallback, useEffect, useRef } from "react";

import useAuthStore from "@lib/stores/useAuthStore/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";

const useNoteStream = () => {
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

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
                  // 상태 변화 반영 → isBusy 갱신
                  queryClient.invalidateQueries({
                    queryKey: ["notes", "detail", noteNumber],
                  });
                  break;

                case "summary_ready":
                  // 요약/태그 즉시 표시 + processing_status 갱신
                  queryClient.invalidateQueries({
                    queryKey: ["notes", "detail", noteNumber],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["notes", "list"],
                  });
                  break;

                case "actions_ready":
                  // 액션아이템 즉시 표시
                  queryClient.invalidateQueries({
                    queryKey: ["notes", "actions", noteNumber],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["notes", "detail", noteNumber],
                  });
                  break;

                case "entities_ready":
                  // 그래프 즉시 표시
                  queryClient.invalidateQueries({
                    queryKey: ["notes", "related", noteNumber],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["notes", "detail", noteNumber],
                  });
                  break;

                case "completed":
                case "failed":
                  // 전체 갱신 → isBusy=false, 미저장 PATCH 허용
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
