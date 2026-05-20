"use client";

import { useCallback, useRef } from "react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useStoreApi,
  type NodeChange,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@liveblocks/react-flow/styles.css";

import { CanvasLoadingSkeleton } from "@/components/canvas/canvas-loading-skeleton";
import {
  CANVAS_DUMMY_EDGES,
  CANVAS_DUMMY_NODES,
} from "@/components/canvas/canvas-dummy-nodes";
import { traceEdgeTypes } from "@/components/canvas/edges/trace-edge";
import { traceNodeTypes } from "@/components/canvas/nodes/trace-node";
import {
  createTraceCanvasNodeFromPayload,
  parseInfrastructureNodeDragPayload,
  TRACE_NODE_DRAG_MIME,
} from "@/lib/canvas/infrastructure-nodes";
import { pointToFlowPosition } from "@/lib/canvas/screen-to-flow";
import type { TraceCanvasEdge, TraceCanvasNode } from "@/types/canvas";

const PRO_OPTIONS = { hideAttribution: true } as const;

function TraceCanvasInner() {
  const result = useLiveblocksFlow<TraceCanvasNode, TraceCanvasEdge>({
    suspense: false,
    nodes: { initial: CANVAS_DUMMY_NODES },
    edges: { initial: CANVAS_DUMMY_EDGES },
  });

  // Hold the last non-null arrays so the StoreUpdater receives stable
  // references and never sees a null→array transition mid-render.
  const lastNodesRef = useRef<TraceCanvasNode[]>([]);
  const lastEdgesRef = useRef<TraceCanvasEdge[]>([]);

  if (!result.isLoading) {
    lastNodesRef.current = result.nodes;
    lastEdgesRef.current = result.edges;
  }

  const nodes = lastNodesRef.current;
  const edges = lastEdgesRef.current;
  const { onNodesChange, onEdgesChange, onConnect, onDelete } = result;

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
      className="h-full w-full"
      onDragOver={onDragOver}
      onDrop={addNodeFromDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={traceNodeTypes}
        edgeTypes={traceEdgeTypes}
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
