import { useMutation } from "@tanstack/react-query";

import { api } from "../../../axios";
import type {
  UseCreateNoteMutationRequest,
  UseCreateNoteMutationResponse,
} from "./useCreateNoteMutation.type";

const createNote = async (data: UseCreateNoteMutationRequest) => {
  const response = await api.post<UseCreateNoteMutationResponse>(
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
