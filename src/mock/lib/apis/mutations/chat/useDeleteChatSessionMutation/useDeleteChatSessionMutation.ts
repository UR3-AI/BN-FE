import { useMutation } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import type { DeleteChatSessionRequest } from "./useDeleteChatSessionMutation.type";

const deleteChatSession = async (sessionId: DeleteChatSessionRequest) => {
  await api.delete(`/api/v1/chat/sessions/${sessionId}`);
};

const useDeleteChatSessionMutation = () => {
  return useMutation({ mutationFn: deleteChatSession });
};

export default useDeleteChatSessionMutation;
