import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { SpotlightCard } from "@/components/animations/spotlight-card";
import type { PurchaseJourneyProps } from "./purchase-journey.types";

export function PurchaseJourney(props: PurchaseJourneyProps) {
  const { steps } = props;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <div key={step.number} className="relative">
          <SpotlightCard className="h-full">
            <div className="flex h-full flex-col gap-3 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-brand">
                  {step.number}
                </span>
                <CheckCircle2
                  aria-hidden="true"
                  className="size-5 text-success"
                />
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm leading-7 text-muted-foreground">
                {step.description}
              </p>
            </div>
          </SpotlightCard>
          {index < steps.length - 1 && (
            <ArrowLeft
              aria-hidden="true"
              className="absolute -end-4 top-1/2 z-10 hidden size-5 -translate-y-1/2 text-brand lg:block"
            />
          )}
        </div>
      ))}
    </div>
  );
}
