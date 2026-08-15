import { GripVertical, X } from "lucide-react";
import {
  AnimatePresence,
  Reorder,
  useDragControls,
} from "motion/react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";

const MISSING_CATALOG_NAME = "Упражнение недоступно";

const listItemMotionProps = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.3, ease: "easeInOut" as const },
};

interface PresetCompositionListProps {
  exercises: string[];
  nameById: ReadonlyMap<string, string>;
  onReorder: (ids: string[]) => void;
  onRemove: (id: string) => void;
}

interface ReorderablePresetItemProps {
  id: string;
  index: number;
  name: string;
  onRemove: (id: string) => void;
}

const ReorderablePresetItem = ({
  id,
  index,
  name,
  onRemove,
}: ReorderablePresetItemProps) => {
  const dragControls = useDragControls();

  const handleReorderPointerDown = (event: ReactPointerEvent<Element>) => {
    event.preventDefault();
    dragControls.start(event);
  };

  return (
    <Reorder.Item
      as="div"
      value={id}
      dragListener={false}
      dragControls={dragControls}
      {...listItemMotionProps}
      className="relative"
    >
      <div className="flex items-center gap-2 bg-card text-card-foreground border border-border rounded-xl px-3 py-2">
        <button
          type="button"
          aria-label="Перетащить упражнение"
          className="touch-none cursor-grab text-muted-foreground"
          onPointerDown={handleReorderPointerDown}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-sm text-muted-foreground tabular-nums">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm">{name}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Удалить упражнение"
          onClick={() => onRemove(id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Reorder.Item>
  );
};

export const PresetCompositionList = ({
  exercises,
  nameById,
  onReorder,
  onRemove,
}: PresetCompositionListProps) => {
  return (
    <Reorder.Group
      as="div"
      axis="y"
      values={exercises}
      onReorder={onReorder}
      className="flex flex-col gap-2"
    >
      <AnimatePresence>
        {exercises.map((id, index) => (
          <ReorderablePresetItem
            key={id}
            id={id}
            index={index}
            name={nameById.get(id) ?? MISSING_CATALOG_NAME}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
};
