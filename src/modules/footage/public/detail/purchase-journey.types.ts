export type PurchaseJourneyStep = {
  number: string;
  title: string;
  description: string;
};

export type PurchaseJourneyProps = {
  steps: PurchaseJourneyStep[];
};
