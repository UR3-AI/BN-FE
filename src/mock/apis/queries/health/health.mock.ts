import type { UseHealthCheckResponse } from "@lib/apis/queries/health/useHealthCheckQuery/useHealthCheckQuery.type";

export const mockHealthCheckResponse: UseHealthCheckResponse = {
  status: "ok",
  neo4j: "connected",
};

export const mockHealthCheckErrorResponse: UseHealthCheckResponse = {
  status: "error",
  neo4j: "disconnected",
};
