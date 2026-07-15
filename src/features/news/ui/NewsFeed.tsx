import { newsEntries } from "../model/newsEntries";
import { Separator } from "@/shared/ui/shadCNComponents/ui/separator";

export const NewsFeed = () => {
  const entries = [...newsEntries].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Пока нет новостей</p>
    );
  }

  return (
    <ul className="flex flex-col">
      {entries.map((entry, index) => (
        <li key={entry.id}>
          {index > 0 ? <Separator className="my-3" /> : null}
          <div className="flex flex-col gap-1">
            <time
              dateTime={entry.date}
              className="text-xs text-muted-foreground"
            >
              {entry.date}
            </time>
            <p className="text-sm font-medium text-foreground">{entry.title}</p>
            <p className="text-sm text-muted-foreground">{entry.summary}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};
