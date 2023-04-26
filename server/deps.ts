// DenoCG dependency
export * as denocg from "https://deno.land/x/denocg@v0.0.7/server/mod.ts";

// obs-websocket dependency
export {
  default as OBSWebSocket,
  type OBSRequestTypes,
  type OBSResponseTypes,
} from "https://esm.sh/v117/obs-websocket-js@5.0.2";

// promise-queue dependency
export { default as Queue } from "https://esm.sh/v117/promise-queue@2.2.5";
