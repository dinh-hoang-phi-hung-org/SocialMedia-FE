import Cookies from "js-cookie";
import { Tokens } from "@/shared/types/common-type/auth-type";

export function getTokensInfo() {
  const refreshToken = Cookies.get("refreshToken");
  const accessToken = Cookies.get("accessToken");
  const tokenExpires = Cookies.get("tokenExpires");
  return { refreshToken, accessToken, tokenExpires };
}

export function setTokensInfo(tokens: Tokens) {
  if (tokens) {
    Cookies.set("refreshToken", tokens.refreshToken);
    Cookies.set("accessToken", tokens.accessToken);
    Cookies.set("tokenExpires", tokens.tokenExpires.toString());
  } else {
    Cookies.remove("refreshToken");
    Cookies.remove("accessToken");
    Cookies.remove("tokenExpires");
  }
}

export function clearTokens() {
  Cookies.remove("refreshToken");
  Cookies.remove("accessToken");
  Cookies.remove("tokenExpires");
}
