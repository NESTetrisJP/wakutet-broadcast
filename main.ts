import { TypeDefinition } from "./common/type_definition.ts";
import { Queue, denocg } from "./server/deps.ts";
import { OBSController } from "./server/obs_controller.ts";
import { serve } from "https://deno.land/std@0.175.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.175.0/http/file_server.ts";

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

// temp
const playerDatabaseReplicant = await server.getReplicant("playerDatabase");
playerDatabaseReplicant.setValue([
  {
    name: "コーリャン",
    profileEntries: [
      ["職業", "プログラマー\nテトリスの鬼"],
      ["自己ベスト", "1,287,000"],
      ["過去の戦績", "CTWC 2016 4位\nCTWC 2018 4位\nCTWC 2019 2位"],
      ["最近ハマってるゲーム", "虹色町\nCookie Clicker"],
      ["コメント", "がんばる折り返しテストテストテストテスト"],
    ],
  },
  {
    name: "りょくちゃ",
    profileEntries: [
      ["職業", "プログラマー💩"],
      ["自己ベスト", "1,190,000"],
      ["過去の戦績", "CTWC 2018 3位"],
      ["Twitter", "@suitougreentea"],
      ["ココイチのトッピング", "ロースカツ\nパリパリチキン"],
      ["コメント", "わくわく"],
    ],
  }
]);