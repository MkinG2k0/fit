import { useState } from "react";
import {
  AddLoadTableExerciseDialog,
  LoadTableDetail,
  LoadTableList,
} from "@/features/loadTable";

export const LoadTablePage = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-3 pb-3 sm:gap-4 sm:px-4 sm:pb-4">
      <p className="text-sm text-muted-foreground">
        Программные проценты от MAX на 16 недель с оценками 1ПМ
      </p>

      {selectedId === null ? (
        <LoadTableList
          onSelect={setSelectedId}
          onAddClick={() => setIsAddOpen(true)}
        />
      ) : (
        <LoadTableDetail
          exerciseId={selectedId}
          onBack={() => setSelectedId(null)}
        />
      )}

      <AddLoadTableExerciseDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
};
