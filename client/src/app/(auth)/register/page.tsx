"use client";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { Check, Eye, EyeOff, X } from "lucide-react";
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
  firebaseCreateUser,
  sendEmailVerification,
  signInWithGoogle,
} from "@/firebase/config/firebase-config";
import createAxiosInstance from "@/axios/axios";
import { useSession } from "@/firebase/session/use-session";

// Constants (reuse from previous component)
const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, text: "At least 8 characters" },
  { regex: /[0-9]/, text: "At least 1 number" },
  { regex: /[a-z]/, text: "At least 1 lowercase letter" },
  { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
  { regex: /[!-\/:-@[-`{-~]/, text: "At least 1 special character" },
] as const;

// Zod Schema for Form Validation
const EmailSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
});

const PasswordSchema = z
  .object({
    password: z
      .string()
      .refine(
        (password) =>
          PASSWORD_REQUIREMENTS.every((req) => req.regex.test(password)),
        { message: "Password does not meet strength requirements" },
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Strength score and configuration (reuse from previous component)
type StrengthScore = 0 | 1 | 2 | 3 | 4 | 5;

const STRENGTH_CONFIG = {
  colors: {
    0: "bg-border",
    1: "bg-red-500",
    2: "bg-orange-500",
    3: "bg-amber-500",
    4: "bg-amber-700",
    5: "bg-emerald-500",
  } satisfies Record<StrengthScore, string>,
  texts: {
    0: "Enter a password",
    1: "Weak password",
    2: "Medium password",
    3: "Strong password",
    4: "Very Strong password",
  } satisfies Record<Exclude<StrengthScore, 5>, string>,
} as const;

const axios = createAxiosInstance(0);

const SignUp: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<"initial" | "password">("initial");
  const [emailData, setEmailData] = useState<z.infer<typeof EmailSchema>>();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const { status } = useSession();
  if (status === "authenticated") {
    redirect("/");
  }
  if (status === "unauthenticated") {
    toast.error("Please Sign Up!");
  }
  const emailForm = useForm<z.infer<typeof EmailSchema>>({
    resolver: zodResolver(EmailSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof PasswordSchema>>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = passwordForm.watch("password");

  const calculateStrength = React.useMemo(() => {
    const requirements = PASSWORD_REQUIREMENTS.map((req) => ({
      met: req.regex.test(password),
      text: req.text,
    }));

    return {
      score: requirements.filter((req) => req.met).length as StrengthScore,
      requirements,
    };
  }, [password]);

  const onEmailSubmit = (data: z.infer<typeof EmailSchema>) => {
    setEmailData(data);
    setStep("password");
  };

  const onPasswordSubmit = async (data: z.infer<typeof PasswordSchema>) => {
    if (!emailData) return;

    try {
      const userCredential = await firebaseCreateUser(
        emailData.email,
        data.password,
      );

      // Backend user registration
      await axios.post("/auth/register", {
        email: emailData.email,
        password: data.password,
        name: emailData.name,
      });
      await sendEmailVerification(userCredential.user);

      toast.success("Verification email sent", {
        description: "Please check your inbox and verify your email.",
      });
    } catch (error) {
      console.error("Sign-up error:", error);
      if (error instanceof Error) {
        if (error.message.includes("auth/email-already-in-use")) {
          toast.error("Sign Up Failed", {
            description:
              "An account with this email already exists. Please use a different email or try logging in.",
          });
        } else {
          toast.error("Sign Up Error", {
            description: error.message,
          });
        }
      }
    }
  };

  const handleSignIn = async () => {
    try {
      const userCredentials = await signInWithGoogle();
      const idToken = await userCredentials.user.getIdToken();
      await axios.post("/auth/login", { idToken });
      router.push("/");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Sign In Error", {
        description: "An error occurred. Please try again.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="mb-4 w-full"
            onClick={handleSignIn}
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          {step === "initial" && (
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={emailForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={emailForm.control}
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

                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            </Form>
          )}

          {step === "password" && (
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-6"
              >
                <Button
                  onClick={() => setStep("initial")}
                  className="group relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-stone-300 bg-gradient-to-r from-white to-stone-200 font-medium text-neutral-700 transition-all duration-300 hover:w-32 dark:from-stone-800 dark:to-stone-700 dark:text-neutral-300"
                >
                  <div className="inline-flex whitespace-nowrap opacity-0 transition-all duration-200 group-hover:-translate-x-3 group-hover:opacity-100">
                    Back
                  </div>
                  <div className="absolute right-3.5">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                    >
                      <path
                        d="M6.85355 3.14645C6.65829 2.95118 6.34171 2.95118 6.14645 3.14645L2.14645 7.14645C1.95118 7.34171 1.95118 7.65829 2.14645 7.85355L6.14645 11.8536C6.34171 12.0488 6.65829 12.0488 6.85355 11.8536C7.04882 11.6583 7.04882 11.3417 6.85355 11.1464L3.70711 8H12.5C12.7761 8 13 7.77614 13 7.5C13 7.22386 12.7761 7 12.5 7H3.70711L6.85355 3.85355C7.04882 3.65829 7.04882 3.34171 6.85355 3.14645Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </Button>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    {emailData?.email}
                  </p>
                </div>

                <FormField
                  control={passwordForm.control}
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
                            onClick={() =>
                              setIsPasswordVisible((prev) => !prev)
                            }
                          >
                            {isPasswordVisible ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </Button>
                        </div>
                      </FormControl>

                      {/* Password strength indicator (reused from previous component) */}
                      <div
                        className="mb-4 mt-3 h-1 overflow-hidden rounded-full bg-border"
                        role="progressbar"
                        aria-valuenow={calculateStrength.score}
                        aria-valuemin={0}
                        aria-valuemax={4}
                      >
                        <div
                          className={`h-full ${
                            STRENGTH_CONFIG.colors[calculateStrength.score]
                          } transition-all duration-500`}
                          style={{
                            width: `${(calculateStrength.score / 5) * 100}%`,
                          }}
                        />
                      </div>

                      {/* Requirements list */}
                      <ul
                        className="space-y-1.5"
                        aria-label="Password requirements"
                      >
                        {calculateStrength.requirements.map((req, index) => (
                          <li
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            {req.met ? (
                              <Check size={16} className="text-emerald-500" />
                            ) : (
                              <X
                                size={16}
                                className="text-muted-foreground/80"
                              />
                            )}
                            <span
                              className={`text-xs ${
                                req.met
                                  ? "text-emerald-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {req.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={
                              isConfirmPasswordVisible ? "text" : "password"
                            }
                            placeholder="Confirm Password"
                            {...field}
                            className={`pr-10 ${
                              passwordForm.getFieldState("confirmPassword")
                                .error
                                ? "border-red-500"
                                : field.value && password === field.value
                                  ? "border-emerald-500"
                                  : ""
                            }`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() =>
                              setIsConfirmPasswordVisible((prev) => !prev)
                            }
                          >
                            {isConfirmPasswordVisible ? (
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

                <Button type="submit" className="w-full">
                  Sign Up
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <div className="mb-4 mt-2 text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </div>
      </Card>
    </div>
  );
};

export default SignUp;
