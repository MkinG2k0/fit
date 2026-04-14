import { useState } from "react";

export const useExerciseSelection = () => {
  const [selectedPresetCheckboxes, setSelectedPresetCheckboxes] = useState<
    string[]
  >([]);
  const [selectedExerciseCheckboxes, setSelectedExerciseCheckboxes] = useState<
    string[]
  >([]);

  const presetSelectHandler = (value: string) => {
    setSelectedPresetCheckboxes((prevState) => {
      if (prevState.includes(value)) {
        return prevState.filter((item) => item !== value);
      }
      return [...prevState, value];
    });
  };

  const exerciseSelectHandler = (value: string) => {
    setSelectedExerciseCheckboxes((prevState) => {
      if (prevState.includes(value)) {
        return prevState.filter((item) => item !== value);
      }
      return [...prevState, value];
    });
  };

  const reset = () => {
    setSelectedExerciseCheckboxes([]);
    setSelectedPresetCheckboxes([]);
  };

  return {
    selectedPresetCheckboxes,
    selectedExerciseCheckboxes,
    presetSelectHandler,
    exerciseSelectHandler,
    reset,
  };
};

