import { useMutation } from "@tanstack/react-query";

import { api } from "../../../axios";
import type {
  UseCreateNoteRequest,
  UseCreateNoteResponse,
} from "./useCreateNoteMutation.type";

const createNote = async (data: UseCreateNoteRequest) => {
  const response = await api.post<UseCreateNoteResponse>(
    "/api/v1/notes",
    data,
  );

  return response.data;
};

const useCreateNoteMutation = () => {
  return useMutation({
    mutationFn: createNote,
  });
};

export default useCreateNoteMutation;
