import type { ExerciseIconId } from "@/entities/exercise/model/exerciseIcons";
import type { CatalogExercise } from "@/entities/exercise/model/types";

const DEFAULT_PRESET_COLOR = { r: 255, g: 165, b: 0, a: 0.5 };

const catalogExercise = (
  name: string,
  iconId: ExerciseIconId,
): CatalogExercise => ({ name, iconId });

export const allExercises = [
  {
    category: "Ноги",
    exercises: [
      catalogExercise("Приседания", "nav-menu"),
      catalogExercise("Жим ногами", "nav-menu"),
      catalogExercise("Выпады", "nav-menu"),
      catalogExercise("Болгарские выпады", "nav-menu"),
      catalogExercise("Разгибания ног в тренажере", "nav-menu"),
      catalogExercise("Сгибания ног в тренажере", "nav-menu"),
    ],
  },
  {
    category: "Ягодицы",
    exercises: [
      catalogExercise("Ягодичный мост", "nav-menu"),
      catalogExercise("Румынская тяга", "nav-menu"),
      catalogExercise("Отведение ноги в кроссовере", "nav-menu"),
      catalogExercise("Гиперэкстензия", "nav-menu"),
    ],
  },
  {
    category: "Спина",
    exercises: [
      catalogExercise("Подтягивания", "nav-timer"),
      catalogExercise("Тяга верхнего блока", "nav-timer"),
      catalogExercise("Тяга штанги в наклоне", "nav-timer"),
      catalogExercise("Тяга горизонтального блока", "nav-timer"),
      catalogExercise("Тяга гантели одной рукой", "nav-timer"),
    ],
  },
  {
    category: "Грудь",
    exercises: [
      catalogExercise("Жим лежа", "nav-exercises"),
      catalogExercise("Жим гантелей на наклонной скамье", "nav-exercises"),
      catalogExercise("Разведение гантелей лежа", "nav-exercises"),
      catalogExercise("Отжимания на брусьях", "nav-exercises"),
      catalogExercise("Сведение рук в кроссовере", "nav-exercises"),
    ],
  },
  {
    category: "Плечи",
    exercises: [
      catalogExercise("Армейский жим", "extra-9"),
      catalogExercise("Махи в сторону", "extra-9"),
      catalogExercise("Махи в наклоне", "extra-9"),
      catalogExercise("Тяга штанги к подбородку", "extra-9"),
    ],
  },
  {
    category: "Руки",
    exercises: [
      catalogExercise("Подъём гантелей на бицепс", "logo-mark"),
      catalogExercise("Молотки", "logo-mark"),
      catalogExercise("Разгибания на блоке", "logo-mark"),
      catalogExercise("Французский жим", "logo-mark"),
      catalogExercise("Подъём штанги на бицепс", "logo-mark"),
    ],
  },
  {
    category: "Пресс",
    exercises: [
      catalogExercise("Скручивания", "nav-settings"),
      catalogExercise("Планка", "nav-settings"),
      catalogExercise("Подъем ног в висе", "nav-settings"),
      catalogExercise("Русский твист", "nav-settings"),
    ],
  },
  {
    category: "Кардио",
    exercises: [
      catalogExercise("Бег", "extra-cardio"),
      catalogExercise("Велотренажер", "extra-cardio"),
      catalogExercise("Гребной тренажер", "extra-cardio"),
      catalogExercise("Эллиптический тренажер", "extra-cardio"),
      catalogExercise("Скакалка", "extra-cardio"),
    ],
  },
  {
    category: "Икры",
    exercises: [
      catalogExercise("Подъемы на носки стоя", "extra-calves"),
      catalogExercise("Подъемы на носки сидя", "extra-calves"),
      catalogExercise("Подъемы на носки в тренажере", "extra-calves"),
    ],
  },
  {
    category: "Предплечья",
    exercises: [
      catalogExercise("Сгибания кистей с гантелями", "nav-exercises"),
      catalogExercise("Разгибания кистей с гантелями", "nav-exercises"),
      catalogExercise("Фермерская прогулка", "nav-exercises"),
    ],
  },
  {
    category: "Мобильность",
    exercises: [
      catalogExercise("Растяжка задней поверхности бедра", "extra-8"),
      catalogExercise("Растяжка грудных мышц", "extra-8"),
      catalogExercise("Мобилизация грудного отдела", "extra-8"),
    ],
  },
];

export const trainingPreset = [
  {
    presetName: "Грудь и бицепс",
    exercises: [
      "Жим лежа",
      "Жим гантелей на наклонной скамье",
      "Подъём гантелей на бицепс",
      "Молотки",
    ],
    presetColor: DEFAULT_PRESET_COLOR,
  },
  {
    presetName: "Спина и трицепс",
    exercises: [
      "Подтягивания",
      "Тяга верхнего блока",
      "Тяга штанги в наклоне",
      "Разгибания на блоке",
    ],
    presetColor: DEFAULT_PRESET_COLOR,
  },
  {
    presetName: "Ноги и плечи",
    exercises: [
      "Приседания",
      "Жим ногами",
      "Выпады",
      "Армейский жим",
      "Махи в сторону",
    ],
    presetColor: DEFAULT_PRESET_COLOR,
  },
  {
    presetName: "Фулбоди для новичка",
    exercises: [
      "Приседания",
      "Жим лежа",
      "Тяга верхнего блока",
      "Планка",
      "Велотренажер",
    ],
    presetColor: DEFAULT_PRESET_COLOR,
  },
  {
    presetName: "Кардио и кор",
    exercises: ["Бег", "Гребной тренажер", "Скручивания", "Планка"],
    presetColor: DEFAULT_PRESET_COLOR,
  },
  {
    presetName: "Спина и бицепс",
    exercises: [
      "Подтягивания",
      "Тяга горизонтального блока",
      "Тяга гантели одной рукой",
      "Подъём штанги на бицепс",
      "Молотки",
    ],
    presetColor: DEFAULT_PRESET_COLOR,
  },
  {
    presetName: "Ягодицы и ноги",
    exercises: [
      "Ягодичный мост",
      "Румынская тяга",
      "Болгарские выпады",
      "Жим ногами",
      "Подъемы на носки стоя",
    ],
    presetColor: DEFAULT_PRESET_COLOR,
  },
  {
    presetName: "Плечи и трицепс",
    exercises: [
      "Армейский жим",
      "Махи в сторону",
      "Махи в наклоне",
      "Разгибания на блоке",
      "Французский жим",
    ],
    presetColor: DEFAULT_PRESET_COLOR,
  },
  {
    presetName: "Легкая восстановительная",
    exercises: [
      "Эллиптический тренажер",
      "Планка",
      "Растяжка задней поверхности бедра",
      "Растяжка грудных мышц",
      "Мобилизация грудного отдела",
    ],
    presetColor: DEFAULT_PRESET_COLOR,
  },
];
