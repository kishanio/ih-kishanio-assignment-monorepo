import { createContext, useContext } from "react";
import { HttpTypes } from "@medusajs/types";

interface IAppContext {
  cart: HttpTypes.StoreCart | null;
  customer: HttpTypes.StoreCustomer | null;
  setCart: (cart: HttpTypes.StoreCart | null) => void;
  setCustomer: (customer: HttpTypes.StoreCustomer | null) => void;
}
export const AppContext = createContext<IAppContext>({
  cart: null,
  customer: null,
  setCart: () => {},
  setCustomer: () => {},
});

export default function useAppContext() {
  const appContext = useContext(AppContext);
  return appContext;
}
