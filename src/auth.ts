import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
     async authorize(credentials) {
  await connectDB();

  const user = await User.findOne({ email: credentials?.email });
  if (!user || !user.passwordHash || user.isDeleted) return null;

  const isValid = await bcrypt.compare(
    credentials?.password as string,
    user.passwordHash
  );
  if (!isValid) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: user.image,
  };
},
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
  if (account?.provider === "google") {
    await connectDB();
    const existing = await User.findOne({ email: user.email });

    if (existing?.isDeleted) return false; // block sign-in for deleted accounts

    if (!existing) {
      await User.create({
        name: user.name,
        email: user.email,
        image: user.image,
        provider: "google",
      });
    }
  }
  return true;
},
    async jwt({ token, user, account }) {
   
      if (user?.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});