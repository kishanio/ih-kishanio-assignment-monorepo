import { InferGetServerSidePropsType } from "next";
import { Button } from "@/components/ui/button";
import Login from "@/components/auth/Login";
import useAppContext from "@/components/useAppContext";
import CartItem from "@/components/cart/CartItem";
import { getServerSidePropsWithCommonProps } from "@/utils/SSR";

export const getServerSideProps = getServerSidePropsWithCommonProps(
  async (_context,commonProps) => {
    if (commonProps.cart) {
      return {
        props: {}
      }
    } else {
      return {
        redirect: {
          destination: "/",
          permanent: false, 
        },
        props: {}
      }
    }
    
  }
);

export default function Cart(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const appContext = useAppContext();
  return (
    <>
      <h1 className="text-2xl font-bold mb-1">Your Trek Cart</h1>
      <p className="">
        Going for the trek is a process. One of the first steps is to get the
        documentation right.
        <br /> Lets start saving the trek details to your account and finishing
        the payment process. We&apos;ll also seek identification from you to
        finalize the trek booking.
      </p>

      {props.cart?.items?.map((item) => {
        return (
          <CartItem
            key={`cart-item-${item.id}`}
            item={item}
            cart={props.cart}
          />
        );
      })}
      {!appContext.customer && (
        <div className="my-10">
          <Login>
            <Button>Proceed with Login</Button>
          </Login>
        </div>
      )}
    </>
  );
}
