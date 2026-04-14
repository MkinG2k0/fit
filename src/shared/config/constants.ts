const DEFAULT_PRESET_COLOR = { r: 255, g: 165, b: 0, a: 0.5 };

export const allExercises = [
  {
    category: "Ноги",
    exercises: ["Приседания", "Жим ногами", "Выпады"],
  },
  {
    category: "Ягодицы",
    exercises: ["Ягодичный мост", "Румынская тяга"],
  },
  {
    category: "Спина",
    exercises: ["Подтягивания", "Тяга верхнего блока", "Тяга штанги в наклоне"],
  },
  {
    category: "Грудь",
    exercises: [
      "Жим лежа",
      "Жим гантелей на наклонной скамье",
      "Разведение гантелей лежа",
    ],
  },
  {
    category: "Плечи",
    exercises: ["Армейский жим", "Махи в сторону"],
  },
  {
    category: "Руки",
    exercises: ["Подъём гантелей на бицепс", "Молотки", "Разгибания на блоке"],
  },
  {
    category: "Пресс",
    exercises: ["Скручивания", "Планка"],
  },
  {
    category: "Кардио",
    exercises: ["Бег", "Велотренажер", "Гребной тренажер"],
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
];
