"use client";

import { TwoFactorSetup } from "@/components/two-factor-setup";
import { useRouter } from "next/navigation";

export default function SetupTwoFactorPage() {
  const router = useRouter();

  return (
    <div className="container max-w-md py-12 mx-auto">
      <h1 className="mb-6 text-2xl font-bold text-center">
        Secure Your Account
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
        Setting up two-factor authentication adds an extra layer of security to
        your account
      </p>

      <TwoFactorSetup
        onComplete={() => router.push("/dashboard")}
        isRequired={true}
      />
    </div>
  );
}
