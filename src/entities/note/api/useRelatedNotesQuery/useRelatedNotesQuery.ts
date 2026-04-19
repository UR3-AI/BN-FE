import { useQuery } from "@tanstack/react-query";

import { api } from "@shared/api/axios";
import noteKeys from "../keys";
import type { UseRelatedNotesParams, UseRelatedNotesResponse } from "./useRelatedNotesQuery.type";

const getRelatedNotes = async ({ noteNumber, ...params }: UseRelatedNotesParams) => {
  const response = await api.get<UseRelatedNotesResponse>(`/api/v1/notes/${noteNumber}/related`, {
    params,
  });

  return response.data;
};

const useRelatedNotesQuery = (params: UseRelatedNotesParams) => {
  return useQuery({
    queryKey: noteKeys.related(params.noteNumber),
    queryFn: () => getRelatedNotes(params),
    enabled: params.noteNumber > 0,
  });
};

export default useRelatedNotesQuery;
