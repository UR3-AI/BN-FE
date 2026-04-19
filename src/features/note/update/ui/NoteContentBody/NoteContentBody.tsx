import { useFormContext } from "react-hook-form";

import type { NoteEditorForm } from "../../hooks";

const NoteContentBody = () => {
  const { register } = useFormContext<NoteEditorForm>();

  return (
    <section className="flex-1 overflow-y-auto px-[2.4rem] py-[1.6rem]">
      <textarea
        {...register("content")}
        placeholder="내용을 입력하세요..."
        className="h-full w-full resize-none text-[1.4rem] leading-[2.2rem] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-help)]"
      />
    </section>
  );
};

export default NoteContentBody;
