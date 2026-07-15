import { useNavigate, useParams } from "react-router-dom";
import { LoadTableDetail } from "@/features/loadTable";

export const LoadTableDetailPage = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();

  if (!exerciseId) {
    return (
      <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-3 pb-3 sm:gap-4 sm:px-4 sm:pb-4">
        <p className="text-sm text-muted-foreground">Упражнение не найдено</p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-3 pb-3 sm:gap-4 sm:px-4 sm:pb-4">
      <LoadTableDetail
        exerciseId={exerciseId}
        onBack={() => navigate("/load-table")}
      />
    </div>
  );
};
