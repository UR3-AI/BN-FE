import { useQuery } from "@tanstack/react-query";

import { api } from "../../../axios";
import noteKeys from "../keys";
import type {
  UseNotesQueryParams,
  UseNotesQueryResponse,
} from "./useNotesQuery.type";

const getNotes = async (params?: UseNotesQueryParams) => {
  const response = await api.get<UseNotesQueryResponse>("/api/v1/notes", {
    params,
  });

  return response.data;
};

const useNotesQuery = (params?: UseNotesQueryParams) => {
  return useQuery({
    queryKey: noteKeys.list(params),
    queryFn: () => getNotes(params),
  });
};

export default useNotesQuery;
