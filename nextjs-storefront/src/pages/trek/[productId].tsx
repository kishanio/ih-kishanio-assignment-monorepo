import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { medusaSDK } from "../../lib/medusa";
import Image from "next/image";
import BookingForm from "@/components/BookingForm";
import { getServerSidePropsWithCommonProps } from "@/utils/SSR";

export const getServerSideProps = getServerSidePropsWithCommonProps(
  async (context: GetServerSidePropsContext) => {
    const params = context.params as { productId: string };
    const medusaSDKProductResponse = await medusaSDK.store.product.retrieve(
      params?.productId,
      {
        fields: "+variants.calculated_price",
      }
    );

    return {
      props: { product: medusaSDKProductResponse.product }
    };
  }
);

export default function TrekPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  return (
    <>
      <div className="grid grid-cols-3 gap-4 h-96 mb-6">
        <div className="col-span-2 relative overflow-hidden rounded-lg">
          <Image
            src={props.product.thumbnail || ""}
            alt={`${props.product.title} Cover`}
            fill
            className="object-cover"
          />
        </div>

        <div className="col-span-1 flex flex-col gap-4">
          {props.product.images && props.product.images.length > 0 ? (
            <>
              <div className="relative h-[calc(50%-8px)] overflow-hidden rounded-lg">
                <Image
                  src={props.product.images[0]?.url || ""}
                  alt={`${props.product.title} Image 1`}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="relative h-[calc(50%-8px)] overflow-hidden rounded-lg">
                <Image
                  src={
                    props.product.images[1]?.url ||
                    props.product.images[0]?.url ||
                    ""
                  }
                  alt={`${props.product.title} Image 2`}
                  fill
                  className="object-cover"
                />
              </div>
            </>
          ) : (
            <>
              <div className="relative h-[calc(50%-8px)] overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image</span>
              </div>
              <div className="relative h-[calc(50%-8px)] overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image</span>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          <h1 className="text-3xl font-bold">{props.product.title}</h1>
          <h2 className="text-xl/snug">{props.product.subtitle}</h2>

          <div className="prose prose-lg max-w-none mt-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                About This Trek
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {props.product.description}
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <BookingForm product={props.product} />
        </div>
      </div>
    </>
  );
}
