"use client";
import React, { useEffect, useState } from "react";
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
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" && !isRedirecting) {
      setIsRedirecting(true);
      router.push("/login");
    }
  }, [status, router, isRedirecting]);

  if (status === "loading" || isRedirecting) {
    return <Loader />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
