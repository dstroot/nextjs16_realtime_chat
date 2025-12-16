import { NextRequest, NextResponse } from "next/server";
import { redis, RedisKeys } from "./lib/redis";
import { nanoid } from "nanoid";
import { MAX_USERS_PER_ROOM, ERROR_CODES } from "./lib/constants";

export const proxy = async (req: NextRequest) => {
  const pathname = req.nextUrl.pathname;

  const roomMatch = pathname.match(/^\/room\/([^/]+)$/);
  if (!roomMatch) return NextResponse.redirect(new URL("/", req.url));

  const roomId = roomMatch[1];

  const meta = await redis.hgetall<{ connected: string[]; createdAt: number }>(
    RedisKeys.roomMeta(roomId)
  );

  if (!meta) {
    return NextResponse.redirect(
      new URL(`/?error=${ERROR_CODES.ROOM_NOT_FOUND}`, req.url)
    );
  }

  const existingToken = req.cookies.get("x-auth-token")?.value;

  // DEBUG LOGS
  // console.log("Proxy middleware for roomId:", roomId);
  // console.log("Room meta:", meta);
  // console.log("Existing token:", existingToken);

  // USER IS ALLOWED TO JOIN ROOM
  if (existingToken && meta.connected.includes(existingToken)) {
    return NextResponse.next();
  }

  // USER IS NOT ALLOWED TO JOIN
  if (meta.connected.length >= MAX_USERS_PER_ROOM) {
    return NextResponse.redirect(
      new URL(`/?error=${ERROR_CODES.ROOM_FULL}`, req.url)
    );
  }

  const response = NextResponse.next();

  const token = nanoid();

  response.cookies.set("x-auth-token", token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  await redis.hset(RedisKeys.roomMeta(roomId), {
    connected: [...meta.connected, token],
  });

  return response;
};

export const config = {
  matcher: "/room/:path*",
};
