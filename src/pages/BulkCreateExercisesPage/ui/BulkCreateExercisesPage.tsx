import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  defaultIconIdForCategory,
  useExerciseStore,
} from "@/entities/exercise";
import { SearchableSelect } from "@/features/analyticsFilters/ui/SearchableSelect";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";

interface ParsedExerciseLine {
  name: string;
  description: string;
}

const parseExerciseLine = (line: string): ParsedExerciseLine | null => {
  const trimmedLine = line.trim();
  if (!trimmedLine) {
    return null;
  }

  const [namePart, ...descriptionParts] = trimmedLine.split("-");
  const name = namePart.trim();
  const description = descriptionParts.join("-").trim();

  if (!name) {
    return null;
  }

  return { name, description };
};

export const BulkCreateExercisesPage = () => {
  const categories = useExerciseStore((state) => state.exercises);
  const createExercise = useExerciseStore((state) => state.createExercise);

  const [category, setCategory] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categoryOptions = useMemo(
    () => categories.map((group) => group.category),
    [categories],
  );
  const selectableCategoryOptions = useMemo(
    () =>
      categoryOptions.map((categoryOption) => ({
        value: categoryOption,
        label: categoryOption,
      })),
    [categoryOptions],
  );

  useEffect(() => {
    if (!category && categoryOptions.length > 0) {
      setCategory(
        categoryOptions.find((categoryOption) => categoryOption === "Руки") ??
          categoryOptions[0],
      );
    }
  }, [category, categoryOptions]);

  const handleSubmit = () => {
    const normalizedCategory = category.trim();
    if (!normalizedCategory) {
      setError("Выберите категорию.");
      setSuccess("");
      return;
    }

    const existingNames = new Set(
      categories.flatMap((group) =>
        group.exercises.map((exercise) => exercise.name.trim().toLowerCase()),
      ),
    );
    const batchNames = new Set<string>();
    const rows = bulkText.split("\n");
    const parsedExercises: ParsedExerciseLine[] = [];
    let skippedDuplicates = 0;

    rows.forEach((row) => {
      const parsed = parseExerciseLine(row);
      if (!parsed) {
        return;
      }

      const lowerName = parsed.name.toLowerCase();
      if (existingNames.has(lowerName) || batchNames.has(lowerName)) {
        skippedDuplicates += 1;
        return;
      }

      batchNames.add(lowerName);
      parsedExercises.push(parsed);
    });

    if (parsedExercises.length === 0) {
      setError("Не найдено валидных строк. Формат: название - описание.");
      setSuccess("");
      return;
    }

    const iconId = defaultIconIdForCategory(normalizedCategory);
    parsedExercises.forEach((exercise) => {
      createExercise({
        name: exercise.name,
        category: normalizedCategory,
        iconId,
        description: exercise.description,
        photoDataUrls: [],
      });
    });

    const duplicateSuffix =
      skippedDuplicates > 0 ? ` Пропущено дублей: ${skippedDuplicates}.` : "";
    setSuccess(
      `Создано упражнений: ${parsedExercises.length}.${duplicateSuffix}`.trim(),
    );
    setError("");
    setBulkText("");
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Массовое создание упражнений</h1>
        <Button variant="outline" asChild>
          <Link to="/exercises">Назад</Link>
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Категория
        </label>
        <SearchableSelect
          value={category}
          options={selectableCategoryOptions}
          placeholder="Выберите категорию"
          searchPlaceholder="Поиск категории..."
          emptyText="Категории не найдены"
          onValueChange={setCategory}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="bulk-exercises" className="text-sm font-medium">
          Список упражнений
        </label>
        <textarea
          id="bulk-exercises"
          rows={12}
          value={bulkText}
          onChange={(event) => setBulkText(event.target.value)}
          placeholder={"Приседания - Спина прямая, колени в сторону носков"}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-48 w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1"
        />
        <p className="text-muted-foreground text-xs">
          Каждая новая строка - новое упражнение. Формат: название - описание.
        </p>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
      {success && <p className="text-sm text-emerald-500">{success}</p>}

      <Button onClick={handleSubmit}>Создать упражнения</Button>
    </div>
  );
};
