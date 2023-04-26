import { PlayerDatabaseEntry } from "../common/type_definition.ts";

const appsScriptConfigText = await Deno.readTextFile("apps-script-conf.json");
const appsScriptConfig = JSON.parse(appsScriptConfigText);

export async function fetchPlayerDatabase(): Promise<PlayerDatabaseEntry[]> {
  const { endpoint, token } = appsScriptConfig;
  const response = await fetch(`${endpoint}?token=${token}&q=getEntry`);
  return await response.json();
}
