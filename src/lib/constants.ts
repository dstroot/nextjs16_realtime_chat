// Room configuration
export const TITLE = ">private_chat";
export const DESCRIPTION = "A private, ephemeral chat room";

// Room configuration
export const ROOM_TTL_SECONDS = 60 * 10; // 10 minutes
export const MAX_USERS_PER_ROOM = 2;

// Message limits
export const MESSAGE_MAX_LENGTH = 5000;
export const USERNAME_MAX_LENGTH = 25;

// Error codes
export const ERROR_CODES = {
  ROOM_DESTROYED: "destroyed",
  ROOM_NOT_FOUND: "room-not-found",
  ROOM_FULL: "room-full",
  ROOM_FAILED: "room-failed",
  MISSING_KEY: "missing-key",
  INVALID_KEY: "invalid-key",
} as const;

// Alert messages configuration
export const ERROR_ALERTS = {
  [ERROR_CODES.ROOM_DESTROYED]: {
    title: "ROOM DESTROYED",
    description: "All messages were permanently deleted.",
  },
  [ERROR_CODES.ROOM_NOT_FOUND]: {
    title: "ROOM NOT FOUND",
    description: "This room may have expired or never existed.",
  },
  [ERROR_CODES.ROOM_FULL]: {
    title: "ROOM FULL",
    description: "This room is at maximum capacity.",
  },
  [ERROR_CODES.ROOM_FAILED]: {
    title: "ROOM CREATION FAILED",
    description: "Please try again later.",
  },
  [ERROR_CODES.MISSING_KEY]: {
    title: "MISSING ENCRYPTION KEY",
    description: "The encryption key is missing from the link.",
  },
  [ERROR_CODES.INVALID_KEY]: {
    title: "INVALID ENCRYPTION KEY",
    description: "The encryption key provided in the URL is invalid.",
  },
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
