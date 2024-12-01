"use client";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  signInWithEmailAndPassword,
  signInWithGoogle,
} from "@/firebase/config/firebase-config";
import createAxiosInstance from "@/axios/axios";
import { useSession } from "@/firebase/session/use-session";

// Zod Schema for Form Validation
const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const Login: React.FC = () => {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const axios = createAxiosInstance(0);
  const { status } = useSession();
  if (status === "authenticated") {
    redirect("/");
  }
  if (status === "unauthenticated") {
    toast.error("Please Login!");
  }

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        data.email,
        data.password,
      );

      // Get ID token
      const idToken = await userCredential.user.getIdToken();

      // Send to backend login route
      await axios.post("/auth/login", { idToken });

      toast.success("Login Successful", {
        description: "Redirecting to home page...",
      });

      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        if (
          error.message.includes("auth/invalid-credential") ||
          error.message.includes("auth/wrong-password")
        ) {
          toast.error("Login Failed", {
            description: "Invalid email or password. Please try again.",
          });
        } else {
          toast.error("Login Error", {
            description: error.message,
          });
        }
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredentials = await signInWithGoogle();
      const email = userCredentials.user.email;
      if (!email) {
        throw new Error("No email found with Google account");
      }
      const idToken = await userCredentials.user.getIdToken();
      await axios.post("/auth/login", { idToken });

      toast.success("Google Sign-In Successful", {
        description: "Redirecting to home page...",
      });

      router.push("/");
    } catch (error: any) {
      toast.error("Sign In Error", {
        description: "An error occurred. Please try again." + error.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-extrabold text-gray-900">
            Log in to your account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={handleGoogleSignIn}
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
            </svg>
            Continue with Google
          </Button>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={isPasswordVisible ? "text" : "password"}
                          placeholder="Password"
                          {...field}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setIsPasswordVisible((prev) => !prev)}
                        >
                          {isPasswordVisible ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mb-4 mt-2 text-left text-sm">
                <a
                  href="/forget-password"
                  className="mr-2 text-blue-600 hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <Button type="submit" className="w-full">
                Log In
              </Button>
            </form>
          </Form>
        </CardContent>
        <div className="mb-4 mt-2 text-center text-sm">
          Don&#39;t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Login;
