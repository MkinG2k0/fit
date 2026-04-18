import { useCallback, useEffect, useState } from "react";
import {
  HealthAccessError,
  loadHealthPageData,
  type HealthDailyPoint,
  type TodayHealthMetrics,
  type HealthAccessErrorCode,
} from "@/entities/health";

interface UseHealthMetricsResult {
  metrics: TodayHealthMetrics | null;
  series: HealthDailyPoint[];
  isDemo: boolean;
  isLoading: boolean;
  errorCode: HealthAccessErrorCode | null;
  refresh: () => Promise<void>;
}

export const useHealthMetrics = (): UseHealthMetricsResult => {
  const [metrics, setMetrics] = useState<TodayHealthMetrics | null>(null);
  const [series, setSeries] = useState<HealthDailyPoint[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<HealthAccessErrorCode | null>(
    null,
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorCode(null);
    try {
      const data = await loadHealthPageData();
      setMetrics(data.today);
      setSeries(data.series);
      setIsDemo(data.isDemo);
    } catch (e) {
      setMetrics(null);
      setSeries([]);
      setIsDemo(false);
      if (e instanceof HealthAccessError) {
        setErrorCode(e.code);
      } else {
        setErrorCode("fetch_failed");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { metrics, series, isDemo, isLoading, errorCode, refresh };
};
