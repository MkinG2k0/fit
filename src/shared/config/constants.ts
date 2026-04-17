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
      catalogExercise("Приседания", "icon-leg"),
      catalogExercise("Жим ногами", "icon-leg"),
      catalogExercise("Выпады", "icon-leg"),
      catalogExercise("Болгарские выпады", "icon-leg"),
      catalogExercise("Разгибания ног в тренажере", "icon-leg"),
      catalogExercise("Сгибания ног в тренажере", "icon-leg"),
    ],
  },
  {
    category: "Ягодицы",
    exercises: [
      catalogExercise("Ягодичный мост", "icon-leg"),
      catalogExercise("Румынская тяга", "icon-muscles-front"),
      catalogExercise("Отведение ноги в кроссовере", "icon-leg"),
      catalogExercise("Гиперэкстензия", "icon-muscles-front"),
    ],
  },
  {
    category: "Спина",
    exercises: [
      catalogExercise("Подтягивания", "icon-muscles-front"),
      catalogExercise("Тяга верхнего блока", "icon-muscles-front"),
      catalogExercise("Тяга штанги в наклоне", "icon-muscles-front"),
      catalogExercise("Тяга горизонтального блока", "icon-muscles-front"),
      catalogExercise("Тяга гантели одной рукой", "icon-muscles-front"),
    ],
  },
  {
    category: "Грудь",
    exercises: [
      catalogExercise("Жим лежа", "icon-breast"),
      catalogExercise("Жим гантелей на наклонной скамье", "icon-breast"),
      catalogExercise("Разведение гантелей лежа", "icon-breast"),
      catalogExercise("Отжимания на брусьях", "icon-triceps"),
      catalogExercise("Сведение рук в кроссовере", "icon-breast"),
    ],
  },
  {
    category: "Плечи",
    exercises: [
      catalogExercise("Армейский жим", "icon-shoulders"),
      catalogExercise("Махи в сторону", "icon-shoulders"),
      catalogExercise("Махи в наклоне", "icon-shoulders"),
      catalogExercise("Тяга штанги к подбородку", "icon-shoulders"),
    ],
  },
  {
    category: "Руки",
    exercises: [
      catalogExercise("Подъём гантелей на бицепс", "icon-hand-power"),
      catalogExercise("Молотки", "icon-hand-power"),
      catalogExercise("Разгибания на блоке", "icon-triceps"),
      catalogExercise("Французский жим", "icon-triceps"),
      catalogExercise("Подъём штанги на бицепс", "icon-hand-power"),
    ],
  },
  {
    category: "Пресс",
    exercises: [
      catalogExercise("Скручивания", "icon-abs-core"),
      catalogExercise("Планка", "icon-abs-core"),
      catalogExercise("Подъем ног в висе", "icon-abs-core"),
      catalogExercise("Русский твист", "icon-abs-core"),
    ],
  },
  {
    category: "Кардио",
    exercises: [
      catalogExercise("Бег", "icon-cardio"),
      catalogExercise("Велотренажер", "icon-cardio"),
      catalogExercise("Гребной тренажер", "icon-cardio"),
      catalogExercise("Эллиптический тренажер", "icon-cardio"),
      catalogExercise("Скакалка", "icon-cardio"),
    ],
  },
  {
    category: "Икры",
    exercises: [
      catalogExercise("Подъемы на носки стоя", "icon-leg"),
      catalogExercise("Подъемы на носки сидя", "icon-leg"),
      catalogExercise("Подъемы на носки в тренажере", "icon-leg"),
    ],
  },
  {
    category: "Предплечья",
    exercises: [
      catalogExercise("Сгибания кистей с гантелями", "icon-hand-power"),
      catalogExercise("Разгибания кистей с гантелями", "icon-hand-power"),
      catalogExercise("Фермерская прогулка", "icon-hand-power"),
    ],
  },
  {
    category: "Мобильность",
    exercises: [
      catalogExercise(
        "Растяжка задней поверхности бедра",
        "icon-mobility-arms-up",
      ),
      catalogExercise("Растяжка грудных мышц", "icon-mobility-arms-up"),
      catalogExercise("Мобилизация грудного отдела", "icon-mobility-arms-up"),
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
