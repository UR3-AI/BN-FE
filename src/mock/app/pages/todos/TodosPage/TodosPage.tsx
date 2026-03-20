import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import {
  CloseIcon,
  DescriptionIcon,
  LinkIcon,
  PlusCircleIcon,
  SparklesIcon,
  TreeIcon,
} from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";
import { useUpdateActionMutation } from "@/mock/lib/apis/mutations/actions";
import type { ActionItemResponse } from "@/mock/lib/apis/mutations/actions/useUpdateActionMutation/useUpdateActionMutation.type";
import useNoteActionsQuery from "@/mock/lib/apis/queries/notes/useNoteActionsQuery/useNoteActionsQuery";
import useNotesQuery from "@/mock/lib/apis/queries/notes/useNotesQuery/useNotesQuery";

type FilterType = "All" | "Pending" | "Completed" | "Overdue";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "In Progress",
  completed: "Completed",
  dismissed: "Dismissed",
};

const getStatusLabel = (status: string): string => STATUS_LABELS[status] ?? status;

const getStatusStyle = (status: string, isOverdue: boolean): string => {
  if (isOverdue) return "bg-error text-on-error";
  switch (status) {
    case "pending":
      return "bg-secondary-container/30 text-secondary";
    case "confirmed":
      return "bg-primary/10 text-primary";
    case "completed":
      return "bg-surface-container-highest text-on-surface/50";
    case "dismissed":
      return "bg-surface-container text-outline";
    default:
      return "bg-surface-container-highest text-on-surface/70";
  }
};

const isOverdue = (action: ActionItemResponse): boolean => {
  if (!action.end_time || action.status === "completed") return false;
  return new Date(action.end_time) < new Date();
};

const formatDateTime = (dateStr: string | null): string => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString();
};

