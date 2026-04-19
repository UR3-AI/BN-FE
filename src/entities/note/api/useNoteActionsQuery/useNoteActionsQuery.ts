import { useQuery } from "@tanstack/react-query";

import { api } from "@shared/api/axios";
import noteKeys from "../keys";
import type { UseNoteActionsParams, UseNoteActionsResponse } from "./useNoteActionsQuery.type";

const getNoteActions = async ({ noteNumber }: UseNoteActionsParams) => {
  const response = await api.get<UseNoteActionsResponse>(`/api/v1/notes/${noteNumber}/actions`);

  return response.data;
};

const useNoteActionsQuery = (params: UseNoteActionsParams) => {
  return useQuery({
    queryKey: noteKeys.actions(params.noteNumber),
    queryFn: () => getNoteActions(params),
    enabled: params.noteNumber > 0,
  });
};

export default useNoteActionsQuery;
