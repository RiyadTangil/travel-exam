"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, Plane, Loader2, Mail } from "lucide-react"

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link")
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage("Your email has been verified successfully!")
        } else {
          setStatus("error")
          const errorMsg = data.error?.message || data.message || "Verification failed"
          setMessage(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg))
        }
      } catch (error) {
        setStatus("error")
        setMessage("Network error. Please try again.")
      }
    }

    verifyEmail()
  }, [token])

  const getBackgroundGradient = () => {
    switch (status) {
      case "loading":
        return "from-blue-900 via-indigo-900 to-purple-900"
      case "success":
        return "from-emerald-900 via-green-900 to-teal-900"
      case "error":
        return "from-red-900 via-rose-900 to-pink-900"
      default:
        return "from-blue-900 via-indigo-900 to-purple-900"
    }
  }

  const getIconColor = () => {
    switch (status) {
      case "loading":
        return "from-blue-500 to-indigo-500"
      case "success":
        return "from-emerald-500 to-green-500"
      case "error":
        return "from-red-500 to-rose-500"
      default:
        return "from-blue-500 to-indigo-500"
    }
  }

  const getButtonColor = () => {
    switch (status) {
      case "success":
        return "from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
      case "error":
        return "from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
      default:
        return "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
    }
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} flex items-center justify-center p-4 relative overflow-hidden`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-2xl">
            <Plane className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Email Verification</h1>
        </div>

        <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="pt-8">
            <div className="text-center">
              {status === "loading" && (
                <>
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${getIconColor()} rounded-2xl mb-6 shadow-2xl`}
                  >
                    <Loader2 className="h-10 w-10 text-white animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Verifying your email...</h2>
                  <p className="text-gray-300 text-lg">Please wait while we verify your email address.</p>
                </>
              )}

              {status === "success" && (
                <>
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${getIconColor()} rounded-2xl mb-6 shadow-2xl`}
                  >
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Email Verified!</h2>
                  <p className="text-gray-300 mb-8 text-lg leading-relaxed">{message}</p>
                  <Button
                    onClick={() => router.push("/auth/signin")}
                    className={`w-full h-14 bg-gradient-to-r ${getButtonColor()} text-white font-semibold text-base shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}
                  >
                    Continue to Sign In
                  </Button>
                </>
              )}

              {status === "error" && (
                <>
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${getIconColor()} rounded-2xl mb-6 shadow-2xl`}
                  >
                    <XCircle className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Verification Failed</h2>
                  <p className="text-gray-300 mb-8 text-lg leading-relaxed">{message}</p>
                  <div className="space-y-4">
                    <Button
                      onClick={() => router.push("/auth/signup")}
                      className={`w-full h-14 bg-gradient-to-r ${getButtonColor()} text-white font-semibold text-base shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Try Signing Up Again
                    </Button>
                    <Link
                      href="/auth/signin"
                      className="block w-full text-center text-sm text-gray-300 hover:text-white hover:underline transition-colors"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
