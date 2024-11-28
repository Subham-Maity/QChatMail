"use client";
import React from "react";
import { useLogoutFirebase } from "@/app/(auth)/_logout/_hook/use-logout";
import { Button } from "@/components/ui/button";

const Logout = () => {
  const logout = useLogoutFirebase("/home");
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return <Button onClick={handleLogout}>Logout</Button>;
};

export default Logout;
