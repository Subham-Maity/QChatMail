import React from "react";
import { FirebaseAuthProtector } from "@/firebase/protector/firebase-protect-layout";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FirebaseAuthProtector>{children}</FirebaseAuthProtector>;
}
