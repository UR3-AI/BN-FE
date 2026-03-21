import {
  AccountIcon,
  BellIcon,
  ChevronRightIcon,
  CloudDoneIcon,
  FolderIcon,
  SearchIcon,
} from "@/mock/app/components/Icons";
import useUnreadCountQuery from "@/mock/lib/apis/queries/notifications/useUnreadCountQuery/useUnreadCountQuery";

interface TopbarProps {
  title?: string;
  breadcrumb?: { label: string; active?: boolean }[];
  showSearch?: boolean;
}

const Topbar = ({
  title = "Cognitive Canvas",
  breadcrumb,
  showSearch = true,
}: TopbarProps) => {
  const { data: unreadData } = useUnreadCountQuery();
  const unreadCount = unreadData?.count ?? 0;

  return (
    <header className="sticky top-0 z-20 flex h-[6.4rem] w-full items-center justify-between bg-surface px-[2.4rem] shadow-[0px_0px_32px_0px_rgba(229,226,225,0.06)]">
      <div className="flex items-center gap-[1.6rem]">
        <span className="font-headline text-[2rem] font-bold tracking-tighter text-primary">
          {title}
        </span>

        {breadcrumb && (
          <>
            <div className="hidden h-[1.6rem] w-px bg-outline-variant/30 sm:block" />
            <div className="hidden items-center gap-[0.8rem] text-[1.4rem] font-medium text-on-surface-variant sm:flex">
              <FolderIcon size="1.6rem" />
              {breadcrumb.map((item, i) => (
                <span
                  key={item.label}
                  className="flex items-center gap-[0.8rem]">
                  {i > 0 && <ChevronRightIcon size="1.2rem" />}
                  <span
                    className={
                      item.active ? "text-on-surface" : ""
                    }>
                    {item.label}
                  </span>
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {showSearch && (
        <div className="mx-[3.2rem] hidden max-w-[40rem] flex-1 md:flex">
          <div className="group relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[1.2rem]">
              <SearchIcon
                size="2rem"
                className="text-on-surface-variant/50 transition-colors group-focus-within:text-primary"
              />
            </div>
            <input
              type="text"
              aria-label="Search notes, entities, or tasks"
              placeholder="Search notes, entities, or tasks..."
              className="block w-full rounded-[0.25rem] border border-outline-variant/20 bg-surface-container-low py-[0.6rem] pl-[4rem] pr-[4.8rem] text-[1.4rem] text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-[1.2rem]">
              <kbd className="hidden items-center rounded-[0.25rem] border border-outline-variant/30 bg-surface-container px-[0.6rem] py-[0.2rem] text-[1rem] font-medium text-on-surface-variant/60 sm:inline-flex">
                <span className="mr-[0.2rem] text-[1.2rem]">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-[1.2rem]">
        <div className="hidden items-center gap-[0.8rem] rounded-[0.25rem] border-b border-outline-variant/20 bg-surface-container px-[1.2rem] py-[0.6rem] lg:flex">
          <CloudDoneIcon
            size="1.6rem"
            fill="#ffe2ab"
          />
          <span className="text-[1.1rem] font-medium tracking-wide text-on-surface-variant">
            SYNCED
          </span>
        </div>
        <button
          type="button"
          className="relative rounded-[0.375rem] p-[0.8rem] text-secondary opacity-80 transition-colors hover:bg-surface-container active:scale-95"
          aria-label="Notifications">
          <BellIcon size="2.4rem" />
          {unreadCount > 0 && (
            <span className="absolute -top-[0.2rem] -right-[0.2rem] flex h-[1.8rem] min-w-[1.8rem] items-center justify-center rounded-full bg-primary px-[0.4rem] text-[1rem] font-bold text-on-primary">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          className="rounded-[0.375rem] p-[0.8rem] text-secondary opacity-80 transition-colors hover:bg-surface-container active:scale-95"
          aria-label="Account">
          <AccountIcon size="2.4rem" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
