import React from "react";
import { Link } from "react-router-dom";
import { SignUp } from "@clerk/clerk-react";
import { UserPlus } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { clerkAppearance } from "@/lib/clerkAppearance";

export default function Register() {
  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Join TrustHaul Freight today"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SignUp
        routing="path"
        path="/register"
        signInUrl="/login"
        fallbackRedirectUrl="/onboarding"
        appearance={clerkAppearance}
      />
    </AuthLayout>
  );
}
