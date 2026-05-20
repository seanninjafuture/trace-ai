"use client";

import { Cursors, useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@liveblocks/react-flow/styles.css";

import {
  CANVAS_DUMMY_EDGES,
  CANVAS_DUMMY_NODES,
} from "@/components/canvas/canvas-dummy-nodes";
import { traceNodeTypes } from "@/components/canvas/trace-node";
import type { TraceCanvasEdge, TraceCanvasNode } from "@/types/canvas";

function TraceCanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<TraceCanvasNode, TraceCanvasEdge>({
      suspense: true,
      nodes: { initial: CANVAS_DUMMY_NODES },
      edges: { initial: CANVAS_DUMMY_EDGES },
    });

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={traceNodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        fitView
        proOptions={{ hideAttribution: true }}
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
        <Cursors />
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
