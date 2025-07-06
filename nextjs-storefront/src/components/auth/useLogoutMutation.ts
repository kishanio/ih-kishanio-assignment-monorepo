import useAppContext from "../useAppContext";
import { medusaSDK } from "@/lib/medusa";
import { useMutation } from "@tanstack/react-query";
import { CART_COOKIE_NAME } from "../cart/useCreateCartMutation";
import { useRouter } from "next/router";

export function useLogoutMutation() {
  const router = useRouter();
  const appContext = useAppContext();
  return useMutation({
    mutationFn: async function () {
      await medusaSDK.auth.logout();
      appContext.setCustomer?.(null);
      document.cookie = `${CART_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
      appContext.setCart?.(null);

      await router.push("/");

      return true;
    },
  });
}
