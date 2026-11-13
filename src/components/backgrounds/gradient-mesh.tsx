import { cn } from "@/lib/utils";
import type { GradientMeshBackgroundProps } from "./gradient-mesh.types";

/** Official VibeFarsiUI `gradient-mesh` background registry asset. */
export function GradientMeshBackground({
  className,
}: GradientMeshBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 home-gradient-mesh",
        className,
      )}
    />
  );
}
