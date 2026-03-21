import { ArchiveIcon } from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";

const ArchivePage = () => {
  return (
    <GlobalLayout
      topbarTitle="Archive"
      showSearch={false}>
      <div className="flex flex-1 flex-col items-center justify-center gap-[2.4rem] p-[4rem]">
        <div className="flex h-[9.6rem] w-[9.6rem] items-center justify-center rounded-[1.6rem] bg-surface-container-highest">
          <ArchiveIcon size="4.8rem" />
        </div>
        <div className="text-center">
          <h2 className="mb-[0.8rem] font-headline text-[2.4rem] font-bold text-on-surface">
            Archive
          </h2>
          <p className="max-w-[40rem] text-[1.4rem] leading-relaxed text-on-surface-variant">
            Archive feature coming soon. Archived notes and projects will appear here.
          </p>
        </div>
      </div>
    </GlobalLayout>
  );
};

export default ArchivePage;
