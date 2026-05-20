/**
 * Convert a screen-space point (e.g. event.clientX/Y) into React Flow's
 * canvas-space coordinates without subscribing to the React Flow store.
 * Mirrors the math in `@xyflow/react`'s `screenToFlowPosition`.
 */
export function pointToFlowPosition(
  clientPoint: { x: number; y: number },
  transform: readonly [number, number, number],
  domNode: HTMLDivElement | null
): { x: number; y: number } {
  if (!domNode) {
    return { x: clientPoint.x, y: clientPoint.y };
  }
  const rect = domNode.getBoundingClientRect();
  const [tx, ty, zoom] = transform;
  return {
    x: (clientPoint.x - rect.x - tx) / zoom,
    y: (clientPoint.y - rect.y - ty) / zoom,
  };
}
