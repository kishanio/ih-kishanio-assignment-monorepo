import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { GetServerSidePropsContext } from "next";
import { HttpTypes } from "@medusajs/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { medusaSDK } from "@/lib/medusa";
import { AppContext } from "@/components/useAppContext";
import { useState } from "react";
import { CART_COOKIE_NAME } from "@/components/cart/useCreateCartMutation";

interface ICommonPageProps {
  cart: HttpTypes.StoreCart | null;
  customer: HttpTypes.StoreCustomer | null;
}

export const CURRENCY_CODES: Record<string, string> = {
  inr: "₹",
  usd: "$",
  eur: "€",
  gbp: "£",
};

export const getCurrencySymbol = function (currencyCode: string): string {
  return CURRENCY_CODES[currencyCode] || currencyCode.toUpperCase();
};

export async function getCommonPageProps(
  context: GetServerSidePropsContext
): Promise<ICommonPageProps> {
  let cartId = context.req.cookies[CART_COOKIE_NAME] || null;

  let customer: HttpTypes.StoreCustomer | null = null;
  // if (token) {
  try {
    const customerResponse = await medusaSDK.store.customer.retrieve(
      {
        fields: "+metadata",
      },
      {
        Cookie: context.req.headers.cookie || "",
        "Content-Type": "application/json",
        "x-publishable-api-key":
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      }
    );
    console.log("Customer Response:", customerResponse);
    customer = customerResponse.customer || null;
    if (customer.metadata?.cart_id) {
      cartId = customer.metadata.cart_id as string;
    }
  } catch (error) {
    console.error("Error retrieving customer:", error);
  }

  let cart: HttpTypes.StoreCart | null = null;
  if (cartId) {
    const cartRetriveResponse = await medusaSDK.store.cart.retrieve(cartId, {});
    cart = cartRetriveResponse.cart;
  }

  return {
    cart,
    customer,
  };
}

export default function App<T extends ICommonPageProps>({
  Component,
  pageProps,
}: AppProps<T>) {
  const [cart, setCart] = useState(pageProps.cart || null);
  const [customer, setCustomer] = useState(pageProps.customer || null);
  console.log(cart, customer);
  return (
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
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
      </ThemeProvider>
    </QueryClientProvider>
  );
}
