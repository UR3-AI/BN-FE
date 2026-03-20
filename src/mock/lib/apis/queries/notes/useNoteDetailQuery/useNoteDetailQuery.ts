import { useQuery } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import notesKeys from "../keys";
import type { NoteDetailResponse } from "./useNoteDetailQuery.type";

const fetchNoteDetail = async (noteNumber: number) => {
  const response = await api.get<NoteDetailResponse>(`/api/v1/notes/${noteNumber}`);

  return response.data;
};

const useNoteDetailQuery = (noteNumber: number) => {
  return useQuery({
    queryKey: notesKeys.detail(noteNumber),
    queryFn: () => fetchNoteDetail(noteNumber),
    enabled: !!noteNumber,
  });
};

export default useNoteDetailQuery;
