import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import type { AppProps } from "next/app";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContext } from "@/components/useAppContext";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import "@/styles/globals.css";
import { ICommonPageProps } from "@/utils/SSR";

export default function App<T extends ICommonPageProps>({
  Component,
  pageProps,
}: AppProps<T>) {
  const [cart, setCart] = useState(pageProps.cart || null);
  const [customer, setCustomer] = useState(pageProps.customer || null);
  console.debug(cart, customer);
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <>
        <QueryClientProvider
          client={
            new QueryClient({
              defaultOptions: {
                mutations: {
                  onError: (error) => {
                    let errorMessage = "An error occurred. Please try again.";
                    if (error instanceof Error) {
                      errorMessage = error.message;
                    }
                    toast.error(errorMessage);
                  },
                },
              },
            })
          }
        >
          <AppContext.Provider
            value={{
              cart,
              setCart,
              customer,
              setCustomer: setCustomer,
            }}
          >
            <>
              <Header />
              <div className="container mx-auto h-svh py-6 px-4 md:px-6 mb-12">
                <Component {...pageProps} />
              </div>
            </>
          </AppContext.Provider>
        </QueryClientProvider>

        <Toaster />
      </>
    </ThemeProvider>
  );
}
