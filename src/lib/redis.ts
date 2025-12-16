import { Redis } from "@upstash/redis";

// create a singleton redis client using the UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN in environment variables
export const redis = Redis.fromEnv();

// Redis key utilities for consistent key construction
export const RedisKeys = {
  roomMeta: (roomId: string) => `meta:${roomId}`,
  roomMessages: (roomId: string) => `messages:${roomId}`,
  roomStream: (roomId: string) => `${roomId}`,
} as const;
