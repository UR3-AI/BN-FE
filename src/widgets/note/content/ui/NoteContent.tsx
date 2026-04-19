import { FormProvider } from "react-hook-form";

import { NoteContentBody, NoteContentFooter, useNoteEditor } from "@features/note/update";

import type { NoteContentProps } from "./NoteContent.type";
import { NoteContentHeader } from "./NoteContentHeader";

const NoteContent = ({ noteNumber, noteDetail, onSaveSuccess }: NoteContentProps) => {
  const { form, saveStatus } = useNoteEditor({
    noteNumber,
    noteDetail,
    onSaveSuccess,
  });

  const processingStatus = noteDetail?.processing_status ?? "pending";
  const tags = noteDetail?.tags ?? [];
  const attachmentCount = noteDetail?.attachment_count ?? 0;

  return (
    <FormProvider {...form}>
      <article className="flex min-w-0 grow-1 h-full flex-col">
        <NoteContentHeader
          noteNumber={noteNumber}
          saveStatus={saveStatus}
          processingStatus={processingStatus}
          tags={tags}
        />

        <NoteContentBody />

        <NoteContentFooter attachmentCount={attachmentCount} />
      </article>
    </FormProvider>
  );
};

export default NoteContent;
