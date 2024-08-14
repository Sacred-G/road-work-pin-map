// types/next-auth.d.ts
import NextAuth from "next-auth";
import { Session } from "next-auth";

declare module "next-auth" {
  /**
   * Extend the User model with additional properties (like id).
   */
  interface User {
    id: string;
  }

  /**
   * Extend the Session model to include the custom User model.
   */
  interface Session {
    user: User;
  }
}
type Location = {
  name: string;
  description: string;
};
type SidebarProps = {
  locations: Location[];
  onTabHover: (index: number | null) => void;
  onTabClick: (index: number) => void;
};
// In a shared types file or directly in mapComponent.tsx if applicable
interface PinData {
  id: string; // Ensure this matches the expected type
  name: string;
  description: string;
  longitude: number;
  latitude: number;
}