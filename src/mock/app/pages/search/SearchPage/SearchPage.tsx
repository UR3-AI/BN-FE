import { useState } from "react";

import {
  AccountIcon,
  ArrowForwardIcon,
  ArrowOutwardIcon,
  BubbleChartIcon,
  ChecklistIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DescriptionIcon,
  EditorIcon,
  ExpandMoreIcon,
  GraphIcon,
  SearchIcon,
  SettingsIcon,
  ShareIcon,
  SparklesIcon,
} from "@/mock/app/components/Icons";
import useSearchQuery from "@/mock/lib/apis/queries/search/useSearchQuery/useSearchQuery";

const SearchPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useSearchQuery({ q: searchQuery });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(inputValue.trim());
    }
  };

  const notes = data?.notes ?? [];
  const entities = data?.entities ?? [];
  const hasResults = notes.length > 0 || entities.length > 0;

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* TopAppBar */}
      <header className="sticky top-0 z-50 bg-surface shadow-[0px_0px_32px_rgba(229,226,225,0.06)]">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-[2.4rem] py-[1.6rem]">
          <div className="flex items-center gap-[3.2rem]">
            <span className="font-headline text-[2rem] font-bold tracking-tighter text-primary">
              Second Brain
            </span>
            <nav className="hidden items-center gap-[2.4rem] md:flex">
              <a
                href="#"
                className="font-headline text-[1.4rem] tracking-tight text-secondary transition-colors hover:text-primary">
                Notes
              </a>
              <a
                href="#"
                className="font-headline text-[1.4rem] tracking-tight text-secondary transition-colors hover:text-primary">
                Graph
              </a>
              <a
                href="#"
                className="font-headline text-[1.4rem] tracking-tight text-secondary transition-colors hover:text-primary">
                Actions
              </a>
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end gap-[1.6rem] max-w-[51.2rem]">
            <div className="relative w-full max-w-[40rem]">
              <SearchIcon
                size="1.6rem"
                className="absolute left-[1.2rem] top-1/2 -translate-y-1/2 text-outline"
              />
              <input
                type="text"
                aria-label="Search cognitive graph"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search your cognitive workspace..."
                className="w-full border-b border-outline-variant bg-surface-container-highest py-[0.8rem] pl-[4rem] pr-[1.6rem] font-body text-[1.4rem] text-on-surface transition-all focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-[0.8rem]">
              <button
                type="button"
                className="rounded-[0.375rem] p-[0.8rem] text-secondary transition-all hover:bg-surface-container-highest active:scale-95"
                aria-label="Settings">
                <SettingsIcon size="2.4rem" />
              </button>
              <button
                type="button"
                className="rounded-[0.375rem] p-[0.8rem] text-secondary transition-all hover:bg-surface-container-highest active:scale-95"
                aria-label="Account">
                <AccountIcon size="2.4rem" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-7.2rem)]">
        {/* Filter Sidebar */}
        <aside className="sticky top-[7.2rem] hidden h-[calc(100vh-7.2rem)] w-[25.6rem] overflow-y-auto bg-surface-container-low lg:block">
          <div className="flex h-full flex-col gap-[3.2rem] px-[2.4rem] py-[3.2rem]">
            <div>
              <h3 className="mb-[2.4rem] font-headline text-[1.2rem] uppercase tracking-[0.15em] text-primary">
                Filter Results
              </h3>

              {/* Temporal Filter */}
              <div className="mb-[3.2rem]">
                <span className="mb-[1.2rem] block font-headline text-[1rem] uppercase tracking-[0.2em] text-outline">
                  Temporal
                </span>
                <div className="space-y-[0.8rem]">
                  {["Last 24 Hours", "Past Week", "Past Month"].map(
                    (label, i) => (
                      <label
                        key={label}
                        className="group flex cursor-pointer items-center gap-[1.2rem]">
                        <div className="flex h-[1.6rem] w-[1.6rem] items-center justify-center rounded-sm border border-outline-variant bg-surface-container-high transition-colors group-hover:border-primary">
                          {i === 0 && (
                            <div className="h-[0.8rem] w-[0.8rem] bg-primary" />
                          )}
                        </div>
                        <span className="text-[1.2rem] font-medium text-on-surface-variant">
                          {label}
                        </span>
                      </label>
                    ),
                  )}
                </div>
              </div>

              {/* Entity Type Filter */}
              <div className="mb-[3.2rem]">
                <span className="mb-[1.2rem] block font-headline text-[1rem] uppercase tracking-[0.2em] text-outline">
                  Entity Type
                </span>
                <div className="space-y-[0.8rem]">
                  {[
                    { label: "Knowledge", icon: GraphIcon, count: 12, active: true },
                    { label: "Drafts", icon: EditorIcon, count: 4, active: false },
                    { label: "Tasks", icon: ChecklistIcon, count: 8, active: false },
                  ].map(({ label, icon: Icon, count, active }) => (
                    <div
                      key={label}
                      className={`flex cursor-pointer items-center justify-between rounded-[0.375rem] px-[1.2rem] py-[0.8rem] text-[1.2rem] uppercase tracking-[0.15em] transition-colors ${
                        active
                          ? "bg-surface-container-highest font-bold text-primary"
                          : "font-bold text-secondary hover:bg-surface-container"
                      }`}>
                      <span className="flex items-center gap-[0.8rem]">
                        <Icon size="1.6rem" />
                        {label}
                      </span>
                      <span className="text-[1rem] opacity-50">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search Depth */}
              <div className="mb-[3.2rem]">
                <label
                  htmlFor="search-depth"
                  className="mb-[1.2rem] block font-headline text-[1rem] uppercase tracking-[0.2em] text-outline">
                  Search Depth
                </label>
                <input
                  id="search-depth"
                  type="range"
                  className="h-[0.4rem] w-full appearance-none rounded-full bg-surface-container-high accent-primary"
                />
                <div className="mt-[0.8rem] flex justify-between text-[0.9rem] uppercase tracking-tighter text-outline">
                  <span>Semantic</span>
                  <span>Exact</span>
                </div>
              </div>
            </div>

            <div className="mt-auto border-t border-outline-variant/10 pt-[2.4rem]">
              <button
                type="button"
                className="w-full rounded-[0.375rem] bg-primary py-[1.2rem] font-headline text-[1.2rem] font-bold uppercase tracking-[0.15em] text-on-primary transition-transform active:scale-95">
                New Entry
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-surface p-[3.2rem] lg:p-[4.8rem]">
          <div className="mx-auto max-w-[96rem]">
            {/* Initial State */}
            {!searchQuery && (
              <div className="flex flex-col items-center justify-center py-[12rem] text-center">
                <SearchIcon
                  size="6rem"
                  className="mb-[2.4rem] text-outline opacity-30"
                />
                <h2 className="mb-[1.2rem] font-headline text-[2.4rem] font-bold tracking-tight text-on-surface-variant">
                  Search to explore your cognitive workspace
                </h2>
                <p className="font-body text-[1.4rem] text-outline">
                  Type a query above and press Enter to search your notes and entities.
                </p>
              </div>
            )}

            {/* Loading State */}
            {searchQuery && isLoading && (
              <div className="flex flex-col items-center justify-center py-[12rem]">
                <div className="h-[4rem] w-[4rem] animate-spin rounded-full border-[0.3rem] border-outline-variant border-t-primary" />
                <p className="mt-[2.4rem] font-body text-[1.4rem] text-on-surface-variant">
                  Searching your cognitive workspace...
                </p>
              </div>
            )}

            {/* No Results */}
            {searchQuery && !isLoading && !hasResults && (
              <div className="flex flex-col items-center justify-center py-[12rem] text-center">
                <BubbleChartIcon
                  size="6rem"
                  fill="#9c8f78"
                  className="mb-[2.4rem] opacity-30"
                />
                <h2 className="mb-[1.2rem] font-headline text-[2.4rem] font-bold tracking-tight text-on-surface-variant">
                  No results found
                </h2>
                <p className="font-body text-[1.4rem] text-outline">
                  No notes or entities matched &ldquo;{searchQuery}&rdquo;.
                </p>
              </div>
            )}

            {/* Search Results */}
            {searchQuery && !isLoading && hasResults && (
              <>
                {/* Search Header */}
                <header className="mb-[4.8rem] flex flex-col justify-between gap-[1.6rem] md:flex-row md:items-end">
                  <div>
                    <h1 className="font-headline text-[4rem] font-extrabold tracking-tighter text-on-surface">
                      Results for{" "}
                      <span className="italic text-primary">
                        &ldquo;{data?.query}&rdquo;
                      </span>
                    </h1>
                    <p className="mt-[0.8rem] font-body text-[1.4rem] text-on-surface-variant">
                      Found {notes.length} note{notes.length !== 1 ? "s" : ""} and {entities.length} {entities.length !== 1 ? "entities" : "entity"} across your cognitive workspace.
                    </p>
                  </div>
                  <div className="flex items-center gap-[0.8rem] font-label text-[1.2rem] text-outline">
                    <span className="rounded-full bg-surface-container-highest px-[1.2rem] py-[0.4rem]">
                      Sort by: Relevance
                    </span>
                    <ExpandMoreIcon size="1.6rem" />
                  </div>
                </header>

                <div className="grid grid-cols-1 gap-[2.4rem] md:grid-cols-12">
                  {/* Top Result: First Entity */}
                  {entities.length > 0 && (
                    <div className="group relative overflow-hidden rounded-[0.5rem] border-b border-outline-variant/20 bg-surface-container-highest p-[3.2rem] shadow-sm transition-colors hover:bg-surface-bright md:col-span-8">
                      <div className="absolute top-0 right-0 p-[1.6rem]">
                        <GraphIcon
                          size="4rem"
                          fill="#ffe2ab"
                          className="opacity-30 transition-colors group-hover:opacity-100"
                        />
                      </div>
                      <div className="relative z-10">
                        <div className="mb-[1.6rem] flex items-center gap-[0.8rem]">
                          <span className="rounded-sm bg-secondary/10 px-[0.8rem] py-[0.2rem] text-[1rem] font-bold uppercase tracking-[0.15em] text-secondary">
                            Node Type: {entities[0].type}
                          </span>
                          <span className="text-[1rem] font-medium text-outline">
                            • {entities[0].mention_count} Mentions
                          </span>
                        </div>
                        <h2 className="mb-[1.2rem] font-headline text-[2.4rem] font-bold text-primary">
                          {entities[0].name}
                        </h2>
                        <p className="mb-[2.4rem] max-w-[51.2rem] font-body text-[1.4rem] leading-relaxed text-on-surface-variant">
                          Entity found in your cognitive workspace with {entities[0].mention_count} mentions across your notes.
                        </p>
                        {entities.length > 1 && (
                          <div className="flex flex-wrap gap-[0.8rem]">
                            {entities.slice(1, 4).map(entity => (
                              <span
                                key={entity.uid}
                                className="rounded-full border border-outline-variant/10 bg-surface-container-low px-[1.2rem] py-[0.4rem] text-[1rem] text-on-surface-variant">
                                {entity.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Related Entities (remaining) */}
                  {entities.length > 1 && (
                    <div className="flex flex-col rounded-[0.5rem] border-b border-outline-variant/20 bg-surface-container p-[2.4rem] md:col-span-4">
                      <div className="mb-[1.6rem] flex items-center justify-between">
                        <h3 className="font-headline text-[1.2rem] uppercase tracking-[0.15em] text-outline">
                          Related Entities
                        </h3>
                        <EditorIcon
                          size="1.6rem"
                          fill="#9c8f78"
                        />
                      </div>
                      <div className="space-y-[1.6rem]">
                        {entities.slice(1, 4).map(entity => (
                          <div
                            key={entity.uid}
                            className="group cursor-pointer">
                            <h4 className="text-[1.4rem] font-semibold text-on-surface transition-colors group-hover:text-primary">
                              {entity.name}
                            </h4>
                            <p className="line-clamp-1 text-[1.1rem] text-on-surface-variant">
                              {entity.type} • {entity.mention_count} mentions
                            </p>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="mt-auto flex items-center gap-[0.4rem] pt-[1.6rem] text-left text-[1rem] font-bold uppercase tracking-[0.15em] text-secondary transition-all hover:gap-[0.8rem]">
                        View all entities
                        <ArrowForwardIcon size="1.2rem" />
                      </button>
                    </div>
                  )}

                  {/* Found in Notes */}
                  {notes.length > 0 && (
                    <div className="mt-[1.6rem] rounded-[0.5rem] bg-surface-container p-[3.2rem] md:col-span-12 lg:col-span-8">
                      <div className="mb-[3.2rem] flex items-center justify-between">
                        <h3 className="font-headline text-[1.2rem] uppercase tracking-[0.15em] text-outline">
                          Found in Notes
                        </h3>
                      </div>
                      <div className="space-y-[4rem]">
                        {notes.map(note => (
                          <div
                            key={note.note_number}
                            className="group flex gap-[2.4rem]">
                            <div className="hidden sm:block">
                              <div className="flex h-[4.8rem] w-[4.8rem] items-center justify-center rounded-[0.125rem] bg-surface-container-highest text-primary/40 transition-colors group-hover:text-primary">
                                <DescriptionIcon size="2.4rem" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="mb-[0.4rem] flex items-center gap-[1.2rem]">
                                <h4 className="text-[1.8rem] font-bold tracking-tight text-on-surface transition-colors group-hover:text-primary">
                                  {note.title ?? `Note #${note.note_number}`}
                                </h4>
                                <span className="font-mono text-[1rem] text-outline">
                                  {new Date(note.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-[1.4rem] leading-relaxed text-on-surface-variant">
                                {note.content_preview}
                              </p>
                              {note.tags.length > 0 && (
                                <div className="mt-[1.2rem] flex flex-wrap gap-[0.8rem]">
                                  {note.tags.map(tag => (
                                    <span
                                      key={tag}
                                      className="rounded-full border border-outline-variant/10 bg-surface-container-lowest px-[1rem] py-[0.2rem] text-[1rem] text-outline">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="mt-[1.2rem] flex items-center gap-[1.6rem]">
                                <button
                                  type="button"
                                  className="flex items-center gap-[0.4rem] text-[1rem] font-bold uppercase tracking-[0.15em] text-outline transition-colors hover:text-primary">
                                  Open Full Note
                                  <ArrowOutwardIcon size="1.2rem" />
                                </button>
                                <button
                                  type="button"
                                  className="flex items-center gap-[0.4rem] text-[1rem] font-bold uppercase tracking-[0.15em] text-outline transition-colors hover:text-primary">
                                  Graph Relation
                                  <ShareIcon size="1.2rem" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Insights */}
                  <div className="mt-[1.6rem] space-y-[2.4rem] md:col-span-12 lg:col-span-4">
                    {/* AI Insight */}
                    <div className="rounded-[0.5rem] border border-primary/20 bg-gradient-to-br from-surface-container-highest to-surface p-[2.4rem]">
                      <div className="mb-[1.6rem] flex items-center gap-[0.8rem]">
                        <SparklesIcon
                          size="1.6rem"
                          fill="#ffe2ab"
                        />
                        <span className="text-[1rem] font-bold uppercase tracking-[0.15em] text-primary">
                          Cognitive Synthesis
                        </span>
                      </div>
                      <p className="text-[1.2rem] italic leading-relaxed text-on-surface-variant">
                        &ldquo;Explore connections between your search results to discover new insights in your cognitive workspace.&rdquo;
                      </p>
                      <button
                        type="button"
                        className="mt-[1.6rem] w-full rounded-[0.375rem] border border-primary/20 bg-primary/10 py-[0.8rem] text-[1rem] font-bold uppercase tracking-[0.15em] text-primary transition-colors hover:bg-primary/20">
                        Generate Graph Gap Analysis
                      </button>
                    </div>

                    {/* Graph Preview */}
                    <div className="overflow-hidden rounded-[0.5rem] border border-outline-variant/10 bg-surface-container">
                      <div className="relative flex h-[19.2rem] items-center justify-center bg-surface-container-lowest">
                        <div className="relative z-10 text-center">
                          <BubbleChartIcon
                            size="3rem"
                            fill="#9c8f78"
                            className="mb-[0.8rem]"
                          />
                          <p className="text-[1rem] uppercase tracking-[0.15em] text-outline">
                            Graph Fragment Preview
                          </p>
                        </div>
                      </div>
                      <div className="bg-surface-container p-[1.6rem]">
                        <h4 className="mb-[0.4rem] text-[1.2rem] font-bold text-on-surface">
                          Knowledge Cluster: {data?.query}
                        </h4>
                        <p className="text-[1rem] text-outline">
                          View the {entities.length} interconnected nodes in the immersive graph.
                        </p>
                        <button
                          type="button"
                          className="mt-[1.2rem] w-full rounded-[0.375rem] border border-outline-variant py-[0.8rem] text-[1rem] font-bold uppercase tracking-[0.15em] text-on-surface transition-colors hover:bg-surface-container-high">
                          Enter Graph
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                <footer className="mt-[8rem] flex items-center justify-between border-t border-outline-variant/10 py-[3.2rem]">
                  <div className="flex items-center gap-[1.6rem]">
                    <button
                      type="button"
                      className="rounded-[0.375rem] border border-outline-variant p-[0.8rem] text-outline transition-colors hover:text-primary active:scale-95"
                      aria-label="Previous page">
                      <ChevronLeftIcon size="2rem" />
                    </button>
                    <span className="text-[1rem] font-bold uppercase tracking-[0.15em] text-outline">
                      Page 1 of 1
                    </span>
                    <button
                      type="button"
                      className="rounded-[0.375rem] border border-outline-variant p-[0.8rem] text-outline transition-colors hover:text-primary active:scale-95"
                      aria-label="Next page">
                      <ChevronRightIcon size="2rem" />
                    </button>
                  </div>
                  <p className="text-[1rem] uppercase tracking-[0.15em] text-outline">
                    {notes.length + entities.length} results found
                  </p>
                </footer>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container px-[2.4rem] py-[1.6rem] md:hidden">
        {[
          { label: "Notes", icon: DescriptionIcon, active: false },
          { label: "Graph", icon: GraphIcon, active: true },
          { label: "Actions", icon: ChecklistIcon, active: false },
          { label: "More", icon: SettingsIcon, active: false },
        ].map(({ label, icon: Icon, active }) => (
          <div
            key={label}
            className={`flex flex-col items-center gap-[0.4rem] ${
              active ? "text-primary" : "text-secondary"
            }`}>
            <Icon size="2.4rem" />
            <span className="text-[0.9rem] font-bold uppercase tracking-[0.15em]">
              {label}
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default SearchPage;
