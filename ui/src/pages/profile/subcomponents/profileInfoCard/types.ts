import type { UserProfile } from "@utils/types/user";

export interface ProfileInfoCardProps {
  user: UserProfile;
  formatDate: (dateStr?: string) => string;
}
