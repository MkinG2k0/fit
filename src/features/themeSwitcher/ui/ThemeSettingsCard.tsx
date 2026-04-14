import { Flame, Leaf, Monitor, Moon, Sun } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/shared/ui/shadCNComponents/ui/radio-group";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";
import { cn } from "@/shared/lib/classMerge";
import { useThemeStore, type ThemeMode } from "@/entities/theme";

interface ThemeOption {
  value: ThemeMode;
  title: string;
  description: string;
  icon: typeof Sun;
}

interface ThemeSettingsCardProps {
  className?: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "system",
    title: "Системная",
    description: "Автоматически подстраивается под настройки устройства",
    icon: Monitor,
  },
  {
    value: "light",
    title: "Светлая",
    description: "Стандартный дневной режим интерфейса",
    icon: Sun,
  },
  {
    value: "dark",
    title: "Темная",
    description: "Комфортный режим при слабом освещении",
    icon: Moon,
  },
  {
    value: "aggressive",
    title: "Агрессивная",
    description: "Контрастная тёмная палитра с ярким акцентом",
    icon: Flame,
  },
  {
    value: "calm",
    title: "Спокойная",
    description: "Мягкая светлая палитра для спокойной работы",
    icon: Leaf,
  },
];

const CARD_CLASS = "gap-3 py-4";
const CARD_HEADER_CLASS = "px-4";
const CARD_CONTENT_CLASS = "px-4";
const OPTION_WRAPPER_CLASS =
  "flex items-start gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted/40";
const OPTION_TITLE_CLASS = "text-sm font-medium";
const OPTION_DESCRIPTION_CLASS = "text-xs text-muted-foreground";
const RADIO_GROUP_CLASS = "gap-2";
const VALID_THEME_MODES = new Set<string>([
  "system",
  "light",
  "dark",
  "aggressive",
  "calm",
]);

const isThemeMode = (value: string): value is ThemeMode =>
  VALID_THEME_MODES.has(value);

const renderThemeOption = ({ value, title, description, icon: Icon }: ThemeOption) => {
  return (
    <Label key={value} htmlFor={`theme-${value}`} className={OPTION_WRAPPER_CLASS}>
      <RadioGroupItem id={`theme-${value}`} value={value} />
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
        <div className="flex flex-col gap-1">
          <span className={OPTION_TITLE_CLASS}>{title}</span>
          <span className={OPTION_DESCRIPTION_CLASS}>{description}</span>
        </div>
      </div>
    </Label>
  );
};

export const ThemeSettingsCard = ({ className }: ThemeSettingsCardProps) => {
  const themeMode = useThemeStore((state) => state.themeMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);

  const handleThemeModeChange = (nextThemeMode: string) => {
    if (!isThemeMode(nextThemeMode)) {
      return;
    }

    setThemeMode(nextThemeMode);
  };

  return (
    <Card className={cn(CARD_CLASS, className)}>
      <CardHeader className={CARD_HEADER_CLASS}>
        <CardTitle>Тема приложения</CardTitle>
        <CardDescription>
          Выберите внешний вид приложения для удобного ведения дневника
        </CardDescription>
      </CardHeader>
      <CardContent className={CARD_CONTENT_CLASS}>
        <RadioGroup
          className={RADIO_GROUP_CLASS}
          value={themeMode}
          onValueChange={handleThemeModeChange}
        >
          {THEME_OPTIONS.map(renderThemeOption)}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
