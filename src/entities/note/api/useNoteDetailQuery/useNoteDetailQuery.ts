import { useQuery } from "@tanstack/react-query";

import { api } from "@shared/api/axios";
import noteKeys from "../keys";
import type { UseNoteDetailParams, UseNoteDetailResponse } from "./useNoteDetailQuery.type";

const getNoteDetail = async ({ noteNumber }: UseNoteDetailParams) => {
  const response = await api.get<UseNoteDetailResponse>(`/api/v1/notes/${noteNumber}`);

  return response.data;
};

const useNoteDetailQuery = (params: UseNoteDetailParams) => {
  return useQuery({
    queryKey: noteKeys.detail(params.noteNumber),
    queryFn: () => getNoteDetail(params),
    enabled: params.noteNumber > 0,
  });
};

export default useNoteDetailQuery;
