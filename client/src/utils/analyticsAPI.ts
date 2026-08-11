import { backendAPI } from "./backendAPI";

export const trackEvent = async (analyticName: string) => {
  try {
    await backendAPI.post("/analytics/increment", { analyticName });
  } catch (err) {
    console.warn("Analytics failed silently:", analyticName, err);
  }
};