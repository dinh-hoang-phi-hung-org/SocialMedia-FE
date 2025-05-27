import axios from "axios";
import type { JwtPayload, RefreshResponse } from "@/shared/types/common-type/auth-type";
import type { AuthResponse } from "@/shared/types/common-type/shared-types";
import { TOKEN_KEY, API_URL } from "@/shared/constants/auth.constant";
import Cookies from "js-cookie";

// Cache for auth state to prevent redundant API calls
let CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// eslint-disable-next-line
let authCache: { lastCheck: number; isAuthenticated: boolean } | null = null;

export const authProvider = {
  /**
   * Check if user is authenticated
   * Optimized with caching to reduce API calls
   */
  checkUser: async (): Promise<AuthResponse> => {
    if (typeof window === "undefined") {
      return { path: "/auth", message: "common:message.login-required" };
    }

    const accessToken = Cookies.get("accessToken");
    const refreshToken = Cookies.get("refreshToken");

    if (!accessToken || !refreshToken) {
      return { path: "/auth", message: "common:message.login-required" };
    }

    if (authProvider.isTokenExpired(accessToken)) {
      // try {
      // const refreshResponse = await authProvider.resetAccessToken();
      // if (refreshResponse.path === "/auth") {
      //   await authProvider.logout();
      //   return { path: "/auth", message: "common:message.session-expired" };
      // }
      await authProvider.logout();
      return { path: "/auth", message: "common:message.session-expired" };
      // } catch (error) {
      //   await authProvider.logout();
      //   return { path: "/auth", message: "common:message.session-expired" };
      // }
    }
    return { path: "/", message: "common:message.already-login" };
  },

  checkAdmin: async (): Promise<AuthResponse> => {
    if (typeof window === "undefined") {
      return { path: "/auth", message: "common:message.login-required" };
    }

    const accessToken = Cookies.get("accessToken");
    const refreshToken = Cookies.get("refreshToken");

    if (!accessToken || !refreshToken) {
      return { path: "/auth", message: "common:message.login-required" };
    }

    if (authProvider.isTokenExpired(accessToken)) {
      // try {
      // const refreshResponse = await authProvider.resetAccessToken();
      // if (refreshResponse.path === "/auth") {
      //   await authProvider.logout();
      //   return { path: "/auth", message: "common:message.session-expired" };
      // }
      await authProvider.logout();
      return { path: "/auth", message: "common:message.session-expired" };
      // } catch (error) {
      //   await authProvider.logout();
      //   return { path: "/auth", message: "common:message.session-expired" };
      // }
    }
    if (authProvider.getRole() !== "admin") {
      return { path: "/", message: "common:message.not-admin" };
    }
    return { path: "/admin", message: "common:message.already-login" };
  },

  /**
   * Decode JWT token
   * Extracted to separate method for better error handling
   */
  decodeToken: (token: string): JwtPayload => {
    try {
      // JWT token has format: header.payload.signature
      // We only need the payload part (second part)
      const base64Url = token.split(".")[1];
      if (!base64Url) {
        throw new Error("Invalid token format");
      }

      // Convert base64url to regular base64
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

      // Decode base64 to get JWT payload as JSON string
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );

      // Parse JSON string to object
      return JSON.parse(jsonPayload) as JwtPayload;
    } catch (error) {
      console.error("Error decoding token:", error);
      return {} as JwtPayload;
    }
  },

  /**
   * Reset access token using refresh token
   * Updated to use HTTP-only cookies instead of Authorization header
   */
  resetAccessToken: async (): Promise<AuthResponse> => {
    try {
      const response = await axios.post<RefreshResponse>(
        `${API_URL}/api/v1/auth/refresh`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          timeout: 5000,
        },
      );

      if (!response.data?.payload?.accessToken || response.data?.payload?.accessToken === "") {
        authCache = null;
        return { path: "/auth", message: "common:message.session-expired" };
      }

      const newToken = response.data?.payload?.accessToken;

      if (!newToken) {
        throw new Error("No token in response");
      }

      authProvider.setToken(newToken, CACHE_EXPIRY);

      return { path: "", message: "", token: newToken };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Clear cache on error
      authCache = null;
      return authProvider.clearTokens();
    }
  },

  /**
   * Check if a token is expired
   * @param token The JWT token to check
   * @returns true if token is expired or invalid, false otherwise
   */
  isTokenExpired: (token: string): boolean => {
    if (!token) return true;

    try {
      const decodedToken = authProvider.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds]

      // Token is expired if exp is in the past
      return decodedToken.exp !== undefined && decodedToken.exp < currentTime;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      // If we can't decode the token, consider it expired
      return true;
    }
  },

  /**
   * Set token in localStorage
   * Added validation
   */
  setToken: (token: string, tokenExpires?: number): void => {
    if (typeof window !== "undefined" && token) {
      try {
        localStorage.setItem(TOKEN_KEY, token);
        if (tokenExpires) {
          CACHE_EXPIRY = tokenExpires;
        }
        authCache = {
          lastCheck: Date.now(),
          isAuthenticated: true,
        };
      } catch (error) {
        console.error("Failed to set token in localStorage:", error);
      }
    }
  },

  /**
   * Get token from localStorage
   * No changes needed, already optimized
   */
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getUsername: (): string | null => {
    if (typeof window === "undefined") return null;
    const token = authProvider.getToken();
    if (!token) return null;

    const decodedToken = authProvider.decodeToken(token);
    const username = decodedToken.username;
    return username || null;
  },

  getUserUuid: (): string | null => {
    if (typeof window === "undefined") return null;
    const token = authProvider.getToken();
    if (!token) return null;

    const decodedToken = authProvider.decodeToken(token);
    const userUuid = decodedToken.uuid;
    return userUuid || null;
  },

  getRole: (): string | null => {
    if (typeof window === "undefined") return null;
    const token = authProvider.getToken();
    if (!token) return null;

    const decodedToken = authProvider.decodeToken(token);
    const role = decodedToken.role;
    return role || null;
  },

  /**
   * Clear tokens and return auth response
   */
  clearTokens: (): AuthResponse => {
    if (typeof window !== "undefined") {
      // Xóa token từ localStorage
      localStorage.removeItem(TOKEN_KEY);

      // Xóa cookies
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      Cookies.remove("tokenExpires");

      // Clear cache
      authCache = null;
      return { path: "/auth", message: "common:message.session-expired" };
    }
    return { path: "", message: "" };
  },

  /**
   * Logout user
   * Added error handling
   */
  logout: async (): Promise<void> => {
    // try {
    //   // Clear tokens first to prevent using expired tokens
    //   await TypeTransfer["Auth"].otherAPIs?.logout();
    // } catch (error) {
    //   console.error("Logout API call failed:", error);
    // } finally {
    //   // Always clear local tokens and cache
    authProvider.clearTokens();
    authCache = null;
    // }
  },

  /**
   * Invalidate auth cache
   * New method to force refresh when needed
   */
  invalidateCache: (): void => {
    authCache = null;
  },
};
