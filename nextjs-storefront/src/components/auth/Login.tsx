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
import { useLoginMutation, ZLoginSchema } from "./useLoginMutation";
import Signup from "./Signup";

export default function Login(props: PropsWithChildren) {
  const loginMutation = useLoginMutation();
  const loginForm = useForm<z.infer<typeof ZLoginSchema>>({
    resolver: zodResolver(ZLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{props.children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(async function (values) {
                try {
                  await loginMutation.mutateAsync(values);
                } catch (error) {
                  console.log("Login failed:", error);
                }
              })}
              className="space-y-8"
            >
              <DialogHeader>
                <DialogTitle>Login</DialogTitle>
                <DialogDescription>
                  Enter your credentials to access your account.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={function ({ field }) {
                    return (
                      <FormItem>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <FormControl>
                          <Input id="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={function ({ field }) {
                    return (
                      <FormItem>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <FormControl>
                          <Input id="password" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <DialogFooter>
                <Signup>
                  <Button variant="ghost">Signup</Button>
                </Signup>
                <Button type="submit" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
