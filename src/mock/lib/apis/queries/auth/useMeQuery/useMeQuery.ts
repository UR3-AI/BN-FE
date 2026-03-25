import { api } from "@lib/apis/axios";
import { useQuery } from "@tanstack/react-query";

import authKeys from "../keys";
import type { UserResponse } from "./useMeQuery.type";

const fetchMe = async () => {
  const response = await api.get<UserResponse>("/api/v1/auth/me");

  return response.data;
};

const useMeQuery = () => {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: fetchMe,
  });
};

export default useMeQuery;