const DetailPanel = ({
  action,
  noteNumber,
  onClose,
}: {
  action: ActionItemResponse | null;
  noteNumber: number | null;
  onClose: () => void;
}) => {
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
          className="text-on-surface/40 transition-colors hover:text-on-surface"
          onClick={onClose}>
          <CloseIcon
            size="2rem"
            stroke="currentColor"
          />
        </button>
      </div>

      {!action && (
        <div className="flex flex-col items-center justify-center py-[8rem] text-center">
          <SparklesIcon
            size="4rem"
            fill="#9c8f78"
            className="mb-[1.6rem] opacity-40"
          />
          <p className="text-[1.4rem] text-on-surface-variant">
            Select an action item to view details
          </p>
        </div>
      )}

      {action && (
        <div className="space-y-[4rem]">
          {/* Selected Task Details */}
          <div className="space-y-[1.6rem]">
            <h2 className="font-headline text-[2.2rem] font-bold leading-tight text-on-surface">
              {action.summary}
            </h2>
            <div className="flex flex-wrap gap-[0.8rem]">
              <span
                className={`rounded-[0.25rem] px-[1.2rem] py-[0.4rem] text-[1.2rem] font-semibold ${getStatusStyle(action.status, isOverdue(action))}`}>
                {isOverdue(action) ? "Overdue" : getStatusLabel(action.status)}
              </span>
              <span className="rounded-[0.25rem] bg-surface-container-highest px-[1.2rem] py-[0.4rem] text-[1.2rem] font-semibold text-on-surface/70">
                Type: {action.type}
              </span>
            </div>
            {(action.start_time || action.end_time) && (
              <div className="space-y-[0.4rem] text-[1.2rem] text-on-surface/60">
                {action.start_time && (
                  <p>Start: {formatDateTime(action.start_time)}</p>
                )}
                {action.end_time && (
                  <p>Due: {formatDateTime(action.end_time)}</p>
                )}
              </div>
            )}
            <p className="text-[1.4rem] leading-relaxed text-on-surface/70">
              Confidence: {Math.round(action.confidence_score * 100)}%
            </p>
          </div>

          {/* Associated Context */}
          {noteNumber !== null && (
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
                        Note #{noteNumber}
                      </p>
                      <p className="text-[1rem] text-on-surface/40">
                        Source note
                      </p>
                    </div>
                  </div>
                </a>
                {action.research_note_number !== null && (
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
                          Research Note #{action.research_note_number}
                        </p>
                        <p className="text-[1rem] text-on-surface/40">
                          Research Reference
                        </p>
                      </div>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

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
                    <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
                  </svg>
                  Generate draft summary
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

interface ActionWithNote {
  action: ActionItemResponse;
  noteNumber: number;
}

const TodosPage = () => {
  const [filter, setFilter] = useState<FilterType>("All");
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { mutate: updateAction } = useUpdateActionMutation();

  const { data: notesData, isLoading: isNotesLoading } = useNotesQuery({ limit: 50 });

  const notesWithActions = notesData?.items.filter(n => n.has_action_items) ?? [];
  const firstNoteWithActions = notesWithActions[0];

  const { data: actionsData, isLoading: isActionsLoading } = useNoteActionsQuery(
    firstNoteWithActions?.note_number ?? 0,
  );

  const isLoading = isNotesLoading || (firstNoteWithActions !== undefined && isActionsLoading);

  const allActions: ActionWithNote[] = (actionsData ?? []).map(action => ({
    action,
    noteNumber: firstNoteWithActions?.note_number ?? 0,
  }));

  const filteredActions = allActions.filter(({ action }) => {
    switch (filter) {
      case "Pending":
        return action.status === "pending" || action.status === "confirmed";
      case "Completed":
        return action.status === "completed";
      case "Overdue":
        return isOverdue(action);
      default:
        return true;
    }
  });

  const selectedEntry = allActions.find(({ action }) => action.id === selectedActionId) ?? null;

  const handleCheckboxToggle = (action: ActionItemResponse) => {
    const newStatus = action.status === "completed" ? "pending" : "completed";
    updateAction(
      { actionId: action.id, status: newStatus },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["notes"] });
        },
      },
    );
  };

  const filters: FilterType[] = ["All", "Pending", "Completed", "Overdue"];

  return (
    <GlobalLayout
      activeMenu="todos"
      sidePanel={
        <DetailPanel
          action={selectedEntry?.action ?? null}
          noteNumber={selectedEntry?.noteNumber ?? null}
          onClose={() => setSelectedActionId(null)}
        />
      }>
      <div className="flex-1 overflow-y-auto bg-surface-container-lowest px-[3.2rem] py-[3.2rem] md:px-[4.8rem]">
        <div className="mx-auto max-w-[89.6rem]">
          {/* Header & Filters */}
          <div className="mb-[4.8rem] flex flex-col gap-[2.4rem]">
            <h2 className="font-headline text-[3.6rem] font-extrabold tracking-tighter text-on-surface">
              Action Items
            </h2>
            <div className="flex gap-[1.2rem]">
              {filters.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-[2rem] py-[0.6rem] text-[1.4rem] font-semibold transition-colors ${
                    filter === f
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-highest text-on-surface/70 hover:bg-surface-bright"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-[12rem]">
              <div className="h-[4rem] w-[4rem] animate-spin rounded-full border-[0.3rem] border-outline-variant border-t-primary" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredActions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-[12rem] text-center">
              <SparklesIcon
                size="6rem"
                fill="#9c8f78"
                className="mb-[2.4rem] opacity-30"
              />
              <h3 className="mb-[1.2rem] font-headline text-[2rem] font-bold text-on-surface-variant">
                No action items found
              </h3>
              <p className="text-[1.4rem] text-outline">
                {filter === "All"
                  ? "Your notes don't have any action items yet."
                  : `No ${filter.toLowerCase()} action items.`}
              </p>
            </div>
          )}

          {/* Task List */}
          {!isLoading && filteredActions.length > 0 && (
            <div className="space-y-[1.6rem]">
              {filteredActions.map(({ action, noteNumber }) => {
                const overdueFlag = isOverdue(action);
                const isCompleted = action.status === "completed";
                const isSelected = selectedActionId === action.id;

                return (
                  <div
                    key={action.id}
                    onClick={() => setSelectedActionId(action.id)}
                    className={`group flex cursor-pointer items-center gap-[2.4rem] rounded-[0.5rem] p-[2.4rem] transition-all duration-300 ${
                      overdueFlag
                        ? "border-l-4 border-error/50 bg-error-container/20 hover:bg-error-container/30"
                        : isCompleted
                          ? "bg-surface-container-low/40 opacity-60"
                          : isSelected
                            ? "bg-surface-container-high"
                            : "bg-surface-container-low hover:bg-surface-container"
                    }`}>
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        aria-label={action.summary}
                        checked={isCompleted}
                        onChange={e => {
                          e.stopPropagation();
                          handleCheckboxToggle(action);
                        }}
                        className="h-[2rem] w-[2rem] rounded border-outline-variant bg-transparent text-primary focus:ring-primary focus:ring-offset-background"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-[0.4rem] flex items-center gap-[1.2rem]">
                        <h3
                          className={`truncate text-[1.6rem] font-semibold text-on-surface ${isCompleted ? "line-through" : ""}`}>
                          {action.summary}
                        </h3>
                        <span
                          className={`flex-shrink-0 rounded px-[0.8rem] py-[0.2rem] text-[1rem] font-bold uppercase tracking-[0.12em] ${getStatusStyle(action.status, overdueFlag)}`}>
                          {overdueFlag ? "Overdue" : getStatusLabel(action.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-[1.6rem] text-[1.2rem] text-on-surface/50">
                        <a
                          href="#"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-[0.4rem] transition-colors hover:text-primary">
                          <LinkIcon
                            size="1.6rem"
                            fill="currentColor"
                          />
                          Note #{noteNumber}
                        </a>
                        {action.end_time && (
                          <span className="flex items-center gap-[0.4rem]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="1.6rem"
                              height="1.6rem"
                              fill="currentColor">
                              <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" />
                            </svg>
                            {formatDateTime(action.end_time)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        aria-label="More options"
                        onClick={e => e.stopPropagation()}
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
                );
              })}

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
          )}
        </div>
      </div>
    </GlobalLayout>
  );
};

export default TodosPage;
