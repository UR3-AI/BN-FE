import { useAuthStore } from "@entities/auth";
import type { NoteStreamPhase } from "@entities/note";
import type { QueryClient } from "@tanstack/react-query";

import handleStreamEvent from "./handleStreamEvent";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";
const FRAME_DELIMITER = "\n\n";

interface ParsedFrame {
  phase: NoteStreamPhase | null;
  payload: unknown;
}

const parseFrame = (frame: string): ParsedFrame => {
  let phase: NoteStreamPhase | null = null;
  let dataLine: string | null = null;

  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) {
      phase = line.slice(6).trim() as NoteStreamPhase;
    } else if (line.startsWith("data:")) {
      dataLine = line.slice(5).trim();
    }
  }

  let payload: unknown = null;

  if (dataLine) {
    try {
      payload = JSON.parse(dataLine);
    } catch {
      payload = null;
    }
  }

  return { phase, payload };
};

const dispatchFrame = (
  frame: string,
  noteNumber: number,
  onPhase: (phase: NoteStreamPhase) => void,
  queryClient: QueryClient,
) => {
  const { phase, payload } = parseFrame(frame);

  if (!phase) return;

  onPhase(phase);
  handleStreamEvent(phase, payload, noteNumber, queryClient);
};

interface ConnectStreamParams {
  noteNumber: number;
  signal: AbortSignal;
  onPhase: (phase: NoteStreamPhase) => void;
  queryClient: QueryClient;
}

const connectStream = async ({
  noteNumber,
  signal,
  onPhase,
  queryClient,
}: ConnectStreamParams) => {
  const { accessToken } = useAuthStore.getState();

  if (!accessToken) return;

  onPhase("pending");

  try {
    const response = await fetch(`${BASE_URL}/api/v1/notes/${noteNumber}/stream`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    });

    if (!response.ok || !response.body) {
      onPhase("failed");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // COMMENT-JY : SSE 프레임은 공백 줄(\n\n)로 구분. 마지막 미완성 프레임은 버퍼에 보존
      const frames = buffer.split(FRAME_DELIMITER);
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        if (!frame.trim()) continue;

        dispatchFrame(frame, noteNumber, onPhase, queryClient);
      }
    }

    if (buffer.trim()) {
      dispatchFrame(buffer, noteNumber, onPhase, queryClient);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;

    onPhase("failed");
  }
};

export default connectStream;
