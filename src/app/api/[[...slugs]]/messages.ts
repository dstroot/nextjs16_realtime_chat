import { Elysia } from "elysia";
import { nanoid } from "nanoid";
import { z } from "zod";

// middleware
import { authMiddleware } from "./auth";

// lib
import { redis, RedisKeys } from "@/lib/redis";
import { Message, realtime } from "@/lib/realtime";
import { MESSAGE_MAX_LENGTH, USERNAME_MAX_LENGTH } from "@/lib/constants";

export const messages = new Elysia({ prefix: "/messages" })
  .use(authMiddleware)
  .post(
    "/",
    async ({ body, auth }) => {
      const { sender, text } = body;
      const { roomId } = auth;

      // ensure room exists first
      const roomExists = await redis.exists(RedisKeys.roomMeta(roomId));
      if (!roomExists) {
        throw new Error("Room does not exist");
      }

      const message: Message = {
        id: nanoid(),
        sender,
        text,
        timestamp: Date.now(),
        roomId,
      };

      // add message to history
      await redis.rpush(RedisKeys.roomMessages(roomId), {
        ...message,
        token: auth.token,
      });
      await realtime.channel(roomId).emit("chat.message", message);

      // housekeeping: refresh TTL on messages list and stream to match room TTL
      const remaining = await redis.ttl(RedisKeys.roomMeta(roomId));

      // update TTLs
      await redis.expire(RedisKeys.roomMessages(roomId), remaining);
      await redis.expire(RedisKeys.roomStream(roomId), remaining);
    },
    {
      query: z.object({ roomId: z.string() }),
      body: z.object({
        sender: z.string().max(USERNAME_MAX_LENGTH),
        text: z.string().max(MESSAGE_MAX_LENGTH),
      }),
    }
  )
  .get(
    "/",
    async ({ auth }) => {
      const messages = await redis.lrange<Message>(
        RedisKeys.roomMessages(auth.roomId),
        0,
        -1
      );

      return {
        messages: messages.map((m) => ({
          ...m,
          token: m.token === auth.token ? auth.token : undefined,
        })),
      };
    },
    { query: z.object({ roomId: z.string() }) }
  );
