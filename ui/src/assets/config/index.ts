// Normaliza a URL com o parser do navegador (ex.: "http:/host" vira "http://host"),
// mantendo a mesma tolerância que o cliente fetch anterior tinha.
const normalizeBaseUrl = (url: string): string => {
  try {
    return new URL(url).toString().replace(/\/$/, "");
  } catch {
    return url;
  }
};

export const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL || "http://localhost:5000");

export const storageKeys = {
  token: "lab_auth_token",
  refreshToken: "lab_refresh_token",
  user: "lab_auth_user",
  healthMetrics: "lab_health_metrics_v1",
  calendarSelectedIds: "lab_calendar_selected_ids_v1"
} as const;

const config = {
  apiBaseUrl,
  storageKeys
};

export default config;
