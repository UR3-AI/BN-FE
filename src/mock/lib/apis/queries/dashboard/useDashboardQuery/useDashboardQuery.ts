import { useQuery } from "@tanstack/react-query";

import { api } from "@lib/apis/axios";

import dashboardKeys from "../keys";
import type { DashboardResponse } from "./useDashboardQuery.type";

const fetchDashboard = async () => {
  const response = await api.get<DashboardResponse>("/api/v1/dashboard");

  return response.data;
};

const useDashboardQuery = () => {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: fetchDashboard,
  });
};

export default useDashboardQuery;
