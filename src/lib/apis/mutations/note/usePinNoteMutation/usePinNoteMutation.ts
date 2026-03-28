import { useMutation } from "@tanstack/react-query";

import { api } from "../../../axios";
import type {
  UsePinNoteRequest,
  UsePinNoteResponse,
} from "./usePinNoteMutation.type";

const pinNote = async ({ noteNumber, pinned }: UsePinNoteRequest) => {
  const response = await api.post<UsePinNoteResponse>(
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
