import { useQuery } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import notesKeys from "../keys";
import type { NoteActionsResponse } from "./useNoteActionsQuery.type";

const fetchNoteActions = async (noteNumber: number) => {
  const response = await api.get<NoteActionsResponse>(`/api/v1/notes/${noteNumber}/actions`);

  return response.data;
};

const useNoteActionsQuery = (noteNumber: number) => {
  return useQuery({
    queryKey: notesKeys.actions(noteNumber),
    queryFn: () => fetchNoteActions(noteNumber),
  });
};

export default useNoteActionsQuery;
