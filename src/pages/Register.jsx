import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignUp } from "@clerk/clerk-react";
import { CheckCircle2, Loader2, Lock, Mail, ShieldCheck, UserPlus } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Register() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (err, fallback) => {
    return err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || fallback;
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      setError(getErrorMessage(err, "Could not create your account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/onboarding");
        return;
      }
      setError("Verification is not complete yet. Please check the code and try again.");
    } catch (err) {
      setError(getErrorMessage(err, "Invalid verification code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={pendingVerification ? ShieldCheck : UserPlus}
      title={pendingVerification ? "Check your email" : "Create your account"}
      subtitle={pendingVerification ? `Enter the verification code sent to ${email}` : "Join TrustHaul Freight today"}
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {pendingVerification ? (
        <form onSubmit={handleVerifyEmail} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <div className="relative">
              <CheckCircle2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-12 pl-10"
                required
              />
            </div>
          </div>
          <Button type="submit" className="h-12 w-full font-medium" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : "Verify email"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-full"
            onClick={() => setPendingVerification(false)}
            disabled={loading}
          >
            Use a different email
          </Button>
        </form>
      ) : (
        <form onSubmit={handleCreateAccount} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pl-10"
                required
              />
            </div>
          </div>
          <Button type="submit" className="h-12 w-full font-medium" disabled={loading || !isLoaded}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : "Create account"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
