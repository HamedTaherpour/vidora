export type CustomerLibraryRouteError = Error & {
  digest?: string;
};

export type DashboardLibraryErrorProps = {
  error: CustomerLibraryRouteError;
  reset: () => void;
};
