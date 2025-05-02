// Constants
import { getTokensInfo } from "@/app/auth/_services/auth-tokens-info";
const tokensInfo = getTokensInfo();

export const TOKEN_KEY = "accessToken";
export const CACHE_EXPIRY = tokensInfo?.tokenExpires;
export const API_URL = process.env.NEXT_PUBLIC_URL_API;
