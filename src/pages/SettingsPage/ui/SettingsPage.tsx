import { Header } from "@/widgets";
import { Separator } from "@/shared/ui/shadCNComponents/ui/separator";
import { ThemeSettingsCard } from "@/features/themeSwitcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";

const PAGE_WRAPPER_CLASS =
  "flex h-dvh flex-col overflow-hidden bg-background text-foreground";
const SCROLL_AREA_CLASS =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-3 sm:px-4 sm:py-4";
const CONTENT_GRID_CLASS = "mx-auto grid w-full max-w-3xl gap-3 sm:gap-4";
const CARD_CLASS = "gap-3 py-4";
const CARD_HEADER_CLASS = "px-4";
const CARD_CONTENT_CLASS = "px-4";

export const SettingsPage = () => {
  return (
    <div className={PAGE_WRAPPER_CLASS}>
      <Header title="Настройки" navigateBack />
      <Separator />

      <div className={SCROLL_AREA_CLASS}>
        <div className={CONTENT_GRID_CLASS}>
          <p className="text-sm text-muted-foreground">
            Персонализация и системные параметры приложения
          </p>

          <ThemeSettingsCard />

          <Card className={CARD_CLASS}>
            <CardHeader className={CARD_HEADER_CLASS}>
              <CardTitle>Профиль</CardTitle>
              <CardDescription>
                Изменение имени и фото профиля будет доступно в следующих
                обновлениях
              </CardDescription>
            </CardHeader>
            <CardContent className={CARD_CONTENT_CLASS}>
              <p className="text-sm text-muted-foreground">Статус: скоро</p>
            </CardContent>
          </Card>

          <Card className={CARD_CLASS}>
            <CardHeader className={CARD_HEADER_CLASS}>
              <CardTitle>Уведомления</CardTitle>
              <CardDescription>
                Здесь появятся напоминания о тренировках и завершении таймера
              </CardDescription>
            </CardHeader>
            <CardContent className={CARD_CONTENT_CLASS}>
              <p className="text-sm text-muted-foreground">Статус: скоро</p>
            </CardContent>
          </Card>

          <Card className={CARD_CLASS}>
            <CardHeader className={CARD_HEADER_CLASS}>
              <CardTitle>Данные</CardTitle>
              <CardDescription>
                Экспорт и очистка локальных данных будут вынесены в этот раздел
              </CardDescription>
            </CardHeader>
            <CardContent className={CARD_CONTENT_CLASS}>
              <p className="text-sm text-muted-foreground">Статус: скоро</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
