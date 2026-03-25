import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type {
  ProjectNotesRequest,
  ProjectNotesResponse,
} from "./useProjectNotesMutation.type";

const manageProjectNotes = async ({
  projectId,
  noteNumber,
  action,
}: ProjectNotesRequest) => {
  const response = await api.post<ProjectNotesResponse>(
    `/api/v1/projects/${projectId}/notes`,
    { note_number: noteNumber, action },
  );
  return response.data;
};

const useProjectNotesMutation = () => {
  return useMutation({ mutationFn: manageProjectNotes });
};

export default useProjectNotesMutation;
