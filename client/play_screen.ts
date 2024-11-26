import {
  HeartsData,
  NameData,
  TypeDefinition,
  type ProfileData,
} from "../common/type_definition.ts";
import * as denocg from "denocg/client";
import { WakutetProfileCardElement } from "./components/profile_card.ts";
import "./components/profile_card.ts";
import { toFullwidthName } from "./common.ts";
import { MatchDataController } from "../common/match_data_controller.ts";

const numMatches = 2;

const client = await denocg.getClient<TypeDefinition>({
  socketHostname: "localhost",
  socketPort: 8515,
});

const playerNames = document.querySelectorAll<HTMLDivElement>(
  ".player .names .name",
);
const playerHearts = document.querySelectorAll<HTMLDivElement>(
  ".player .names .hearts",
);
const playerProfiles = document.querySelectorAll<WakutetProfileCardElement>(
  ".player .profile wakutet-profile-card",
);
const playerProfileContainers = document.querySelectorAll<HTMLDivElement>(
  ".player .profile",
);

const getCombinedIndex = (matchIndex: number, playerIndex: number) => {
  return matchIndex * 2 + playerIndex;
};

const getPlayerNameElement = (matchIndex: number, playerIndex: number) => {
  return playerNames[getCombinedIndex(matchIndex, playerIndex)];
};
const getPlayerHeartsElement = (matchIndex: number, playerIndex: number) => {
  return playerHearts[getCombinedIndex(matchIndex, playerIndex)];
};
const getPlayerProfileElement = (matchIndex: number, playerIndex: number) => {
  return playerProfiles[getCombinedIndex(matchIndex, playerIndex)];
};
const getPlayerProfileContainerElement = (matchIndex: number, playerIndex: number) => {
  return playerProfileContainers[getCombinedIndex(matchIndex, playerIndex)];
};

const setPlayerName = (matchIndex: number, playerIndex: number, name: NameData) => {
  const element = getPlayerNameElement(matchIndex, playerIndex);
  const originalName = name.original != "" ? name.original : `Player${playerIndex + 1}`;
  element.innerText = toFullwidthName(originalName);
  if (name.english) {
    const english = document.createElement("span");
    english.className = "english";
    english.innerText = `(${name.english})`;
    element.appendChild(english);
  }
  getPlayerProfileElement(matchIndex, playerIndex).name = name;
};

const setPlayerHearts = (matchIndex: number, playerIndex: number, hearts: HeartsData) => {
  const element = getPlayerHeartsElement(matchIndex, playerIndex);
  element.innerHTML = [...new Array(hearts.max)].map((_, i) =>
    `<div class="${i < hearts.lit ? "lit" : "unlit"}">Œ</div>`
  ).join("");
};

const setPlayerProfile = (matchIndex: number, playerIndex: number, profile: ProfileData) => {
  getPlayerProfileElement(matchIndex, playerIndex).profile = profile;
}

const setPlayerProfileVisible = (matchIndex: number, visible: boolean) => {
  [0, 1].forEach(playerIndex => {
    getPlayerProfileContainerElement(matchIndex, playerIndex).hidden = !visible;
  });
}

const _matchDataController = new MatchDataController(
  numMatches,
  async () => await client.getReplicant("matchData"),
  value => {
    value.forEach((match, matchIndex) => {
      match.playerNames.forEach((playerName, playerIndex) => setPlayerName(matchIndex, playerIndex, playerName));
      match.playerHearts.forEach((hearts, playerIndex) => setPlayerHearts(matchIndex, playerIndex, hearts));
      match.playerProfiles.forEach((profile, playerIndex) => setPlayerProfile(matchIndex, playerIndex, profile));
      setPlayerProfileVisible(matchIndex, match.playerProfilesVisible);
    });
  });
