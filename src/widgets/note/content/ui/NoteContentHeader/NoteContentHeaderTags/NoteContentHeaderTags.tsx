import { useTagInput } from "@features/note/manage-tags";
import type { NoteContentHeaderTagsProps } from "./NoteContentHeaderTags.type";

const NoteContentHeaderTags = ({ noteNumber, tags }: NoteContentHeaderTagsProps) => {
  const { register, handleKeyDown, removeTag } = useTagInput({ noteNumber, tags });

  return (
    <div className="flex flex-wrap items-center gap-[0.6rem]">
      {tags.map(tag => (
        <span
          key={tag}
          className="flex items-center gap-[0.4rem] rounded-[0.4rem] bg-[var(--color-gray-bg)] px-[0.8rem] py-[0.2rem] text-[1.2rem] text-[var(--color-text-secondary)]"
        >
          #{tag}
          <button
            type="button"
            className="cursor-pointer text-[1rem] text-[var(--color-text-help)] hover:text-[var(--color-error)]"
            onClick={() => removeTag(tag)}
            aria-label={`태그 ${tag} 제거`}
          >
            ✕
          </button>
        </span>
      ))}

      <input
        {...register("tag")}
        type="text"
        onKeyDown={handleKeyDown}
        placeholder="태그 추가..."
        className="min-w-[8rem] flex-1 text-[1.2rem] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-help)]"
      />
    </div>
  );
};

export default NoteContentHeaderTags;
