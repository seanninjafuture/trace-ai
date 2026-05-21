"use client";

import { resolveNodeColorPair } from "@/lib/canvas/node-color-pairs";
import type { TraceCanvasEdge, TraceCanvasNode } from "@/types/canvas";

const PREVIEW_FILL: Record<
  ReturnType<typeof resolveNodeColorPair>,
  { fill: string; stroke: string }
> = {
  default: { fill: "#27272a", stroke: "#52525b" },
  blue: { fill: "#172554", stroke: "#3b82f6" },
  purple: { fill: "#3b0764", stroke: "#a855f7" },
  amber: { fill: "#451a03", stroke: "#f59e0b" },
};

function nodeSize(node: TraceCanvasNode) {
  return {
    width: node.width ?? 150,
    height: node.height ?? 80,
  };
}

function nodeCenter(node: TraceCanvasNode) {
  const { width, height } = nodeSize(node);
  return {
    x: node.position.x + width / 2,
    y: node.position.y + height / 2,
  };
}

function computeBounds(nodes: TraceCanvasNode[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    const { width, height } = nodeSize(node);
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + width);
    maxY = Math.max(maxY, node.position.y + height);
  }

  const pad = 12;
  return {
    minX: minX - pad,
    minY: minY - pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
  };
}

function PreviewNodeShape({
  node,
}: {
  node: TraceCanvasNode;
}) {
  const { width, height } = nodeSize(node);
  const { x, y } = node.position;
  const type = node.data.type;
  const palette = PREVIEW_FILL[resolveNodeColorPair(node.data.colorPair)];

  if (type === "gateway") {
    const ry = height / 2;
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={ry}
        ry={ry}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth={1.5}
      />
    );
  }

  if (type === "database") {
    const capRy = Math.min(12, height * 0.15);
    return (
      <g>
        <ellipse
          cx={x + width / 2}
          cy={y + capRy}
          rx={width / 2 - 2}
          ry={capRy}
          fill={palette.fill}
          stroke={palette.stroke}
          strokeWidth={1.5}
        />
        <rect
          x={x + 2}
          y={y + capRy}
          width={width - 4}
          height={height - capRy * 2}
          fill={palette.fill}
          stroke={palette.stroke}
          strokeWidth={1.5}
        />
        <ellipse
          cx={x + width / 2}
          cy={y + height - capRy}
          rx={width / 2 - 2}
          ry={capRy}
          fill={palette.fill}
          stroke={palette.stroke}
          strokeWidth={1.5}
        />
      </g>
    );
  }

  if (type === "queue") {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const points = [
      [cx + width * 0.42, cy - height * 0.38],
      [cx + width * 0.42, cy + height * 0.38],
      [cx, cy + height * 0.45],
      [cx - width * 0.42, cy + height * 0.38],
      [cx - width * 0.42, cy - height * 0.38],
      [cx, cy - height * 0.45],
    ]
      .map(([px, py]) => `${px},${py}`)
      .join(" ");

    return (
      <polygon
        points={points}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth={1.5}
      />
    );
  }

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={6}
      ry={6}
      fill={palette.fill}
      stroke={palette.stroke}
      strokeWidth={1.5}
    />
  );
}

type StarterTemplatePreviewProps = {
  nodes: TraceCanvasNode[];
  edges: TraceCanvasEdge[];
  className?: string;
};

export function StarterTemplatePreview({
  nodes,
  edges,
  className,
}: StarterTemplatePreviewProps) {
  const { minX, minY, width, height } = computeBounds(nodes);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  return (
    <svg
      viewBox={`${minX} ${minY} ${width} ${height}`}
      className={className}
      role="img"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      {edges.map((edge) => {
        const source = nodeById.get(edge.source);
        const target = nodeById.get(edge.target);
        if (!source || !target) return null;

        const from = nodeCenter(source);
        const to = nodeCenter(target);

        return (
          <line
            key={edge.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            className="stroke-zinc-700"
            strokeWidth={1.5}
          />
        );
      })}
      {nodes.map((node) => (
        <PreviewNodeShape key={node.id} node={node} />
      ))}
    </svg>
  );
}
