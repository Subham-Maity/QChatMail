"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import createAxiosInstance from "@/axios/axios";

const axios = createAxiosInstance(0);

const AurinkoAuthButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAurinkoAuth = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/aurinko/auth-url", {
        params: { serviceType: "Google" },
      });
      window.location.href = response.data;
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleAurinkoAuth} disabled={isLoading} variant="outline">
      {isLoading ? "Preparing Authentication..." : "Connect Google Account"}
    </Button>
  );
};

export default AurinkoAuthButton;
