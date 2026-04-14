import React, { useEffect, useState } from "react";

interface CircularCountdownProps {
  totalSeconds: number;
  currentSeconds: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const CircularCountdown: React.FC<CircularCountdownProps> = ({
  totalSeconds,
  currentSeconds,
  size = 120,
  strokeWidth = 10,
  color = "black",
}) => {
  const [adaptiveSize, setAdaptiveSize] = useState(size);

  useEffect(() => {
    const calculateAdaptiveSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate maximum safe size based on viewport
      // Leave 40px padding (20px on each side) and consider other UI elements
      const maxWidth = viewportWidth - 40;
      const maxHeight = viewportHeight - 200; // Account for buttons and other UI elements

      const maxSize = Math.min(maxWidth, maxHeight);

      // Use the smaller of: provided size or calculated max size
      // Minimum size of 120px to ensure readability
      const newSize = Math.max(120, Math.min(size, maxSize));

      setAdaptiveSize(newSize);
    };

    calculateAdaptiveSize();

    const handleResize = () => {
      calculateAdaptiveSize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [size]);

  const radius = (adaptiveSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = (currentSeconds / totalSeconds) * 100;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: adaptiveSize, height: adaptiveSize }}
    >
      <svg
        width={adaptiveSize}
        height={adaptiveSize}
        // ✅ секретная комбинация:
        // 1️⃣ rotate(90deg) — поворачиваем, чтобы начало было сверху
        // 2️⃣ scale(-1, 1) — делаем движение по часовой
        style={{ transform: "rotate(90deg) scale(-1, 1)" }}
      >
        {/* фон */}
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={adaptiveSize / 2}
          cy={adaptiveSize / 2}
        />
        {/* активная дуга */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={radius}
          cx={adaptiveSize / 2}
          cy={adaptiveSize / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s linear, stroke 0.5s ease",
          }}
        />
      </svg>
    </div>
  );
};
