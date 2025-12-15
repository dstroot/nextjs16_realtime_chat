import { Elysia } from "elysia";
import { rooms } from "./rooms";
import { messages } from "./messages";

const app = new Elysia({ prefix: "/api" }).use(rooms).use(messages);

export const GET = app.fetch;
export const POST = app.fetch;
export const DELETE = app.fetch;

export type App = typeof app;
