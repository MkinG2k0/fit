export interface RingGoalsSettings {
  fullSetCount: number;
  fullVolume: number;
}

export const DEFAULT_RING_GOALS: RingGoalsSettings = {
  fullSetCount: 20,
  fullVolume: 6000,
};

export const MIN_RING_GOAL_VALUE = 1;
