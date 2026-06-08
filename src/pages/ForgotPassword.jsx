import React from "react";
import { Link } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPassword() {
  return (
    <AuthLayout
      icon={KeyRound}
      title="Reset your password"
      subtitle="Use Clerk's secure password reset from the login screen"
    >
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Click below, enter your email, then choose the password reset option.
        </p>
        <Link to="/login">
          <Button className="w-full h-12">Go to Login</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
