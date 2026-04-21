import { useLastExerciseSession } from "../lib/useLastExerciseSession";

interface ExerciseCardLastSessionHintProps {
  exerciseName: string;
}

export const ExerciseCardLastSessionHint = ({
  exerciseName,
}: ExerciseCardLastSessionHintProps) => {
  const lastSession = useLastExerciseSession(exerciseName);

  if (!lastSession) {
    return null;
  }

  return (
    <p
      className="w-full border-t border-border px-4 pb-2 pt-1.5 text-center text-xs leading-snug text-muted-foreground"
      role="note"
    >
      Прошлый раз, {lastSession.dateLabel}: {lastSession.setsSummary}
    </p>
  );
};
