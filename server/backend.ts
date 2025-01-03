import { PlayerDatabaseEntry } from "../common/type_definition.ts";

let appsScriptConfig: { endpoint: string, token: string } | undefined;
try {
  const appsScriptConfigText = await Deno.readTextFile("apps-script-conf.json");
  const parsed: unknown = JSON.parse(appsScriptConfigText);
  const checkValidity = (obj: any): obj is typeof appsScriptConfig => {
    return typeof(obj.endpoint) == "string" && typeof(obj.token) == "string";
  }
  if (checkValidity(parsed)) {
    appsScriptConfig = parsed;
  } else {
    console.error(parsed);
    appsScriptConfig = undefined;
  }
} catch (e) {
  console.error(e);
  appsScriptConfig = undefined;
}

const createTestData = (): PlayerDatabaseEntry[] => {
  const createOtherHeaders = (): [string, string][] => {
    return [...new Array(8)].map((_, i) => [`ヘッダ${i}`, `内容${i}`]);
  };

  return [...new Array(20)].map((_, i) => ({
    id: i,
    name: `なまえ${i}`,
    englishName: i % 2 == 0 ? `Name${i}` : null,
    profileEntries: [
      ["居住地", "秋葉原Hey"],
      ["プレイスタイル", "Hybrid (DAS/TAP)"],
      ["自己ベスト", "1,048,576"],
      ["前回成績", "ベスト16"],
      ...createOtherHeaders(),
    ],
    qualifierBestScore: (i + 1) * 10000,
    qualifierNumMaxout: i + 1,
  }));
};

export async function fetchPlayerDatabase(): Promise<PlayerDatabaseEntry[]> {
  if (appsScriptConfig != null) {
    const { endpoint, token } = appsScriptConfig;
    const response = await fetch(`${endpoint}?token=${token}&q=getEntry`);
    return await response.json();
  } else {
    return createTestData();
  }
}
