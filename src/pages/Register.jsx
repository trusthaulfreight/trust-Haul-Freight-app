import React from "react";
import { Link } from "react-router-dom";
import { SignUp } from "@clerk/clerk-react";
import { UserPlus } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    card: "w-full shadow-none border-0 p-0 bg-transparent",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton: "hidden",
    dividerRow: "hidden",
    footer: "hidden",
    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
  },
};

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
