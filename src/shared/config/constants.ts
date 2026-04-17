import { defaultIconIdForCategory } from "@/entities/exercise/model/exerciseIcons";
import type { CatalogExercise } from "@/entities/exercise/model/types";

const DEFAULT_PRESET_COLOR = { r: 255, g: 165, b: 0, a: 0.5 };

const catalog = (category: string, names: readonly string[]): CatalogExercise[] => {
  const iconId = defaultIconIdForCategory(category);

  return names.map((name) => ({ name, iconId }));
};

export const allExercises = [
  {
    category: "Ноги",
    exercises: catalog("Ноги", [
      "Приседания",
      "Жим ногами",
      "Выпады",
      "Болгарские выпады",
      "Разгибания ног в тренажере",
      "Сгибания ног в тренажере",
    ]),
  },
  {
    category: "Ягодицы",
    exercises: catalog("Ягодицы", [
      "Ягодичный мост",
      "Румынская тяга",
      "Отведение ноги в кроссовере",
      "Гиперэкстензия",
    ]),
  },
  {
    category: "Спина",
    exercises: catalog("Спина", [
      "Подтягивания",
      "Тяга верхнего блока",
      "Тяга штанги в наклоне",
      "Тяга горизонтального блока",
      "Тяга гантели одной рукой",
    ]),
  },
  {
    category: "Грудь",
    exercises: catalog("Грудь", [
      "Жим лежа",
      "Жим гантелей на наклонной скамье",
      "Разведение гантелей лежа",
      "Отжимания на брусьях",
      "Сведение рук в кроссовере",
    ]),
  },
  {
    category: "Плечи",
    exercises: catalog("Плечи", [
      "Армейский жим",
      "Махи в сторону",
      "Махи в наклоне",
      "Тяга штанги к подбородку",
    ]),
  },
  {
    category: "Руки",
    exercises: catalog("Руки", [
      "Подъём гантелей на бицепс",
      "Молотки",
      "Разгибания на блоке",
      "Французский жим",
      "Подъём штанги на бицепс",
    ]),
  },
  {
    category: "Пресс",
    exercises: catalog("Пресс", [
      "Скручивания",
      "Планка",
      "Подъем ног в висе",
      "Русский твист",
    ]),
  },
  {
    category: "Кардио",
    exercises: catalog("Кардио", [
      "Бег",
      "Велотренажер",
      "Гребной тренажер",
      "Эллиптический тренажер",
      "Скакалка",
    ]),
  },
  {
    category: "Икры",
    exercises: catalog("Икры", [
      "Подъемы на носки стоя",
      "Подъемы на носки сидя",
      "Подъемы на носки в тренажере",
    ]),
  },
  {
    category: "Предплечья",
    exercises: catalog("Предплечья", [
      "Сгибания кистей с гантелями",
      "Разгибания кистей с гантелями",
      "Фермерская прогулка",
    ]),
  },
  {
    category: "Мобильность",
    exercises: catalog("Мобильность", [
      "Растяжка задней поверхности бедра",
      "Растяжка грудных мышц",
      "Мобилизация грудного отдела",
    ]),
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
