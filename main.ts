import { TypeDefinition } from "./common/type_definition.ts";
import { denocg } from "./server/deps.ts";
import { OBSController } from "./server/obs_controller.ts";
import { serve } from "https://deno.land/std@0.175.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.175.0/http/file_server.ts";

const config: denocg.ServerConfig<TypeDefinition> = {
  socketPort: 8515,
  assetsPort: 8514,
  assetsRoot: "./client",
};

const server = await denocg.launchServer(config);

const obsConfigText = await Deno.readTextFile("./obs-websocket-conf.json");
const obsConfig = JSON.parse(obsConfigText);
const obs = new OBSController(obsConfig.address, obsConfig.password);

const competitionSceneName = "competition";
const resultSceneName = "result";
const chatSourceName = "chat";

serve(async (request) => {
  return await serveDir(request, {
    fsRoot: "./client/",
    headers: ["Access-Control-Allow-Origin: http://localhost:5000"],
  });
}, { port: 8516 });
