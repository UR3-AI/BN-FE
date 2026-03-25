import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type { DeleteChatSessionRequest } from "./useDeleteChatSessionMutation.type";

const deleteChatSession = async (sessionId: DeleteChatSessionRequest) => {
  await api.delete(`/api/v1/chat/sessions/${sessionId}`);
};

const useDeleteChatSessionMutation = () => {
  return useMutation({ mutationFn: deleteChatSession });
};

export default useDeleteChatSessionMutation;
