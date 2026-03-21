import { useState } from "react";

import {
  CloseIcon,
  CursorIcon,
  DatabaseIcon,
  DeleteIcon,
  DragPanIcon,
  LabelIcon,
  LassoIcon,
  LayersIcon,
  LinkIcon,
  MergeIcon,
  PsychologyIcon,
  SparklesIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";
import useEntityDetailQuery from "@/mock/lib/apis/queries/graph/useEntityDetailQuery/useEntityDetailQuery";
import useEntityNeighborsQuery from "@/mock/lib/apis/queries/graph/useEntityNeighborsQuery/useEntityNeighborsQuery";
import useGraphStatsQuery from "@/mock/lib/apis/queries/graph/useGraphStatsQuery/useGraphStatsQuery";
import useGraphVisualizationQuery from "@/mock/lib/apis/queries/graph/useGraphVisualizationQuery/useGraphVisualizationQuery";
import type { GraphNode } from "@/mock/lib/apis/queries/graph/useGraphVisualizationQuery/useGraphVisualizationQuery.type";

const MAX_NODES = 20;

const computeNodePositions = (
  nodes: GraphNode[],
): { id: string; x: number; y: number }[] => {
  const limited = nodes.slice(0, MAX_NODES);
  if (limited.length === 0) return [];

  const centerX = 50;
  const centerY = 45;
  const radius = 30;

  return limited.map((node, index) => {
    if (index === 0) {
      return { id: node.id, x: centerX, y: centerY };
    }
    const angle = ((index - 1) / (limited.length - 1)) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { id: node.id, x, y };
  });
};

const GraphPage = () => {
  const [selectedUid, setSelectedUid] = useState<string>("");

  const { data: vizData, isLoading: isVizLoading } = useGraphVisualizationQuery(MAX_NODES);
  const { data: statsData } = useGraphStatsQuery();
  const { data: entityDetail, isLoading: isDetailLoading } = useEntityDetailQuery(selectedUid);
  const { data: neighborsData } = useEntityNeighborsQuery({ uid: selectedUid });
  const neighborIds = new Set(neighborsData?.nodes.map(n => n.id) ?? []);

  const nodes = vizData?.nodes.slice(0, MAX_NODES) ?? [];
  const edges = vizData?.edges ?? [];
  const positions = computeNodePositions(nodes);

  const getPosition = (id: string) => positions.find(p => p.id === id);

  const handleNodeClick = (nodeId: string) => {
    setSelectedUid(nodeId);
  };

  const selectedNode = nodes.find(n => n.id === selectedUid);

  return (
    <GlobalLayout
      topbarTitle={`Knowledge Graph${statsData ? ` · ${statsData.total_entities} entities` : ""}`}
      showSearch={false}>
      {/* Canvas Area */}
      <div
        className="relative flex-1 cursor-crosshair overflow-hidden bg-surface-container-lowest"
        style={{
          backgroundImage: "radial-gradient(circle, #2a2a2a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}>
        {/* Floating Toolbar (Left) */}
        <div className="absolute left-[2.4rem] top-[2.4rem] z-30 flex flex-col gap-[0.8rem]">
          <div className="rounded-[0.5rem] border-b border-outline-variant/10 bg-surface-container-high/80 p-[0.6rem] shadow-xl backdrop-blur-md">
            <button
              type="button"
              className="mb-[0.4rem] flex items-center justify-center rounded-[0.25rem] bg-primary/20 p-[1.2rem] text-primary">
              <CursorIcon size="2rem" />
            </button>
            <button
              type="button"
              className="mb-[0.4rem] flex items-center justify-center rounded-[0.25rem] p-[1.2rem] text-on-surface-variant hover:bg-surface-container-highest">
              <LassoIcon size="2rem" />
            </button>
            <button
              type="button"
              className="mb-[0.4rem] flex items-center justify-center rounded-[0.25rem] p-[1.2rem] text-on-surface-variant hover:bg-surface-container-highest">
              <DragPanIcon size="2rem" />
            </button>
            <div className="my-[0.8rem] h-px bg-outline-variant/20" />
            <button
              type="button"
              className="mb-[0.4rem] flex items-center justify-center rounded-[0.25rem] p-[1.2rem] text-on-surface-variant hover:bg-surface-container-highest">
              <ZoomInIcon size="2rem" />
            </button>
            <button
              type="button"
              className="flex items-center justify-center rounded-[0.25rem] p-[1.2rem] text-on-surface-variant hover:bg-surface-container-highest">
              <ZoomOutIcon size="2rem" />
            </button>
          </div>
          <div className="rounded-[0.5rem] border-b border-outline-variant/10 bg-surface-container-high/80 p-[0.6rem] shadow-xl backdrop-blur-md">
            <button
              type="button"
              className="flex items-center justify-center rounded-[0.25rem] p-[1.2rem] text-on-surface-variant hover:bg-surface-container-highest">
              <LayersIcon size="2rem" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isVizLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="h-[4rem] w-[4rem] animate-spin rounded-full border-[0.3rem] border-outline-variant border-t-primary" />
          </div>
        )}

        {/* Graph Connections (SVG) */}
        {!isVizLoading && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40">
            {edges.map((edge, i) => {
              const sourcePos = getPosition(edge.source);
              const targetPos = getPosition(edge.target);
              if (!sourcePos || !targetPos) return null;
              return (
                <line
                  key={i}
                  x1={`${sourcePos.x}%`}
                  y1={`${sourcePos.y}%`}
                  x2={`${targetPos.x}%`}
                  y2={`${targetPos.y}%`}
                  stroke="#9fd0cd"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        )}

        {/* Graph Nodes */}
        {!isVizLoading &&
          nodes.map((node, index) => {
            const pos = getPosition(node.id);
            if (!pos) return null;
            const isSelected = node.id === selectedUid;
            const isCenter = index === 0;
            const isNeighbor = neighborIds.has(node.id);

            return (
              <div
                key={node.id}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => handleNodeClick(node.id)}>
                <div
                  className={`flex items-center justify-center rounded-full border transition-transform hover:scale-110 ${
                    isCenter
                      ? "h-[6.4rem] w-[6.4rem] border-2 border-primary bg-surface-container-highest shadow-[0_0_0_0_rgba(255,226,171,0.4)]"
                      : isSelected
                        ? "h-[4.8rem] w-[4.8rem] border-2 border-primary bg-surface-container-highest"
                        : isNeighbor
                          ? "h-[4rem] w-[4rem] border border-primary/50 bg-surface-container-highest"
                          : "h-[4rem] w-[4rem] border border-secondary bg-surface-container-highest"
                  }`}>
                  {isCenter ? (
                    <PsychologyIcon
                      size="3rem"
                      fill="#ffe2ab"
                    />
                  ) : (
                    <DatabaseIcon
                      size="2rem"
                      fill={isSelected ? "#ffe2ab" : "#9c8f78"}
                    />
                  )}
                </div>
                <div className="absolute -bottom-[4rem] left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                  <span
                    className={`text-[1.2rem] font-medium ${isCenter ? "text-[1.4rem] text-primary" : "text-on-surface"}`}>
                    {node.label}
                  </span>
                  {isCenter && (
                    <p className="text-[1rem] uppercase tracking-[0.15em] text-outline">
                      Active Focus
                    </p>
                  )}
                </div>
              </div>
            );
          })}

        {/* Selection Counter (Bottom) */}
        <div className="absolute bottom-[3.2rem] left-1/2 z-40 flex -translate-x-1/2 items-center gap-[2.4rem] rounded-full border border-outline-variant/20 bg-surface-container-highest px-[2.4rem] py-[1.6rem] shadow-2xl">
          <div className="flex items-center gap-[1.2rem]">
            <div className="flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-full bg-secondary/20 text-[1.2rem] font-bold text-secondary">
              {nodes.length}
            </div>
            <span className="text-[1.4rem] font-medium">Nodes</span>
          </div>
          <div className="h-[2.4rem] w-px bg-outline-variant/20" />
          <div className="flex items-center gap-[0.8rem]">
            <button
              type="button"
              className="flex items-center gap-[0.8rem] rounded-[0.25rem] bg-surface-container px-[1.6rem] py-[0.6rem] text-[1.2rem] font-semibold transition-colors hover:bg-surface-bright">
              <MergeIcon size="1.6rem" /> Merge
            </button>
            <button
              type="button"
              className="flex items-center gap-[0.8rem] rounded-[0.25rem] bg-surface-container px-[1.6rem] py-[0.6rem] text-[1.2rem] font-semibold transition-colors hover:bg-surface-bright">
              <LabelIcon size="1.6rem" /> Group
            </button>
            <button
              type="button"
              className="flex items-center gap-[0.8rem] rounded-[0.25rem] bg-error-container/20 px-[1.6rem] py-[0.6rem] text-[1.2rem] font-semibold text-error transition-colors hover:bg-error-container/40">
              <DeleteIcon size="1.6rem" /> Remove
            </button>
          </div>
        </div>

        {/* Zoom Info (Bottom Left) */}
        <div className="absolute bottom-[2.4rem] left-[2.4rem] z-10 flex items-center gap-[1.6rem]">
          <div className="flex items-center rounded-full border border-outline-variant/10 bg-surface-container-high/60 px-[1.2rem] py-[0.6rem] text-[1rem] font-medium text-outline backdrop-blur-sm">
            <span className="mr-[0.8rem]">ZOOM</span>
            <span className="text-on-surface">100%</span>
          </div>
          <div className="flex items-center rounded-full border border-outline-variant/10 bg-surface-container-high/60 px-[1.2rem] py-[0.6rem] text-[1rem] font-medium uppercase tracking-tighter text-outline backdrop-blur-sm">
            <span className="mr-[0.8rem] h-[0.8rem] w-[0.8rem] animate-pulse rounded-full bg-green-500" />
            Real-time Sync Active
          </div>
        </div>

        {/* Entity Details Sidebar (Right) */}
        <aside className="absolute top-0 right-0 bottom-0 z-40 w-[32rem] overflow-y-auto border-l border-outline-variant/10 bg-surface-container-low">
          <div className="p-[2.4rem]">
            <div className="mb-[3.2rem] flex items-center justify-between">
              <span className="text-[1rem] font-bold uppercase tracking-[0.15em] text-outline">
                Entity Details
              </span>
              <button
                type="button"
                className="rounded-[0.125rem] p-[0.4rem] transition-colors hover:bg-surface-container-highest"
                onClick={() => setSelectedUid("")}>
                <CloseIcon size="1.8rem" />
              </button>
            </div>

            {/* No selection state */}
            {!selectedUid && (
              <div className="flex flex-col items-center justify-center py-[8rem] text-center">
                <SparklesIcon
                  size="4rem"
                  fill="#9c8f78"
                  className="mb-[1.6rem] opacity-40"
                />
                <p className="text-[1.4rem] text-on-surface-variant">
                  Click a node to view entity details
                </p>
              </div>
            )}

            {/* Loading state */}
            {selectedUid && isDetailLoading && (
              <div className="flex justify-center py-[8rem]">
                <div className="h-[3.2rem] w-[3.2rem] animate-spin rounded-full border-[0.3rem] border-outline-variant border-t-primary" />
              </div>
            )}

            {/* Entity Info */}
            {selectedUid && !isDetailLoading && entityDetail && (
              <>
                <div className="mb-[3.2rem]">
                  <div className="mb-[1.6rem] flex items-start gap-[1.6rem]">
                    <div className="flex h-[4.8rem] w-[4.8rem] items-center justify-center rounded-[0.5rem] bg-primary/10 text-primary">
                      <PsychologyIcon
                        size="2.4rem"
                        fill="#ffe2ab"
                      />
                    </div>
                    <div>
                      <h3 className="font-headline text-[2rem] font-bold text-on-surface">
                        {entityDetail.name}
                      </h3>
                      <p className="text-[1.2rem] text-secondary">
                        {entityDetail.type} • {entityDetail.mention_count} mentions
                      </p>
                    </div>
                  </div>
                </div>

                {/* Relationships */}
                {entityDetail.related_entities.length > 0 && (
                  <div className="mb-[3.2rem]">
                    <h4 className="mb-[1.6rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-outline">
                      Active Relationships
                    </h4>
                    <div className="space-y-[1.2rem]">
                      {entityDetail.related_entities.map(rel => (
                        <div
                          key={rel.uid}
                          className="group flex cursor-pointer items-center justify-between rounded-[0.25rem] border border-outline-variant/10 bg-surface-container-highest/50 p-[1.2rem] transition-colors hover:bg-surface-container-highest">
                          <div className="flex items-center gap-[1.2rem]">
                            <LinkIcon
                              size="1.8rem"
                              className="text-secondary"
                            />
                            <span className="text-[1.2rem] font-medium">{rel.name}</span>
                          </div>
                          <span className="text-[1rem] text-outline">{rel.relationship_type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked Notes */}
                {entityDetail.notes.length > 0 && (
                  <div>
                    <h4 className="mb-[1.6rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-outline">
                      Linked Notes
                    </h4>
                    <div className="space-y-[1.6rem]">
                      {entityDetail.notes.map(note => (
                        <div
                          key={note.note_number}
                          className="group cursor-pointer">
                          <h5 className="mb-[0.4rem] text-[1.4rem] font-semibold text-on-surface transition-colors group-hover:text-primary">
                            {note.title ?? `Note #${note.note_number}`}
                          </h5>
                          <span className="mt-[0.4rem] block text-[1rem] text-outline">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {entityDetail.related_entities.length === 0 && entityDetail.notes.length === 0 && (
                  <p className="text-[1.4rem] text-on-surface-variant">
                    No relationships or linked notes found.
                  </p>
                )}

                {selectedNode && (
                  <button
                    type="button"
                    className="mt-[4rem] w-full rounded-[0.25rem] border border-outline-variant/20 py-[1.2rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-primary transition-colors hover:bg-primary/5">
                    Expand Full Editor
                  </button>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </GlobalLayout>
  );
};

export default GraphPage;
