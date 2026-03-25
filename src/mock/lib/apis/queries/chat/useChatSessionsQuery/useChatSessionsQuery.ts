import { api } from "@lib/apis/axios";
import { useQuery } from "@tanstack/react-query";

import chatKeys from "../keys";
import type {
  ChatSessionListResponse,
  UseChatSessionsQueryParams,
} from "./useChatSessionsQuery.type";

const fetchChatSessions = async (params: UseChatSessionsQueryParams) => {
  const response = await api.get<ChatSessionListResponse>(
    "/api/v1/chat/sessions",
    { params },
  );
  return response.data;
};

const useChatSessionsQuery = (params: UseChatSessionsQueryParams = {}) => {
  return useQuery({
    queryKey: [...chatKeys.sessions, params],
    queryFn: () => fetchChatSessions(params),
  });
};

export default useChatSessionsQuery;
