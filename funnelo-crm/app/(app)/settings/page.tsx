import type { Metadata } from "next";
import { ProfileSettings } from "@/components/settings/ProfileSettings";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return <ProfileSettings />;
}
