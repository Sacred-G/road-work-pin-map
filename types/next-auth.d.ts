// types/next-auth.d.ts
import NextAuth from "next-auth";
import { Session } from "next-auth";
declare module '@mapbox/mapbox-gl-directions'
export interface MapComponentProps {
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
    };}
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
