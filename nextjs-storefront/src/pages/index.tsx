import ProductCard from "@/components/ProductCard";
import { medusaSDK } from "@/lib/medusa";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getCommonPageProps } from "./_app";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const commonPageProps = await getCommonPageProps(context);
  const medusaSDKProductResponse = await medusaSDK.store.product.list();

  return {
    props: { products: medusaSDKProductResponse.products, ...commonPageProps },
  };
}

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
