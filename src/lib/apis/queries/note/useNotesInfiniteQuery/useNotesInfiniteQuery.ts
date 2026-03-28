import { useInfiniteQuery } from "@tanstack/react-query";

import { api } from "../../../axios";
import noteKeys from "../keys";
import type { UseNotesResponse } from "../useNotesQuery/useNotesQuery.type";
import type { UseNotesInfiniteParams, UseNotesInfiniteRequest } from "./useNotesInfiniteQuery.type";

const getNotes = async (params?: UseNotesInfiniteRequest) => {
  const response = await api.get<UseNotesResponse>("/api/v1/notes", {
    params,
  });

  return response.data;
};

const useNotesInfiniteQuery = (params?: UseNotesInfiniteParams) => {
  return useInfiniteQuery({
    queryKey: noteKeys.infinite(params),
    queryFn: ({ pageParam }) => getNotes({ ...params, cursor: pageParam }),

    // COMMENT-JY : 초기 pageParam은 null이지만 이후 string 타입의 cursor가 할당되므로, 올바른 타입 추론을 위해 불가피하게 as 사용
    initialPageParam: null as string | null,

    getNextPageParam: lastPage => (lastPage.has_next ? lastPage.next_cursor : undefined),
  });
};

export default useNotesInfiniteQuery;
