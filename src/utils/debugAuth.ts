// Debug utility to check if JWT token exists
import Cookies from "js-cookie";

export function debugAuth() {
    const token = Cookies.get("token");
    const uid = Cookies.get("uid");

    console.log("=== Auth Debug ===");
    console.log("Token exists:", !!token);
    console.log("Token value:", token ? `${token.substring(0, 20)}...` : "null");
    console.log("User ID:", uid);
    console.log("================");

    return { hasToken: !!token, uid };
}
