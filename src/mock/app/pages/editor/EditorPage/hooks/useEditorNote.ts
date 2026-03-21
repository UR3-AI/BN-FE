import { useEffect, useMemo, useState } from "react";

import useNotesQuery from "@/mock/lib/apis/queries/notes/useNotesQuery/useNotesQuery";

const useEditorNote = () => {
  const { data: notesData, isLoading } = useNotesQuery({ limit: 50 });
  const [selectedNoteNumber, setSelectedNoteNumber] = useState<number>(0);

  const notes = useMemo(() => notesData?.items ?? [], [notesData]);

  useEffect(() => {
    if (notes.length > 0 && selectedNoteNumber === 0) {
      setSelectedNoteNumber(notes[0].note_number);
    }
  }, [notes, selectedNoteNumber]);

  return {
    notes,
    isLoading,
    selectedNoteNumber,
    setSelectedNoteNumber,
  };
};

export default useEditorNote;
