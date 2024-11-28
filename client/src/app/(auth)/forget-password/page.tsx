"use client";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
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
import { sendPasswordResetEmail } from "@/firebase/config/firebase-config";

// Zod Schema for Form Validation
const ForgetPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

const ForgetPassword: React.FC = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof ForgetPasswordSchema>>({
    resolver: zodResolver(ForgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof ForgetPasswordSchema>) => {
    try {
      // Send password reset email
      await sendPasswordResetEmail(data.email);

      toast.success("Password Reset Email Sent", {
        description: "Check your email to reset your password.",
      });
      // Add a delay before redirecting
      await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 seconds delay

      // Optionally redirect to log in or stay on the same page
      router.push("/login");
    } catch (error) {
      console.error("Password reset error:", error);
      if (error instanceof Error) {
        if (error.message.includes("auth/user-not-found")) {
          toast.error("Reset Failed", {
            description: "No user found with this email address.",
          });
        } else if (error.message.includes("auth/invalid-email")) {
          toast.error("Invalid Email", {
            description: "Please enter a valid email address.",
          });
        } else {
          toast.error("Password Reset Error", {
            description: "An error occurred. Please try again.",
          });
        }
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-extrabold text-gray-900">
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-center text-sm text-gray-600">
            Enter the email address associated with your account, and we'll send
            you a link to reset your password.
          </p>

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
                        placeholder="Enter your email address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Reset Password
              </Button>
            </form>
          </Form>
        </CardContent>
        <div className="mb-4 mt-2 text-center text-sm">
          Remember your password?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </a>
        </div>
      </Card>
    </div>
  );
};

export default ForgetPassword;
