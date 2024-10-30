import * as esbuild from "esbuild";
import { denoPlugins } from "@luca/esbuild-deno-loader";

const mode = Deno.args[0];
if (mode != "build" && mode != "watch") throw new Error("Invalid command");
const watch = mode == "watch";

const options: esbuild.BuildOptions = {
  entryPoints: [
    "./client/dashboard.ts",
    "./client/footer.ts",
    "./client/title.ts",
    "./client/commentary.ts",
    "./client/qualifier_ranking.ts",
    "./client/bracket.ts",
    "./client/play_screen.ts",
  ],
  platform: "browser",
  bundle: true,
  format: "esm",
  outbase: "./client",
  outdir: "./client",
  outExtension: { ".js": ".bundle.js" },
  metafile: true,
  plugins: [...denoPlugins({ configPath: `${import.meta.dirname}/deno.json` })],
  tsconfigRaw: {
    compilerOptions: {
      experimentalDecorators: true,
      useDefineForClassFields: false,
    },
  },
};

if (watch) {
  const context = await esbuild.context(options);
  await context.watch();
} else {
  await esbuild.build(options);
  Deno.exit();
}
