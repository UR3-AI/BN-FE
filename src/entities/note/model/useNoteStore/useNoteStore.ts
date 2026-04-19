import type { NoteStore } from "./useNoteStore.type";

import { create } from "zustand";

const useNoteStore = create<NoteStore>()(set => ({
  selectedNoteNumber: 0,

  selectNote: noteNumber => {
    set({ selectedNoteNumber: noteNumber });
  },
}));

export default useNoteStore;
