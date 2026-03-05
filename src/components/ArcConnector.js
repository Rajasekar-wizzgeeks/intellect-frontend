import React, { useEffect, useRef, useState } from "react";

export default function ArcConnector({
  items = [],
  arcColor = "#21552f",
  arcHeight = 320,
  strokeWidth = 3,
  paddingTop = 50,
  paddingBottom = 50,
  setPointsLine,
  circleColor,
  circleBorderColor,
  circleBorderWidth = 1.5,
  circleRadius = 7,
}) {
  const pathRef = useRef(null);
  const [points, setPoints] = useState([]);

  const itemsKey = items
    .map((it, idx) => {
      if (it && typeof it === "object") return it.id ?? it.key ?? idx;
      return String(it);
    })
    .join("|");

  const arePointsEqual = (a, b) => {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i]?.x !== b[i]?.x || a[i]?.y !== b[i]?.y) return false;
    }
    return true;
  };

  useEffect(() => {
    if (!pathRef.current) return;

    const path = pathRef.current;
    const length = path.getTotalLength();

    const samples = [];
    for (let t = 0; t <= length; t += 1) {
      const pt = path.getPointAtLength(t);
      samples.push({ x: pt.x, y: pt.y });
    }

    const usableHeight = arcHeight - paddingTop - paddingBottom;
    const rowSpacing = items.length > 1 ? usableHeight / (items.length - 1) : 0;

    const newPoints = items.map((_, i) => {
      const targetY = paddingTop + i * rowSpacing;

      let closest = samples[0];
      let minDiff = Infinity;

      for (let s of samples) {
        const diff = Math.abs(s.y - targetY);
        if (diff < minDiff) {
          minDiff = diff;
          closest = s;
        }
      }

      return closest;
    });

    setPoints((prev) => {
      if (arePointsEqual(prev, newPoints)) return prev;
      return newPoints;
    });

    setPointsLine?.(newPoints);
  }, [itemsKey, arcHeight, paddingTop, paddingBottom, setPointsLine]);

  return (
    <svg
      className="bs-arc"
      viewBox={`0 0 200 ${arcHeight}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Arc Path */}
      <path
        ref={pathRef}
        d={`M20 0 
            C 170 ${arcHeight * 0.25}, 
              170 ${arcHeight * 0.75}, 
              20 ${arcHeight}`}
        stroke={arcColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />

      {/* Dynamic Circles */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={circleRadius ?? 7}
          fill={circleColor ?? arcColor}
          stroke={circleBorderColor ?? arcColor}
          strokeWidth={circleBorderWidth}
        />
      ))}
    </svg>
  );
}
