import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      userType: "PLATFORM" | "TENANT";
      roleId?: string;
      permissions?: string[];
      companyId: string;
      companyName?: string;
      companyLogoUrl?: string;
      subscriptionEndDate?: string;
      companyStatus?: string;
      image?: string;
    };
    error?: string;
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    userType: "PLATFORM" | "TENANT";
    roleId?: string;
    permissions?: string[];
    companyId?: string;
    companyName?: string;
    companyLogoUrl?: string;
    subscriptionEndDate?: string;
    companyStatus?: string;
    image?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    sub: string;
    name: string;
    email: string;
    role: string;
    userType: "PLATFORM" | "TENANT";
    roleId?: string;
    companyId?: string;
    companyName?: string;
    companyLogoUrl?: string;
    subscriptionEndDate?: string;
    companyStatus?: string;
    picture?: string;
    isInvalid?: boolean;
  }
}