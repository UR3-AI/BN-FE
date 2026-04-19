import type {
  ActionsReadyPayload,
  CompletedPayload,
  NoteStreamPhase,
  SavingPayload,
  SummaryReadyPayload,
} from "@entities/note";
import { noteKeys } from "@entities/note";
import type { QueryClient } from "@tanstack/react-query";

import { patchDetailCache, patchListItemCache } from "./noteStreamCache";

const handleStreamEvent = (
  phase: NoteStreamPhase,
  payload: unknown,
  noteNumber: number,
  queryClient: QueryClient,
) => {
  switch (phase) {
    case "processing":
      patchDetailCache(queryClient, noteNumber, { processing_status: "processing" });
      return;

    case "summary_ready": {
      const data = payload as SummaryReadyPayload | null;

      if (!data) return;

      const patch = { title: data.title, summary: data.summary, tags: data.tags };

      patchDetailCache(queryClient, noteNumber, patch);
      patchListItemCache(queryClient, noteNumber, patch);
      return;
    }

    case "actions_ready": {
      const data = payload as ActionsReadyPayload | null;

      queryClient.invalidateQueries({ queryKey: noteKeys.actions(noteNumber) });

      if (data) {
        patchListItemCache(queryClient, noteNumber, {
          has_action_items: data.action_item_count > 0,
        });
      }

      return;
    }

    case "entities_ready":
      queryClient.invalidateQueries({ queryKey: noteKeys.related(noteNumber) });
      return;

    case "saving": {
      const data = payload as SavingPayload | null;

      if (!data) return;

      const base = { title: data.title, summary: data.summary, tags: data.tags };

      patchDetailCache(queryClient, noteNumber, base);
      patchListItemCache(queryClient, noteNumber, {
        ...base,
        has_action_items: data.action_item_count > 0,
      });
      return;
    }

    case "completed": {
      const data = payload as CompletedPayload | null;

      if (!data) {
        patchDetailCache(queryClient, noteNumber, { processing_status: "completed" });
        patchListItemCache(queryClient, noteNumber, { processing_status: "completed" });
        return;
      }

      const base = { title: data.title, summary: data.summary, tags: data.tags };

      patchDetailCache(queryClient, noteNumber, { ...base, processing_status: "completed" });
      patchListItemCache(queryClient, noteNumber, {
        ...base,
        processing_status: "completed",
        has_action_items: data.action_item_count > 0,
      });
      return;
    }

    case "failed":
      patchDetailCache(queryClient, noteNumber, { processing_status: "failed" });
      patchListItemCache(queryClient, noteNumber, { processing_status: "failed" });
      return;
  }
};

export default handleStreamEvent;
