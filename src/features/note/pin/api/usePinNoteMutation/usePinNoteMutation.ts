import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@shared/api/axios";
import { noteKeys } from "@entities/note";
import type { UsePinNoteRequest, UsePinNoteResponse } from "./usePinNoteMutation.type";

const pinNote = async ({ noteNumber, pinned }: UsePinNoteRequest) => {
  const response = await api.post<UsePinNoteResponse>(`/api/v1/notes/${noteNumber}/pin`, {
    pinned,
  });

  return response.data;
};

const usePinNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pinNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists });
    },
  });
};

export default usePinNoteMutation;
