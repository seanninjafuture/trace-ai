import { useId } from "react";
import {
  Cpu,
  Database,
  GitCommit,
  Network,
  type LucideIcon,
} from "lucide-react";

import { TRACE_NODE_LABEL_PLACEHOLDER } from "@/components/canvas/nodes/use-trace-node-mutations";
import { cn } from "@/lib/utils";
import type { InfrastructureNodeType } from "@/types/canvas";

export const infrastructureTypeIcons: Record<
  InfrastructureNodeType,
  LucideIcon
> = {
  gateway: Network,
  compute: Cpu,
  database: Database,
  queue: GitCommit,
};

type InfrastructureShapeBodyProps = {
  label: string;
  type: InfrastructureNodeType;
  compact?: boolean;
  /** Hides label text while keeping icons and SVG shells (inline edit overlay). */
  hideLabel?: boolean;
  labelTextClass?: string;
  iconClass?: string;
};

export function DatabaseCylinderSvg({ className }: { className?: string }) {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 150 90"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--bg-surface)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--bg-base)" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <ellipse
        cx="75"
        cy="72"
        rx="66"
        ry="12"
        fill={`url(#${gradientId})`}
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M 9 20 L 9 68"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M 141 20 L 141 68"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <ellipse
        cx="75"
        cy="20"
        rx="66"
        ry="12"
        fill="color-mix(in srgb, var(--bg-surface) 70%, transparent)"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

export function QueueHexagonSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 190 55"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
      aria-hidden
    >
      <path
        d="M 28 27.5 L 52 8 L 138 8 L 162 27.5 L 138 47 L 52 47 Z"
        fill="color-mix(in srgb, var(--bg-surface) 55%, transparent)"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NodeLabelText({
  label,
  className,
  placeholderClassName,
}: {
  label: string;
  className: string;
  placeholderClassName?: string;
}) {
  if (!label.trim()) {
    return (
      <span
        className={cn(
          className,
          "text-center font-normal",
          placeholderClassName ?? "text-text-muted/50"
        )}
      >
        {TRACE_NODE_LABEL_PLACEHOLDER}
      </span>
    );
  }

  return <span className={className}>{label}</span>;
}

export function InfrastructureShapeBody({
  label,
  type,
  compact = false,
  hideLabel = false,
  labelTextClass = "text-text-primary",
  iconClass = "text-text-muted",
}: InfrastructureShapeBodyProps) {
  const Icon = infrastructureTypeIcons[type];
  const labelClass = compact
    ? cn(
        "max-w-full truncate text-[10px] leading-tight font-medium",
        labelTextClass
      )
    : cn(
        "max-w-full truncate text-xs leading-snug font-medium",
        labelTextClass
      );
  const iconSizeClass = compact ? "size-3" : "size-4";

  if (type === "gateway") {
    return (
      <div className="relative flex size-full items-center justify-center px-3">
        <div
          className="pointer-events-none absolute -inset-1 rounded-full border border-border-default/50"
          aria-hidden
        />
        <div className="relative flex size-full items-center justify-center gap-1.5 rounded-full px-3">
          <Icon
            className={cn("shrink-0", iconClass, iconSizeClass)}
            aria-hidden
          />
          {!hideLabel && (
            <NodeLabelText
              label={label}
              className={labelClass}
              placeholderClassName={cn(labelTextClass, "opacity-50")}
            />
          )}
        </div>
      </div>
    );
  }

  if (type === "compute") {
    return (
      <div
        className="relative flex size-full flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5"
        style={{
          backgroundImage: `
            linear-gradient(color-mix(in srgb, var(--border-default) 35%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in srgb, var(--border-default) 35%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: "12px 12px",
        }}
      >
        <Icon
          className={cn("shrink-0", iconClass, iconSizeClass)}
          aria-hidden
        />
        {!hideLabel && (
          <NodeLabelText
            label={label}
            className={cn(labelClass, "px-1 text-center")}
            placeholderClassName={cn(labelTextClass, "opacity-50")}
          />
        )}
      </div>
    );
  }

  if (type === "database") {
    return (
      <div className="relative flex size-full flex-col items-center justify-center">
        <DatabaseCylinderSvg className="text-border-default" />
        <div className="relative z-10 flex flex-col items-center gap-0.5 px-2">
          <Icon
            className={cn("shrink-0", iconClass, iconSizeClass)}
            aria-hidden
          />
          {!hideLabel && (
            <NodeLabelText
              label={label}
              className={cn(labelClass, "text-center")}
              placeholderClassName={cn(labelTextClass, "opacity-50")}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full items-center justify-center">
      <QueueHexagonSvg className="text-border-default" />
      <div className="relative z-10 flex items-center gap-1.5 px-4">
        <Icon
          className={cn("shrink-0", iconClass, iconSizeClass)}
          aria-hidden
        />
        {!hideLabel && (
          <NodeLabelText
            label={label}
            className={labelClass}
            placeholderClassName={cn(labelTextClass, "opacity-50")}
          />
        )}
      </div>
    </div>
  );
}
