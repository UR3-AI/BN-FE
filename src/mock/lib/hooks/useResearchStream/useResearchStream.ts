import { useCallback, useEffect, useRef, useState } from "react";

import useAuthStore from "@lib/stores/useAuthStore/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";

interface ResearchStreamState {
  status: "idle" | "streaming" | "completed" | "failed";
  content: string;
}

const useResearchStream = () => {
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);
  const [state, setState] = useState<ResearchStreamState>({
    status: "idle",
    content: "",
  });

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const subscribe = useCallback(
    async (actionId: number) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({ status: "streaming", content: "" });

      try {
        const token = useAuthStore.getState().accessToken;
        const response = await fetch(
          `/api/v1/actions/${actionId}/research/stream`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            signal: controller.signal,
          },
        );
        if (!response.ok || !response.body) {
          setState(prev => ({ ...prev, status: "failed" }));
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        let currentEvent = "";

        const processLines = (lines: string[]) => {
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  setState(prev => ({
                    ...prev,
                    content: prev.content + data.content,
                  }));
                }
              } catch {
                // ignore parse errors
              }
            } else if (line === "") {
              if (currentEvent === "completed") {
                setState(prev => ({ ...prev, status: "completed" }));
                queryClient.invalidateQueries({ queryKey: ["notes"] });
                return true;
              }
              if (currentEvent === "failed") {
                setState(prev => ({ ...prev, status: "failed" }));
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
            // 스트림 종료 시 남은 buffer 처리
            if (buffer.trim()) {
              const remaining = buffer.split("\n");
              remaining.push("");
              if (processLines(remaining)) return;
            }
            // 스트림이 끝났는데 completed/failed 이벤트가 없으면 완료 처리
            if (currentEvent === "completed" || currentEvent === "") {
              setState(prev => ({ ...prev, status: "completed" }));
              queryClient.invalidateQueries({ queryKey: ["notes"] });
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          if (processLines(lines)) return;
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

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState({ status: "idle", content: "" });
  }, []);

  return { ...state, subscribe, reset };
};

export default useResearchStream;
