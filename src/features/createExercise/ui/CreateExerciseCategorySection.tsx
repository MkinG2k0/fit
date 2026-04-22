import type { ExerciseCategory } from "@/entities/exercise";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";

interface CreateExerciseCategorySectionProps {
  categories: ExerciseCategory[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CreateExerciseCategorySection = ({
  categories,
  selectedCategory,
  onSelectCategory,
}: CreateExerciseCategorySectionProps) => {
  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor="category" className="text-sm font-medium">
        Категория
      </label>
      <div className="min-w-0 w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-2">
        <div className="flex w-max min-w-full flex-nowrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.category}
              type="button"
              variant={selectedCategory === category.category ? "default" : "outline"}
              className="shrink-0 whitespace-nowrap"
              onClick={() => onSelectCategory(category.category)}
            >
              {category.category}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
