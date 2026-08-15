import { useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const ADD_EXERCISE_PARAM = "add-exercise";
export const EXERCISE_STATS_PARAM = "exercise-stats";

export const OVERLAY_SEARCH_PARAM_KEYS = [
  ADD_EXERCISE_PARAM,
  EXERCISE_STATS_PARAM,
] as const;

export const hasOverlaySearchParam = (
  searchParams: URLSearchParams,
): boolean => OVERLAY_SEARCH_PARAM_KEYS.some((key) => searchParams.has(key));

export const useOverlaySearchParam = (paramKey: string, value: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const didPushRef = useRef(false);
  const isOpen = searchParams.get(paramKey) === value;

  const open = useCallback(() => {
    if (searchParams.get(paramKey) === value) {
      return;
    }
    const next = new URLSearchParams(searchParams);
    next.set(paramKey, value);
    didPushRef.current = true;
    setSearchParams(next);
  }, [paramKey, searchParams, setSearchParams, value]);

  const close = useCallback(() => {
    if (searchParams.get(paramKey) !== value) {
      return;
    }
    if (didPushRef.current) {
      didPushRef.current = false;
      navigate(-1);
      return;
    }
    const next = new URLSearchParams(searchParams);
    next.delete(paramKey);
    setSearchParams(next, { replace: true });
  }, [navigate, paramKey, searchParams, setSearchParams, value]);

  const onOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        open();
        return;
      }
      close();
    },
    [close, open],
  );

  useEffect(() => {
    if (!isOpen) {
      didPushRef.current = false;
    }
  }, [isOpen]);

  return { isOpen, open, close, onOpenChange };
};
