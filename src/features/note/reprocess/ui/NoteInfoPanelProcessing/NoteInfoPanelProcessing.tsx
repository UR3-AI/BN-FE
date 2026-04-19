import { LoadingSpinner } from "@shared/ui";
import { useReprocessNoteMutation } from "@entities/note";

import {
  PROCESSING_LABEL,
  PROCESSING_STEPS,
  PROCESSING_STEP_MAP,
} from "./NoteInfoPanelProcessing.constants";
import type { NoteInfoPanelProcessingProps } from "./NoteInfoPanelProcessing.type";

const NoteInfoPanelProcessing = ({
  noteNumber,
  processingStatus,
  streamPhase,
  summary,
}: NoteInfoPanelProcessingProps) => {
  const reprocess = useReprocessNoteMutation();

  // COMMENT-JY : 스트림이 활성화되어 있으면 stream phase를 우선, 아니면 서버 저장 상태로 폴백
  const effectivePhase = streamPhase !== "idle" ? streamPhase : processingStatus;
  const stepIndex = PROCESSING_STEP_MAP[effectivePhase] ?? 0;
  const isFailed = effectivePhase === "failed";

  return (
    <section className="flex flex-col gap-[1.2rem] border-b border-[var(--color-divider-lighter)] px-[2rem] py-[1.6rem]">
      <h3 className="text-[1.4rem] font-semibold text-[var(--color-text-primary)]">AI 처리 상태</h3>

      <span
        className={`w-fit rounded-[0.6rem] px-[0.8rem] py-[0.2rem] text-[1.2rem] font-semibold ${
          isFailed
            ? "bg-red-50 text-[var(--color-error)]"
            : processingStatus === "completed"
              ? "bg-green-50 text-green-700"
              : "bg-[var(--color-gray-bg)] text-[var(--color-text-secondary)]"
        }`}
      >
        {PROCESSING_LABEL[effectivePhase] ?? effectivePhase}
      </span>

      <div className="flex gap-[0.4rem]">
        {PROCESSING_STEPS.map((label, i) => (
          <div
            key={label}
            className="flex flex-1 flex-col items-center gap-[0.4rem]"
          >
            <div
              className={`h-[0.4rem] w-full rounded-full ${
                isFailed
                  ? "bg-[var(--color-error)]"
                  : i < stepIndex
                    ? "bg-[var(--color-primary)]"
                    : "bg-[var(--color-gray-bg)]"
              }`}
            />
            <span className="text-[1.1rem] text-[var(--color-text-help)]">{label}</span>
          </div>
        ))}
      </div>

      {isFailed && (
        <button
          type="button"
          className="w-fit cursor-pointer text-[1.2rem] font-medium text-[var(--color-primary)] hover:underline"
          onClick={() => reprocess.mutate({ noteNumber })}
          disabled={reprocess.isPending}
        >
          {reprocess.isPending ? (
            <span className="flex items-center gap-[0.4rem]">
              <LoadingSpinner size="1.2rem" />
              재처리 중
            </span>
          ) : (
            "재처리"
          )}
        </button>
      )}

      {summary && (
        <div className="flex flex-col gap-[0.4rem]">
          <h4 className="text-[1.2rem] font-semibold text-[var(--color-text-secondary)]">요약</h4>
          <p className="whitespace-pre-wrap text-[1.3rem] leading-[2rem] text-[var(--color-text-primary)]">
            {summary}
          </p>
        </div>
      )}
    </section>
  );
};

export default NoteInfoPanelProcessing;
