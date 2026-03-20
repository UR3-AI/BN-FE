import {
  CloseIcon,
  DescriptionIcon,
  LinkIcon,
  PlusCircleIcon,
  SparklesIcon,
  TreeIcon,
} from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";

const DetailPanel = () => {
  return (
    <div className="p-[2.4rem]">
      {/* Header */}
      <div className="mb-[3.2rem] flex items-center justify-between">
        <span className="text-[1rem] font-bold uppercase tracking-[0.2em] text-primary">
          Detail View
        </span>
        <button
          type="button"
          aria-label="Close detail panel"
          className="text-on-surface/40 transition-colors hover:text-on-surface">
          <CloseIcon
            size="2rem"
            stroke="currentColor"
          />
        </button>
      </div>

      <div className="space-y-[4rem]">
        {/* Selected Task Details */}
        <div className="space-y-[1.6rem]">
          <h2 className="font-headline text-[2.2rem] font-bold leading-tight text-on-surface">
            Finalize Neural Architecture Documentation
          </h2>
          <div className="flex flex-wrap gap-[0.8rem]">
            <span className="rounded-[0.25rem] bg-error-container/40 px-[1.2rem] py-[0.4rem] text-[1.2rem] font-semibold text-error">
              Priority: High
            </span>
            <span className="rounded-[0.25rem] bg-surface-container-highest px-[1.2rem] py-[0.4rem] text-[1.2rem] font-semibold text-on-surface/70">
              Project: Core AI
            </span>
          </div>
          <p className="text-[1.4rem] leading-relaxed text-on-surface/70">
            Complete the technical specifications for the new graph-based neural
            storage. Focus on the relationship mapping between disconnected
            nodes.
          </p>
        </div>

        {/* Associated Context */}
        <div className="space-y-[1.6rem]">
          <h4 className="text-[1rem] font-bold uppercase tracking-[0.15em] text-on-surface/40">
            Associated Context
          </h4>
          <div className="space-y-[0.8rem]">
            <a
              href="#"
              className="group block rounded-[0.25rem] bg-surface-container-low p-[1.2rem] transition-colors hover:bg-surface-container-high">
              <div className="flex items-center gap-[1.2rem]">
                <DescriptionIcon
                  size="2rem"
                  fill="#ffe2ab"
                />
                <div>
                  <p className="text-[1.4rem] font-medium text-on-surface transition-colors group-hover:text-primary">
                    Neural Storage Schema
                  </p>
                  <p className="text-[1rem] text-on-surface/40">
                    Updated 2 days ago
                  </p>
                </div>
              </div>
            </a>
            <a
              href="#"
              className="group block rounded-[0.25rem] bg-surface-container-low p-[1.2rem] transition-colors hover:bg-surface-container-high">
              <div className="flex items-center gap-[1.2rem]">
                <TreeIcon
                  size="2rem"
                  fill="#9fd0cd"
                />
                <div>
                  <p className="text-[1.4rem] font-medium text-on-surface transition-colors group-hover:text-secondary">
                    Concept Graph v4
                  </p>
                  <p className="text-[1rem] text-on-surface/40">
                    Visual Reference
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* AI Suggested Actions */}
        <div className="space-y-[1.6rem] rounded-[0.5rem] border border-primary/10 bg-gradient-to-br from-primary/5 to-secondary/5 p-[2.4rem]">
          <div className="flex items-center gap-[0.8rem]">
            <SparklesIcon
              size="1.8rem"
              fill="#ffe2ab"
            />
            <h4 className="text-[1rem] font-bold uppercase tracking-[0.15em] text-primary/80">
              AI Suggested Actions
            </h4>
          </div>
          <ul className="space-y-[0.4rem]">
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-[0.8rem] rounded-[0.25rem] p-[0.8rem] text-left text-[1.2rem] text-on-surface/80 transition-colors hover:bg-white/5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="1.6rem"
                  height="1.6rem"
                  fill="currentColor">
                  <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" />
                </svg>
                Schedule review session
              </button>
            </li>
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-[0.8rem] rounded-[0.25rem] p-[0.8rem] text-left text-[1.2rem] text-on-surface/80 transition-colors hover:bg-white/5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="1.6rem"
                  height="1.6rem"
                  fill="currentColor">
                  <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36 0-2.56-2.08-4.64-4.64-4.64-1.31 0-2.55.52-3.46 1.44L8 3.36 6.1 1.44C5.19.52 3.96 0 2.64 0 .08 0-2 2.08-2 4.64c0 .48.11.92.18 1.36H-2v2h24V6zm-7.82 0c-.01-.16-.18-.63-.18-.36 0-1.46 1.18-2.64 2.64-2.64.74 0 1.42.3 1.9.78l1.86 1.86c-.25.04-.5.06-.76.06H12.82zM4.28 5.78C3.82 5.28 3.1 5 2.64 5 1.18 5 0 3.82 0 2.36c0 .27-.17.74-.18.9H-.18l1.86-1.86C2.16.92 2.84.62 3.58.62 5.04.62 6.22 1.8 6.22 3.26c0 .26-.02.51-.06.76L4.28 5.78zM2 8v14h20V8H2zm8 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8v-2h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2v-2h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2v-2h2v2z" />
                </svg>
                Gather reference materials
              </button>
            </li>
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-[0.8rem] rounded-[0.25rem] p-[0.8rem] text-left text-[1.2rem] text-on-surface/80 transition-colors hover:bg-white/5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="1.6rem"
                  height="1.6rem"
                  fill="currentColor">
                  <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
                </svg>
                Generate draft summary
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const TodosPage = () => {
  return (
    <GlobalLayout
      activeMenu="todos"
      sidePanel={<DetailPanel />}>
      <div className="flex-1 overflow-y-auto bg-surface-container-lowest px-[3.2rem] py-[3.2rem] md:px-[4.8rem]">
        <div className="mx-auto max-w-[89.6rem]">
          {/* Header & Filters */}
          <div className="mb-[4.8rem] flex flex-col gap-[2.4rem]">
            <h2 className="font-headline text-[3.6rem] font-extrabold tracking-tighter text-on-surface">
              Action Items
            </h2>
            <div className="flex gap-[1.2rem]">
              <button
                type="button"
                className="rounded-full bg-primary px-[2rem] py-[0.6rem] text-[1.4rem] font-semibold text-on-primary">
                All
              </button>
              <button
                type="button"
                className="rounded-full bg-surface-container-highest px-[2rem] py-[0.6rem] text-[1.4rem] font-medium text-on-surface/70 transition-colors hover:bg-surface-bright">
                Pending
              </button>
              <button
                type="button"
                className="rounded-full bg-surface-container-highest px-[2rem] py-[0.6rem] text-[1.4rem] font-medium text-on-surface/70 transition-colors hover:bg-surface-bright">
                Completed
              </button>
              <button
                type="button"
                className="rounded-full bg-surface-container-highest px-[2rem] py-[0.6rem] text-[1.4rem] font-medium text-on-surface/70 transition-colors hover:bg-surface-bright">
                Overdue
              </button>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-[1.6rem]">
            {/* Urgent Task */}
            <div className="group flex items-center gap-[2.4rem] rounded-[0.5rem] border-l-4 border-error/50 bg-error-container/20 p-[2.4rem] transition-all duration-300 hover:bg-error-container/30">
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  aria-label="Finalize Neural Architecture Documentation"
                  className="h-[2rem] w-[2rem] rounded border-outline-variant bg-transparent text-primary focus:ring-primary focus:ring-offset-background"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-[0.4rem] flex items-center gap-[1.2rem]">
                  <h3 className="truncate text-[1.6rem] font-semibold text-on-surface">
                    Finalize Neural Architecture Documentation
                  </h3>
                  <span className="flex-shrink-0 rounded px-[0.8rem] py-[0.2rem] text-[1rem] font-bold uppercase tracking-[0.12em] bg-error text-on-error">
                    Urgent
                  </span>
                </div>
                <div className="flex items-center gap-[1.6rem] text-[1.2rem] text-on-surface/50">
                  <a
                    href="#"
                    className="flex items-center gap-[0.4rem] transition-colors hover:text-primary">
                    <LinkIcon
                      size="1.6rem"
                      fill="currentColor"
                    />
                    Ref: Neural Architecture
                  </a>
                  <span className="flex items-center gap-[0.4rem]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="1.6rem"
                      height="1.6rem"
                      fill="currentColor">
                      <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" />
                    </svg>
                    Due today, 5:00 PM
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  aria-label="More options"
                  className="rounded p-[0.8rem] hover:bg-surface-bright">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="2rem"
                    height="2rem"
                    fill="currentColor"
                    className="text-on-surface/60">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* In Progress Task */}
            <div className="group flex items-center gap-[2.4rem] rounded-[0.5rem] bg-surface-container-low p-[2.4rem] transition-all duration-300 hover:bg-surface-container">
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  aria-label="Review feedback from the design workshop"
                  className="h-[2rem] w-[2rem] rounded border-outline-variant bg-transparent text-primary focus:ring-primary focus:ring-offset-background"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-[0.4rem] flex items-center gap-[1.2rem]">
                  <h3 className="truncate text-[1.6rem] font-semibold text-on-surface">
                    Review feedback from the design workshop
                  </h3>
                  <span className="flex-shrink-0 rounded px-[0.8rem] py-[0.2rem] text-[1rem] font-bold uppercase tracking-[0.12em] bg-primary/10 text-primary">
                    In Progress
                  </span>
                </div>
                <div className="flex items-center gap-[1.6rem] text-[1.2rem] text-on-surface/50">
                  <a
                    href="#"
                    className="flex items-center gap-[0.4rem] transition-colors hover:text-primary">
                    <LinkIcon
                      size="1.6rem"
                      fill="currentColor"
                    />
                    Ref: Q4 Strategy
                  </a>
                  <span className="flex items-center gap-[0.4rem]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="1.6rem"
                      height="1.6rem"
                      fill="currentColor">
                      <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" />
                    </svg>
                    Tomorrow
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  aria-label="More options"
                  className="rounded p-[0.8rem] hover:bg-surface-bright">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="2rem"
                    height="2rem"
                    fill="currentColor"
                    className="text-on-surface/60">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Planned Task */}
            <div className="group flex items-center gap-[2.4rem] rounded-[0.5rem] bg-surface-container-low p-[2.4rem] transition-all duration-300 hover:bg-surface-container">
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  aria-label="Drafting budget proposal for AI infrastructure"
                  className="h-[2rem] w-[2rem] rounded border-outline-variant bg-transparent text-primary focus:ring-primary focus:ring-offset-background"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-[0.4rem] flex items-center gap-[1.2rem]">
                  <h3 className="truncate text-[1.6rem] font-semibold text-on-surface">
                    Drafting budget proposal for AI infrastructure
                  </h3>
                  <span className="flex-shrink-0 rounded px-[0.8rem] py-[0.2rem] text-[1rem] font-bold uppercase tracking-[0.12em] bg-secondary-container/30 text-secondary">
                    Planned
                  </span>
                </div>
                <div className="flex items-center gap-[1.6rem] text-[1.2rem] text-on-surface/50">
                  <a
                    href="#"
                    className="flex items-center gap-[0.4rem] transition-colors hover:text-primary">
                    <LinkIcon
                      size="1.6rem"
                      fill="currentColor"
                    />
                    Ref: Budgeting V2
                  </a>
                  <span className="flex items-center gap-[0.4rem]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="1.6rem"
                      height="1.6rem"
                      fill="currentColor">
                      <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" />
                    </svg>
                    Friday, Oct 24
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  aria-label="More options"
                  className="rounded p-[0.8rem] hover:bg-surface-bright">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="2rem"
                    height="2rem"
                    fill="currentColor"
                    className="text-on-surface/60">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Completed Task */}
            <div className="group flex items-center gap-[2.4rem] rounded-[0.5rem] bg-surface-container-low/40 p-[2.4rem] opacity-60 transition-all duration-300">
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  defaultChecked
                  aria-label="Update workspace accessibility guidelines"
                  className="h-[2rem] w-[2rem] rounded border-outline-variant bg-transparent text-primary focus:ring-primary focus:ring-offset-background"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-[0.4rem] flex items-center gap-[1.2rem]">
                  <h3 className="truncate text-[1.6rem] font-semibold text-on-surface line-through">
                    Update workspace accessibility guidelines
                  </h3>
                </div>
                <div className="flex items-center gap-[1.6rem] text-[1.2rem] text-on-surface/40">
                  <a
                    href="#"
                    className="flex items-center gap-[0.4rem]">
                    <LinkIcon
                      size="1.6rem"
                      fill="currentColor"
                    />
                    Ref: Operations
                  </a>
                  <span className="flex items-center gap-[0.4rem]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="1.6rem"
                      height="1.6rem"
                      fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Completed yesterday
                  </span>
                </div>
              </div>
            </div>

            {/* Add Task Placeholder */}
            <div className="flex h-[12.8rem] items-center justify-center rounded-[0.5rem] border-2 border-dashed border-outline-variant/10">
              <button
                type="button"
                className="flex items-center gap-[0.8rem] text-[1.4rem] font-medium text-on-surface/30 transition-colors hover:text-primary">
                <PlusCircleIcon
                  size="2rem"
                  fill="currentColor"
                />
                Add quick task
              </button>
            </div>
          </div>
        </div>
      </div>
    </GlobalLayout>
  );
};

export default TodosPage;
