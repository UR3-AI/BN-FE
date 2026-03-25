import { api } from "@lib/apis/axios";
import { useQuery } from "@tanstack/react-query";

import notesKeys from "../keys";
import type { RelatedNotesResponse } from "./useRelatedNotesQuery.type";

const fetchRelatedNotes = async (noteNumber: number) => {
  const response = await api.get<RelatedNotesResponse>(
    `/api/v1/notes/${noteNumber}/related`,
  );

  return response.data;
};

const useRelatedNotesQuery = (noteNumber: number) => {
  return useQuery({
    queryKey: notesKeys.related(noteNumber),
    queryFn: () => fetchRelatedNotes(noteNumber),
    enabled: !!noteNumber,
  });
};

export default useRelatedNotesQuery;
