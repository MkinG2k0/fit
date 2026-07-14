import type { ReactNode } from "react";

const renderInline = (text: string, keyPrefix: string): ReactNode[] => {
  const parts: ReactNode[] = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let partIndex = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={`${keyPrefix}-b-${partIndex++}`} className="font-semibold">
        {match[1]}
      </strong>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
};

type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

const parseBlocks = (markdown: string): Block[] => {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }
    blocks.push({ type: "list", items: listItems });
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      flushList();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2],
      });
      continue;
    }

    const listMatch = /^[-*]\s+(.+)$/.exec(trimmed);
    if (listMatch) {
      listItems.push(listMatch[1]);
      continue;
    }

    flushList();
    blocks.push({ type: "paragraph", text: trimmed });
  }

  flushList();
  return blocks;
};

export const MarkdownContent = ({ content }: { content: string }) => {
  const blocks = parseBlocks(content);

  return (
    <div className="grid gap-2 text-sm text-foreground">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const headingClass =
            block.level === 1
              ? "text-base font-semibold text-foreground"
              : block.level === 2
                ? "text-sm font-semibold text-foreground"
                : "text-sm font-medium text-foreground";
          return (
            <p key={`h-${index}`} className={headingClass}>
              {renderInline(block.text, `h-${index}`)}
            </p>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              key={`ul-${index}`}
              className="list-disc space-y-1 pl-5 text-foreground"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`li-${index}-${itemIndex}`}>
                  {renderInline(item, `li-${index}-${itemIndex}`)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`p-${index}`} className="text-foreground">
            {renderInline(block.text, `p-${index}`)}
          </p>
        );
      })}
    </div>
  );
};
