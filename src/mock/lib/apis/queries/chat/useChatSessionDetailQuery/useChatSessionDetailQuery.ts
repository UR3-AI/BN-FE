import { useQuery } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import chatKeys from "../keys";
import type { ChatSessionDetailResponse } from "./useChatSessionDetailQuery.type";

const fetchChatSessionDetail = async (sessionId: string) => {
  const response = await api.get<ChatSessionDetailResponse>(
    `/api/v1/chat/sessions/${sessionId}`,
  );
  return response.data;
};

const useChatSessionDetailQuery = (sessionId: string) => {
  return useQuery({
    queryKey: chatKeys.session(sessionId),
    queryFn: () => fetchChatSessionDetail(sessionId),
    enabled: !!sessionId,
  });
};

export default useChatSessionDetailQuery;
