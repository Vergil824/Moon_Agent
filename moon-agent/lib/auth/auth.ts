import type { NextAuthOptions, DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      mobile: string;
    } & DefaultSession["user"];
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    error?: "RefreshTokenError" | "RefreshAccessTokenError";
  }

  interface User {
    id: string;
    mobile: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    mobile: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    error?: "RefreshTokenError" | "RefreshAccessTokenError";
  }
}

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:48080";

// Types for backend response
type AuthTokens = {
  userId: number;
  accessToken: string;
  refreshToken: string;
  expiresTime: number; // Timestamp in milliseconds
};

type ApiResponse<T> = {
  code: number;
  msg: string;
  data: T;
};

// Refresh access token using refresh token
async function refreshAccessToken(refreshToken: string): Promise<AuthTokens | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/app-api/member/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "tenant-id": "1",
        Authorization: `Bearer ${refreshToken}`,
        // For backends that only read HttpOnly cookie, also send a Cookie header manually.
        Cookie: `refreshToken=${refreshToken}`
      },
      // Some backends expect refreshToken in HttpOnly cookie; include browser cookies if available.
      credentials: "include",
      // Also send refreshToken in body for backends that accept JSON payload.
      body: JSON.stringify({ refreshToken })
    });

    const result: ApiResponse<AuthTokens> = await response.json();

    if (result.code === 0 && result.data) {
      return result.data;
    }

    console.error("Token refresh failed:", result.msg);
    return null;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "password",
      name: "Password",
      credentials: {
        mobile: { label: "Mobile", type: "tel" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.mobile || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/app-api/member/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "tenant-id": "1"
            },
            body: JSON.stringify({
              mobile: credentials.mobile,
              password: credentials.password
            })
          });

          const result: ApiResponse<AuthTokens> = await response.json();

          if (result.code === 0 && result.data) {
            // Return user object with tokens
            return {
              id: String(result.data.userId),
              mobile: credentials.mobile,
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
              expiresAt: result.data.expiresTime
            };
          }

          // Return null for failed authentication
          console.error("Login failed:", result.msg);
          return null;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      }
    }),
    CredentialsProvider({
      id: "sms",
      name: "SMS",
      credentials: {
        mobile: { label: "Mobile", type: "tel" },
        code: { label: "Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.mobile || !credentials?.code) {
          return null;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/app-api/member/auth/sms-login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "tenant-id": "1"
            },
            body: JSON.stringify({
              mobile: credentials.mobile,
              code: credentials.code
            })
          });

          const result: ApiResponse<AuthTokens> = await response.json();

          if (result.code === 0 && result.data) {
            return {
              id: String(result.data.userId),
              mobile: credentials.mobile,
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
              expiresAt: result.data.expiresTime
            };
          }

          console.error("SMS Login failed:", result.msg);
          return null;
        } catch (error) {
          console.error("SMS Login error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      const currentToken = token as JWT;
      // Initial sign in
      if (user) {
        return {
          ...currentToken,
          id: user.id,
          mobile: user.mobile,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiresAt: user.expiresAt,
          error: undefined
        };
      }

      const expiresAt =
        typeof currentToken.expiresAt === "string"
          ? Number(currentToken.expiresAt)
          : currentToken.expiresAt;

      // If expiresAt is missing or invalid, avoid forced refresh and just return token
      if (!expiresAt || Number.isNaN(expiresAt)) {
        return { ...currentToken, error: undefined };
      }

      // Return previous token if the access token has not expired yet
      // Add 60 second buffer before actual expiration
      if (Date.now() < expiresAt - 60000) {
        return { ...currentToken, error: undefined };
      }

      // Access token has expired or about to expire, try to refresh it
      const refreshedTokens = await refreshAccessToken(currentToken.refreshToken);

      if (refreshedTokens) {
        return {
          ...currentToken,
          accessToken: refreshedTokens.accessToken,
          refreshToken: refreshedTokens.refreshToken,
          expiresAt: refreshedTokens.expiresTime,
          error: undefined
        };
      }

      // Refresh failed: mark explicit error so front-end can sign out
      return {
        ...currentToken,
        error: "RefreshAccessTokenError" as const
      };
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.mobile = token.mobile;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      session.error = token.error;
      return session;
    }
  },
  pages: {
    signIn: "/welcome",
    error: "/welcome"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  }
};

// Helper function to get session on server side
export async function getAuth() {
  return await getServerSession(authOptions);
}
