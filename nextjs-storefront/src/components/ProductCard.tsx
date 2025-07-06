import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { HttpTypes } from "@medusajs/types";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

export default function ProductCard(props: {
  product: HttpTypes.StoreProduct;
}) {
  const plugin = useRef(
    Autoplay({
      delay: Math.floor(Math.random() * (5000 - 500 + 1)) + 500,
    })
  );

  return (
    <Card className="w-full pt-0">
      <Carousel
        plugins={[plugin.current]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {props.product.thumbnail && (
            <CarouselItem key={`${props.product.id}-cover`}>
              <Card className="py-0">
                <CardContent className="flex aspect-square items-center justify-center p-0 rounded-[inherit]">
                  <div className="relative w-full h-full rounded-[inherit]">
                    <Image
                      src={props.product.thumbnail}
                      alt={`${props.product.title} Cover`}
                      fill
                      className="object-cover rounded-[inherit]"
                    />
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          )}
          {props.product.images?.map(function (image, imageIdx) {
            return (
              <CarouselItem key={`${props.product.id}-${image.id}`}>
                <Card className="py-0">
                  <CardContent className="flex aspect-square items-center justify-center p-0 rounded-[inherit]">
                    <div className="relative w-full h-full rounded-[inherit]">
                      <Image
                        src={image.url}
                        alt={`${props.product.title} #${imageIdx + 1}`}
                        fill
                        className="object-cover rounded-[inherit]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
      <CardContent className="">
        <h2 className="text-xl font-bold mb-2">{props.product.title}</h2>
        <p className="text-sm min-h-12">{props.product.subtitle}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link href={`/trek/${props.product.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
