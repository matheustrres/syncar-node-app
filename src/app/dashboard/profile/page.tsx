import { getProfile } from "@/lib/data-access";
import ProfileClientPage from "./ProfileClientPage";

export default async function ProfilePage() {
  const profileData = await getProfile();
  return <ProfileClientPage initialProfile={profileData} />;
}
