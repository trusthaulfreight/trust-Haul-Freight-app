import React from "react";
import { Link } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";
import { LogIn } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { clerkAppearance } from "@/lib/clerkAppearance";

export default function Login() {
  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your TrustHaul account"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/register"
        fallbackRedirectUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </AuthLayout>
  );
}
