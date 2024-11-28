import React from "react";
import Logout from "@/app/(auth)/_logout/logout";
import { FirebaseAuthProtector } from "@/firebase/protector/firebase-protect-layout";

const Page = () => {
  return (
    <FirebaseAuthProtector>
      <div>
        Hello World!
        <Logout />
      </div>
    </FirebaseAuthProtector>
  );
};

export default Page;
