import Image from "next/image";
import { HttpTypes } from "@medusajs/types";
import { getCurrencySymbol } from "@/pages/_app";

export default function CartItem(props:{
    item: HttpTypes.StoreCartLineItem;
    cart: HttpTypes.StoreCart | null;
}) {
    return <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mt-6">
        <div className="col-span-2">
          <div className="grid grid-cols-3 gap-6 w-full h-25">
            <div className="col-span-1 relative">
              {props.item.thumbnail && (
                <Image
                  src={props.item.thumbnail}
                  alt={`${props.item.title} Cover`}
                  fill
                  className="object-cover rounded-lg"
                />
              )}
            </div>
            <div className="col-span-2 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {props.item.product_title || "Trek Title"}
                </h2>

                <h4 className="text-lg/snug font-medium">
                  {props.item.variant_title}
                </h4>
              </div>
              <div>
                <h4 className="text-md/snug font-medium">
                  {getCurrencySymbol(
                    props.cart?.region?.currency_code || "Unknown"
                  )}{" "}
                  {props.item.unit_price
                    ? (
                        props.item.unit_price
                      ).toLocaleString()
                    : 0}
                </h4>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-1"></div>
      </div>
}