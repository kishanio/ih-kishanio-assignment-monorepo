import { medusaSDK } from "@/lib/medusa";
import { useMutation } from "@tanstack/react-query";
import { HttpTypes } from "@medusajs/types";

export const CART_COOKIE_NAME = "_medusa_cart_id";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export default function useCreateCartMutation() {
  return useMutation({
    mutationFn: async function (items: HttpTypes.StoreAddCartLineItem[]) {
      const createCartResponse = await medusaSDK.store.cart.create({
        items: items,
      });
      const cart = createCartResponse.cart
      if (cart?.id) {
          document.cookie = `${CART_COOKIE_NAME}=${cart?.id}; path=/; max-age=${CART_COOKIE_MAX_AGE}; SameSite=Lax`;
        }
      return cart;
    },
  });
}
