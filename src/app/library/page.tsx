import { CustomerLibraryScreen } from "@/modules/ui-mock/customer-library/customer-library-preview";
import {
  loadCustomerLibraryRouteData,
  type CustomerLibrarySearchParams,
} from "@/modules/ui-mock/customer-library/route-data";

export const dynamic = "force-dynamic";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: CustomerLibrarySearchParams;
}) {
  const data = await loadCustomerLibraryRouteData(searchParams, "library");
  return <CustomerLibraryScreen {...data} />;
}
