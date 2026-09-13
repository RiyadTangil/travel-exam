"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SharedModal } from "@/components/shared/shared-modal";
import { toast } from "sonner";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
}

export function ChangePasswordModal({ open, onOpenChange }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [showCurrentPw, setShowCurrentPw]     = useState(false);
  const [showNewPw, setShowNewPw]             = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [errors, setErrors]                   = useState<PasswordErrors>({});

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setShowCurrentPw(false);
    setShowNewPw(false);
    setErrors({});
    setLoading(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  /**
   * Client-side validation — mirrors server-side rules exactly so the
   * server is only hit when the payload is already valid.
   */
  const validate = (): boolean => {
    const next: PasswordErrors = {};

    if (!currentPassword.trim()) {
      next.currentPassword = "Current password is required";
    }

    if (!newPassword.trim()) {
      next.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      next.newPassword = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(newPassword)) {
      next.newPassword = "Must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(newPassword)) {
      next.newPassword = "Must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(newPassword)) {
      next.newPassword = "Must contain at least one number";
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      next.newPassword = "New password must differ from current password";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res  = await fetch("/api/auth/change-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        // fail() puts the payload under `error`; `message` is the top-level human string
        const field   = data?.error?.field;
        const message = data?.error?.message || data?.message || "Failed to change password";

        if (field === "currentPassword") {
          setErrors({ currentPassword: message });
        } else if (field === "newPassword") {
          setErrors({ newPassword: message });
        } else {
          toast.error(message);
        }
        return;
      }

      toast.success("Password changed! Signing you out for security…");
      resetForm();
      onOpenChange(false);

      // Mandatory re-login after password rotation
      setTimeout(() => signOut({ callbackUrl: "/auth/signin" }), 1500);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Password strength ────────────────────────────────────────────────
  const getStrength = (pw: string) => {
    if (!pw) return { label: "", color: "", width: "0%" };
    let score = 0;
    if (pw.length >= 8)              score++;
    if (pw.length >= 12)             score++;
    if (/[A-Z]/.test(pw))           score++;
    if (/[a-z]/.test(pw))           score++;
    if (/[0-9]/.test(pw))           score++;
    if (/[^A-Za-z0-9]/.test(pw))    score++;
    if (score <= 2) return { label: "Weak",   color: "bg-red-500",   width: "33%"  };
    if (score <= 4) return { label: "Medium", color: "bg-amber-500", width: "66%"  };
    return             { label: "Strong", color: "bg-green-500", width: "100%" };
  };
  const strength = getStrength(newPassword);

  return (
    <SharedModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Change Password"
      maxWidth="max-w-md"
      submitText="Update Password"
      cancelText="Cancel"
      onSubmit={handleSubmit}
      loading={loading}
    >
      {/* ── Modal icon + subtitle ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 border border-sky-200">
          <ShieldCheck className="h-5 w-5 text-sky-600" />
        </div>
        <p className="text-sm text-gray-500">
          Enter your current password and choose a strong new one.
        </p>
      </div>

      <div className="space-y-5">
        {/* Current Password */}
        <div className="space-y-2">
          <Label htmlFor="cp-current" className="text-sm font-medium text-gray-700">
            Current Password
          </Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              id="cp-current"
              type={showCurrentPw ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (errors.currentPassword) setErrors((p) => ({ ...p, currentPassword: undefined }));
              }}
              placeholder="Enter current password"
              className={`pl-10 pr-10 h-11 ${errors.currentPassword ? "border-red-300" : "border-gray-300"}`}
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPw(!showCurrentPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-xs text-red-600">{errors.currentPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="cp-new" className="text-sm font-medium text-gray-700">
            New Password
          </Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              id="cp-new"
              type={showNewPw ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: undefined }));
              }}
              placeholder="Enter new password"
              className={`pl-10 pr-10 h-11 ${errors.newPassword ? "border-red-300" : "border-gray-300"}`}
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNewPw(!showNewPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-600">{errors.newPassword}</p>
          )}

          {/* Strength indicator */}
          {newPassword && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Password strength</span>
                <span className={`text-xs font-medium ${
                  strength.label === "Weak"   ? "text-red-600"   :
                  strength.label === "Medium" ? "text-amber-600" : "text-green-600"
                }`}>
                  {strength.label}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <ul className="text-[11px] text-gray-400 space-y-0.5 mt-1">
                <li className={newPassword.length >= 8    ? "text-green-600" : ""}>• At least 8 characters</li>
                <li className={/[A-Z]/.test(newPassword)  ? "text-green-600" : ""}>• One uppercase letter</li>
                <li className={/[a-z]/.test(newPassword)  ? "text-green-600" : ""}>• One lowercase letter</li>
                <li className={/[0-9]/.test(newPassword)  ? "text-green-600" : ""}>• One number</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </SharedModal>
  );
}
