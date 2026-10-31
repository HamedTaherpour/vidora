import Image from "next/image";
import Link from "next/link";
import { LogInIcon, MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { PublicSiteHeaderProps } from "./public-site-header.types";
import { createPublicCategoryHref } from "./public-site-header.utils";

export type { PublicSiteHeaderProps } from "./public-site-header.types";
export { createPublicCategoryHref } from "./public-site-header.utils";

function HeaderLoginButton() {
  return (
    <Button
      render={<Link href="/session" />}
      nativeButton={false}
      variant="outline"
    >
      <LogInIcon data-icon="inline-start" aria-hidden="true" />
      ورود به حساب
    </Button>
  );
}

export function PublicSiteHeader({ categories }: PublicSiteHeaderProps) {
  return (
    <header
      data-slot="public-site-header"
      data-sticky-header
      className="sticky top-0 z-30 border-b border-border/60 bg-background"
    >
      <div className="container-storefront flex min-h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
          >
            <Image
              src="/images/brand/logo-with-text.png"
              alt="ویدورا"
              width={1332}
              height={303}
              priority
              className="h-auto w-28 sm:w-32"
            />
          </Link>

          <div className="hidden items-center md:flex">
            <NavigationMenu aria-label="ناوبری اصلی">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>دسته‌بندی‌ها</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid min-w-56 gap-1 p-2">
                      {categories.map((category) => (
                        <li key={category.value}>
                          <NavigationMenuLink
                            render={
                              <Link
                                href={createPublicCategoryHref(category.value)}
                              />
                            }
                          >
                            {category.labelFa}
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    render={<Link href="/#footage-listing" />}
                  >
                    فوتیج‌ها
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        <div className="hidden md:block">
          <HeaderLoginButton />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="باز کردن منوی ناوبری"
                />
              }
            >
              <MenuIcon aria-hidden="true" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(22rem,calc(100vw-2rem))]"
            >
              <SheetHeader>
                <SheetTitle>ناوبری ویدورا</SheetTitle>
              </SheetHeader>
              <nav
                aria-label="ناوبری موبایل"
                className="flex flex-col gap-1 px-4"
              >
                <SheetClose
                  render={<Link href="/#footage-listing" />}
                  nativeButton={false}
                  className="rounded-lg px-3 py-2 text-start text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  فوتیج‌ها
                </SheetClose>
                <p className="px-3 pt-4 pb-1 text-sm font-medium text-muted-foreground">
                  دسته‌بندی‌ها
                </p>
                {categories.map((category) => (
                  <SheetClose
                    key={category.value}
                    render={
                      <Link href={createPublicCategoryHref(category.value)} />
                    }
                    nativeButton={false}
                    className="rounded-lg px-3 py-2 text-start text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {category.labelFa}
                  </SheetClose>
                ))}
                <SheetClose
                  render={<Link href="/session" />}
                  nativeButton={false}
                  className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-start text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <LogInIcon aria-hidden="true" />
                  ورود به حساب
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
