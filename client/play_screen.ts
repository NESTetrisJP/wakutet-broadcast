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

const nodeListToArray = <T extends Node>(nodeList: NodeListOf<T>) => {
  const result = new Array<T>(nodeList.length);
  nodeList.forEach((e, i) => result[i] = e);
  return result;
};

const matchElements = [...new Array(numMatches)].map((_, matchIndex) => {
  const matchNumber = matchIndex + 1;
  const matchElement = document.querySelector(`#match${matchNumber}`);
  if (matchElement != null) {
    return {
      playerNames: nodeListToArray(matchElement.querySelectorAll(".player .names .name")) as HTMLDivElement[],
      playerHearts: nodeListToArray(matchElement.querySelectorAll(".player .names .hearts")) as HTMLDivElement[],
      playerProfiles: nodeListToArray(matchElement.querySelectorAll(".player .profile wakutet-profile-card")) as WakutetProfileCardElement[],
      playerProfileContainers: nodeListToArray(matchElement.querySelectorAll(".player .profile")) as HTMLDivElement[],
    };
  } else {
    return {
      playerNames: [undefined, undefined],
      playerHearts: [undefined, undefined],
      playerProfiles: [undefined, undefined],
      playerProfileContainers: [undefined, undefined],
    }
  }
});

const getPlayerNameElement = (matchIndex: number, playerIndex: number) => {
  return matchElements[matchIndex].playerNames[playerIndex];
};
const getPlayerHeartsElement = (matchIndex: number, playerIndex: number) => {
  return matchElements[matchIndex].playerHearts[playerIndex];
};
const getPlayerProfileElement = (matchIndex: number, playerIndex: number) => {
  return matchElements[matchIndex].playerProfiles[playerIndex];
};
const getPlayerProfileContainerElement = (matchIndex: number, playerIndex: number) => {
  return matchElements[matchIndex].playerProfileContainers[playerIndex];
};

const setPlayerName = (matchIndex: number, playerIndex: number, name: NameData) => {
  const playerNameElement = getPlayerNameElement(matchIndex, playerIndex);
  if (playerNameElement != null) {
    const originalName = name.original != "" ? name.original : `Player${playerIndex + 1}`;
    playerNameElement.innerText = toFullwidthName(originalName);
    if (name.english) {
      const english = document.createElement("span");
      english.className = "english";
      english.innerText = `(${name.english})`;
      playerNameElement.appendChild(english);
    }
  }

  const playerProfileElement = getPlayerProfileElement(matchIndex, playerIndex);
  if (playerProfileElement != null) {
    playerProfileElement.name = name;
  }
};

const setPlayerHearts = (matchIndex: number, playerIndex: number, hearts: HeartsData) => {
  const element = getPlayerHeartsElement(matchIndex, playerIndex);
  if (element != null)
  {
    element.innerHTML = [...new Array(hearts.max)].map((_, i) =>
      `<div class="${i < hearts.lit ? "lit" : "unlit"}">Œ</div>`
    ).join("");
  }
};

const setPlayerProfile = (matchIndex: number, playerIndex: number, profile: ProfileData) => {
  const element = getPlayerProfileElement(matchIndex, playerIndex);
  if (element != null) {
    element.profile = profile;
  }
}

const setPlayerProfileVisible = (matchIndex: number, visible: boolean) => {
  [0, 1].forEach(playerIndex => {
    const container = getPlayerProfileContainerElement(matchIndex, playerIndex);
    if (container != null) {
      container.hidden = !visible;
    }
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
