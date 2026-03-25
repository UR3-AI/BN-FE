import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type {
  NoteCreateRequest,
  NoteCreateResponse,
} from "./useCreateNoteMutation.type";

const mutationFn = async (data: NoteCreateRequest) => {
  const response = await api.post<NoteCreateResponse>("/api/v1/notes", data);
  return response.data;
};

const useCreateNoteMutation = () => {
  return useMutation({ mutationFn });
};

export default useCreateNoteMutation;
