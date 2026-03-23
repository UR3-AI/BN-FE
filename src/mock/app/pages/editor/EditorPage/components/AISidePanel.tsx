import type { ActionItemResponse } from "@/mock/lib/apis/queries/notes/useNoteDetailQuery/useNoteDetailQuery.type";
import type { RelatedNote } from "@/mock/lib/apis/queries/notes/useRelatedNotesQuery/useRelatedNotesQuery.type";

import {
  CheckboxBlankIcon,
  CheckboxIcon,
  SparklesIcon,
  TreeIcon,
} from "@/mock/app/components/Icons";

const ENTITY_TYPE_COLORS: Record<string, string> = {
  person: "#f4a8b5",
  technology: "#a8c5f4",
  project: "#9fd0cd",
  concept: "#c4b5f4",
  organization: "#ffe2ab",
  topic: "#b5f4c4",
};

interface GraphNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
}

const buildMiniGraph = (
  noteTitle: string | null,
  relatedNotes: RelatedNote[],
): { nodes: GraphNode[]; edges: { from: string; to: string }[] } => {
  const cx = 50;
  const cy = 50;

  // Center node = current note
  const centerNode: GraphNode = {
    id: "center",
    label: noteTitle ?? "This Note",
    type: "project",
    x: cx,
    y: cy,
  };

  // Collect unique entities from related notes
  const entityMap = new Map<string, { name: string; type: string }>();
  for (const note of relatedNotes) {
    for (const entity of note.shared_entities) {
      if (!entityMap.has(entity.name)) {
        entityMap.set(entity.name, entity);
      }
    }
  }

  const entities = [...entityMap.values()].slice(0, 8);
  const radius = 35;
  const entityNodes: GraphNode[] = entities.map((e, i) => {
    const angle = (2 * Math.PI * i) / entities.length - Math.PI / 2;
    return {
      id: `entity-${e.name}`,
      label: e.name,
      type: e.type,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  const edges = entityNodes.map(n => ({ from: "center", to: n.id }));

  return { nodes: [centerNode, ...entityNodes], edges };
};

interface AISidePanelProps {
  summary: string | null;
  content: string | null;
  tags: string[];
  actions: ActionItemResponse[];
  relatedNotes: RelatedNote[];
  noteTitle: string | null;
  isProcessing: boolean;
}

const AISidePanel = ({ summary, content, tags, actions, relatedNotes, noteTitle, isProcessing }: AISidePanelProps) => {
  const isResearch = tags.includes("research") || tags.includes("auto-generated");
  const { nodes: graphNodes, edges: graphEdges } = buildMiniGraph(noteTitle, relatedNotes);
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

      {/* Contextual Graph */}
      <div className="mt-[4.8rem] rounded-[0.5rem] border border-outline-variant/10 bg-surface-container-lowest p-[1.6rem]">
        <span className="mb-[1.2rem] block text-[1rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          Contextual Graph
        </span>
        {graphNodes.length <= 1 ? (
          <div className="flex flex-col items-center justify-center py-[4rem] text-center">
            <TreeIcon
              size="3rem"
              fill="#ffe2ab"
              className="mb-[1.2rem] opacity-40"
            />
            <p className="text-[1rem] text-outline">
              No entity connections found
            </p>
          </div>
        ) : (
          <div className="relative aspect-square w-full">
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full">
              {/* Edges */}
              {graphEdges.map(edge => {
                const from = graphNodes.find(n => n.id === edge.from);
                const to = graphNodes.find(n => n.id === edge.to);
                if (!from || !to) return null;
                return (
                  <line
                    key={`${edge.from}-${edge.to}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#9fd0cd"
                    strokeWidth="0.3"
                    opacity="0.4"
                  />
                );
              })}
              {/* Nodes */}
              {graphNodes.map(node => {
                const isCenter = node.id === "center";
                const color = ENTITY_TYPE_COLORS[node.type] ?? "#9c8f78";
                const r = isCenter ? 4.5 : 3;
                return (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r}
                      fill={isCenter ? "#1a1a1a" : "#1a1a1a"}
                      stroke={isCenter ? "#ffe2ab" : color}
                      strokeWidth={isCenter ? "0.8" : "0.5"}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r - 1.2}
                      fill={isCenter ? "#ffe2ab" : color}
                      opacity={isCenter ? 0.8 : 0.6}
                    />
                    <text
                      x={node.x}
                      y={node.y + r + 3}
                      textAnchor="middle"
                      fill={isCenter ? "#ffe2ab" : "#a8a29e"}
                      fontSize={isCenter ? "3" : "2.5"}
                      fontWeight={isCenter ? "bold" : "normal"}>
                      {node.label.length > 8 ? node.label.slice(0, 7) + "…" : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
        <p className="mt-[0.8rem] text-center text-[1rem] text-outline">
          {graphNodes.length - 1} entities connected
        </p>
      </div>
    </div>
  );
};

export default AISidePanel;
