import { medusaSDK } from "@/lib/medusa";
import { useMutation } from "@tanstack/react-query";
import z from "zod";
import useAppContext from "../useAppContext";
import useCreateCartMutation from "./useCreateCartMutation";


export function useTransferCartMutation() {
  const appContext = useAppContext();
  const createCartMutation = useCreateCartMutation();
  const loginMutation = useMutation({
    mutationFn: async function () {
      const customerResponse = await medusaSDK.store.customer.retrieve({
        fields: "+metadata",
      });

      if (appContext.cart) {
        await medusaSDK.store.cart.transferCart(appContext.cart.id);
        const updatedCustomer = await medusaSDK.store.customer.update({
          metadata: {
            cart_id: appContext.cart.id,
          },
        }); 
        appContext.setCustomer?.(updatedCustomer.customer);
      } else {
        if (customerResponse.customer?.metadata?.cart_id) {
          const cartResponse = await medusaSDK.store.cart.retrieve(
            customerResponse.customer.metadata.cart_id as string,
            {}
          );
          console.debug("Cart Response:", cartResponse);
          if (cartResponse.cart) {
            appContext.setCart?.(cartResponse.cart);
          }
        } else {
          const cartResponse = await createCartMutation.mutateAsync([]);
          appContext.setCart?.(cartResponse);
        }
      }


      return true;
    },
  });

  return loginMutation;
}
