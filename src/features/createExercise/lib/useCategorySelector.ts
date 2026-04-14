import { useState, useRef, useEffect } from "react";

export const useCategorySelector = () => {
  const [focused, setFocused] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node)
      ) {
        setFocused(false);
      }
    };

    if (focused) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, [focused]);

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setFocused(false);
    }, 150);
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setFocused(true);
  };

  const handleSelect = (callback: () => void) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    callback();
    setFocused(false);
  };

  return {
    focused,
    commandRef,
    handleBlur,
    handleFocus,
    handleSelect,
    setFocused,
  };
};

