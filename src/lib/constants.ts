// Room configuration
export const TITLE = ">private_chat";
export const DESCRIPTION = "A private, ephemeral chat room";

// Room configuration
export const ROOM_TTL_SECONDS = 60 * 10; // 10 minutes
export const MAX_USERS_PER_ROOM = 2;

// Message limits
export const MESSAGE_MAX_LENGTH = 5000;
export const USERNAME_MAX_LENGTH = 25;

// Error configuration - single source of truth
export const ERROR_CONFIG = {
  ROOM_DESTROYED: {
    code: "destroyed",
    title: "ROOM DESTROYED",
    description: "All messages were permanently deleted.",
  },
  ROOM_NOT_FOUND: {
    code: "room-not-found",
    title: "ROOM NOT FOUND",
    description: "This room may have expired or never existed.",
  },
  ROOM_FULL: {
    code: "room-full",
    title: "ROOM FULL",
    description: "This room is at maximum capacity.",
  },
  ROOM_FAILED: {
    code: "room-failed",
    title: "ROOM CREATION FAILED",
    description: "Please try again later.",
  },
  MISSING_KEY: {
    code: "missing-key",
    title: "MISSING ENCRYPTION KEY",
    description: "The encryption key is missing from the link.",
  },
  INVALID_KEY: {
    code: "invalid-key",
    title: "INVALID ENCRYPTION KEY",
    description: "The encryption key provided in the URL is invalid.",
  },
} as const;

// Derived error codes for backwards compatibility
export const ERROR_CODES = {
  ROOM_DESTROYED: ERROR_CONFIG.ROOM_DESTROYED.code,
  ROOM_NOT_FOUND: ERROR_CONFIG.ROOM_NOT_FOUND.code,
  ROOM_FULL: ERROR_CONFIG.ROOM_FULL.code,
  ROOM_FAILED: ERROR_CONFIG.ROOM_FAILED.code,
  MISSING_KEY: ERROR_CONFIG.MISSING_KEY.code,
  INVALID_KEY: ERROR_CONFIG.INVALID_KEY.code,
} as const;

// Derived error alerts for backwards compatibility
export const ERROR_ALERTS = {
  [ERROR_CODES.ROOM_DESTROYED]: {
    title: ERROR_CONFIG.ROOM_DESTROYED.title,
    description: ERROR_CONFIG.ROOM_DESTROYED.description,
  },
  [ERROR_CODES.ROOM_NOT_FOUND]: {
    title: ERROR_CONFIG.ROOM_NOT_FOUND.title,
    description: ERROR_CONFIG.ROOM_NOT_FOUND.description,
  },
  [ERROR_CODES.ROOM_FULL]: {
    title: ERROR_CONFIG.ROOM_FULL.title,
    description: ERROR_CONFIG.ROOM_FULL.description,
  },
  [ERROR_CODES.ROOM_FAILED]: {
    title: ERROR_CONFIG.ROOM_FAILED.title,
    description: ERROR_CONFIG.ROOM_FAILED.description,
  },
  [ERROR_CODES.MISSING_KEY]: {
    title: ERROR_CONFIG.MISSING_KEY.title,
    description: ERROR_CONFIG.MISSING_KEY.description,
  },
  [ERROR_CODES.INVALID_KEY]: {
    title: ERROR_CONFIG.INVALID_KEY.title,
    description: ERROR_CONFIG.INVALID_KEY.description,
  },
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
