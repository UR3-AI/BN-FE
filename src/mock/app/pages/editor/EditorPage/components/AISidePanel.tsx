import type { ActionItemResponse } from "@/mock/lib/apis/queries/notes/useNoteDetailQuery/useNoteDetailQuery.type";

import {
  CheckboxBlankIcon,
  CheckboxIcon,
  SparklesIcon,
  TreeIcon,
} from "@/mock/app/components/Icons";

interface AISidePanelProps {
  summary: string | null;
  content: string | null;
  tags: string[];
  actions: ActionItemResponse[];
  isProcessing: boolean;
}

const AISidePanel = ({ summary, content, tags, actions, isProcessing }: AISidePanelProps) => {
  const isResearch = tags.includes("research") || tags.includes("auto-generated");
  return (
    <div className="p-[2.4rem]">
      {/* Header */}
      <div className="mb-[3.2rem] flex items-center justify-between">
        <h2 className="font-headline text-[1.4rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
          AI Synthesis
        </h2>
        {isProcessing && (
          <div className="flex items-center gap-[0.8rem] rounded-[0.125rem] bg-primary/10 px-[0.8rem] py-[0.4rem]">
            <div className="h-[0.6rem] w-[0.6rem] animate-pulse rounded-full bg-primary" />
            <span className="text-[1rem] font-bold uppercase tracking-tighter text-primary">
              Processing
            </span>
          </div>
        )}
      </div>

      {/* Focus Plate: Summary */}
      <div className="mb-[2.4rem] rounded-[0.25rem] border-b border-outline-variant/20 bg-surface-container-highest p-[2.4rem]">
        <h3 className="mb-[1.2rem] flex items-center gap-[0.8rem] text-[1.2rem] font-bold text-primary">
          <SparklesIcon
            size="1.6rem"
            fill="#ffe2ab"
          />
          Executive Summary
        </h3>
        <p className="text-[1.4rem] leading-relaxed text-on-surface/80">
          {summary ?? "No summary available"}
        </p>
      </div>

      {/* Research Findings */}
      {isResearch && content && (
        <div className="mb-[2.4rem] rounded-[0.25rem] border border-secondary/20 bg-surface-container-low p-[2rem]">
          <h3 className="mb-[1.2rem] flex items-center gap-[0.8rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-secondary">
            <TreeIcon
              size="1.6rem"
              fill="#9fd0cd"
            />
            Research Findings
          </h3>
          <div className="max-h-[24rem] overflow-y-auto">
            <p className="whitespace-pre-wrap text-[1.3rem] leading-relaxed text-on-surface/80">
              {content}
            </p>
          </div>
        </div>
      )}

      {/* Metadata Nodes */}
      <div className="mb-[3.2rem]">
        <h3 className="mb-[1.6rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
          Metadata Nodes
        </h3>
        <div className="flex flex-wrap gap-[0.8rem]">
          {tags.length > 0 ? (
            tags.map(tag => (
              <span
                key={tag}
                className="rounded-full border border-outline-variant/10 bg-surface-container px-[1.2rem] py-[0.4rem] text-[1.2rem] font-medium text-secondary">
                #{tag}
              </span>
            ))
          ) : (
            <span className="text-[1.2rem] text-on-surface-variant">No tags</span>
          )}
        </div>
      </div>

      {/* Extracted Actions */}
      <div>
        <h3 className="mb-[1.6rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
          Extracted Actions
        </h3>
        <div className="space-y-[1.2rem]">
          {actions.length > 0 ? (
            actions.map(action => {
              const isCompleted = action.status === "completed" || action.status === "done";
              return (
                <div
                  key={action.id}
                  className={`flex items-start gap-[1.2rem] rounded-[0.125rem] border-l-2 bg-surface-container/40 p-[1.2rem] ${
                    isCompleted
                      ? "border-outline/20 opacity-60"
                      : "border-primary/40"
                  }`}>
                  {isCompleted ? (
                    <CheckboxIcon
                      size="1.8rem"
                      fill="#9c8f78"
                    />
                  ) : (
                    <CheckboxBlankIcon
                      size="1.8rem"
                      fill="#ffe2ab"
                    />
                  )}
                  <div>
                    <p
                      className={`text-[1.2rem] font-medium text-on-surface ${isCompleted ? "line-through" : ""}`}>
                      {action.summary}
                    </p>
                    <p className="mt-[0.4rem] text-[1rem] text-on-surface-variant">
                      {isCompleted
                        ? "Completed"
                        : action.end_time
                          ? `Due: ${action.end_time}`
                          : action.status}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-[1.2rem] text-on-surface-variant">No action items</p>
          )}
        </div>
      </div>

      {/* Contextual Graph Placeholder */}
      <div className="mt-[4.8rem] flex aspect-square flex-col items-center justify-center rounded-[0.5rem] border border-outline-variant/10 bg-surface-container-lowest p-[1.6rem] text-center">
        <div className="relative mb-[1.6rem] flex h-[12.8rem] w-[12.8rem] items-center justify-center">
          <TreeIcon
            size="3rem"
            fill="#ffe2ab"
          />
        </div>
        <span className="text-[1rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          Contextual Graph
        </span>
        <p className="mt-[0.8rem] px-[1.6rem] text-[1rem] text-outline">
          {actions.length} active nodes identified in current text segment
        </p>
      </div>
    </div>
  );
};

export default AISidePanel;
