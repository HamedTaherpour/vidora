import { cn } from "@/lib/utils";
import type { BlurTextProps } from "./blur-text.types";

/** Official VibeFarsiUI `blur-text` asset. Words emerge from a soft blur in RTL order. */
export function BlurText(props: BlurTextProps) {
  const { text, delay = 90, className } = props;

  return (
    <span className={cn("inline", className)} aria-label={text}>
      {text.split(" ").map((word, index) => (
        <span
          key={`${word}-${index}`}
          aria-hidden="true"
          className="inline-block"
          style={{
            animation: `blur-in 900ms cubic-bezier(0.16, 1, 0.3, 1) ${index * delay}ms both`,
          }}
        >
          {word} 
        </span>
      ))}
    </span>
  );
}
