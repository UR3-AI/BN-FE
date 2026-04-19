import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@shared/api/axios";
import noteKeys from "../keys";
import type {
  UseReprocessNoteRequest,
  UseReprocessNoteResponse,
} from "./useReprocessNoteMutation.type";

const reprocessNote = async ({ noteNumber }: UseReprocessNoteRequest) => {
  const response = await api.post<UseReprocessNoteResponse>(
    `/api/v1/notes/${noteNumber}/reprocess`,
  );

  return response.data;
};

const useReprocessNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reprocessNote,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(variables.noteNumber) });
      queryClient.invalidateQueries({ queryKey: noteKeys.actions(variables.noteNumber) });
      queryClient.invalidateQueries({ queryKey: noteKeys.related(variables.noteNumber) });
    },
  });
};

export default useReprocessNoteMutation;
