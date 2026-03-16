import serverless from "serverless-http";
import { app } from "../../server/app";

const expressHandler = serverless(app);

export async function handler(event: Record<string, unknown>, context: Record<string, unknown>) {
  const rawPath = typeof event.path === "string" ? event.path : "";
  const normalizedPath = rawPath.replace(/^\/\.netlify\/functions\/api/, "");
  const nextEvent = {
    ...event,
    path: `/api${normalizedPath || ""}`,
    rawUrl:
      typeof event.rawUrl === "string"
        ? event.rawUrl.replace("/.netlify/functions/api", "/api")
        : event.rawUrl,
  };

  return expressHandler(nextEvent, context);
}
