import { HttpTypes } from "@medusajs/types";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "./ui/form";
import { parse as ParseDate } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { getCurrencySymbol } from "@/pages/_app";
import { useRouter } from "next/router";
import Link from "next/link";
import useAddToCartMutation from "./cart/useAddToCartMutation";
import useAppContext from "./useAppContext";

const ZBookingSchema = z.object({
  yearOption: z.string().min(1, "Year is required"),
  monthOption: z.string().min(1, "Month is required"),
  batchOption: z.string().min(1, "Batch is required"),
});

export default function BookingForm(props: {
  product: HttpTypes.StoreProduct;
}) {
  const appContext = useAppContext();
  const addToCartMutation = useAddToCartMutation();
  const router = useRouter();
  const yearOptions = props.product.options
    ?.find(function (option) { return option.title === "Year"})
    ?.values?.sort(function (a, b) {
      const yearA = parseInt(a.value, 10);
      const yearB = parseInt(b.value, 10);
      return yearA - yearB; // Sort in ascending order
    });
  const monthOptions = props.product.options
    ?.find(function (option) { return option.title === "Month"})
    ?.values?.sort(function (a, b) {
      const dateA = ParseDate(a.value, "MMMM", new Date());
      const dateB = ParseDate(b.value, "MMMM", new Date());
      return dateA.getMonth() - dateB.getMonth();
    });

  const defaultYearOption = yearOptions?.[0]?.id || "";
  const defaultMonthOption = monthOptions?.[0]?.id || "";

  const bookingForm = useForm<z.infer<typeof ZBookingSchema>>({
    resolver: zodResolver(ZBookingSchema),
    defaultValues: {
      yearOption: defaultYearOption,
      monthOption: defaultMonthOption,
      batchOption:
        props.product.variants?.find(function (v) {
          const hasYearOption = v.options?.some(
            function (option) {
              return option.option?.title === "Year" &&
              option.value === defaultYearOption
            }
          );
          const hasMonthOption = v.options?.some(
            function(option) {
              return option.option?.title === "Month" &&
              option.value === defaultMonthOption
            }
          );
          return hasYearOption && hasMonthOption;
        })?.id || "",
    },
  });

  const watchedYear = bookingForm.watch("yearOption");
  const watchedMonth = bookingForm.watch("monthOption");

  const updateCartMutation = useMutation({
    mutationFn: async function (values: z.infer<typeof ZBookingSchema>) {
      const cart = await addToCartMutation.mutateAsync([
        {
          variant_id: values.batchOption,
          quantity: 1,
          metadata: {
            year: values.yearOption,
            month: values.monthOption,
          },
        },
      ]);

      return cart;
    },
    onSuccess: function () {
      router.push("/cart");
    },
  });

  const batches = props.product.variants?.filter(function (v) {
    const hasYearOption = v.options?.some(
      (option) => option.option?.title === "Year" && option.id === watchedYear
    );
    const hasMonthOption = v.options?.some(
      (option) => option.option?.title === "Month" && option.id === watchedMonth
    );
    return hasYearOption && hasMonthOption;
  });

  // check if the cart already has the trek product
  const hasTrekInCart = appContext.cart?.items?.some(function (item) {
    return item.product?.id === props.product.id;
  });

  if (hasTrekInCart) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Trek Booking Already in Cart
          </CardTitle>
          <CardDescription className="text-balance">
            Please proceed to checkout to complete your booking.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button size="sm" asChild className="w-full">
            <Link href="/cart">Go to Cart</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <Form {...bookingForm}>
        <form
          onSubmit={bookingForm.handleSubmit(function (values) {
            updateCartMutation.mutate(values);
          })}
          className="space-y-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Book your Trek</CardTitle>
              <CardDescription className="text-balance">
                We usually have limited slots available for each trek. Please
                use the option below to check availability and book your trek.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="">
                <FormField
                  control={bookingForm.control}
                  name="yearOption"
                  render={function ({ field }) {
                    return (
                      <fieldset className="flex flex-col gap-3">
                        <legend className="text-sm font-medium">Year</legend>
                        <p className="text-muted-foreground text-sm">
                          Which year are you planning to trek?
                        </p>
                        <RadioGroup
                          className="grid gap-3 md:grid-cols-2"
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          {yearOptions?.map(function (value) {
                            return (
                              <Label
                                className="has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-input/20 flex items-start gap-3 rounded-lg border p-3"
                                key={value.id}
                              >
                                <RadioGroupItem
                                  value={value.id}
                                  id={value.id}
                                  className="data-[state=checked]:border-primary"
                                />
                                <div className="grid gap-1 font-normal">
                                  <div className="font-medium">
                                    {value.value}
                                  </div>
                                </div>
                              </Label>
                            );
                          })}
                        </RadioGroup>
                      </fieldset>
                    );
                  }}
                />
              </div>
              <div className="mt-3">
                <FormField
                  control={bookingForm.control}
                  name="monthOption"
                  render={function ({ field }) {
                    return (
                      <fieldset className="flex flex-col gap-3">
                        <legend className="text-sm font-medium">Month</legend>
                        <p className="text-muted-foreground text-sm">
                          Select month for your trek.
                        </p>
                        <RadioGroup
                          className="grid gap-3 md:grid-cols-2"
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          {monthOptions?.map(function (value) {
                            return (
                              <Label
                                className="has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-input/20 flex items-start gap-3 rounded-lg border p-3"
                                key={value.id}
                              >
                                <RadioGroupItem
                                  value={value.id}
                                  id={value.id}
                                  className="data-[state=checked]:border-primary"
                                />
                                <div className="grid gap-1 font-normal">
                                  <div className="font-medium">
                                    {value.value}
                                  </div>
                                </div>
                              </Label>
                            );
                          })}
                        </RadioGroup>
                      </fieldset>
                    );
                  }}
                />
              </div>

              <div className="mt-3">
                <FormField
                  control={bookingForm.control}
                  name="batchOption"
                  render={function ({ field }) {
                    return (
                      <fieldset className="flex flex-col gap-3">
                        <legend className="text-sm font-medium">
                          Available Batches
                        </legend>
                        <p className="text-muted-foreground text-sm">
                          Choose from available trek batches for{" "}
                          {watchedYear && watchedMonth
                            ? "the selected period"
                            : "your selected year and month"}
                          .
                        </p>
                        {batches && batches.length > 0 ? (
                          <RadioGroup
                            className="grid gap-3"
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            {batches.map(function (batch) {
                              const price = batch.calculated_price
                                ?.calculated_amount
                                ? `${getCurrencySymbol(
                                    batch.calculated_price.currency_code ||
                                      "Unknown"
                                  )} ${batch.calculated_price.calculated_amount.toLocaleString()}`
                                : "Price on request";

                              return (
                                <Label
                                  className="has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-input/20 flex items-start gap-3 rounded-lg border p-3 cursor-pointer"
                                  key={batch.id}
                                >
                                  <RadioGroupItem
                                    value={batch.id}
                                    id={batch.id}
                                    className="data-[state=checked]:border-primary"
                                  />
                                  <div className="grid gap-1 font-normal flex-1">
                                    <div className="font-medium">
                                      {batch.title}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {price}
                                    </div>
                                    {batch.inventory_quantity !== undefined && (
                                      <div className="text-xs text-muted-foreground">
                                        {batch.inventory_quantity > 0
                                          ? `${batch.inventory_quantity} slots available`
                                          : "Limited availability"}
                                      </div>
                                    )}
                                  </div>
                                </Label>
                              );
                            })}
                          </RadioGroup>
                        ) : (
                          <div className="p-4 rounded-lg border border-dashed border-gray-300 text-center">
                            <p className="text-muted-foreground text-sm">
                              {watchedYear && watchedMonth
                                ? "No batches available for the selected year and month."
                                : "Please select year and month to see available batches."}
                            </p>
                          </div>
                        )}
                      </fieldset>
                    );
                  }}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                size="sm"
                type="submit"
                disabled={
                  !bookingForm.formState.isValid ||
                  !batches ||
                  batches.length === 0 ||
                  addToCartMutation.isPending
                }
                className="w-full"
              >
                {addToCartMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    Adding to Cart...
                  </>
                ) : addToCartMutation.isSuccess ? (
                  <>✓ Added to Cart</>
                ) : (
                  "Add to Cart"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </>
  );
}
