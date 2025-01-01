import { DenoCGContext, denocgContext } from "../denocg_context.ts";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { map } from "lit/directives/map.js";
import { consume } from "@lit-labs/context";
import "../register_fluentui_elements.ts";
import { HeartsData, type PlayerDatabaseEntry } from "../../common/type_definition.ts";
import "./profile_card.ts";
import { Select } from "@fluentui/web-components";
import "./section.ts";
import { MatchDataController } from "../../common/match_data_controller.ts";

@customElement("wakutet-stage-controller")
export class WakutetStageControllerElement extends LitElement {
  static override styles = css`
  .players {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
  }

  .name {
    font-size: 20px;
    text-align: center;
  }

  .hearts-controller {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }

  .heart {
    font-size: 20px;
    color: gray;
  }
  .heart-lit {
    color: red;
  }

  fluent-select {
    --max-height: 400px;
  }
  `;

  constructor() {
    super();
  }

  @property({ attribute: "num-matches", type: Number })
  numMatches: number = 1; 

  @property({ attribute: "match-index", type: Number })
  matchIndex: number = 0; 

  // @ts-ignore: ?
  @consume({ context: denocgContext })
  private _denocgContext!: DenoCGContext;

  @state()
  private _playerDatabase: PlayerDatabaseEntry[] = [];
  @state()
  private _playerProfilePatterns: Record<number, string[][]> = {};

  @state()
  private _playerHearts: HeartsData[] = [null, null].map((_) => ({
    lit: 0,
    max: 0,
  }));
  @state()
  private _playerIds: number[] = [-1, -1];
  @state()
  private _playerProfilesPattern = -1;

  private _matchDataController!: MatchDataController;

  override async firstUpdated() {
    const client = await this._denocgContext.getClient();
    const playerDatabaseReplicant = await client.getReplicant("playerDatabase");
    playerDatabaseReplicant.subscribe((value) => {
      this._playerDatabase = value ?? [];
    });
    const playerProfilePatternsReplicant = await client.getReplicant("playerProfilePatterns");
    playerProfilePatternsReplicant.subscribe(value => {
      this._playerProfilePatterns = value ?? {};
    });
    this._matchDataController = new MatchDataController(
      this.numMatches,
      async () => await client.getReplicant("matchData"),
      value => {
        const matchData = value?.[this.matchIndex];
        this._playerHearts = matchData.playerHearts;
        this._playerIds = matchData.playerIds.map(e => e ?? -1);
        this._playerProfilesPattern = matchData.playerProfilesVisible ? matchData.playerProfilesPatternIndex : -1;
      });
  }

  private _constructPlayerProfileEntries(
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

  private _setPlayerId(playerIndex: number, id: number) {
    if (id == -1) {
      this._matchDataController.setPlayerName(this.matchIndex, playerIndex, { original: "", english: null });
      this._matchDataController.setPlayerProfile(this.matchIndex, playerIndex, { entries: [] });
      this._matchDataController.setPlayerIds(this.matchIndex, playerIndex, undefined);
    } else {
      const player = this._playerDatabase.find(e => e.id == id)!;
      this._matchDataController.setPlayerName(this.matchIndex, playerIndex, { original: player.name, english: player.englishName });
      if (this._playerProfilesPattern >= 0) {
        this._matchDataController.setPlayerProfile(this.matchIndex, playerIndex, { entries: this._constructPlayerProfileEntries(player.id, this._playerProfilesPattern) });
      }
      this._matchDataController.setPlayerIds(this.matchIndex, playerIndex, id);
    }
  }

  private _setPlayerProfilesPattern(pattern: number) {
    if (pattern == -1) {
      this._matchDataController.setPlayerProfilesVisible(this.matchIndex, false);
    } else {
      [0, 1].forEach(playerIndex => {
        const player = this._playerDatabase.find(e => e.id == this._playerIds[playerIndex]);
        if (player != null) {
          this._matchDataController.setPlayerProfile(this.matchIndex, playerIndex, { entries: this._constructPlayerProfileEntries(player.id, pattern) });
        }
      });
      this._matchDataController.setPlayerProfilesVisible(this.matchIndex, true);
      this._matchDataController.setPlayerProfilesPatternIndex(this.matchIndex, pattern);
    }
  }

  private _setNumMaxHearts(numMaxHearts: number) {
    this._matchDataController.setNumMaxHearts(this.matchIndex, numMaxHearts);
  }

  private _changeNumLitHearts(playerIndex: number, delta: number) {
    const newValue = this._playerHearts[playerIndex].lit + delta;
    this._matchDataController.setNumLitHearts(this.matchIndex, playerIndex, newValue);
  }

  override render() {
    const matchNumber = Number(this.matchIndex) + 1;
    const numMaxHearts = Math.min(
      Math.max(this._playerHearts[0]?.max ?? 0, 0),
      5,
    );
    // deno-fmt-ignore
    return html`
    <wakutet-section>
      <div slot="header">マッチ${matchNumber}</div>
      <div slot="content">
        <div>
          <fluent-select
            value=${this._playerProfilesPattern}
            @change=${(ev: Event) => this._setPlayerProfilesPattern(Number((ev.target as Select).value))}
          >
            <fluent-option value="-1">プロフィール非表示</fluent-option>
            <fluent-option value="0">パターン1プロフィール</fluent-option>
            <fluent-option value="1">パターン2プロフィール</fluent-option>
            <fluent-option value="2">パターン3プロフィール</fluent-option>
            <fluent-option value="3">パターン4プロフィール</fluent-option>
            <fluent-option value="4">パターン5プロフィール</fluent-option>
          </fluent-select>
        </div>
        <div>
          <fluent-select
            value=${numMaxHearts}
            @change=${(ev: Event) => this._setNumMaxHearts(Number((ev.target as Select).value))}
          >
            <fluent-option value="0">ハート非表示</fluent-option>
            <fluent-option value="1">1本先取</fluent-option>
            <fluent-option value="2">2本先取</fluent-option>
            <fluent-option value="3">3本先取</fluent-option>
            <fluent-option value="4">4本先取</fluent-option>
            <fluent-option value="5">5本先取</fluent-option>
          </fluent-select>
        </div>
        <hr>
        <div class="players">
          ${map([0, 1], playerIndex => {
            return html`
            <div class="player">
              <fluent-select
                value=${this._playerIds[playerIndex]}
                @change=${(ev: Event) => this._setPlayerId(playerIndex, Number((ev.target as Select).value))}
              >
                <fluent-option value="-1">[空席]</fluent-option>
                ${map(this._playerDatabase, entry => html`<fluent-option value="${entry.id}">${entry.name}</fluent-option>`)}
              </fluent-select>
              <div class="hearts-controller">
                <div>
                  ${map([...new Array(this._playerHearts[playerIndex].max)], (_, j) =>
                    html`<span class=${
                      classMap({
                        "heart": true,
                        "heart-lit": j < this._playerHearts[playerIndex].lit,
                      })
                    }>♥</span>`)
                  }
                </div>
                <div>
                  <fluent-button @click=${() =>
                  this._changeNumLitHearts(playerIndex, -Infinity)}>0</fluent-button>
                  <fluent-button @click=${() =>
                  this._changeNumLitHearts(playerIndex, -1)}>-</fluent-button>
                  <fluent-button @click=${() =>
                  this._changeNumLitHearts(playerIndex, +1)}>+</fluent-button>
                </div>
              </div>
            </div>
            `
          })}
        </div>
      </div>
    </wakutet-section>
    `;
  }
}
