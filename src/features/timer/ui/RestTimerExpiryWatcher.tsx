import { useRestTimerExpiryWatcher } from "../lib/useRestTimerExpiryWatcher";

/** Always-mounted listener for rest timer completion (sound / vibrate / notify). */
export const RestTimerExpiryWatcher = () => {
  useRestTimerExpiryWatcher();
  return null;
};
