import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
} from "@/shared/ui/shadCNComponents/ui/command";
import {
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
  onCreateExerciseInCategory?: (categoryName: string) => void;
  onEditExercise?: (payload: {
    name: string;
    category: string;
    iconId: ExerciseIconId;
    description: string;
    photoDataUrl: string;
  }) => void;
  onEditPreset?: (preset: TrainingPreset) => void;
}

interface RadioProps extends BaseProps {
  checkable?: "radio";
  exerciseSelectHandler: (value: string) => void;
  presetSelectHandler?: never;
  selectedExerciseCheckboxes: string;
  selectedPresetCheckboxes?: never;
}

interface CheckableProps extends BaseProps {
  checkable?: "checkbox";
  exerciseSelectHandler: (value: string) => void;
  presetSelectHandler: (value: string) => void;
  selectedExerciseCheckboxes: string[];
  selectedPresetCheckboxes: string[];
}

interface NonCheckableProps extends BaseProps {
  checkable?: false;
  exerciseSelectHandler?: never;
  presetSelectHandler?: never;
  selectedExerciseCheckboxes?: never;
  selectedPresetCheckboxes?: never;
}

export type FullExerciseCommandProps =
  | CheckableProps
  | NonCheckableProps
  | RadioProps;

export const FullExerciseCommand = ({
  selectedExerciseCheckboxes = [],
  selectedPresetCheckboxes = [],
  presetSelectHandler,
  exerciseSelectHandler,
  checkable = false,
  deletable = false,
  variant = "all",
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
    name: string;
    category?: string;
  }>({
    open: false,
    type: "exercise",
    name: "",
  });
  const [renameCategoryDialog, setRenameCategoryDialog] = useState<{
    open: boolean;
    categoryName: string;
  }>({
    open: false,
    categoryName: "",
  });
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setExpandedCategories((prevState) => {
      const nextState: Record<string, boolean> = {};

      allExercises.forEach((group) => {
        nextState[group.category] = prevState[group.category] ?? false;
      });

      return nextState;
    });
  }, [allExercises]);

  const handleDeleteConfirm = () => {
    if (deleteDialog.type === "exercise" && deleteDialog.category) {
      deleteExercise(deleteDialog.name, deleteDialog.category);
    } else if (deleteDialog.type === "category") {
      deleteCategory(deleteDialog.name);
    } else if (deleteDialog.type === "preset") {
      deleteTrainingPreset(deleteDialog.name);
    }
    setDeleteDialog({ open: false, type: "exercise", name: "" });
  };

  const openDeleteDialog = (
    type: "exercise" | "preset" | "category",
    name: string,
    category?: string,
  ) => {
    setDeleteDialog({ open: true, type, name, category });
  };

  const handleExerciseDelete = (name: string, category: string) => {
    openDeleteDialog("exercise", name, category);
  };

  const handleExerciseEdit = (payload: {
    name: string;
    category: string;
    iconId: ExerciseIconId;
    description: string;
    photoDataUrl: string;
  }) => {
    onEditExercise?.(payload);
  };

  const handlePresetDelete = (name: string) => {
    openDeleteDialog("preset", name);
  };

  const handlePresetEdit = (preset: TrainingPreset) => {
    onEditPreset?.(preset);
  };

  const handleCategoryDelete = (categoryName: string) => {
    openDeleteDialog("category", categoryName);
  };

  const handleCategoryRenameOpen = (categoryName: string) => {
    setRenameCategoryDialog({ open: true, categoryName });
  };

  const handleCategoryToggle = (categoryName: string) => {
    setExpandedCategories((prevState) => ({
      ...prevState,
      [categoryName]: !(prevState[categoryName] ?? false),
    }));
  };

  const handleCategoryRenameConfirm = (newCategoryName: string) => {
    renameCategory(renameCategoryDialog.categoryName, newCategoryName);
    setRenameCategoryDialog({ open: false, categoryName: "" });
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialog({ ...deleteDialog, open });
  };

  const handleRenameDialogOpenChange = (open: boolean) => {
    setRenameCategoryDialog((prevState) => ({ ...prevState, open }));
  };

  const existingCategories = allExercises.map((group) => group.category);
  const isSearchActive = searchValue.trim().length > 0;

  return (
    <>
      <Command className="h-full min-h-0 w-full">
        <CommandInput
          placeholder="Поиск..."
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <CommandList className="min-h-0 flex-1 overflow-y-auto overscroll-contain ">
          <RadioGroup className={"gap-0"}>
            {(variant === "exercises" || variant === "all") &&
              allExercises.map((group) => (
                <CommandGroup
                  heading={
                    <CategoryActions
                      categoryName={group.category}
                      isExpanded={
                        (expandedCategories[group.category] ?? false) ||
                        isSearchActive
                      }
                      deletable={deletable}
                      onCreateExerciseInCategory={onCreateExerciseInCategory}
                      onToggleCategory={handleCategoryToggle}
                      onEditCategory={handleCategoryRenameOpen}
                      onDeleteCategory={handleCategoryDelete}
                    />
                  }
                  key={group.category}
                >
                  <CommandSeparator />
                  <AnimatePresence initial={false}>
                    {((expandedCategories[group.category] ?? false) ||
                      isSearchActive) && (
                      <motion.div
                        key={`${group.category}-content`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        {group.exercises.map((entry) => (
                          <ExerciseItem
                            key={`${group.category}-${entry.name}`}
                            name={entry.name}
                            iconId={entry.iconId}
                            description={entry.description}
                            photoDataUrl={entry.photoDataUrl}
                            category={group.category}
                            checkable={checkable}
                            deletable={deletable}
                            allowListDelete={!onEditExercise}
                            selected={selectedExerciseCheckboxes.includes(
                              entry.name,
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CommandGroup>
              ))}
          </RadioGroup>
          {(variant === "presets" || variant === "all") && (
            <CommandGroup heading={"Пресеты"}>
              {trainingPreset.map((preset) => (
                <PresetItem
                  key={preset.presetName}
                  preset={preset}
                  checkable={checkable}
                  deletable={deletable}
                  selected={selectedPresetCheckboxes.includes(
                    preset.presetName,
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
