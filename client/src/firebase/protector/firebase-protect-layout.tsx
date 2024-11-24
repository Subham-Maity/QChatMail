"use client";
import React from "react";

import { useRouter } from "next/navigation";

import { useSession } from "@/firebase/session/use-session";
import Loader from "@/firebase/loader/loader";

interface FirebaseAuthProtectorProps {
  children: React.ReactNode;
}

export function FirebaseAuthProtector({
  children,
}: FirebaseAuthProtectorProps) {
  const { status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <Loader />;
  }

  if (status === "unauthenticated") {
    console.log(status + "status");
    router.push("/sign-in");
    return null;
  }

  return <>{children}</>;
}
