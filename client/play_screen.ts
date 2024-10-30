import {
  HeartsData,
  NameData,
  TypeDefinition,
} from "../common/type_definition.ts";
import * as denocg from "denocg/client";
import { WakutetProfileCardElement } from "./components/profile_card.ts";
import "./components/profile_card.ts";
import { toFullwidthName } from "./common.ts";

const client = await denocg.getClient<TypeDefinition>({
  socketHostname: "localhost",
  socketPort: 8515,
});

const playerNames = document.querySelectorAll<HTMLDivElement>(
  ".player .names .name",
);
const playerNamesReplicant = await client.getReplicant("playerNames");

const playerHearts = document.querySelectorAll<HTMLDivElement>(
  ".player .names .hearts",
);
const playerHeartsReplicant = await client.getReplicant("playerHearts");

const playerProfiles = document.querySelectorAll<WakutetProfileCardElement>(
  ".player .profile wakutet-profile-card",
);
const playerProfilesReplicant = await client.getReplicant("playerProfiles");

const playerProfileContainers = document.querySelectorAll<HTMLDivElement>(
  ".player .profile",
);
const playerProfilesVisibleReplicant = await client.getReplicant(
  "playerProfilesVisible",
);

playerNamesReplicant.subscribe((value) => {
  value ??= [null, null].map((_, i) => ({ original: "", english: null })) as [
    NameData,
    NameData,
  ];
  value.forEach((name, i) => {
    if (playerNames.length <= i) return;
    const originalName = name.original != "" ? name.original : `Player${i + 1}`;
    playerNames[i].innerText = toFullwidthName(originalName);
    if (name.english) {
      const english = document.createElement("span");
      english.className = "english";
      english.innerText = `(${name.english})`;
      playerNames[i].appendChild(english);
    }
  });
});

playerHeartsReplicant.subscribe((value) => {
  value ??= [null, null].map(() => ({ max: 0, lit: 0 })) as [
    HeartsData,
    HeartsData,
  ];
  value.forEach((e, i) => {
    if (playerHearts.length <= i) return;
    playerHearts[i].innerHTML = [...new Array(e.max)].map((_, i) =>
      `<div class="${i < e.lit ? "lit" : "unlit"}">Œ</div>`
    ).join("");
  });
});

playerProfilesReplicant.subscribe((value) => {
  const nullableValue = value ?? [undefined, undefined];
  nullableValue.forEach((e, i) => {
    if (playerProfiles.length <= i) return;
    playerProfiles[i].profile = e;
  });
});

playerProfilesVisibleReplicant.subscribe((value) => {
  playerProfileContainers.forEach((container) => {
    container.classList.toggle("profile-hidden", !value);
  });
});
