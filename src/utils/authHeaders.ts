import Cookies from "js-cookie";

/**
 * Get Authorization headers for API requests
 * Works in both browser and server-side contexts
 * @param token - Optional token to use (for SSR contexts)
 */
export function getAuthHeaders(token?: string): Record<string, string> {
    // If token is provided directly (SSR context), use it
    if (token) {
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    // Try to get token from cookies (browser context)
    if (typeof window !== "undefined") {
        const cookieToken = Cookies.get("token");
        if (cookieToken) {
            return {
                Authorization: `Bearer ${cookieToken}`,
            };
        }
    }

    return {};
}

/**
 * Get token from cookies (browser only)
 */
export function getToken(): string | undefined {
    if (typeof window !== "undefined") {
        return Cookies.get("token");
    }
    return undefined;
}
