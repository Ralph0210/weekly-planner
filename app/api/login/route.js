import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const SITE_PASSWORD = "0210"
const AUTH_COOKIE_NAME = "site-auth"

export async function POST(request) {
  const { password } = await request.json()

  if (password === SITE_PASSWORD) {
    const response = NextResponse.json({ success: true })

    // Set authentication cookie (expires in 7 days)
    const cookieStore = await cookies()
    cookieStore.set(AUTH_COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 })
}
