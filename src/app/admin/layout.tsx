import type { ReactNode } from "react";
import { isDevelopmentAuthBypassEnabled } from "@/modules/auth/development/dev-auth-bypass";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const bypassEnabled = isDevelopmentAuthBypassEnabled();

  return (
    <div className="container-admin">
      {bypassEnabled ? (
        <p
          role="status"
          className="border-b border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950"
        >
          حالت توسعه: احراز هویت دور زده شده است؛ عملیات تغییردهنده غیرفعال است.
        </p>
      ) : null}
      {children}
    </div>
  );
}
