import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import type { PinNoteRequest, PinNoteResponse } from "./usePinNoteMutation.type";

const pinNote = async ({ noteNumber, pinned }: PinNoteRequest) => {
  const response = await api.post<PinNoteResponse>(`/api/v1/notes/${noteNumber}/pin`, { pinned });
  return response.data;
};

const usePinNoteMutation = () => {
  return useMutation({ mutationFn: pinNote });
};

export default usePinNoteMutation;
