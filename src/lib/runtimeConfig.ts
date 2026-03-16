import { Capacitor } from "@capacitor/core";

const API_BASE_URL_KEY = "astra_api_base_url";

function normalizeApiBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function getStoredApiBaseUrl() {
  return normalizeApiBaseUrl(localStorage.getItem(API_BASE_URL_KEY) ?? "");
}

export function setStoredApiBaseUrl(value: string) {
  const normalized = normalizeApiBaseUrl(value);
  if (normalized) {
    localStorage.setItem(API_BASE_URL_KEY, normalized);
  } else {
    localStorage.removeItem(API_BASE_URL_KEY);
  }
}

export function getApiBaseUrl() {
  const stored = getStoredApiBaseUrl();
  if (stored) {
    return stored;
  }

  const envUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL?.trim() ?? "");
  if (envUrl && !(Capacitor.isNativePlatform() && /localhost|127\.0\.0\.1/i.test(envUrl))) {
    return envUrl;
  }

  if (typeof window !== "undefined" && window.location.protocol.startsWith("http")) {
    return "/api";
  }

  if (Capacitor.isNativePlatform()) {
    return "";
  }

  return "/api";
}

export function getDefaultApiHint() {
  if (typeof window !== "undefined" && window.location.hostname) {
    return `https://seu-site.netlify.app/api`;
  }

  return "https://seu-site.netlify.app/api";
}
