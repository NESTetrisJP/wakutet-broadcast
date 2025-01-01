import { Replicant } from "denocg/client";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import "./register_fluentui_elements.ts";
import {
  createDenoCGContext,
  DenoCGContext,
} from "./denocg_context.ts";
import "./components/profile_card.ts";
import type { NameData, PlayerDatabaseEntry } from "../common/type_definition.ts";

const numProfilePatterns = 5;

@customElement("wakutet-profile-editor")
export class WakutetProfileEditor extends LitElement {
  static override styles = css`
  .container {
    margin: 8px;
  }

  .player {
    width: fit-content;
    margin-top: 8px;
    margin-bottom: 8px;
    border-top: 1px solid black;
    border-bottom: 1px solid black;
  }

  .player-name {
    font-size: 120%;
  }

  .profile-patterns {
    width: fit-content;
    display: flex;
    flex-direction: row;
  }

  .profile-pattern {
    padding: 8px;
    display: grid;
    grid-template:
      'header header' auto
      'chooser preview' auto /
      auto auto;
  }

  .profile-pattern + .profile-pattern {
    border-left: 1px dotted black;
  }

  .profile-pattern-header {
    grid-area: header;
  }

  .profile-chooser {
    grid-area: chooser;
    width: 200px;
  }

  .profile-preview {
    grid-area: preview;
    background: black;
    width: 356px;
    zoom: 33%;
  }
  `;

  @state()
  private _denocgContext: DenoCGContext = createDenoCGContext();

  @state()
  private _playerDatabase: PlayerDatabaseEntry[] = [];

  @state()
  private _fetchingPlayerDatabase = false;

  private _playerProfilePatternsReplicant!: Replicant<Record<number, string[][]>>
  @state()
  private _playerProfilePatterns: Record<number, string[][]> = {};

  constructor() {
    super();
  }

  override async firstUpdated() {
    const client = await this._denocgContext.getClient();
    const playerDatabaseReplicant = await client.getReplicant("playerDatabase");
    playerDatabaseReplicant.subscribe(value => {
      this._playerDatabase = value ?? [];
    });
    this._playerProfilePatternsReplicant = await client.getReplicant("playerProfilePatterns");
    this._playerProfilePatternsReplicant.subscribe(value => {
      this._playerProfilePatterns = value ?? {};
    });
  }

  private async _fetchPlayerDatabase() {
    try {
      this._fetchingPlayerDatabase = true;
      const client = await this._denocgContext.getClient();
      await client.requestToServer("fetchPlayerDatabase");
    } finally {
      this._fetchingPlayerDatabase = false;
    }
  }
  
  private _constructProfileEntries(
    playerId: number,
    patternIndex: number,
  ) {
    const player = this._playerDatabase.find(e => e.id == playerId) ?? { profileEntries: [] };
    const visibleEntries = (this._playerProfilePatterns[playerId]?.[patternIndex] ?? []);
    return player.profileEntries.flatMap(e => {
      const isVisible = visibleEntries.indexOf(e[0]) >= 0;
      return isVisible ? [e] : [];
    });
  }

  private _getProfileEntryVisibility(
    playerId: number,
    patternIndex: number,
    entryName: string,
  ): boolean {
    const visibleEntries = (this._playerProfilePatterns[playerId]?.[patternIndex] ?? []);
    return visibleEntries.indexOf(entryName) >= 0;
  }

  private _setProfileEntryVisibility(
    playerId: number,
    patternIndex: number,
    entryName: string,
    isVisible: boolean,
  ) {
    const result = { ...this._playerProfilePatterns };
    result[playerId] = result[playerId] != null ? [...result[playerId]] : [];
    while (result[playerId].length < numProfilePatterns) { result[playerId].push([]); }

    const entries = [...result[playerId][patternIndex]];
    let dirty = false;
    if (isVisible) {
      if (entries.indexOf(entryName) == -1) {
        entries.push(entryName);
        dirty = true;
      }
    } else {
      const index = entries.indexOf(entryName);
      if (index >= 0) {
        entries.splice(index, 1);
        dirty = true;
      }
    }
    if (dirty) {
      result[playerId][patternIndex] = entries;
      this._playerProfilePatternsReplicant.setValue(result);
    }
  }

  override render() {
    // deno-fmt-ignore
    return html`
    <div class="container">
      <fluent-button @click=${() => this._fetchPlayerDatabase()} ?disabled=${this._fetchingPlayerDatabase}>プレイヤー情報更新</fluent-button>
      ${map(this._playerDatabase, player => {
        // deno-fmt-ignore
        return html`
          <div class="player">
            <div class="player-name">
              <span>${player.name} ${player.englishName != null ? `(${player.englishName})` : null}</span>
              <span style="margin-left: 1em">ID: ${player.id}</span>
            </div>
            <div class="profile-patterns">
              ${map([...new Array(numProfilePatterns)], (_, patternIndex) => {
                const patternNumber = patternIndex + 1;
                const entries = this._constructProfileEntries(player.id, patternIndex);
                return html`
                <div class="profile-pattern">
                  <div class="profile-pattern-header">パターン${patternNumber}</div>
                  <div class="profile-chooser">
                    ${(() => {
                      const profileEntryKeys = player.profileEntries.map((e) => e[0]);
                      return map(profileEntryKeys, (e) => html`
                        <fluent-checkbox
                          ?checked=${this._getProfileEntryVisibility(player.id, patternIndex, e)}
                          @change=${(ev: Event) => this._setProfileEntryVisibility(player.id, patternIndex, e, (ev.target as HTMLInputElement).checked)}
                        >${e}</fluent-checkbox>
                        `);
                    })()}
                  </div>
                  <div class="profile-preview">
                    <wakutet-profile-card .name=${{ original: player.name, english: player.englishName } satisfies NameData} .profile=${{ entries }}></wakutet-profile-card>
                  </div>
                </div>
                `
              })}
            </div>
          </div>
        `
      })}
    </div>
    `;
  }
}
