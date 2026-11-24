import "server-only";

import {
  isDevelopmentAuthBypassEnabled,
  isDevelopmentAuthBypassIdentity,
} from "@/modules/auth/development/dev-auth-bypass";
import type { RequiredCustomer } from "@/modules/auth/authorization/authorization";
import { publicFootageDevelopmentFixtures } from "@/modules/footage/public/catalog/public-footage-development-fixtures";
import type { CustomerLibraryPreviewItem } from "./customer-library-preview.types";

type DevelopmentPreviewEnvironment = {
  NODE_ENV: string | undefined;
  DEV_AUTH_BYPASS: string | undefined;
};

/** Returns presentation-only library items for the explicit local preview identity. */
export function getCustomerLibraryPreview(
  customer: RequiredCustomer,
  environment: DevelopmentPreviewEnvironment = {
    NODE_ENV: process.env.NODE_ENV,
    DEV_AUTH_BYPASS: process.env.DEV_AUTH_BYPASS,
  },
): readonly CustomerLibraryPreviewItem[] | null {
  if (
    !isDevelopmentAuthBypassEnabled(environment) ||
    !isDevelopmentAuthBypassIdentity(customer)
  ) {
    return null;
  }

  return publicFootageDevelopmentFixtures.map((item, index) => ({
    reference: `development-library-${index + 1}`,
    item,
    qualityVariants: index % 3 === 0 ? ["1080p", "4K"] : ["1080p"],
  }));
}
