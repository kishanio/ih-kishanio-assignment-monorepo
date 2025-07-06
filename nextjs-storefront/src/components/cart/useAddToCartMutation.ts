import { useMutation } from "@tanstack/react-query";
import useCreateCartMutation from "./useCreateCartMutation";
import { HttpTypes } from "@medusajs/types";
import useAppContext from "../useAppContext";
import { medusaSDK } from "@/lib/medusa";

export default function useAddToCartMutation() {
  const createCartMutation = useCreateCartMutation();
  const appContext = useAppContext();
  const addToCartMutation = useMutation({
    mutationFn: async function (items: HttpTypes.StoreAddCartLineItem[]) {
      let cart = appContext.cart;
      if (!cart) {
        cart = await createCartMutation.mutateAsync(items);
      } else {
        for (const item of items) {
          const addItemResponse = await medusaSDK.store.cart.createLineItem(
            cart.id,
            item
          );
          cart = addItemResponse.cart;
        }
      }
    appContext.setCart?.(cart);
      return cart;
    },
  });

  return addToCartMutation
}
