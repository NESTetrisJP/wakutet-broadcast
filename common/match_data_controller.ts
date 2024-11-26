import * as denocg from "denocg/client";
import { type MatchData, type NameData, type ProfileData } from "./type_definition.ts";

export class MatchDataController {
  #numMatches: number;
  #onUpdate: (value: MatchData[]) => void;
  #currentValue!: MatchData[];
  #replicant?: denocg.Replicant<MatchData[]>;

  constructor(numMatches: number, replicantGetter: () => Promise<denocg.Replicant<MatchData[]>>, onUpdate: (value: MatchData[]) => void) {
    this.#numMatches = numMatches;
    this.#onUpdate = onUpdate;
    this.#updateValue(undefined);

    (async () => {
      this.#replicant = await replicantGetter();
      this.#replicant.subscribe(value => this.#updateValue(value));
    })();
  }

  #updateValue(value?: MatchData[]) {
    if (value == null) { value = []; } else { value = [...value]; }
    while (value.length < this.#numMatches) {
      value.push({
        playerNames: [undefined, undefined].map(_ => ({ original: "", english: "" })),
        playerHearts: [undefined, undefined].map(_ => ({ lit: 0, max: 0 })),
        playerProfiles: [undefined, undefined].map(_ => ({ entries: [] })),
        playerProfilesVisible: false,
      })
    }
    this.#currentValue = value;
    this.#onUpdate(this.#currentValue);
  }

  #patch(matchIndex: number, data: Partial<MatchData>) {
    const newValue = [...this.#currentValue];
    newValue[matchIndex] = {
      ...newValue[matchIndex],
      ...data,
    };
    this.#currentValue = newValue;
    this.#replicant?.setValue(this.#currentValue);
  }

  setPlayerName(matchIndex: number, playerIndex: number, name: NameData) {
    const newValue = [...this.#currentValue[matchIndex].playerNames];
    newValue[playerIndex] = name;
    this.#patch(matchIndex, { playerNames: newValue });
  }

  setNumMaxHearts(matchIndex: number, numMaxHearts: number) {
    const newValue = this.#currentValue[matchIndex].playerHearts.map(e => ({ ...e, max: numMaxHearts }));
    this.#patch(matchIndex, { playerHearts: newValue });
  }

  setNumLitHearts(matchIndex: number, playerIndex: number, numLitHearts: number) {
    const newValue = [...this.#currentValue[matchIndex].playerHearts];
    newValue[playerIndex] = { ...newValue[playerIndex], lit: Math.max(0, Math.min(numLitHearts, newValue[playerIndex].max)) };
    this.#patch(matchIndex, { playerHearts: newValue });
  }

  setPlayerProfile(matchIndex: number, playerIndex: number, profile: ProfileData) {
    const newValue = [...this.#currentValue[matchIndex].playerProfiles];
    newValue[playerIndex] = profile;
    this.#patch(matchIndex, { playerProfiles: newValue });
  }

  setPlayerProfilesVisible(matchIndex: number, visible: boolean) {
    this.#patch(matchIndex, { playerProfilesVisible: visible });
  }
}
