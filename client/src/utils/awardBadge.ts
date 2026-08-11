import { backendAPI } from "./backendAPI";

export type AwardBadgeResponse = {
  success: boolean;
  granted: boolean;
  badgeName: string;
  icon?: string;
};

export const awardBadge = async (badgeName: string): Promise<AwardBadgeResponse | null> => {
  try {
    const { data } = await backendAPI.post("/award-badge", { badgeName });
    return data as AwardBadgeResponse;
  } catch (error) {
    console.error(`Failed to award badge "${badgeName}":`, error);
    return null;
  }
};
