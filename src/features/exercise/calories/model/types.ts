export type SetCalorieUiPhase = "idle" | "active" | "calculating";

export interface SetCalorieProfileInput {
  userWeightKg: number;
  userAge: number;
  isMale: boolean;
}

export interface SetCalorieWindowInput {
  startTime: Date;
  endTime: Date;
}
