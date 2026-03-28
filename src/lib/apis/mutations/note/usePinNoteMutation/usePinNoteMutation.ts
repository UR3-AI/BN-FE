import { useMutation } from "@tanstack/react-query";

import { api } from "../../../axios";
import type {
  UsePinNoteMutationRequest,
  UsePinNoteMutationResponse,
} from "./usePinNoteMutation.type";

const pinNote = async ({ noteNumber, pinned }: UsePinNoteMutationRequest) => {
  const response = await api.post<UsePinNoteMutationResponse>(
    `/api/v1/notes/${noteNumber}/pin`,
    { pinned },
  );

  return response.data;
};

const usePinNoteMutation = () => {
  return useMutation({
    mutationFn: pinNote,
  });
};

export default usePinNoteMutation;
