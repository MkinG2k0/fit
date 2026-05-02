import { memo } from "react";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";

interface CategoryActionsProps {
  categoryId: string;
  categoryName: string;
  isExpanded: boolean;
  deletable: boolean;
  onCreateExerciseInCategory?: (categoryName: string) => void;
  onToggleCategory: (categoryId: string) => void;
  onEditCategory: (categoryId: string, categoryName: string) => void;
  onDeleteCategory: (categoryId: string, categoryName: string) => void;
}

export const CategoryActions = memo(({
  categoryId,
  categoryName,
  isExpanded,
  deletable,
  onCreateExerciseInCategory,
  onToggleCategory,
  onEditCategory,
  onDeleteCategory,
}: CategoryActionsProps) => {
  const handleToggleCategory = () => {
    onToggleCategory(categoryId);
  };

  const handleEditCategory = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onEditCategory(categoryId, categoryName);
  };

  const handleDeleteCategory = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDeleteCategory(categoryId, categoryName);
  };

  const handleCreateExercise = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onCreateExerciseInCategory?.(categoryName);
  };

  return (
    <div
      className="flex items-center justify-between gap-2 cursor-pointer p-1 "
      onClick={handleToggleCategory}
    >
      <button
        type="button"
        className="cursor-pointer flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        <span>{categoryName}</span>
      </button>
      <div className="flex items-center gap-1">
        {onCreateExerciseInCategory && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleCreateExercise}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
        {deletable && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleEditCategory}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleDeleteCategory}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
});
