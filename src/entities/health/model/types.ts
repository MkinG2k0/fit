export interface TodayHealthMetrics {
  steps: number;
  activeCaloriesKcal: number;
}

export interface HealthDailyPoint {
  dateKey: string;
  label: string;
  steps: number;
  calories: number;
}
