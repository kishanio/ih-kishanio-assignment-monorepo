import { Button } from "@/components/ui/button";
import { IconShoppingCart, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import useAppContext from "./useAppContext";
import Login from "./auth/Login";
import { useLogoutMutation } from "./auth/useLogoutMutation";

export default function Header() {
  const appContext = useAppContext();
  const logoutMutation = useLogoutMutation();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">IH</span>
            </div>
            <span className="hidden font-bold sm:inline-block">
              IndiaHikes Store
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart" className="flex items-center justify-center">
              <IconShoppingCart className="h-5 w-5" />
              {appContext.cart &&
                appContext.cart.items &&
                appContext.cart.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-pulse">
                    <span className="absolute inset-0 rounded-full bg-primary animate-ping"></span>
                    <span className="relative block h-3 w-3 rounded-full bg-primary"></span>
                  </span>
                )}
            </Link>
          </Button>

          {appContext.customer ? (
            <Button
              variant="outline"
              onClick={async function () {
                await logoutMutation.mutateAsync();
              }}
            >
              Logout
            </Button>
          ) : (
            <Login>
              <Button variant="outline">
                <IconUser className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Login>
          )}
        </div>
      </div>
    </header>
  );
}
