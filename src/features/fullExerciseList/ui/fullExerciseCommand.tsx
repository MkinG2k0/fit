import { useEffect, useMemo, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
} from "@/shared/ui/shadCNComponents/ui/command";
import {
  type ExerciseCategory,
  type ExerciseIconId,
  type TrainingPreset,
  useExerciseStore,
} from "@/entities/exercise";
import { DeleteDialog } from "./DeleteDialog";
import { ExerciseItem } from "./ExerciseItem";
import { PresetItem } from "./PresetItem";
import { RadioGroup } from "@/shared/ui/shadCNComponents/ui/radio-group";
import { CategoryActions } from "./CategoryActions";
import { RenameCategoryDialog } from "./RenameCategoryDialog";

interface BaseProps {
  checkable?: "checkbox" | "radio" | false;
  deletable?: boolean;
  variant?: "exercises" | "presets" | "all";
  autoExpandCategoryId?: string;
  /** @deprecated Legacy support: use autoExpandCategoryId. */
  autoExpandCategory?: string;
  onCreateExerciseInCategory?: (categoryName: string) => void;
  onEditExercise?: (payload: {
    id: string;
    name: string;
    category: string;
    iconId: ExerciseIconId;
    description: string;
    photoDataUrls: string[];
  }) => void;
  onEditPreset?: (preset: TrainingPreset) => void;
}

interface RadioProps extends BaseProps {
  checkable?: "radio";
  autoExpandCategoryId?: string;
  autoExpandCategory?: string;
  exerciseSelectHandler: (value: string) => void;
  presetSelectHandler?: never;
  selectedExerciseCheckboxes: string;
  selectedPresetCheckboxes?: never;
}

interface CheckableProps extends BaseProps {
  checkable?: "checkbox";
  autoExpandCategoryId?: string;
  autoExpandCategory?: string;
  exerciseSelectHandler: (value: string) => void;
  presetSelectHandler: (value: string) => void;
  selectedExerciseCheckboxes: string[];
  selectedPresetCheckboxes: string[];
}

interface NonCheckableProps extends BaseProps {
  checkable?: false;
  autoExpandCategoryId?: string;
  autoExpandCategory?: string;
  exerciseSelectHandler?: never;
  presetSelectHandler?: never;
  selectedExerciseCheckboxes?: never;
  selectedPresetCheckboxes?: never;
}

export type FullExerciseCommandProps =
  | CheckableProps
  | NonCheckableProps
  | RadioProps;

const matchesCatalogSearch = (query: string, parts: string[]) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return parts.some((part) =>
    part.trim().toLowerCase().includes(normalizedQuery),
  );
};

const resolveExerciseNameById = (
  exerciseId: string,
  catalog: ExerciseCategory[],
) => {
  for (const group of catalog) {
    const entry = group.exercises.find((exercise) => exercise.id === exerciseId);
    if (entry) {
      return entry.name;
    }
  }

  return "";
};

