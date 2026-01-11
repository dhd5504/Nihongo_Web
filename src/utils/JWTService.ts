import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { env } from "~/env.mjs";

export interface JwtPayload {
  id: number;
  role: string;
  exp?: number;
}

export function getToken() {
  return Cookies.get("token");
}

export function removeToken() {
  Cookies.remove("token");
  Cookies.remove("uid");
}

export function isTokenExpired(token: string) {
  const decodedToken = jwtDecode<JwtPayload>(token);
  if (!decodedToken.exp) return false;
  const currentTime = Date.now() / 1000;
  return currentTime > decodedToken.exp;
}

export function isToken() {
  const token = Cookies.get("token");
  return !!token;
}

export function getUsernameByToken() {
  const token = Cookies.get("token");
  if (token) {
    return jwtDecode(token).sub as string;
  }
  return null;
}

export function getIdUserByToken() {
  const uid = Cookies.get("uid");
  if (uid) return Number(uid);

  const token = Cookies.get("token");
  if (!token) return null;

  const decodedToken = jwtDecode<JwtPayload>(token) as JwtPayload;
  return decodedToken.id;
}

export function logout(navigate: any) {
  fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/account/logout`, {
    method: "POST",
    credentials: "include",
  })
    .catch(() => {
      // ignore network errors, still clear client cookies
    })
    .finally(() => {
      Cookies.remove("token");
      Cookies.remove("uid");
      navigate("/");
    });
}

export function setToken(token: string) {
  // kept for backward compatibility; avoid using when HttpOnly cookie is set from server
  Cookies.set("token", token, { expires: 1, secure: true, sameSite: "Strict" });
}

export function manualParsedCoolies(cookies: string) {
  const parsedCookies: Record<string, string> = cookies
    .split("; ")
    .reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      if (!key) {
        return acc;
      }
      acc[key] = value ?? "";
      return acc;
    }, {} as Record<string, string>);
  return parsedCookies;
}
