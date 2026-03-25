import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import useNotesQuery from "@/mock/lib/apis/queries/notes/useNotesQuery/useNotesQuery";

const useEditorNote = () => {
  const { data: notesData, isLoading } = useNotesQuery({ limit: 50 });
  const location = useLocation();
  const initialNote =
    (location.state as { noteNumber?: number })?.noteNumber ?? 0;
  const [selectedNoteNumber, setSelectedNoteNumber] =
    useState<number>(initialNote);

  const notes = useMemo(() => notesData?.items ?? [], [notesData]);

  useEffect(() => {
    if (notes.length > 0 && selectedNoteNumber === 0) {
      setSelectedNoteNumber(notes[0].note_number);
    }
  }, [notes, selectedNoteNumber]);

  // location.state로 전달된 노트 번호 반영
  useEffect(() => {
    if (initialNote > 0) {
      setSelectedNoteNumber(initialNote);
    }
  }, [initialNote]);

  return {
    notes,
    isLoading,
    selectedNoteNumber,
    setSelectedNoteNumber,
  };
};

export default useEditorNote;
