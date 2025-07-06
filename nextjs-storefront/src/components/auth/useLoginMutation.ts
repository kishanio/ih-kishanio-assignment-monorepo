import { medusaSDK } from "@/lib/medusa";
import { useMutation } from "@tanstack/react-query";
import z from "zod";
import useAppContext from "../useAppContext";
import useCreateCartMutation from "../cart/useCreateCartMutation";

export const LOGIN_COOKIENAME = "_medusa_auth_token";
export const LOGIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const ZLoginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export function useLoginMutation() {
  const appContext = useAppContext();
  const createCartMutation = useCreateCartMutation();
  const loginMutation = useMutation({
    mutationFn: async function (data: z.infer<typeof ZLoginSchema>) {
      await medusaSDK.auth.login("customer", "emailpass", data);
      let customerResponse = await medusaSDK.store.customer.retrieve({
        fields: "+metadata",
      });

      if (appContext.cart) {
        await medusaSDK.store.cart.transferCart(appContext.cart.id);

        await medusaSDK.store.customer.update({
          metadata: {
            cart_id: appContext.cart.id,
          },
        }); // pending logic to confirm transfer of cart
      } else {
        if (customerResponse.customer?.metadata?.cart_id) {
          const cartResponse = await medusaSDK.store.cart.retrieve(
            customerResponse.customer.metadata.cart_id as string,
            {}
          );
          console.log("Cart Response:", cartResponse);
          if (cartResponse.cart) {
            appContext.setCart?.(cartResponse.cart);
          }
        } else {
          const cartResponse = await createCartMutation.mutateAsync([]);
          appContext.setCart?.(cartResponse);
        }
      }

      customerResponse = await medusaSDK.store.customer.retrieve({
        fields: "+metadata",
      });

      appContext.setCustomer?.(customerResponse.customer);

      return true;
    },
  });

  return loginMutation;
}
