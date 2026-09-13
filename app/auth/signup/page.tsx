"use client"

import type React from "react"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, User, ArrowRight, CheckCircle, Sparkles, MapPin, Lock, Building, Eye, EyeOff } from "lucide-react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    companyAddress: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [logoClickCount, setLogoClickCount] = useState(0)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    // Create form data for submission
    const submitData = new FormData()
    submitData.append("name", formData.name)
    submitData.append("email", formData.email)
    submitData.append("password", formData.password)
    submitData.append("companyName", formData.companyName)
    submitData.append("companyAddress", formData.companyAddress)
    // Send same email for company as well
    submitData.append("companyEmail", formData.email)
    submitData.append("companyMobile", "0000000000") // Default mobile if not provided

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: submitData,
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        const errorMsg = data.error?.message || data.message || "An error occurred"
        setError(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg))
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E6F0F9] to-[#F0F7FD] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#005CC1]/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#4099D9]/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-md border border-white">
            <CardContent className="pt-8 px-8 pb-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-[#005CC1]/10 rounded-2xl mb-6 shadow-xl backdrop-blur-sm">
                  <Mail className="h-10 w-10 text-[#005CC1]" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Check Your Email</h1>
                <p className="text-slate-600 mb-6 text-base leading-relaxed">
                  Welcome to <strong className="text-[#005CC1] font-extrabold">Travel_Hisab</strong>. 
                  Your account has been created successfully. We've sent a verification link to:
                </p>
                <div className="bg-slate-100/80 border border-slate-200/50 rounded-lg p-3 mb-6 inline-block w-full">
                  <span className="text-slate-800 font-semibold break-all">{formData.email}</span>
                </div>
                <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 mb-8 text-left">
                  <p className="text-amber-800 text-sm leading-relaxed font-medium">
                    ⚠️ Please verify your email before trying to sign in. You won't be able to log in to the dashboard until your account is verified.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/auth/signin")}
                  className="w-full h-12 bg-gradient-to-r from-[#005CC1] to-[#4099D9] text-white hover:opacity-90 font-bold text-base shadow-lg transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Go to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F0F9] to-[#F0F7FD] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#005CC1]/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#4099D9]/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10 my-8">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-md border border-white">
          <CardHeader className="pb-2 pt-8">
            <div 
              className="relative w-full h-32 mb-2 cursor-pointer"
              onClick={() => setLogoClickCount(prev => prev + 1)}
            >
              <Image
                src="/main_log_bgremoved.png"
                alt="Travel_Hisab Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50 text-red-600">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                  Full Name
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#005CC1] transition-colors" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-12 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#005CC1] focus:ring-[#005CC1]/10 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#005CC1] transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-12 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#005CC1] focus:ring-[#005CC1]/10 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="companyName" className="text-sm font-semibold text-slate-700">
                  Agency Name
                </Label>
                <div className="relative group">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#005CC1] transition-colors" />
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Enter agency name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="pl-12 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#005CC1] focus:ring-[#005CC1]/10 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="companyAddress" className="text-sm font-semibold text-slate-700">
                  Agency Address
                </Label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#005CC1] transition-colors" />
                  <Input
                    id="companyAddress"
                    type="text"
                    placeholder="Enter agency address"
                    value={formData.companyAddress}
                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                    className="pl-12 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#005CC1] focus:ring-[#005CC1]/10 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#005CC1] transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-12 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#005CC1] focus:ring-[#005CC1]/10 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#005CC1] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                    Confirm
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#005CC1] transition-colors" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-12 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#005CC1] focus:ring-[#005CC1]/10 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#005CC1] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {logoClickCount >= 10 && (
                <Button
                  type="submit"
                  className="w-full h-12 mt-2 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Sign Up
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  )}
                </Button>
              )}

              <div className="text-center pt-2">
                <p className="text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="font-bold text-[#005CC1] hover:underline transition-colors">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
