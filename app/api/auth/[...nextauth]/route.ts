import { MONGODB_DB_NAME } from "@/lib/database-config"
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb";
import { authorizeUser } from "@/services/authService";
import { ObjectId } from "mongodb";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

if (!NEXTAUTH_SECRET) {
  throw new Error("Please define the NEXTAUTH_SECRET environment variable inside .env.local");
}

// Simple in-memory cache to reduce MongoDB queries in callbacks
// Uses a 5-minute Time-To-Live (TTL)
const callbackCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;
// const CACHE_TTL_MS = 5 * 60 * 1000;


function getCachedData(key: string) {
  const item = callbackCache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data;
  }
  if (item) callbackCache.delete(key);
  return null;
}

function setCachedData(key: string, data: any) {
  callbackCache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
}

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email, Passport or Name", type: "text" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;
        const ip = req?.headers?.["x-forwarded-for"] || "unknown";
        return await authorizeUser(credentials, ip as string);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: { token: any; user?: any, trigger?: string, session?: any }) {
      // Handle session updates (e.g., when profile changes)
      if (trigger === "update" && session) {
        if (session.user?.companyName !== undefined) {
          token.companyName = session.user.companyName;
        }
        if (session.user?.companyLogoUrl !== undefined) {
          token.companyLogoUrl = session.user.companyLogoUrl;
        }
      }

      // Add role, userType, companyId, and candidate info to token when signing in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.userType = user.userType;
        token.passportNumber = (user as any).passportNumber;
        token.targetCountry = (user as any).targetCountry;
        token.trade = (user as any).trade;
        token.examStatus = (user as any).examStatus;
        token.roleId = user.roleId;
        token.companyId = user.companyId;
        token.companyName = user.companyName;
        token.companyLogoUrl = (user as any).companyLogoUrl;
        token.subscriptionEndDate = (user as any).subscriptionEndDate;
        token.companyStatus = (user as any).companyStatus;
      }

      if (token.id) {
        try {
          const cacheKey = `user_status_${token.id}`;
          let dbUserStatus = getCachedData(cacheKey);

          if (!dbUserStatus) {
            const client = await clientPromise;
            const db = client.db(MONGODB_DB_NAME);
            const users = db.collection("users");
            const dbUser = await users.findOne({ _id: new ObjectId(token.id) });
            dbUserStatus = dbUser?.status || null;

            // Cache the status to avoid querying on every JWT generation
            setCachedData(cacheKey, dbUserStatus);
          }

          if (!dbUserStatus || dbUserStatus === "inactive") {
            token.isInvalid = true;
          }
        } catch (error) {
          console.error("JWT sync error:", error);
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token?.isInvalid) {
        session.error = "UserDeletedOrInactive";
        return session;
      }
      if (token && session.user) {
        session.user.id = token.id || token.sub;
        session.user.role = token.role;
        session.user.userType = token.userType;
        session.user.passportNumber = token.passportNumber;
        session.user.targetCountry = token.targetCountry;
        session.user.trade = token.trade;
        session.user.examStatus = token.examStatus;
        session.user.roleId = token.roleId;
        session.user.companyId = token.companyId;
        session.user.companyName = token.companyName;
        session.user.companyLogoUrl = token.companyLogoUrl;
        session.user.subscriptionEndDate = token.subscriptionEndDate as string;
        session.user.companyStatus = token.companyStatus as string;

        // Fetch permissions from DB to avoid inflating the JWT cookie size
        if (token.roleId) {
          try {
            const cacheKey = `role_permissions_${token.roleId}`;
            let permissions = getCachedData(cacheKey);

            if (!permissions) {
              const client = await clientPromise;
              const db = client.db(MONGODB_DB_NAME);
              const roles = db.collection("roles");
              const roleData = await roles.findOne({ _id: new ObjectId(token.roleId) });
              permissions = roleData?.permissions || [];

              // Cache permissions
              setCachedData(cacheKey, permissions);
            }

            session.user.permissions = permissions;
          } catch (error) {
            console.error("Session permissions fetch error:", error);
            session.user.permissions = [];
          }
        } else {
          session.user.permissions = [];
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days validation of jwt token

  },
  debug: process.env.NODE_ENV === "development",
  secret: NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 