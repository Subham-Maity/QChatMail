"use client";
import { useEffect } from "react";
import { useQuery } from "react-query";

import { auth } from "@/firebase/config/firebase-config";
import createAxiosInstance from "@/axios/axios";
import { useAuthStore, type User } from "@/firebase/store/use-auth-store";

const axios = createAxiosInstance(0);

async function fetchUser() {
  const response = await axios.get("/auth/me");
  return response.data;
}

export function useSession() {
  const { user, status, setUser, setStatus } = useAuthStore();

  const { data, error, isLoading, refetch } = useQuery<User, Error>(
    "user",
    fetchUser,
    {
      enabled: false,
      retry: false,
    },
  );

  // Rest of the code stays the same
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await refetch();
        } catch (error) {
          console.error("Error during session check:", error);
          setUser(null);
          setStatus("unauthenticated");
        }
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    });

    return () => unsubscribe();
  }, [setUser, setStatus, refetch]);

  useEffect(() => {
    if (isLoading) {
      setStatus("loading");
    } else if (error) {
      setUser(null);
      setStatus("unauthenticated");
    } else if (data) {
      setUser(data);
      setStatus("authenticated");
    }
  }, [data, error, isLoading, setUser, setStatus]);

  return { user, status };
}
