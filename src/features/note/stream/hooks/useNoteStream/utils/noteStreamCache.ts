import type { NoteDetail, NoteListItem, UseNotesResponse } from "@entities/note";
import { noteKeys } from "@entities/note";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";

type ListCache = UseNotesResponse | InfiniteData<UseNotesResponse>;

export const patchDetailCache = (
  queryClient: QueryClient,
  noteNumber: number,
  patch: Partial<NoteDetail>,
) => {
  queryClient.setQueryData<NoteDetail>(noteKeys.detail(noteNumber), prev => {
    if (!prev) return prev;

    return { ...prev, ...patch };
  });
};

export const patchListItemCache = (
  queryClient: QueryClient,
  noteNumber: number,
  patch: Partial<NoteListItem>,
) => {
  const mapItem = (item: NoteListItem): NoteListItem => {
    if (item.note_number !== noteNumber) return item;

    return { ...item, ...patch };
  };

  queryClient.setQueriesData<ListCache>({ queryKey: noteKeys.lists }, data => {
    if (!data) return data;

    if ("pages" in data) {
      return {
        ...data,
        pages: data.pages.map(page => ({ ...page, items: page.items.map(mapItem) })),
      };
    }

    return { ...data, items: data.items.map(mapItem) };
  });
};
