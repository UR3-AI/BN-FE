import { useQuery } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import notesKeys from "../keys";
import type { NoteListResponse, UseNotesQueryParams } from "./useNotesQuery.type";

const fetchNotes = async (params: UseNotesQueryParams) => {
  const response = await api.get<NoteListResponse>("/api/v1/notes", { params });

  return response.data;
};

const useNotesQuery = (params: UseNotesQueryParams = {}) => {
  return useQuery({
    queryKey: [...notesKeys.list, params],
    queryFn: () => fetchNotes(params),
  });
};

export default useNotesQuery;
