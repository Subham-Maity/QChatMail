"use client";
import React from "react";
import SignInButton from "@/components/auth/sign-in-button";

const SignInPage = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#171514] py-16">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <SignInButton />
      </div>
    </div>
  );
};

export default SignInPage;
