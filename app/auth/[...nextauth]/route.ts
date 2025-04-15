import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const supabase = createClient()

        // Find user by email
        const { data: user, error } = await supabase.from("users").select("*").eq("email", credentials.email).single()

        if (error || !user || !user.hashed_password) {
          throw new Error("Invalid credentials")
        }

        // Compare passwords
        const isCorrectPassword = await bcrypt.compare(credentials.password, user.hashed_password)

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          subscriptionStatus: user.subscription_status,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      if (token.role && session.user) {
        session.user.role = token.role
      }

      if (token.subscriptionStatus && session.user) {
        session.user.subscriptionStatus = token.subscriptionStatus
      }

      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.subscriptionStatus = user.subscriptionStatus
      }

      return token
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
