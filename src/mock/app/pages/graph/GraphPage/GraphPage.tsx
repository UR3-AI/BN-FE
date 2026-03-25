import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from "d3-force";
import type { SimulationNodeDatum, SimulationLinkDatum } from "d3-force";
import { useQueryClient } from "@tanstack/react-query";

import {
  CloseIcon,
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
import type {
  GraphNode as ApiGraphNode,
  GraphEdge as ApiGraphEdge,
} from "@/mock/lib/apis/queries/graph/useGraphVisualizationQuery/useGraphVisualizationQuery.type";

// ─── Constants ──────────────────────────────────────────────────────────────────

const ENTITY_TYPE_COLORS: Record<string, string> = {
  person: "#f4a8b5",
  technology: "#a8c5f4",
  project: "#9fd0cd",
  concept: "#c4b5f4",
  organization: "#ffe2ab",
  topic: "#b5f4c4",
};

const getNodeColor = (type: string) => ENTITY_TYPE_COLORS[type] ?? "#9c8f78";

// ─── Force Layout ───────────────────────────────────────────────────────────────

interface SimNode extends SimulationNodeDatum {
  id: string;
}

const calculateForceLayout = (
  nodes: ApiGraphNode[],
  edges: ApiGraphEdge[],
  centerId?: string,
) => {
  if (nodes.length === 0) return new Map<string, { x: number; y: number }>();

  const nodeIds = new Set(nodes.map(n => n.id));
  // 이웃 노드 세트
  const neighborSet = new Set<string>();
  for (const e of edges) {
    if (e.source === centerId) neighborSet.add(e.target);
    if (e.target === centerId) neighborSet.add(e.source);
  }

  const simNodes: SimNode[] = nodes.map(n => {
    const isCenter = n.id === centerId;
    const isNeighbor = neighborSet.has(n.id);
    return {
      id: n.id,
      // 이웃은 가까이, 나머지는 멀리 초기화
      x: isCenter ? 0 : isNeighbor ? (Math.random() - 0.5) * 200 : (Math.random() - 0.5) * 400,
      y: isCenter ? 0 : isNeighbor ? (Math.random() - 0.5) * 200 : (Math.random() - 0.5) * 400,
      ...(isCenter ? { fx: 0, fy: 0 } : {}),
    };
  });

  const simLinks: SimulationLinkDatum<SimNode>[] = edges
    .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map(e => ({ source: e.source, target: e.target }));

  const n = nodes.length;
  const simulation = forceSimulation<SimNode>(simNodes)
    .force("link", forceLink<SimNode, SimulationLinkDatum<SimNode>>(simLinks).id(d => d.id).distance(250).strength(0.6))
    .force("charge", forceManyBody<SimNode>().strength(n > 30 ? -800 : n > 15 ? -1200 : -1600))
    .force("center", forceCenter<SimNode>(0, 0).strength(0.08))
    .force("collide", forceCollide<SimNode>(130).strength(0.9))
    .stop();

  simulation.tick(Math.min(300, Math.max(100, n * 3)));

  const positions = new Map<string, { x: number; y: number }>();
  for (const node of simNodes) {
    positions.set(node.id, { x: node.x ?? 0, y: node.y ?? 0 });
  }
  return positions;
};

// ─── Custom Node ────────────────────────────────────────────────────────────────

interface EntityNodeData {
  label: string;
  entityType: string;
  mentionCount: number;
  isCenter: boolean;
  isNeighbor: boolean;
  [key: string]: unknown;
}

const EntityNode = memo(({ data }: { data: EntityNodeData }) => {
  const color = getNodeColor(data.entityType);
  const isCenter = data.isCenter;
  const isNeighbor = data.isNeighbor;

  const size = isCenter ? 260 : isNeighbor ? 208 : 120;
  const dotSize = isCenter ? 72 : isNeighbor ? 56 : 32;

  return (
    <div className="flex flex-col items-center" style={{ position: "relative" }}>
      {/* Handles for edge connections */}
      <Handle type="target" position={Position.Top} style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1 }} />

      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: `radial-gradient(circle at 35% 35%, ${color}40, ${color}15)`,
          border: `${isCenter ? 4 : 3}px solid ${isCenter ? color : `${color}${isNeighbor ? "80" : "40"}`}`,
          boxShadow: isCenter
            ? `0 0 30px ${color}50, 0 0 60px ${color}20`
            : isNeighbor
              ? `0 0 15px ${color}25`
              : "none",
          transition: "all 0.5s ease-out",
        }}>
        <span
          className="rounded-full"
          style={{
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}90`,
          }}
        />
      </div>
      <span
        className="mt-[12px] max-w-[350px] truncate text-center font-bold"
        style={{
          fontSize: isCenter ? 40 : isNeighbor ? 32 : 20,
          color: isCenter ? color : isNeighbor ? "#e0ddd5" : "#9c8f78",
          opacity: isCenter ? 1 : isNeighbor ? 0.9 : 0.6,
        }}>
        {data.label}
      </span>
      {isCenter && (
        <span style={{ fontSize: 24, color: `${color}99`, textTransform: "capitalize" as const }}>
          {data.entityType}
        </span>
      )}
    </div>
  );
});
EntityNode.displayName = "EntityNode";

const nodeTypes = { entity: EntityNode };

// ─── Graph Inner ────────────────────────────────────────────────────────────────

const GraphInner = ({
  selectedUid,
  onNodeClick,
  vizData,
  neighborIds,
}: {
  selectedUid: string;
  onNodeClick: (uid: string) => void;
  vizData: { nodes: ApiGraphNode[]; edges: ApiGraphEdge[] } | undefined;
  neighborIds: Set<string>;
}) => {
  const { fitView } = useReactFlow();

  // vizData 참조 안정화
  const apiNodes = useMemo(() => vizData?.nodes ?? [], [vizData]);
  const apiEdges = useMemo(() => vizData?.edges ?? [], [vizData]);

  // Force layout 계산
  const positions = useMemo(
    () => calculateForceLayout(apiNodes, apiEdges, selectedUid || apiNodes[0]?.id),
    [apiNodes, apiEdges, selectedUid],
  );

  // React Flow 노드/에지 변환
  const flowNodes = useMemo(() => {
    return apiNodes.map(n => {
      const pos = positions.get(n.id) ?? { x: 0, y: 0 };
      const isCenter = n.id === (selectedUid || apiNodes[0]?.id);
      const isNeighbor = !isCenter && neighborIds.has(n.id);
      return {
        id: n.id,
        type: "entity",
        position: pos,
        data: {
          label: n.label,
          entityType: n.type,
          mentionCount: n.mention_count,
          isCenter,
          isNeighbor,
        } satisfies EntityNodeData,
      };
    });
  }, [apiNodes, positions, selectedUid, neighborIds]);

  const centerId = selectedUid || apiNodes[0]?.id;
  const flowEdges = useMemo(() => {
    const nodeIds = new Set(apiNodes.map(n => n.id));
    return apiEdges
      .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map((e, i) => {
        const highlighted = e.source === centerId || e.target === centerId;
        return {
          id: `e-${i}`,
          source: e.source,
          target: e.target,
          label: highlighted ? e.type : undefined,
          style: {
            strokeWidth: highlighted ? 5 : 2.5,
            stroke: highlighted ? "#ffe2ab" : "#9fd0cd",
            opacity: highlighted ? 0.8 : 0.3,
          },
          labelStyle: { fill: "#9c8f78", fontSize: 20, fontWeight: 500 },
          labelBgStyle: { fill: "#1a1a1a", fillOpacity: 0.8 },
          labelBgPadding: [8, 4] as [number, number],
          labelBgBorderRadius: 6,
        };
      });
  }, [apiEdges, apiNodes, centerId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  const isFirstLoad = useRef(true);

  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
    // 첫 로드 시에만 전체 fitView
    if (isFirstLoad.current && flowNodes.length > 0) {
      isFirstLoad.current = false;
      const timer = setTimeout(() => {
        fitView({ padding: 0.2, duration: 500, minZoom: 0.2 });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [flowNodes, flowEdges, setNodes, setEdges, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={(_e, node) => onNodeClick(node.id)}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.1, minZoom: 0.3 }}
      minZoom={0.1}
      maxZoom={3}
      proOptions={{ hideAttribution: true }}>
      <Controls
        showInteractive={false}
        className="!rounded-[0.5rem] !border !border-outline-variant/10 !bg-surface-container-high/80 !shadow-xl !backdrop-blur-md [&>button]:!border-outline-variant/10 [&>button]:!bg-transparent [&>button]:!fill-on-surface-variant [&>button:hover]:!bg-surface-container-highest"
      />
      <Background
        variant={BackgroundVariant.Dots}
        gap={30}
        size={1}
        color="#2a2a2a"
      />
    </ReactFlow>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────────

const GraphPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedUid, setSelectedUid] = useState<string>("");
  const [mergeTarget, setMergeTarget] = useState<string>("");
  const [editingName, setEditingName] = useState<string | null>(null);

  const { data: vizData, isLoading: isVizLoading } = useGraphVisualizationQuery(50);
  const { data: statsData } = useGraphStatsQuery();
  const { data: entityDetail, isLoading: isDetailLoading } = useEntityDetailQuery(selectedUid);
  const { data: neighborsData } = useEntityNeighborsQuery({ uid: selectedUid });
  const { data: mentionsData } = useEntityMentionsQuery(selectedUid);
  const deleteEntityMutation = useDeleteEntityMutation();
  const mergeEntitiesMutation = useMergeEntitiesMutation();
  const updateEntityMutation = useUpdateEntityMutation();

  const neighborIds = useMemo(() => new Set(neighborsData?.nodes.map(n => n.id) ?? []), [neighborsData]);
  const mentions = mentionsData?.mentions ?? [];

  // 첫 로드 시 hub entity 자동 선택
  useEffect(() => {
    if (!selectedUid && statsData?.hub_entities?.[0]) {
      setSelectedUid(statsData.hub_entities[0].uid);
    }
  }, [selectedUid, statsData]);

  const handleNodeClick = useCallback((uid: string) => {
    setSelectedUid(uid);
    setMergeTarget("");
  }, []);

  const handleDeleteEntity = () => {
    if (!selectedUid || !window.confirm("Delete this entity?")) return;
    deleteEntityMutation.mutate(selectedUid, {
      onSuccess: () => { setSelectedUid(""); queryClient.invalidateQueries({ queryKey: ["graph"] }); },
    });
  };

  const handleMerge = () => {
    if (!selectedUid || !mergeTarget) return;
    if (!window.confirm("Merge selected entity into target?")) return;
    mergeEntitiesMutation.mutate(
      { source_uid: selectedUid, target_uid: mergeTarget },
      { onSuccess: d => { setSelectedUid(d.merged_uid); setMergeTarget(""); queryClient.invalidateQueries({ queryKey: ["graph"] }); } },
    );
  };

  const handleRename = () => {
    if (!selectedUid || editingName === null || !editingName.trim()) return;
    updateEntityMutation.mutate(
      { uid: selectedUid, name: editingName.trim() },
      { onSuccess: () => { setEditingName(null); queryClient.invalidateQueries({ queryKey: ["graph"] }); } },
    );
  };

  return (
    <GlobalLayout showSearch={false}>
      <div className="flex flex-1 overflow-hidden">
        {/* Graph Canvas */}
        <div className="relative flex-1 bg-surface-container-lowest">
          {isVizLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-[4rem] w-[4rem] animate-spin rounded-full border-[0.3rem] border-outline-variant border-t-primary" />
            </div>
          ) : (
            <ReactFlowProvider>
              <GraphInner
                selectedUid={selectedUid}
                onNodeClick={handleNodeClick}
                vizData={vizData}
                neighborIds={neighborIds}
              />
            </ReactFlowProvider>
          )}

          {/* Stats + Title overlay */}
          <div className="pointer-events-none absolute top-[2rem] left-[2rem] z-10">
            <h2 className="font-headline text-[1.8rem] font-bold text-on-surface">Knowledge Graph</h2>
            {statsData && (
              <p className="text-[1.2rem] text-on-surface-variant/60">
                {statsData.total_entities} entities · {statsData.total_relationships} relationships
              </p>
            )}
          </div>

          {/* Type Legend */}
          <div className="absolute top-[2rem] right-[34rem] z-10 rounded-[0.5rem] border border-outline-variant/10 bg-surface-container-high/80 p-[1.2rem] shadow-xl backdrop-blur-md">
            <span className="mb-[0.8rem] block text-[1rem] font-bold uppercase tracking-[0.15em] text-outline">
              Entity Types
            </span>
            <div className="space-y-[0.4rem]">
              {Object.entries(ENTITY_TYPE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-[0.8rem]">
                  <span className="inline-block h-[1rem] w-[1rem] rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[1.1rem] capitalize text-on-surface-variant">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="absolute bottom-[2rem] left-1/2 z-10 flex -translate-x-1/2 items-center gap-[2rem] rounded-full border border-outline-variant/20 bg-surface-container-highest/90 px-[2rem] py-[1.2rem] shadow-2xl backdrop-blur-md">
            <button
              type="button"
              onClick={handleMerge}
              disabled={!selectedUid || !mergeTarget || mergeEntitiesMutation.isPending}
              className="flex items-center gap-[0.6rem] rounded-[0.25rem] px-[1.2rem] py-[0.4rem] text-[1.2rem] font-semibold transition-colors hover:bg-surface-container disabled:opacity-30">
              <MergeIcon size="1.4rem" />
              Merge
            </button>
            <div className="h-[2rem] w-px bg-outline-variant/20" />
            <button
              type="button"
              onClick={handleDeleteEntity}
              disabled={!selectedUid || deleteEntityMutation.isPending}
              className="flex items-center gap-[0.6rem] rounded-[0.25rem] px-[1.2rem] py-[0.4rem] text-[1.2rem] font-semibold text-error transition-colors hover:bg-error-container/20 disabled:opacity-30">
              <DeleteIcon size="1.4rem" />
              Remove
            </button>
          </div>
        </div>

        {/* Entity Details Sidebar */}
        <aside className="w-[32rem] shrink-0 overflow-y-auto border-l border-outline-variant/10 bg-surface-container-low">
          <div className="p-[2.4rem]">
            <div className="mb-[3.2rem] flex items-center justify-between">
              <span className="text-[1rem] font-bold uppercase tracking-[0.15em] text-outline">Entity Details</span>
              <button type="button" onClick={() => { setSelectedUid(""); setMergeTarget(""); }}
                className="rounded-[0.125rem] p-[0.4rem] transition-colors hover:bg-surface-container-highest">
                <CloseIcon size="1.8rem" />
              </button>
            </div>

            {!selectedUid && (
              <div className="flex flex-col items-center py-[8rem] text-center">
                <SparklesIcon size="4rem" fill="#9c8f78" className="mb-[1.6rem] opacity-40" />
                <p className="text-[1.4rem] text-on-surface-variant">Click a node to view details</p>
              </div>
            )}

            {selectedUid && isDetailLoading && (
              <div className="flex justify-center py-[8rem]">
                <div className="h-[3.2rem] w-[3.2rem] animate-spin rounded-full border-[0.3rem] border-outline-variant border-t-primary" />
              </div>
            )}

            {selectedUid && !isDetailLoading && entityDetail && (
              <>
                {/* Entity Info */}
                <div className="mb-[3.2rem]">
                  <div className="mb-[1.6rem] flex items-start gap-[1.6rem]">
                    <div className="flex h-[4.8rem] w-[4.8rem] items-center justify-center rounded-[0.5rem]"
                      style={{ backgroundColor: `${getNodeColor(entityDetail.type)}20` }}>
                      <PsychologyIcon size="2.4rem" fill={getNodeColor(entityDetail.type)} />
                    </div>
                    <div className="flex-1">
                      {editingName !== null ? (
                        <input type="text" value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setEditingName(null); }}
                          className="w-full rounded-[0.25rem] border border-outline-variant/20 bg-surface-container-highest px-[0.8rem] py-[0.4rem] text-[1.6rem] font-bold text-on-surface focus:border-primary focus:outline-none"
                          autoFocus />
                      ) : (
                        <h3 className="cursor-pointer font-headline text-[2rem] font-bold text-on-surface hover:text-primary"
                          onClick={() => setEditingName(entityDetail.name)}>
                          {entityDetail.name}
                        </h3>
                      )}
                      <p className="text-[1.2rem] text-secondary">{entityDetail.type} · {entityDetail.mention_count} mentions</p>
                    </div>
                  </div>
                </div>

                {/* Relationships */}
                {entityDetail.related_entities.length > 0 && (
                  <div className="mb-[3.2rem]">
                    <h4 className="mb-[1.6rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-outline">Relationships</h4>
                    <div className="space-y-[0.8rem]">
                      {entityDetail.related_entities.map(rel => (
                        <button key={rel.uid} type="button" onClick={() => setSelectedUid(rel.uid)}
                          className="flex w-full items-center gap-[1.2rem] rounded-[0.25rem] border border-outline-variant/10 bg-surface-container-highest/50 p-[1.2rem] text-left transition-colors hover:bg-surface-container-highest">
                          <LinkIcon size="1.4rem" className="shrink-0 text-secondary" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[1.3rem] font-medium text-on-surface">{rel.name}</p>
                            <p className="text-[1rem] text-outline">{rel.relationship_type} · {rel.type}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked Notes */}
                {entityDetail.notes.length > 0 && (
                  <div className="mb-[3.2rem]">
                    <h4 className="mb-[1.6rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-outline">Linked Notes</h4>
                    <div className="space-y-[0.8rem]">
                      {entityDetail.notes.map(note => (
                        <button key={note.note_number} type="button"
                          onClick={() => navigate("/", { state: { noteNumber: note.note_number } })}
                          className="flex w-full items-center gap-[1.2rem] rounded-[0.25rem] p-[1rem] text-left transition-colors hover:bg-surface-container">
                          <span className="text-[1.3rem] font-medium text-primary">{note.title ?? `Note #${note.note_number}`}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mentions */}
                {mentions.length > 0 && (
                  <div>
                    <h4 className="mb-[1.6rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-outline">Mentions</h4>
                    <div className="space-y-[0.8rem]">
                      {mentions.map(m => (
                        <button key={m.note_number} type="button"
                          onClick={() => navigate("/", { state: { noteNumber: m.note_number } })}
                          className="w-full rounded-[0.25rem] bg-surface-container/50 p-[1.2rem] text-left transition-colors hover:bg-surface-container">
                          <p className="text-[1.2rem] font-medium text-on-surface">{m.title ?? `Note #${m.note_number}`}</p>
                          <p className="mt-[0.4rem] line-clamp-2 text-[1.1rem] text-on-surface-variant/60">{m.snippet}</p>
                        </button>
                      ))}
                    </div>
                  </div>
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
