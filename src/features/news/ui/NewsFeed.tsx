import { newsEntries } from "../model/newsEntries";
import { groupNewsByWeek } from "../lib/groupNewsByWeek";
import { Separator } from "@/shared/ui/shadCNComponents/ui/separator";

export const NewsFeed = () => {
  const weeks = groupNewsByWeek(newsEntries);

  if (weeks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Пока нет новостей</p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {weeks.map((week) => (
        <section key={week.weekStartDate} className="flex flex-col gap-3">
          <h2 className="text-base font-medium text-foreground">{week.label}</h2>
          <ul className="flex flex-col">
            {week.entries.map((entry, index) => (
              <li key={entry.id}>
                {index > 0 ? <Separator className="my-3" /> : null}
                <div className="flex flex-col gap-1">
                  <time
                    dateTime={entry.date}
                    className="text-xs text-muted-foreground"
                  >
                    {entry.date}
                  </time>
                  <p className="text-sm font-medium text-foreground">
                    {entry.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{entry.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};