export const FullExerciseCommand = ({
  selectedExerciseCheckboxes = [],
  selectedPresetCheckboxes = [],
  presetSelectHandler,
  exerciseSelectHandler,
  checkable = false,
  deletable = false,
  variant = "all",
  autoExpandCategoryId,
  autoExpandCategory,
  onCreateExerciseInCategory,
  onEditExercise,
  onEditPreset,
}: FullExerciseCommandProps) => {
  const allExercises = useExerciseStore((state) => state.exercises);
  const trainingPreset = useExerciseStore((state) => state.trainingPreset);
  const deleteExercise = useExerciseStore((state) => state.deleteExercise);
  const deleteCategory = useExerciseStore((state) => state.deleteCategory);
  const renameCategory = useExerciseStore((state) => state.renameCategory);
  const deleteTrainingPreset = useExerciseStore(
    (state) => state.deleteTrainingPreset,
  );

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "exercise" | "preset" | "category";
    id?: string;
    name: string;
  }>({
    open: false,
    type: "exercise",
    name: "",
  });
  const [renameCategoryDialog, setRenameCategoryDialog] = useState<{
    open: boolean;
    categoryId: string;
    categoryName: string;
  }>({
    open: false,
    categoryId: "",
    categoryName: "",
  });
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [searchValue, setSearchValue] = useState("");
  const commandListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    commandListRef.current?.scrollTo({ top: 0 });
  }, [searchValue]);

  useEffect(() => {
    setExpandedCategories((prevState) => {
      const nextState: Record<string, boolean> = {};

      allExercises.forEach((group) => {
        nextState[group.id] = prevState[group.id] ?? false;
      });

      return nextState;
    });
  }, [allExercises]);

  useEffect(() => {
    const categoryIdToExpand =
      autoExpandCategoryId ??
      allExercises.find((group) => group.category === autoExpandCategory)?.id;
    if (!categoryIdToExpand) {
      return;
    }

    setExpandedCategories((prevState) => ({
      ...prevState,
      [categoryIdToExpand]: true,
    }));
  }, [allExercises, autoExpandCategory, autoExpandCategoryId]);

  const handleDeleteConfirm = () => {
    if (deleteDialog.type === "exercise" && deleteDialog.id) {
      deleteExercise(deleteDialog.id);
    } else if (deleteDialog.type === "category") {
      if (deleteDialog.id) {
        deleteCategory(deleteDialog.id);
      }
    } else if (deleteDialog.type === "preset" && deleteDialog.id) {
      deleteTrainingPreset(deleteDialog.id);
    }
    setDeleteDialog({ open: false, type: "exercise", name: "" });
  };

  const openDeleteDialog = (
    type: "exercise" | "preset" | "category",
    id: string | undefined,
    name: string,
  ) => {
    setDeleteDialog({ open: true, type, id, name });
  };

  const handleExerciseDelete = (id: string, name: string) => {
    openDeleteDialog("exercise", id, name);
  };

  const handleExerciseEdit = (payload: {
    id: string;
    name: string;
    category: string;
    iconId: ExerciseIconId;
    description: string;
    photoDataUrls: string[];
  }) => {
    onEditExercise?.(payload);
  };

  const handlePresetDelete = (id: string, name: string) => {
    openDeleteDialog("preset", id, name);
  };

  const handlePresetEdit = (preset: TrainingPreset) => {
    onEditPreset?.(preset);
  };

  const handleCategoryDelete = (categoryId: string, categoryName: string) => {
    openDeleteDialog("category", categoryId, categoryName);
  };

  const handleCategoryRenameOpen = (categoryId: string, categoryName: string) => {
    setRenameCategoryDialog({ open: true, categoryId, categoryName });
  };

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategories((prevState) => ({
      ...prevState,
      [categoryId]: !(prevState[categoryId] ?? false),
    }));
  };

  const handleCategoryRenameConfirm = (newCategoryName: string) => {
    renameCategory(renameCategoryDialog.categoryId, newCategoryName);
    setRenameCategoryDialog({ open: false, categoryId: "", categoryName: "" });
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialog({ ...deleteDialog, open });
  };

  const handleRenameDialogOpenChange = (open: boolean) => {
    setRenameCategoryDialog((prevState) => ({ ...prevState, open }));
  };

  const existingCategories = allExercises.map((group) => group.category);
  const isSearchActive = searchValue.trim().length > 0;

  const visibleExerciseGroups = useMemo(() => {
    if (!isSearchActive) {
      return allExercises;
    }

    return allExercises
      .map((group) => ({
        ...group,
        exercises: group.exercises.filter((entry) =>
          matchesCatalogSearch(searchValue, [
            entry.name,
            group.category,
            entry.description,
          ]),
        ),
      }))
      .filter((group) => group.exercises.length > 0);
  }, [allExercises, isSearchActive, searchValue]);

  const visiblePresets = useMemo(() => {
    if (!isSearchActive) {
      return trainingPreset;
    }

    return trainingPreset.filter((preset) => {
      const exerciseNames = preset.exercises.map((exerciseId) =>
        resolveExerciseNameById(exerciseId, allExercises),
      );

      return matchesCatalogSearch(searchValue, [
        preset.presetName,
        ...exerciseNames,
      ]);
    });
  }, [allExercises, isSearchActive, searchValue, trainingPreset]);

  const showExerciseGroups = variant === "exercises" || variant === "all";
  const showPresets = variant === "presets" || variant === "all";
  const hasVisibleResults =
    (showExerciseGroups && visibleExerciseGroups.length > 0) ||
    (showPresets && visiblePresets.length > 0);

  return (
    <>
      <Command shouldFilter={false} className="h-full min-h-0 w-full">
        <CommandInput
          placeholder="Поиск..."
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <CommandList
          ref={commandListRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain "
        >
          {isSearchActive && !hasVisibleResults && (
            <CommandEmpty>Ничего не найдено</CommandEmpty>
          )}
          <RadioGroup className={"gap-0"}>
            {showExerciseGroups &&
              visibleExerciseGroups.map((group) => (
                <CommandGroup
                  heading={
                    <CategoryActions
                      categoryName={group.category}
                      categoryId={group.id}
                      isExpanded={
                        (expandedCategories[group.id] ?? false) ||
                        isSearchActive
                      }
                      deletable={deletable}
                      onCreateExerciseInCategory={onCreateExerciseInCategory}
                      onToggleCategory={handleCategoryToggle}
                      onEditCategory={handleCategoryRenameOpen}
                      onDeleteCategory={handleCategoryDelete}
                    />
                  }
                  key={group.id}
                >
                  <CommandSeparator />
                  {((expandedCategories[group.id] ?? false) || isSearchActive) && (
                    <div className="overflow-hidden">
                      {group.exercises.map((entry) => (
                        <ExerciseItem
                          key={entry.id}
                          id={entry.id}
                          name={entry.name}
                          iconId={entry.iconId}
                          description={entry.description}
                          photoDataUrls={entry.photoDataUrls}
                          category={group.category}
                          checkable={checkable}
                          deletable={deletable}
                          allowListDelete={!onEditExercise}
                          selected={selectedExerciseCheckboxes.includes(
                            entry.id,
                          )}
                          onSelect={exerciseSelectHandler}
                          onDelete={handleExerciseDelete}
                          onEdit={
                            deletable && onEditExercise
                              ? handleExerciseEdit
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  )}
                </CommandGroup>
              ))}
          </RadioGroup>
          {showPresets && (!isSearchActive || visiblePresets.length > 0) && (
            <CommandGroup heading={"Пресеты"}>
              {visiblePresets.map((preset) => (
                <PresetItem
                  key={preset.id!}
                  preset={preset}
                  checkable={checkable}
                  deletable={deletable}
                  selected={selectedPresetCheckboxes.includes(
                    preset.id!,
                  )}
                  onSelect={presetSelectHandler}
                  onDelete={handlePresetDelete}
                  onEdit={handlePresetEdit}
                />
              ))}
            </CommandGroup>
          )}

          <div className="mb-28"></div>
        </CommandList>
      </Command>

      <DeleteDialog
        open={deleteDialog.open}
        onOpenChange={handleDeleteDialogOpenChange}
        type={deleteDialog.type}
        name={deleteDialog.name}
        onConfirm={handleDeleteConfirm}
      />
      <RenameCategoryDialog
        open={renameCategoryDialog.open}
        onOpenChange={handleRenameDialogOpenChange}
        currentName={renameCategoryDialog.categoryName}
        existingCategories={existingCategories}
        onConfirm={handleCategoryRenameConfirm}
      />
    </>
  );
};
