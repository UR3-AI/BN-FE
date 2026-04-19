import { useFormContext } from "react-hook-form";

import { LoadingSpinner } from "@shared/ui";

import type { NoteEditorForm } from "@features/note/update";

import type { NoteContentHeaderProps } from "./NoteContentHeader.type";
import { NoteContentHeaderTags } from "./NoteContentHeaderTags";

const PROCESSING_LABEL: Record<string, string> = {
  pending: "대기 중",
  processing: "처리 중",
  failed: "처리 실패",
};

const NoteContentHeader = ({
  noteNumber,
  saveStatus,
  processingStatus,
  tags,
}: NoteContentHeaderProps) => {
  const { register } = useFormContext<NoteEditorForm>();

  return (
    <header className="flex flex-col gap-[1.2rem] border-b border-[var(--color-divider-lighter)] px-[2.4rem] py-[1.6rem]">
      {processingStatus !== "completed" && (
        <span
          className={`w-fit rounded-[0.6rem] px-[0.8rem] py-[0.2rem] text-[1.2rem] font-semibold ${
            processingStatus === "failed"
              ? "bg-red-50 text-[var(--color-error)]"
              : "bg-[var(--color-gray-bg)] text-[var(--color-text-secondary)]"
          }`}
        >
          {PROCESSING_LABEL[processingStatus] ?? processingStatus}
        </span>
      )}

      <NoteContentHeaderTags
        noteNumber={noteNumber}
        tags={tags}
      />

      <div className="flex items-center gap-[0.8rem]">
        <input
          {...register("title")}
          type="text"
          placeholder="제목 없음"
          className="min-w-0 flex-1 text-[1.8rem] font-bold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-help)]"
        />

        <div className="flex shrink-0 items-center gap-[0.4rem] text-[1.2rem]">
          {saveStatus === "saving" && (
            <>
              <LoadingSpinner size="1.2rem" />
              <span className="text-[var(--color-text-help)]">저장 중</span>
            </>
          )}
          {saveStatus === "saved" && (
            <span className="text-[var(--color-text-secondary)]">저장 완료</span>
          )}

          {saveStatus === "error" && <span className="text-[var(--color-error)]">저장 실패</span>}
        </div>
      </div>
    </header>
  );
};

export default NoteContentHeader;
