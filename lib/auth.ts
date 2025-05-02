"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { kv } from "@vercel/kv"
import bcrypt from "bcryptjs"

// Type for session
type Session = {
  email: string
  expiresAt: number
}

// Type for user
type User = {
  email: string
  passwordHash: string
}

// Initialize admin user if not exists
async function initAdminUser() {
  try {
    const adminExists = await kv.exists("admin-user")

    if (!adminExists) {
      // Default admin credentials - in a real app, you'd want to set this up differently
      const defaultEmail = "admin@example.com"
      const defaultPassword = "admin123" // This should be changed immediately

      const passwordHash = await bcrypt.hash(defaultPassword, 10)

      const user: User = {
        email: defaultEmail,
        passwordHash,
      }

      await kv.set("admin-user", user)
      console.log("Default admin user created")
    }
  } catch (error) {
    console.error("Error initializing admin user:", error)
  }
}

// Call this when the app starts
initAdminUser()

// Login function
export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate input
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    // Get admin user
    const user = await kv.get<User>("admin-user")

    if (!user) {
      return { error: "Authentication failed" }
    }

    // Check if email matches
    if (user.email !== email) {
      return { error: "Authentication failed" }
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
      return { error: "Authentication failed" }
    }

    // Create session
    const session: Session = {
      email: user.email,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }

    // Store session in cookie
    cookies().set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    // Return success instead of redirecting
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Authentication failed" }
  }
}

// Logout function
export async function logout() {
  cookies().delete("session")
  redirect("/login")
}

// Get current session
export async function getSession(): Promise<Session | null> {
  try {
    const sessionCookie = cookies().get("session")

    if (!sessionCookie?.value) {
      return null
    }

    const session: Session = JSON.parse(sessionCookie.value)

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      cookies().delete("session")
      return null
    }

    return session
  } catch (error) {
    console.error("Get session error:", error)
    return null
  }
}
