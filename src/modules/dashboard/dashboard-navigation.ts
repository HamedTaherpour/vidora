export type DashboardNavigationItem = {
  href: string;
  label: string;
  description: string;
};

export const CUSTOMER_DASHBOARD_ROUTES = {
  dashboard: "/dashboard",
  library: "/dashboard/library",
  orders: "/dashboard/orders",
  profile: "/dashboard/profile",
} as const;

export const CUSTOMER_DASHBOARD_NAVIGATION: readonly DashboardNavigationItem[] =
  [
    {
      href: CUSTOMER_DASHBOARD_ROUTES.dashboard,
      label: "نمای کلی",
      description: "خلاصه حساب کاربری",
    },
    {
      href: CUSTOMER_DASHBOARD_ROUTES.library,
      label: "کتابخانه من",
      description: "فوتیج‌های خریداری‌شده",
    },
    {
      href: CUSTOMER_DASHBOARD_ROUTES.orders,
      label: "سفارش‌ها و فاکتورها",
      description: "سوابق خرید و فاکتورها",
    },
    {
      href: CUSTOMER_DASHBOARD_ROUTES.profile,
      label: "پروفایل",
      description: "اطلاعات حساب کاربری",
    },
  ] as const;

export function isDashboardNavigationItemCurrent(
  href: string,
  pathname: string,
): boolean {
  return href === CUSTOMER_DASHBOARD_ROUTES.dashboard
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}
