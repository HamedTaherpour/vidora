import type { ReactNode } from "react";

type AdminLayoutProps = {
  children: ReactNode;
};

/**
 * Operational Admin shell.
 * Persian RTL for Admin pages without changing the root storefront layout.
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div dir="rtl" lang="fa">
      {children}
    </div>
  );
}
