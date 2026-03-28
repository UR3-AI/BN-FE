import { useForm, useWatch } from "react-hook-form";

import { useSearchDebounce } from "@lib/hooks";

interface NoteSearchForm {
  search: string;
}

const useNoteSearch = () => {
  const { register, control } = useForm<NoteSearchForm>({
    defaultValues: { search: "" },
  });

  const searchValue = useWatch({ control, name: "search" });
  const debouncedSearch = useSearchDebounce({ value: searchValue });
  const searchParam = debouncedSearch || undefined;

  return { register, searchParam };
};

export default useNoteSearch;
