import { CustomerLibraryScreen } from "@/modules/ui-mock/customer-library/customer-library-preview";
import {
  loadCustomerLibraryRouteData,
  type CustomerLibrarySearchParams,
} from "@/modules/ui-mock/customer-library/route-data";

export const dynamic = "force-dynamic";

export default async function LibraryInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ purchaseReference: string }>;
  searchParams: CustomerLibrarySearchParams;
}) {
  const { purchaseReference } = await params;
  const data = await loadCustomerLibraryRouteData(
    searchParams,
    "invoice",
    purchaseReference,
  );
  return <CustomerLibraryScreen {...data} />;
}
