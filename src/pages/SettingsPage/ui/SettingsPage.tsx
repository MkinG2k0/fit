import { Header } from "@/widgets";
import { ThemeSettingsCard } from "@/features/themeSwitcher";
import { SettingsTransferCard } from "@/features/appSettingsTransfer";
import { ProfileRingGoalsSettingsCard } from "@/features/profileRingGoalsSettings";
import { WorkoutCaloriesSettingsCard } from "@/features/exercise";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";

export const SettingsPage = () => {
  return (
    <div className="flex h-dvh flex-col gap-2 overflow-hidden bg-background text-foreground">
      <Header title="Настройки" navigateBack />

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="mx-auto grid w-full max-w-3xl gap-3 sm:gap-4">
          <p className="text-sm text-muted-foreground">
            Персонализация и системные параметры приложения
          </p>

          <ThemeSettingsCard />

          <ProfileRingGoalsSettingsCard />

          <WorkoutCaloriesSettingsCard />

          <Card className="gap-3 py-4">
            <CardHeader className="px-4">
              <CardTitle>Уведомления</CardTitle>
              <CardDescription>
                Здесь появятся напоминания о тренировках и завершении таймера
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-sm text-muted-foreground">Статус: скоро</p>
            </CardContent>
          </Card>

          <SettingsTransferCard />

          <div className="mb-2"></div>
        </div>
      </div>
    </div>
  );
};
