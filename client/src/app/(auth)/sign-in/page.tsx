"use client";
import React from "react";
import SignInButton from "@/components/auth/button/task/sign-in-button";

const SignInPage = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-[#171514] w-full min-h-screen py-16">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <SignInButton />
      </div>
    </div>
  );
};

export default SignInPage;
