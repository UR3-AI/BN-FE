import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type {
  ReprocessNoteRequest,
  ReprocessNoteResponse,
} from "./useReprocessNoteMutation.type";

const reprocessNote = async (noteNumber: ReprocessNoteRequest) => {
  const response = await api.post<ReprocessNoteResponse>(
    `/api/v1/notes/${noteNumber}/reprocess`,
  );
  return response.data;
};

const useReprocessNoteMutation = () => {
  return useMutation({ mutationFn: reprocessNote });
};

export default useReprocessNoteMutation;
