"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MarkdownPreviewProps = {
  markdown: string;
  className?: string;
};

function renderInline(text: string, keyPrefix: string) {
  const parts: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("`")) {
      parts.push(
        <code
          key={`${keyPrefix}-code-${index}`}
          className="rounded bg-bg-base/80 px-1 py-0.5 font-mono text-[0.85em] text-text-primary"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(
        <strong
          key={`${keyPrefix}-bold-${index}`}
          className="font-semibold text-text-primary"
        >
          {token.slice(2, -2)}
        </strong>
      );
    }

    lastIndex = match.index + token.length;
    index += 1;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function MarkdownPreview({ markdown, className }: MarkdownPreviewProps) {
  const lines = markdown.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let blockIndex = 0;

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    blocks.push(
      <ul
        key={`list-${blockIndex}`}
        className="list-disc space-y-1 pl-5 text-sm text-text-muted"
      >
        {listItems.map((item, itemIndex) => (
          <li key={`item-${blockIndex}-${itemIndex}`}>
            {renderInline(item, `li-${blockIndex}-${itemIndex}`)}
          </li>
        ))}
      </ul>
    );
    listItems = [];
    blockIndex += 1;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const Tag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
      blocks.push(
        <Tag
          key={`heading-${blockIndex}`}
          className={cn(
            "font-semibold text-text-primary",
            level === 1 && "text-lg",
            level === 2 && "text-base",
            level === 3 && "text-sm"
          )}
        >
          {renderInline(text, `heading-${blockIndex}`)}
        </Tag>
      );
      blockIndex += 1;
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      listItems.push(bulletMatch[1]);
      continue;
    }

    flushList();
    blocks.push(
      <p
        key={`paragraph-${blockIndex}`}
        className="text-sm leading-relaxed text-text-muted"
      >
        {renderInline(trimmed, `paragraph-${blockIndex}`)}
      </p>
    );
    blockIndex += 1;
  }

  flushList();

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {blocks.length > 0 ? (
        blocks
      ) : (
        <p className="text-sm text-text-muted">No content.</p>
      )}
    </div>
  );
}
