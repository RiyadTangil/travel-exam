"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Settings, KeyRound, LogOut, Building2, GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutConfirmationDialog } from "@/components/shared/logout-confirmation-dialog";
import { ChangePasswordModal } from "@/components/shared/change-password-modal";

export function DashboardHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const isCandidate = session?.user?.role === "CANDIDATE";
  const userName = session?.user?.name || (isCandidate ? "Candidate Student" : "User");
  const passportNumber = (session?.user as any)?.passportNumber;
  const companyName = session?.user?.companyName || "My Company";
  const companyLogoUrl = session?.user?.companyLogoUrl || "";

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w.charAt(0)).join("").toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await signOut({ redirect: false });
    window.location.href = "/auth/signin";
  };

  return (
    <>
      <div className="flex w-full min-w-0 max-w-full items-center justify-between gap-2 border-b border-gray-200 bg-white p-2 sm:gap-3 sm:p-4">
        <div className="flex-1" />

        {/* Right: Profile Avatar Dropdown */}
        <div className="flex shrink-0 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 shrink-0 rounded-full p-0 sm:h-10 sm:w-10 ring-2 ring-sky-200 hover:ring-sky-300 transition-all"
                id="header-profile-trigger"
              >
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                  {!isCandidate && companyLogoUrl && (
                    <AvatarImage
                      src={companyLogoUrl}
                      alt={companyName}
                      className="object-contain"
                    />
                  )}
                  <AvatarFallback className="bg-sky-100 text-sky-700 text-xs sm:text-sm font-semibold">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-64 rounded-xl border border-gray-200 bg-white p-0 shadow-xl"
            >
              {/* Header inside dropdown */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-sky-50 to-blue-50 rounded-t-xl">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 border border-sky-200 overflow-hidden">
                  {isCandidate ? (
                    <GraduationCap className="h-5 w-5 text-[#005CC1]" />
                  ) : companyLogoUrl ? (
                    <img
                      src={companyLogoUrl}
                      alt={companyName}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Building2 className="h-5 w-5 text-sky-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {isCandidate ? (
                    <>
                      <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                      <p className="text-xs text-[#005CC1] font-medium truncate">
                        {passportNumber ? `পাসপোর্ট: ${passportNumber}` : "পরীক্ষার্থী / Candidate"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-900 truncate">{companyName}</p>
                      <p className="text-xs text-gray-500 truncate">{userName}</p>
                    </>
                  )}
                </div>
              </div>

              <DropdownMenuSeparator className="m-0" />

              {/* Menu Items */}
              <div className="p-1.5">
                {isCandidate ? (
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/profile")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                    id="header-profile-settings"
                  >
                    <User className="h-4 w-4 text-[#005CC1]" />
                    <span className="text-sm font-medium">আমার প্রোফাইল / My Profile</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/profile")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                    id="header-profile-settings"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-sm font-medium">Profile Settings</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() => setShowChangePassword(true)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                  id="header-change-password"
                >
                  <KeyRound className="h-4 w-4" />
                  <span className="text-sm font-medium">Change Password</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                  id="header-logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={handleLogout}
      />
    </>
  );
}
