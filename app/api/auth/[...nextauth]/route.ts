import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, findUserByCredentials} from "../../../../lib/data";
import { createUser } from "../../../../lib/actions";
import bcrypt from "bcryptjs";

const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check for hardcoded credentials
        if (
          credentials.email === "brent@pinmap.com" &&
          credentials.password === "pinmap"
        ) {
          let user = await findUserByEmail(credentials.email);
          if (!user) {
            user = await createUser(credentials.email, "Brent", "brent@pinmap.com", bcrypt.hashSync("pinmap", 10));
          }
          if (user) {
            return { id: user.id, email: user.email, name: user.name };
          }
        }

        // Check for admin credentials
        if (
          credentials.email === process.env.ADMIN_EMAIL &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          let user = await findUserByEmail(credentials.email);
          if (!user) {
            user = await createUser(credentials.email, "Admin", "", bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10));
          }
          if (user) {
            return { id: user.id, email: user.email, name: user.name };
          }
        }

        // Check if user exists in the database
        const user = await findUserByCredentials(credentials.email);
        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return { id: user.id, email: user.email, name: user.name };
        }

        // Optionally, create a new user if not found
        if (!user) {
          const hashedPassword = bcrypt.hashSync(credentials.password, 10);
          const newUser = await createUser(credentials.email, "", "", hashedPassword);
          if (newUser) {
            return { id: newUser.id, email: newUser.email, name: newUser.name };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github" || account?.provider === "google") {
        const email = user.email;
        let existingUser = await findUserByEmail(email ?? "");
        if (!existingUser) {
          existingUser = await createUser(
            email ?? "",
            user.name ?? "",
            user.image ?? "",
            "brent@pinmap.com"
          );
        }
        if (existingUser) {
          user.id = existingUser.id;
          return true;
        }
      }
      return true;
    },

    async session({ session }) {
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