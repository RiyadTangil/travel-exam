"use client";
import type React from "react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, ArrowRight, GraduationCap, Loader2 } from "lucide-react";

function SignInContent() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Redirect to appropriate dashboard if already authenticated (and session is valid)
  useEffect(() => {
    if (status === "authenticated" && session?.user && (session as any)?.error !== "UserDeletedOrInactive") {
      if (searchParams.get("callbackUrl")) {
        router.push(searchParams.get("callbackUrl") as string);
      } else if (session.user.userType === "PLATFORM") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [status, session, searchParams, router]);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E6F0F9] to-[#F0F7FD] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#005CC1]/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#4099D9]/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center gap-4 p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white">
          <div className="relative flex items-center justify-center w-14 h-14">
            <div className="w-14 h-14 rounded-full border-4 border-[#005CC1]/20 border-t-[#005CC1] animate-spin" />
            <Loader2 className="w-6 h-6 text-[#005CC1] animate-spin absolute" />
          </div>
          <p className="text-slate-600 font-semibold text-sm tracking-wider animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render form if already authenticated (and session is valid)
  if (status === "authenticated" && (session as any)?.error !== "UserDeletedOrInactive") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const cleanIdentifier = identifier.trim();
      const result = await signIn("credentials", {
        identifier: cleanIdentifier,
        email: cleanIdentifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        window.location.href = callbackUrl;
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F0F9] to-[#F0F7FD] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#005CC1]/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#4099D9]/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-md border border-white">
          <CardHeader className="text-center pb-2 pt-8">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#005CC1] to-sky-500 text-white shadow-lg shadow-blue-500/20">
              <GraduationCap className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight text-slate-900">
              Travel Exam
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1 font-medium">
              Candidate Examination & Agency Assessment Portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert className="border-red-200 bg-red-50 text-red-600">
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label
                  htmlFor="identifier"
                  className="text-sm font-semibold text-slate-700"
                >
                  Email, Passport Number, or Full Name
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#005CC1] transition-colors" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter email, passport no, or full name"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-12 h-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#005CC1] focus:ring-[#005CC1]/10 transition-all font-medium"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#005CC1] transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#005CC1] focus:ring-[#005CC1]/10 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#005CC1] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* <div className="flex items-center justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-slate-500 hover:text-[#005CC1] hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div> */}

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>
            {/* //todo: commented for now . will work on it later.  */}
            {/* <div className="text-center pt-2">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-bold text-[#005CC1] hover:underline transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div> */}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              className="text-slate-500 hover:text-[#005CC1] hover:underline transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-slate-500 hover:text-[#005CC1] hover:underline transition-colors"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading fallback for the Suspense boundary
function SignInFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInContent />
    </Suspense>
  );
}
