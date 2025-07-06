import { medusaSDK } from "@/lib/medusa";
import { useMutation } from "@tanstack/react-query";
import z from "zod";
import useAppContext from "../useAppContext";
import { useTransferCartMutation } from "../cart/useTransferCartMutation";

export const LOGIN_COOKIENAME = "_medusa_auth_token";
export const LOGIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const ZLoginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export function useLoginMutation() {
  const appContext = useAppContext();
  const transerCartMutation = useTransferCartMutation();
  const loginMutation = useMutation({
    mutationFn: async function (data: z.infer<typeof ZLoginSchema>) {
      await medusaSDK.auth.login("customer", "emailpass", data);

      await transerCartMutation.mutateAsync();

      const customerResponse = await medusaSDK.store.customer.retrieve({
        fields: "+metadata",
      });
      appContext.setCustomer?.(customerResponse.customer);

      return true;
    },
  });

  return loginMutation;
}
