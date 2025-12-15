import { Elysia } from "elysia";
import { nanoid } from "nanoid";
import { authMiddleware } from "./auth";
import { z } from "zod";

// lib
import { redis, RedisKeys } from "@/lib/redis";
import { realtime } from "@/lib/realtime";
import { ROOM_TTL_SECONDS } from "@/lib/constants";

export const rooms = new Elysia({ prefix: "/room" })
  .post("/create", async () => {
    const roomId = nanoid();

    await redis.hset(RedisKeys.roomMeta(roomId), {
      connected: [],
      createdAt: Date.now(),
    });

    // set TTL for room metadata
    await redis.expire(RedisKeys.roomMeta(roomId), ROOM_TTL_SECONDS);
    return { roomId };
  })
  .use(authMiddleware)
  .get(
    "/ttl",
    async ({ auth }) => {
      const ttl = await redis.ttl(RedisKeys.roomMeta(auth.roomId));
      return { ttl: ttl > 0 ? ttl : 0 };
    },
    { query: z.object({ roomId: z.string() }) }
  )
  .delete(
    "/",
    async ({ auth }) => {
      await realtime
        .channel(auth.roomId)
        .emit("chat.destroy", { isDestroyed: true });

      await Promise.all([
        redis.del(RedisKeys.roomMeta(auth.roomId)),
        redis.del(RedisKeys.roomMessages(auth.roomId)),
      ]);
    },
    { query: z.object({ roomId: z.string() }) }
  );
