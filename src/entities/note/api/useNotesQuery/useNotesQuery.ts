import { useQuery } from "@tanstack/react-query";

import { api } from "@shared/api/axios";
import noteKeys from "../keys";
import type { UseNotesParams, UseNotesResponse } from "./useNotesQuery.type";

const getNotes = async (params?: UseNotesParams) => {
  const response = await api.get<UseNotesResponse>("/api/v1/notes", {
    params,
  });

  return response.data;
};

const useNotesQuery = (params?: UseNotesParams) => {
  return useQuery({
    queryKey: noteKeys.list(params),
    queryFn: () => getNotes(params),
  });
};

export default useNotesQuery;
