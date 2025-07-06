import { GetServerSidePropsContext } from "next";
import { HttpTypes } from "@medusajs/types";
import { medusaSDK } from "@/lib/medusa";
import { CART_COOKIE_NAME } from "@/components/cart/useCreateCartMutation";

export interface ICommonPageProps {
  cart: HttpTypes.StoreCart | null;
  customer: HttpTypes.StoreCustomer | null;
}

// wrap all the pages with this function to get common props
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
    console.debug("Customer Response:", customerResponse);
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

interface IRedirect {
      destination: string;
      permanent: boolean;
    }
export function getServerSidePropsWithCommonProps<W>(
  fn: (context: GetServerSidePropsContext, commonProps: ICommonPageProps) => Promise<{
    props: W;
    redirect?: IRedirect;
  }>
): (context: GetServerSidePropsContext) => Promise<{
  props: ICommonPageProps & W;
  redirect?: IRedirect
}> {
  return async (context: GetServerSidePropsContext) => {
    const commonPageProps = await getCommonPageProps(context);
    const {props, redirect} = await fn(context,commonPageProps);
    return {
      props: {
        ...commonPageProps,
        ...props
      },
      redirect
    };
  };
}
