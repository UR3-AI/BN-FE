import { IS_DEV } from "@shared/constants";
import { useQuery } from "@tanstack/react-query";

import { api } from "@shared/api/axios";
import healthKeys from "../keys";
import type { UseHealthCheckResponse } from "./useHealthCheckQuery.type";

const healthCheck = async () => {
  const response = await api.get<UseHealthCheckResponse>("/health");

  return response.data;
};

const useHealthCheckQuery = () => {
  return useQuery({
    queryKey: healthKeys.check,
    queryFn: healthCheck,
    enabled: IS_DEV,
  });
};

export default useHealthCheckQuery;
