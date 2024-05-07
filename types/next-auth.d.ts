/* This code snippet is a TypeScript declaration file (`next-auth.d.ts`) that extends the types
provided by the `next-auth` library. It is augmenting the existing types defined in the `next-auth`
module. */
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
