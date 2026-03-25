import { api } from "@lib/apis/axios";
import { useMutation } from "@tanstack/react-query";

import type { ChatRequest, ChatResponse } from "./useChatMutation.type";

const chat = async (data: ChatRequest) => {
  const response = await api.post<ChatResponse>("/api/v1/chat", data);
  return response.data;
};

const useChatMutation = () => {
  return useMutation({ mutationFn: chat });
};

export default useChatMutation;
