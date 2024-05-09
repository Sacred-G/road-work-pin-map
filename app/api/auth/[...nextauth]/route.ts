import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google"; // Import GoogleProvider
import { findUserByEmail } from "@/lib/data";
import { createUser } from "@/lib/actions";

const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    GoogleProvider({ // Add GoogleProvider configuration
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle sign-in for both GitHub and Google
      if (account?.provider === "github" || account?.provider === "google") {
        const email = user.email;
        let existingUser = await findUserByEmail(email ?? "");
        if (!existingUser) {
          existingUser = await createUser(
            email ?? "",
            user.name ?? "",
            user.image ?? ""
          );
        }
        if (existingUser) {
          user.id = existingUser.id;
          return true;
        }
      }
      return true;
    },

    async session({ session, user }) {
      const existingUser = await findUserByEmail(session?.user?.email ?? "");
      if (existingUser) {
        const newSession = {
          ...session,
          user: { ...session.user, id: existingUser?.id },
        };
        return newSession;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
