import { PropsWithChildren } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { medusaSDK } from "@/lib/medusa";
import useAppContext from "../useAppContext";
import { useLoginMutation } from "./useLoginMutation";

export const ZSignupSchema = z
  .object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().min(1, "Email is required"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Signup(props: PropsWithChildren) {
  const loginMutation = useLoginMutation();
  const signUpMutation = useMutation({
    mutationFn: async function (data: z.infer<typeof ZSignupSchema>) {
      const signupToken = await medusaSDK.auth.register(
        "customer",
        "emailpass",
        data
      );
      if (!signupToken) {
        throw new Error("Signup failed");
      }
      await medusaSDK.store.customer.create({
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
      }, {
        
      }, {
        "Authorization": `Bearer ${signupToken}`,
        "Content-Type": "application/json",
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      });
      await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      return true; // Simulating a successful signup
    },
  });
  const signupForm = useForm<z.infer<typeof ZSignupSchema>>({
    resolver: zodResolver(ZSignupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{props.children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...signupForm}>
            <form
              onSubmit={signupForm.handleSubmit(async function (values) {
                try {
                  await signUpMutation.mutateAsync(values);
                } catch (error) {
                  let errorMessage = "An error occurred while logging in.";
                  if (error instanceof Error) {
                    errorMessage = error.message;
                  }
                  toast.error(errorMessage);
                }
              })}
              className="space-y-8"
            >
              <DialogHeader>
                <DialogTitle>Signup</DialogTitle>
                <DialogDescription>
                  Signup to create an account and start shopping.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <FormField
                  control={signupForm.control}
                  name="firstName"
                  render={function ({ field }) {
                    return (
                      <FormItem>
                        <FormLabel htmlFor={field.name}>First Name</FormLabel>
                        <FormControl>
                          <Input id={field.name} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={signupForm.control}
                  name="lastName"
                  render={function ({ field }) {
                    return (
                      <FormItem>
                        <FormLabel htmlFor={field.name}>Last Name</FormLabel>
                        <FormControl>
                          <Input id={field.name} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={function ({ field }) {
                    return (
                      <FormItem>
                        <FormLabel htmlFor={field.name}>Email</FormLabel>
                        <FormControl>
                          <Input id={field.name} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={function ({ field }) {
                    return (
                      <FormItem>
                        <FormLabel htmlFor={field.name}>Password</FormLabel>
                        <FormControl>
                          <Input id={field.name} type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={function ({ field }) {
                    return (
                      <FormItem>
                        <FormLabel htmlFor={field.name}>
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <Input id={field.name} type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={signUpMutation.isPending}>
                  {signUpMutation.isPending ? "Please wait..." : "Sign Up"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
