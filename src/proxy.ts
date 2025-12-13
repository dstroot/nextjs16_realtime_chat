import { NextRequest, NextResponse } from "next/server"
import { redis } from "./lib/redis"
import { nanoid } from "nanoid"
import { MAX_USERS_PER_ROOM, ERROR_CODES } from "./lib/constants"

export const proxy = async (req: NextRequest) => {
  const pathname = req.nextUrl.pathname

  const roomMatch = pathname.match(/^\/room\/([^/]+)$/)
  if (!roomMatch) return NextResponse.redirect(new URL("/", req.url))

  const roomId = roomMatch[1]

  const meta = await redis.hgetall<{ connected: string[]; createdAt: number }>(
    `meta:${roomId}`
  )

  if (!meta) {
    return NextResponse.redirect(new URL(`/?error=${ERROR_CODES.ROOM_NOT_FOUND}`, req.url))
  }

  const existingToken = req.cookies.get("x-auth-token")?.value

  // USER IS ALLOWED TO JOIN ROOM
  if (existingToken && meta.connected.includes(existingToken)) {
    return NextResponse.next()
  }

  // USER IS NOT ALLOWED TO JOIN
  if (meta.connected.length >= MAX_USERS_PER_ROOM) {
    return NextResponse.redirect(new URL(`/?error=${ERROR_CODES.ROOM_FULL}`, req.url))
  }

  const response = NextResponse.next()

  const token = nanoid()

  response.cookies.set("x-auth-token", token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })

  await redis.hset(`meta:${roomId}`, {
    connected: [...meta.connected, token],
  })

  return response
}

export const config = {
  matcher: "/room/:path*",
}
