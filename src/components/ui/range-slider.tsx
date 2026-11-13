"use client";

import { useRef } from "react";
import type { RangeSliderProps, RangeValue } from "./range-slider.types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Two keyboard-operable native sliders composed as one accessible price range. */
export function RangeSlider(props: RangeSliderProps) {
  const { value, min, max, step, onChange, onCommit, label } = props;
  const startRef = useRef<RangeValue>(value);
  const percent = (current: number) =>
    max === min ? 0 : ((current - min) / (max - min)) * 100;
  const update = (index: 0 | 1, raw: number) => {
    const next: RangeValue = [...value] as RangeValue;
    next[index] = clamp(raw, min, max);
    if (index === 0) next[0] = Math.min(next[0], next[1]);
    else next[1] = Math.max(next[1], next[0]);
    onChange(next);
  };
  const commit = () => {
    if (startRef.current[0] !== value[0] || startRef.current[1] !== value[1])
      onCommit?.(value);
    startRef.current = value;
  };

  return (
    <div className="space-y-2" dir="rtl">
      <span id={`${label}-range-label`} className="sr-only">
        {label}
      </span>
      <div className="relative h-11 px-2">
        <div
          aria-hidden="true"
          className="absolute inset-x-2 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-input"
        >
          <span
            className="absolute inset-y-0 rounded-full bg-primary"
            style={{
              insetInlineStart: `${percent(value[0])}%`,
              insetInlineEnd: `${100 - percent(value[1])}%`,
            }}
          />
        </div>
        {[0, 1].map((index) => (
          <input
            key={index}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[index]}
            aria-label={`${label}؛ ${index === 0 ? "حداقل" : "حداکثر"}`}
            aria-labelledby={`${label}-range-label`}
            onFocus={() => {
              startRef.current = value;
            }}
            onChange={(event) =>
              update(index as 0 | 1, Number(event.target.value))
            }
            onPointerUp={commit}
            onKeyUp={commit}
            className={`absolute inset-x-0 top-0 h-11 w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background ${index === 1 ? "pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto" : ""}`}
            style={{ zIndex: index === 0 ? 2 : 3 }}
          />
        ))}
      </div>
    </div>
  );
}
