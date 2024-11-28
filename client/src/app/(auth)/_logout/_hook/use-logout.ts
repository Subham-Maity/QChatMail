"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import createAxiosInstance from "@/axios/axios";
import { auth } from "@/firebase/config/firebase-config";
import { useAuthStore } from "@/firebase/store/use-auth-store";

const axios = createAxiosInstance(0);

export function useLogoutFirebase(redirectTo: string) {
  const { clear } = useAuthStore();
  const router = useRouter();

  return useCallback(async () => {
    try {
      // Call the backend logout endpoint
      await axios.post("/auth/logout");

      // Sign out from Firebase
      await auth.signOut();

      // Clear the local auth state
      clear();

      // Use router.push for client-side navigation
      router.push(redirectTo);
    } catch (error) {
      console.error("Logout error:", error);
      // Handle any logout errors here
    }
  }, [clear, redirectTo, router]);
}
