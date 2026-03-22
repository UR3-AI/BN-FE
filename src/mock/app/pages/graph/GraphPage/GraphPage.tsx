import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useQueryClient } from "@tanstack/react-query";

import {
  CloseIcon,
  DatabaseIcon,
  DeleteIcon,
  LinkIcon,
  MergeIcon,
  PsychologyIcon,
  SparklesIcon,
} from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";
import useDeleteEntityMutation from "@/mock/lib/apis/mutations/graph/useDeleteEntityMutation/useDeleteEntityMutation";
import useMergeEntitiesMutation from "@/mock/lib/apis/mutations/graph/useMergeEntitiesMutation/useMergeEntitiesMutation";
import useUpdateEntityMutation from "@/mock/lib/apis/mutations/graph/useUpdateEntityMutation/useUpdateEntityMutation";
import useEntityDetailQuery from "@/mock/lib/apis/queries/graph/useEntityDetailQuery/useEntityDetailQuery";
import useEntityMentionsQuery from "@/mock/lib/apis/queries/graph/useEntityMentionsQuery/useEntityMentionsQuery";
import useEntityNeighborsQuery from "@/mock/lib/apis/queries/graph/useEntityNeighborsQuery/useEntityNeighborsQuery";
import useGraphStatsQuery from "@/mock/lib/apis/queries/graph/useGraphStatsQuery/useGraphStatsQuery";
import useGraphVisualizationQuery from "@/mock/lib/apis/queries/graph/useGraphVisualizationQuery/useGraphVisualizationQuery";
import type { GraphNode } from "@/mock/lib/apis/queries/graph/useGraphVisualizationQuery/useGraphVisualizationQuery.type";

const MAX_NODES = 20;

const ENTITY_TYPE_COLORS: Record<string, string> = {
  person: "#f4a8b5",
  technology: "#a8c5f4",
  project: "#9fd0cd",
  concept: "#c4b5f4",
  organization: "#ffe2ab",
  topic: "#b5f4c4",
};

const getNodeColor = (type: string) => ENTITY_TYPE_COLORS[type] ?? "#9c8f78";

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
    const count = limited.length - 1;
    const angle = (2 * Math.PI * (index - 1)) / count;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { id: node.id, x, y };
  });
};

const GraphPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedUid, setSelectedUid] = useState<string>("");
  const [mergeTarget, setMergeTarget] = useState<string>("");
  const [editingName, setEditingName] = useState<string | null>(null);

  const { data: vizData, isLoading: isVizLoading } = useGraphVisualizationQuery(MAX_NODES);
  const { data: statsData } = useGraphStatsQuery();
  const { data: entityDetail, isLoading: isDetailLoading } = useEntityDetailQuery(selectedUid);
  const { data: neighborsData } = useEntityNeighborsQuery({ uid: selectedUid });
  const { data: mentionsData } = useEntityMentionsQuery(selectedUid);
  const deleteEntityMutation = useDeleteEntityMutation();
  const mergeEntitiesMutation = useMergeEntitiesMutation();
  const updateEntityMutation = useUpdateEntityMutation();

  const handleDeleteEntity = () => {
    if (!selectedUid || !window.confirm("Delete this entity?")) return;
    deleteEntityMutation.mutate(selectedUid, {
      onSuccess: () => {
        setSelectedUid("");
        queryClient.invalidateQueries({ queryKey: ["graph"] });
      },
    });
  };

  const handleMerge = () => {
    if (!selectedUid || !mergeTarget || selectedUid === mergeTarget) return;
    if (!window.confirm("Merge selected entity into target?")) return;
    mergeEntitiesMutation.mutate(
      { source_uid: selectedUid, target_uid: mergeTarget },
      {
        onSuccess: data => {
          setSelectedUid(data.merged_uid);
          setMergeTarget("");
          queryClient.invalidateQueries({ queryKey: ["graph"] });
        },
      },
    );
  };

  const handleRename = () => {
    if (!selectedUid || editingName === null || !editingName.trim()) return;
    updateEntityMutation.mutate(
      { uid: selectedUid, name: editingName.trim() },
      {
        onSuccess: () => {
          setEditingName(null);
          queryClient.invalidateQueries({ queryKey: ["graph"] });
        },
      },
    );
  };

  const mentions = mentionsData?.mentions ?? [];
  const neighborIds = new Set(neighborsData?.nodes.map(n => n.id) ?? []);

  const nodes = vizData?.nodes.slice(0, MAX_NODES) ?? [];
  const edges = vizData?.edges ?? [];
  const positions = computeNodePositions(nodes);

  const getPosition = (id: string) => positions.find(p => p.id === id);

  const handleNodeClick = (nodeId: string) => {
    setSelectedUid(nodeId);
    setMergeTarget("");
  };

  const handleNodeRightClick = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    if (selectedUid && nodeId !== selectedUid) {
      setMergeTarget(nodeId);
    }
  };

  return (
    <GlobalLayout
      topbarTitle={`Knowledge Graph${statsData ? ` · ${statsData.total_entities} entities · ${statsData.total_relationships} edges` : ""}`}
      showSearch={false}>
      {/* Canvas Area */}
      <div
        className="relative flex-1 cursor-crosshair overflow-hidden bg-surface-container-lowest"
        style={{
          backgroundImage: "radial-gradient(circle, #2a2a2a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}>
        {/* Type Legend (Left Top) */}
        <div className="absolute left-[2.4rem] top-[2.4rem] z-30">
          <div className="rounded-[0.5rem] border border-outline-variant/10 bg-surface-container-high/80 p-[1.2rem] shadow-xl backdrop-blur-md">
            <span className="mb-[0.8rem] block text-[1rem] font-bold uppercase tracking-[0.15em] text-outline">
              Entity Types
            </span>
            <div className="space-y-[0.4rem]">
              {Object.entries(ENTITY_TYPE_COLORS).map(([type, color]) => (
                <div
                  key={type}
                  className="flex items-center gap-[0.8rem]">
                  <span
                    className="inline-block h-[1rem] w-[1rem] rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[1.1rem] capitalize text-on-surface-variant">{type}</span>
                </div>
              ))}
            </div>
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
            const isMergeTarget = node.id === mergeTarget;

            return (
              <div
                key={node.id}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => handleNodeClick(node.id)}
                onContextMenu={e => handleNodeRightClick(e, node.id)}>
                <div
                  className={`flex items-center justify-center rounded-full border transition-transform hover:scale-110 ${
                    isMergeTarget
                      ? "h-[4.8rem] w-[4.8rem] border-2 border-dashed border-secondary bg-surface-container-highest"
                      : isCenter
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
                      fill={isSelected || isMergeTarget ? "#ffe2ab" : getNodeColor(node.type)}
                    />
                  )}
                </div>
                <div className="absolute -bottom-[4rem] left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                  <span
                    className={`text-[1.2rem] font-medium ${isCenter ? "text-[1.4rem] text-primary" : isMergeTarget ? "text-secondary" : "text-on-surface"}`}>
                    {node.label}
                  </span>
                  {isMergeTarget && (
                    <p className="text-[1rem] uppercase tracking-[0.15em] text-secondary">
                      Merge Target
                    </p>
                  )}
                  {isCenter && !isMergeTarget && (
                    <p className="text-[1rem] uppercase tracking-[0.15em] text-outline">
                      Active Focus
                    </p>
                  )}
                </div>
              </div>
            );
          })}

        {/* Bottom Bar */}
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
              onClick={handleMerge}
              disabled={!selectedUid || !mergeTarget || mergeEntitiesMutation.isPending}
              className="flex items-center gap-[0.8rem] rounded-[0.25rem] bg-surface-container px-[1.6rem] py-[0.6rem] text-[1.2rem] font-semibold transition-colors hover:bg-surface-bright disabled:opacity-30">
              <MergeIcon size="1.6rem" />
              {mergeEntitiesMutation.isPending ? "Merging..." : "Merge"}
            </button>
            <button
              type="button"
              onClick={handleDeleteEntity}
              disabled={!selectedUid || deleteEntityMutation.isPending}
              className="flex items-center gap-[0.8rem] rounded-[0.25rem] bg-error-container/20 px-[1.6rem] py-[0.6rem] text-[1.2rem] font-semibold text-error transition-colors hover:bg-error-container/40 disabled:opacity-30">
              <DeleteIcon size="1.6rem" />
              {deleteEntityMutation.isPending ? "Deleting..." : "Remove"}
            </button>
          </div>
        </div>

        {/* Merge Hint */}
        {selectedUid && !mergeTarget && (
          <div className="absolute bottom-[8rem] left-1/2 z-30 -translate-x-1/2">
            <span className="rounded-full bg-surface-container-high/80 px-[1.6rem] py-[0.6rem] text-[1.1rem] text-on-surface-variant backdrop-blur-sm">
              Right-click another node to set merge target
            </span>
          </div>
        )}

        {/* Stats (Bottom Left) */}
        <div className="absolute bottom-[2.4rem] left-[2.4rem] z-10 flex items-center gap-[1.6rem]">
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
                onClick={() => {
                  setSelectedUid("");
                  setMergeTarget("");
                }}>
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
                    <div
                      className="flex h-[4.8rem] w-[4.8rem] items-center justify-center rounded-[0.5rem]"
                      style={{ backgroundColor: `${getNodeColor(entityDetail.type)}20` }}>
                      <PsychologyIcon
                        size="2.4rem"
                        fill={getNodeColor(entityDetail.type)}
                      />
                    </div>
                    <div className="flex-1">
                      {editingName !== null ? (
                        <div className="flex items-center gap-[0.8rem]">
                          <input
                            type="text"
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter") handleRename();
                              if (e.key === "Escape") setEditingName(null);
                            }}
                            className="w-full rounded-[0.25rem] border border-outline-variant/20 bg-surface-container-highest px-[0.8rem] py-[0.4rem] text-[1.6rem] font-bold text-on-surface focus:border-primary focus:outline-none"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <h3
                          className="cursor-pointer font-headline text-[2rem] font-bold text-on-surface transition-colors hover:text-primary"
                          onClick={() => setEditingName(entityDetail.name)}>
                          {entityDetail.name}
                        </h3>
                      )}
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
                        <button
                          key={rel.uid}
                          type="button"
                          onClick={() => setSelectedUid(rel.uid)}
                          className="group flex w-full cursor-pointer items-center justify-between rounded-[0.25rem] border border-outline-variant/10 bg-surface-container-highest/50 p-[1.2rem] text-left transition-colors hover:bg-surface-container-highest">
                          <div className="flex items-center gap-[1.2rem]">
                            <LinkIcon
                              size="1.8rem"
                              className="text-secondary"
                            />
                            <span className="text-[1.2rem] font-medium transition-colors group-hover:text-primary">
                              {rel.name}
                            </span>
                          </div>
                          <span className="text-[1rem] text-outline">{rel.relationship_type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked Notes */}
                {entityDetail.notes.length > 0 && (
                  <div className="mb-[3.2rem]">
                    <h4 className="mb-[1.6rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-outline">
                      Linked Notes
                    </h4>
                    <div className="space-y-[1.6rem]">
                      {entityDetail.notes.map(note => (
                        <button
                          key={note.note_number}
                          type="button"
                          onClick={() => navigate("/", { state: { noteNumber: note.note_number } })}
                          className="group block w-full cursor-pointer text-left">
                          <h5 className="mb-[0.4rem] text-[1.4rem] font-semibold text-on-surface transition-colors group-hover:text-primary">
                            {note.title ?? `Note #${note.note_number}`}
                          </h5>
                          <span className="mt-[0.4rem] block text-[1rem] text-outline">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mentions */}
                {mentions.length > 0 && (
                  <div className="mb-[3.2rem]">
                    <h4 className="mb-[1.6rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-outline">
                      Mentions
                    </h4>
                    <div className="space-y-[1.2rem]">
                      {mentions.map(mention => (
                        <button
                          key={`${mention.note_number}-${mention.created_at}`}
                          type="button"
                          onClick={() => navigate("/", { state: { noteNumber: mention.note_number } })}
                          className="block w-full rounded-[0.25rem] border border-outline-variant/10 bg-surface-container-highest/50 p-[1.2rem] text-left transition-colors hover:bg-surface-container-highest">
                          <p className="text-[1.2rem] font-medium text-on-surface">
                            {mention.title ?? `Note #${mention.note_number}`}
                          </p>
                          <p className="mt-[0.4rem] text-[1.1rem] leading-relaxed text-on-surface-variant line-clamp-2">
                            {mention.context}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {entityDetail.related_entities.length === 0 && entityDetail.notes.length === 0 && mentions.length === 0 && (
                  <p className="text-[1.4rem] text-on-surface-variant">
                    No relationships, linked notes, or mentions found.
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleDeleteEntity}
                  disabled={deleteEntityMutation.isPending}
                  className="mt-[4rem] w-full rounded-[0.25rem] border border-error/30 py-[1.2rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-error transition-colors hover:bg-error/10 disabled:opacity-50">
                  {deleteEntityMutation.isPending ? "Deleting..." : "Delete Entity"}
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    </GlobalLayout>
  );
};

export default GraphPage;
