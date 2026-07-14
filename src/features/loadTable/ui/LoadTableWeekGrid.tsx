import { buildWeekRows } from "@/entities/loadTable";

interface LoadTableWeekGridProps {
  maxKg: number;
}

const formatKg = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }
  return value.toFixed(1);
};

export const LoadTableWeekGrid = ({ maxKg }: LoadTableWeekGridProps) => {
  const rows = buildWeekRows(maxKg);

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <thead className="bg-muted/50 text-xs text-muted-foreground">
          <tr>
            <th className="whitespace-nowrap px-2 py-2 font-medium">Неделя</th>
            <th className="whitespace-nowrap px-2 py-2 font-medium">вес %</th>
            <th className="whitespace-nowrap px-2 py-2 font-medium">вес кг</th>
            <th className="whitespace-nowrap px-2 py-2 font-medium">раз</th>
            <th className="whitespace-nowrap px-2 py-2 font-medium">Ф. Бржыки</th>
            <th className="whitespace-nowrap px-2 py-2 font-medium">Ф. Эйпли</th>
            <th className="whitespace-nowrap px-2 py-2 font-medium">Ф. Лэндера</th>
            <th className="whitespace-nowrap px-2 py-2 font-medium">avg</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.week} className="border-t border-border">
              <td className="px-2 py-1.5 text-foreground">{row.week}</td>
              <td className="px-2 py-1.5 text-foreground">{row.percent}</td>
              <td className="px-2 py-1.5 text-foreground">{formatKg(row.weightKg)}</td>
              <td className="px-2 py-1.5 text-foreground">{row.reps}</td>
              <td className="px-2 py-1.5 text-foreground">
                {formatKg(row.formulas.brzycki)}
              </td>
              <td className="px-2 py-1.5 text-foreground">
                {formatKg(row.formulas.epley)}
              </td>
              <td className="px-2 py-1.5 text-foreground">
                {formatKg(row.formulas.lander)}
              </td>
              <td className="px-2 py-1.5 text-foreground">
                {formatKg(row.formulas.avg)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
