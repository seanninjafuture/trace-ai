"use client";

import { useCallback, useRef } from "react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useStoreApi,
  type NodeChange,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@liveblocks/react-flow/styles.css";

import { CanvasPeerCursors } from "@/components/canvas/canvas-cursors";
import {
  useCanvasAutosaveEnabled,
  useCanvasSaveContext,
  useCanvasSaveStatusSetter,
} from "@/components/canvas/canvas-save-context";
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave";
import { useCanvasHydration } from "@/hooks/use-canvas-hydration";
import {
  CanvasControls,
  CanvasKeyboardShortcuts,
} from "@/components/canvas/canvas-controls";
import { PresenceBar } from "@/components/canvas/presence-bar";
import { CanvasLoadingSkeleton } from "@/components/canvas/canvas-loading-skeleton";
import { traceEdgeTypes } from "@/components/canvas/edges/orthogonal-edge";
import { traceNodeTypes } from "@/components/canvas/nodes/trace-node";
import {
  createTraceCanvasNodeFromPayload,
  parseInfrastructureNodeDragPayload,
  TRACE_NODE_DRAG_MIME,
} from "@/lib/canvas/infrastructure-nodes";
import { pointToFlowPosition } from "@/lib/canvas/screen-to-flow";
import type { TraceCanvasEdge, TraceCanvasNode } from "@/types/canvas";

const PRO_OPTIONS = { hideAttribution: true } as const;

const DEFAULT_EDGE_OPTIONS = {
  type: "traceEdge",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: "var(--border-default)",
  },
  data: { label: "" },
} as const;

function TraceCanvasInner() {
  const saveContext = useCanvasSaveContext();
  const setSaveStatus = useCanvasSaveStatusSetter();
  const { enabled: autosaveEnabled } = useCanvasAutosaveEnabled();
  const persistenceProjectId = saveContext?.projectId;

  const result = useLiveblocksFlow<TraceCanvasNode, TraceCanvasEdge>({
    suspense: false,
    nodes: { initial: [] },
    edges: { initial: [] },
  });

  const {
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDelete,
    isLoading: flowIsLoading,
  } = result;

  const flowNodes = result.isLoading ? [] : (result.nodes ?? []);
  const flowEdges = result.isLoading ? [] : (result.edges ?? []);

  useCanvasHydration({
    projectId: persistenceProjectId ?? "",
    enabled: Boolean(persistenceProjectId),
    isLoading: flowIsLoading,
    nodes: flowNodes,
    edges: flowEdges,
    onNodesChange,
    onEdgesChange,
  });

  useCanvasAutosave({
    projectId: persistenceProjectId ?? "",
    nodes: flowNodes,
    edges: flowEdges,
    isLoading: flowIsLoading,
    enabled: Boolean(persistenceProjectId) && autosaveEnabled,
    onStatusChange: setSaveStatus,
  });

  // Hold the last non-null arrays so the StoreUpdater receives stable
  // references and never sees a null→array transition mid-render.
  const lastNodesRef = useRef<TraceCanvasNode[]>([]);
  const lastEdgesRef = useRef<TraceCanvasEdge[]>([]);

  if (!result.isLoading) {
    if (Array.isArray(result.nodes)) {
      lastNodesRef.current = result.nodes;
    }
    if (Array.isArray(result.edges)) {
      lastEdgesRef.current = result.edges;
    }
  }

  const nodes = lastNodesRef.current;
  const edges = lastEdgesRef.current;

  const storeApi = useStoreApi();
  const hasFitViewApplied = useRef(false);

  const onInit = useCallback(
    (instance: ReactFlowInstance<TraceCanvasNode, TraceCanvasEdge>) => {
      if (hasFitViewApplied.current) return;
      hasFitViewApplied.current = true;
      requestAnimationFrame(() => {
        void instance.fitView({ padding: 0.1 });
      });
    },
    []
  );

  const addNodeFromDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const raw = event.dataTransfer.getData(TRACE_NODE_DRAG_MIME);
      const payload = parseInfrastructureNodeDragPayload(raw);
      if (!payload) return;

      const { transform, domNode } = storeApi.getState();
      const dropPoint = pointToFlowPosition(
        { x: event.clientX, y: event.clientY },
        transform,
        domNode
      );
      const position = {
        x: dropPoint.x - payload.dimensions.width / 2,
        y: dropPoint.y - payload.dimensions.height / 2,
      };

      const newNode = createTraceCanvasNodeFromPayload(payload, position);
      const change: NodeChange<TraceCanvasNode> = {
        type: "add",
        item: newNode,
      };
      onNodesChange([change]);
    },
    [onNodesChange, storeApi]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Render the loading skeleton until storage finishes loading. We avoid
  // mounting <ReactFlow> at all while loading so the StoreUpdater's mount
  // effect doesn't get torn down/re-mounted by a transient suspense state.
  if (result.isLoading) {
    return <CanvasLoadingSkeleton />;
  }

  return (
    <div
      className="relative h-full w-full"
      onDragOver={onDragOver}
      onDrop={addNodeFromDrop}
    >
      <PresenceBar />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={traceNodeTypes}
        edgeTypes={traceEdgeTypes}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        onInit={onInit}
        connectionMode={ConnectionMode.Loose}
        proOptions={PRO_OPTIONS}
        className="bg-bg-base"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="var(--border-default)"
        />
        <MiniMap
          position="bottom-left"
          className="!rounded-lg !border !border-border-default !bg-bg-surface"
          maskColor="color-mix(in srgb, var(--bg-base) 55%, transparent)"
          nodeColor="var(--accent-primary)"
        />
        <CanvasControls />
        <CanvasKeyboardShortcuts />
        <CanvasPeerCursors />
      </ReactFlow>
    </div>
  );
}

export function TraceCanvas() {
  return (
    <ReactFlowProvider>
      <TraceCanvasInner />
    </ReactFlowProvider>
  );
}
