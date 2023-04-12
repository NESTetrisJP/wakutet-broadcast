import { denocg } from "./deps/denocg.ts";

const client = await denocg.getClient({
  socketHostname: "localhost",
  socketPort: 8515,
});

document.querySelectorAll<HTMLDivElement>(".player .name .header").forEach(
  (e) => e.innerText = "Hello!",
);
