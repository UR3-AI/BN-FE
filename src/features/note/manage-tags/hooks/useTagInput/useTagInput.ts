import { useForm } from "react-hook-form";

import { useAddTagsMutation, useRemoveTagsMutation } from "../../api";
import type { TagInputForm, UseTagInputParams } from "./useTagInput.type";

const useTagInput = ({ noteNumber, tags }: UseTagInputParams) => {
  const { register, reset, getValues } = useForm<TagInputForm>({
    defaultValues: { tag: "" },
  });

  const addTags = useAddTagsMutation();
  const removeTags = useRemoveTagsMutation();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
    e.preventDefault();

    const trimmed = getValues("tag").trim();

    if (trimmed && !tags.includes(trimmed)) {
      addTags.mutate({ noteNumber, tags: [trimmed] });
    }

    reset();
  };

  const removeTag = (tag: string) => {
    removeTags.mutate({ noteNumber, tags: [tag] });
  };

  return { register, handleKeyDown, removeTag };
};

export default useTagInput;
