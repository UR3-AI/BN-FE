import { useMemo, useState } from "react";

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DeleteIcon,
  DescriptionIcon,
  FolderIcon,
  PlusCircleIcon,
  PushPinIcon,
  SearchIcon,
} from "@/mock/app/components/Icons";
import type { NoteListItem } from "@/mock/lib/apis/queries/notes/useNotesQuery/useNotesQuery.type";
import useProjectTreeQuery from "@/mock/lib/apis/queries/projects/useProjectTreeQuery/useProjectTreeQuery";
import type { ProjectTreeNode } from "@/mock/lib/apis/queries/projects/useProjectTreeQuery/useProjectTreeQuery.type";

interface NoteListPanelProps {
  notes: NoteListItem[];
  selectedNoteNumber: number;
  onSelectNote: (noteNumber: number) => void;
  onCreateNote: () => void;
  onPinToggle: (noteNumber: number, pinned: boolean) => void;
  onDelete: (noteNumber: number) => void;
  isCreating: boolean;
  width?: number;
  onResizePointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onResizePointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onResizePointerUp?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
};

const NoteListPanel = ({
  notes,
  selectedNoteNumber,
  onSelectNote,
  onCreateNote,
  onPinToggle,
  onDelete,
  isCreating,
  width,
  onResizePointerDown,
  onResizePointerMove,
  onResizePointerUp,
}: NoteListPanelProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(),
  );
  const { data: projectTree } = useProjectTreeQuery();

  const filteredNotes = searchQuery
    ? notes.filter(
        n =>
          (n.title ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content_preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : notes;

  const pinnedNotes = filteredNotes.filter(n => n.is_pinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.is_pinned);

  // 프로젝트별 노트 그룹핑 (태그 기반 매칭) — useMemo로 캐싱
  const { projectNoteMap, uncategorizedNotes } = useMemo(() => {
    const map = new Map<string, NoteListItem[]>();
    const assigned = new Set<number>();

    const collectProjectNames = (nodes: ProjectTreeNode[]): string[] => {
      const names: string[] = [];
      for (const node of nodes) {
        names.push(node.name);
        if (node.children.length > 0) {
          names.push(...collectProjectNames(node.children));
        }
      }
      return names;
    };

    if (projectTree?.items) {
      const allProjectNames = collectProjectNames(projectTree.items);
      for (const projectName of allProjectNames) {
        const matchingNotes = unpinnedNotes.filter(note =>
          note.tags.some(
            tag => tag.toLowerCase() === projectName.toLowerCase(),
          ),
        );
        if (matchingNotes.length > 0) {
          map.set(projectName, matchingNotes);
          matchingNotes.forEach(n => assigned.add(n.note_number));
        }
      }
    }

    return {
      projectNoteMap: map,
      uncategorizedNotes: unpinnedNotes.filter(
        n => !assigned.has(n.note_number),
      ),
    };
  }, [unpinnedNotes, projectTree?.items]);

  const toggleProject = (projectName: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectName)) {
        next.delete(projectName);
      } else {
        next.add(projectName);
      }
      return next;
    });
  };

  const renderProjectGroup = (node: ProjectTreeNode, depth = 0) => {
    const projectNotes = projectNoteMap.get(node.name) ?? [];
    const isExpanded = expandedProjects.has(node.name);
    const hasContent = projectNotes.length > 0 || node.children.length > 0;

    if (!hasContent && !searchQuery) return null;

    return (
      <div key={node.id}>
        <button
          type="button"
          onClick={() => toggleProject(node.name)}
          className="flex w-full items-center gap-[0.6rem] px-[1.6rem] py-[0.8rem] text-left transition-colors hover:bg-surface-container"
          style={{ paddingLeft: `${1.6 + depth * 1.2}rem` }}>
          {hasContent ? (
            isExpanded ? (
              <ChevronDownIcon
                size="1.2rem"
                fill="#9c8f78"
              />
            ) : (
              <ChevronRightIcon
                size="1.2rem"
                fill="#9c8f78"
              />
            )
          ) : (
            <span className="w-[1.2rem]" />
          )}
          <FolderIcon
            size="1.2rem"
            fill={node.color ?? "#9c8f78"}
          />
          <span className="flex-1 truncate text-[1.1rem] font-semibold text-on-surface-variant">
            {node.name}
          </span>
          {projectNotes.length > 0 && (
            <span className="text-[1rem] text-on-surface-variant/50">
              {projectNotes.length}
            </span>
          )}
        </button>

        {isExpanded && (
          <>
            {projectNotes.map(note => (
              <NoteItem
                key={note.note_number}
                note={note}
                isSelected={note.note_number === selectedNoteNumber}
                onSelect={onSelectNote}
                onPinToggle={onPinToggle}
                onDelete={onDelete}
                depth={depth + 1}
              />
            ))}
            {node.children.map(child => renderProjectGroup(child, depth + 1))}
          </>
        )}
      </div>
    );
  };

  if (collapsed) {
    return (
      <>
        <div className="hidden shrink-0 flex-col items-center gap-[1.6rem] bg-surface-container-lowest py-[1.6rem] px-[0.8rem] lg:flex">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="rounded-[0.25rem] p-[0.4rem] text-on-surface-variant/40 transition-colors hover:bg-surface-container hover:text-on-surface-variant"
            title="Expand notes">
            <ChevronRightIcon
              size="1.6rem"
              stroke="currentColor"
            />
          </button>
          <button
            type="button"
            onClick={onCreateNote}
            disabled={isCreating}
            title="New note"
            className="rounded-[0.25rem] p-[0.4rem] text-on-surface-variant/40 transition-colors hover:bg-surface-container hover:text-primary">
            <PlusCircleIcon
              size="2rem"
              fill="currentColor"
            />
          </button>
          <DescriptionIcon
            size="2rem"
            className="text-on-surface-variant/20"
          />
          <span
            className="text-[1rem] font-bold text-on-surface-variant/30"
            style={{ writingMode: "vertical-rl" }}>
            NOTES
          </span>
        </div>
        {onResizePointerDown && (
          <div
            className="hidden shrink-0 cursor-col-resize touch-none select-none border-r border-outline-variant/10 transition-colors hover:bg-primary/20 active:bg-primary/40 lg:block"
            style={{ width: "6px" }}
            onPointerDown={onResizePointerDown}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div
        className="hidden shrink-0 flex-col bg-surface-container-lowest lg:flex"
        style={{ width: width ? `${width}px` : "28rem" }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/10 px-[1.6rem] py-[1.6rem]">
          <div className="flex items-center gap-[0.8rem]">
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="rounded-[0.25rem] p-[0.2rem] text-on-surface-variant/40 transition-colors hover:bg-surface-container hover:text-on-surface-variant"
              title="Collapse notes">
              <ChevronLeftIcon
                size="1.4rem"
                stroke="currentColor"
              />
            </button>
            <h2 className="text-[1.2rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
              Notes
            </h2>
          </div>
          <button
            type="button"
            onClick={onCreateNote}
            disabled={isCreating}
            className="flex items-center gap-[0.6rem] rounded-[0.375rem] bg-primary px-[1.2rem] py-[0.6rem] text-[1.1rem] font-semibold text-on-primary transition-all hover:brightness-110 active:scale-95 disabled:opacity-50">
            <PlusCircleIcon
              size="1.4rem"
              fill="currentColor"
            />
            {isCreating ? "Creating..." : "New"}
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-outline-variant/10 px-[1.6rem] py-[1.2rem]">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[1rem]">
              <SearchIcon
                size="1.4rem"
                className="text-on-surface-variant/50"
              />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full rounded-[0.25rem] border border-outline-variant/20 bg-surface-container-low py-[0.6rem] pl-[3.2rem] pr-[1.2rem] text-[1.2rem] text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto">
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-[0.6rem] px-[1.6rem] pt-[1.6rem] pb-[0.8rem]">
                <PushPinIcon
                  size="1.2rem"
                  fill="#9c8f78"
                />
                <span className="text-[1rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                  Pinned
                </span>
              </div>
              {pinnedNotes.map(note => (
                <NoteItem
                  key={note.note_number}
                  note={note}
                  isSelected={note.note_number === selectedNoteNumber}
                  onSelect={onSelectNote}
                  onPinToggle={onPinToggle}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}

          {/* Project Groups */}
          {projectTree?.items && projectTree.items.length > 0 && (
            <div>
              <div className="px-[1.6rem] pt-[1.6rem] pb-[0.8rem]">
                <span className="text-[1rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                  Projects
                </span>
              </div>
              {projectTree.items.map(node => renderProjectGroup(node))}
            </div>
          )}

          {/* Uncategorized */}
          {uncategorizedNotes.length > 0 && (
            <div>
              <div className="px-[1.6rem] pt-[1.6rem] pb-[0.8rem]">
                <span className="text-[1rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                  Recent
                </span>
              </div>
              {uncategorizedNotes.map(note => (
                <NoteItem
                  key={note.note_number}
                  note={note}
                  isSelected={note.note_number === selectedNoteNumber}
                  onSelect={onSelectNote}
                  onPinToggle={onPinToggle}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}

          {filteredNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center px-[1.6rem] py-[4.8rem]">
              <p className="text-[1.2rem] text-on-surface-variant">
                {searchQuery ? "No matching notes" : "No notes yet"}
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Resize Handle */}
      {onResizePointerDown && (
        <div
          className="hidden shrink-0 cursor-col-resize touch-none select-none border-r border-outline-variant/10 transition-colors hover:bg-primary/20 active:bg-primary/40 lg:block"
          style={{ width: "6px" }}
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={onResizePointerUp}
        />
      )}
    </>
  );
};

interface NoteItemProps {
  note: NoteListItem;
  isSelected: boolean;
  onSelect: (noteNumber: number) => void;
  onPinToggle: (noteNumber: number, pinned: boolean) => void;
  onDelete: (noteNumber: number) => void;
  depth?: number;
}

const NoteItem = ({
  note,
  isSelected,
  onSelect,
  onPinToggle,
  onDelete,
  depth = 0,
}: NoteItemProps) => {
  return (
    <div
      className={`group relative w-full cursor-pointer py-[1.2rem] pr-[1.6rem] text-left transition-colors hover:bg-surface-container ${
        isSelected
          ? "border-l-2 border-primary bg-surface-container-highest"
          : "border-l-2 border-transparent"
      }`}
      style={{ paddingLeft: `${1.6 + depth * 1.2}rem` }}>
      <button
        type="button"
        onClick={() => onSelect(note.note_number)}
        className="w-full text-left">
        <p className="truncate pr-[4.8rem] text-[1.3rem] font-semibold text-on-surface">
          {note.title ?? "Untitled"}
        </p>
        <div className="mt-[0.4rem] flex items-center gap-[0.8rem]">
          <span className="text-[1rem] text-on-surface-variant">
            {formatRelativeTime(note.created_at)}
          </span>
        </div>
        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="mt-[0.4rem] flex flex-wrap gap-[0.4rem]">
            {note.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="rounded-full bg-surface-container-high px-[0.6rem] py-[0.1rem] text-[0.9rem] text-on-surface-variant/70">
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[0.9rem] text-on-surface-variant/50">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </button>
      <div className="absolute top-[1.2rem] right-[1.2rem] flex gap-[0.2rem]">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onPinToggle(note.note_number, !note.is_pinned);
          }}
          className={`rounded-[0.25rem] p-[0.4rem] transition-all ${
            note.is_pinned
              ? "text-primary opacity-100"
              : "text-on-surface-variant opacity-0 group-hover:opacity-100"
          } hover:bg-surface-container-high`}
          title={note.is_pinned ? "Unpin" : "Pin"}>
          <PushPinIcon
            size="1.4rem"
            fill="currentColor"
          />
        </button>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onDelete(note.note_number);
          }}
          className="rounded-[0.25rem] p-[0.4rem] text-on-surface-variant opacity-0 transition-all hover:bg-error/10 hover:text-error group-hover:opacity-100"
          title="Delete">
          <DeleteIcon
            size="1.4rem"
            fill="currentColor"
          />
        </button>
      </div>
    </div>
  );
};

export default NoteListPanel;
