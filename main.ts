import { TypeDefinition } from "./common/type_definition.ts";
import { denocg, Queue } from "./server/deps.ts";
import { OBSController } from "./server/obs_controller.ts";
import { serve } from "https://deno.land/std@0.175.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.175.0/http/file_server.ts";
import { fetchPlayerDatabase } from "./server/backend.ts";

const config: denocg.ServerConfig<TypeDefinition> = {
  socketPort: 8515,
  assetsPort: 8514,
  assetsRoot: "./client",
};

const server = await denocg.launchServer(config);

serve(async (request) => {
  return await serveDir(request, {
    fsRoot: "./client/",
    headers: ["Access-Control-Allow-Origin: http://localhost:5000"],
  });
}, { port: 8516 });

const obsConfigText = await Deno.readTextFile("./obs-websocket-conf.json");
const obsConfig = JSON.parse(obsConfigText);
const obs = new OBSController(obsConfig.address, obsConfig.password);

const sceneChangeQueue = new Queue(1);
const currentSceneNameReplicant = await server.getReplicant("currentSceneName");
currentSceneNameReplicant.subscribe(async (value) => {
  if (!value) return;
  await sceneChangeQueue.add(async () => {
    try {
      await obs.call("SetCurrentProgramScene", { sceneName: value });
    } catch (e) {
      console.error(e);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
});

const playerDatabaseReplicant = await server.getReplicant("playerDatabase");
server.registerRequestHandler("fetchPlayerDatabase", async () => {
  playerDatabaseReplicant.setValue(await fetchPlayerDatabase());
});
