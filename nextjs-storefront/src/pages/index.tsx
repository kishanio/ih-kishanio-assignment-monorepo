import ProductCard from "@/components/ProductCard";
import { medusaSDK } from "@/lib/medusa";
import { getServerSidePropsWithCommonProps } from "@/utils/SSR";
import { InferGetServerSidePropsType } from "next";

export const getServerSideProps = getServerSidePropsWithCommonProps(
  async () => {
    const medusaSDKProductResponse = await medusaSDK.store.product.list();

    return {
      props: { products: medusaSDKProductResponse.products },
    };
  }
);

export default function Home(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {props.products.map(function (product) {
          return <ProductCard key={product.id} product={product} />;
        })}
      </div>
    </>
  );
}
