import type { NoteContentFooterProps } from "./NoteContentFooter.type";

const NoteContentFooter = ({ attachmentCount }: NoteContentFooterProps) => {
  return (
    <footer className="border-t border-[var(--color-divider-lighter)] px-[2.4rem] py-[1.6rem]">
      <section className="flex flex-col gap-[0.8rem]">
        <h3 className="text-[1.2rem] font-semibold text-[var(--color-text-secondary)]">
          첨부파일 ({attachmentCount})
        </h3>

        {attachmentCount === 0 ? (
          <p className="text-[1.3rem] text-[var(--color-text-help)]">첨부파일 없음</p>
        ) : (
          <p className="text-[1.3rem] text-[var(--color-text-help)]">
            {attachmentCount}개의 첨부파일
          </p>
        )}
      </section>
    </footer>
  );
};

export default NoteContentFooter;
