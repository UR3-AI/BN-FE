import { useCallback, useEffect, useRef, useState } from "react";

import type { NoteStreamPhase } from "@entities/note";
import { useQueryClient } from "@tanstack/react-query";

import type { UseNoteStreamParams, UseNoteStreamReturn } from "./useNoteStream.type";
import { connectStream } from "./utils";

const useNoteStream = ({
  noteNumber,
  enabled = false,
}: UseNoteStreamParams): UseNoteStreamReturn => {
  const [phase, setPhase] = useState<NoteStreamPhase>("idle");

  const abortRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const unsubscribe = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const subscribe = useCallback(() => {
    unsubscribe();

    if (noteNumber <= 0) return;

    const controller = new AbortController();
    abortRef.current = controller;

    connectStream({
      noteNumber,
      signal: controller.signal,
      onPhase: setPhase,
      queryClient,
    });
  }, [noteNumber, queryClient, unsubscribe]);

  useEffect(() => {
    if (!enabled || noteNumber <= 0) return unsubscribe;

    subscribe();

    return unsubscribe;
  }, [enabled, noteNumber, subscribe, unsubscribe]);

  return { phase, subscribe, unsubscribe };
};

export default useNoteStream;
