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
              if (currentEvent === "completed" || currentEvent === "failed") {
                queryClient.invalidateQueries({ queryKey: ["notes"] });
                return true;
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
