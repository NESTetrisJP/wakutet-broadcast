import * as denocg from "denocg/client";
import { DenoCGContext, denocgContext } from "../denocg_context.ts";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { map } from "lit/directives/map.js";
import { consume } from "@lit-labs/context";
import "../register_fluentui_elements.ts";
import { HeartsData, NameData, type MatchData } from "../../common/type_definition.ts";
import "./profile_card.ts";
import { Select } from "@fluentui/web-components";
import "./section.ts";
import { MatchDataController } from "../../common/match_data_controller.ts";

@customElement("wakutet-stage-controller")
export class WakutetStageControllerElement extends LitElement {
  static override styles = css`
  .grid {
    display: grid;
    grid-template-columns: 200px 200px;
    gap: 0 20px;
  }
  .name:nth-child(1) {
    grid-area: 1 / 1;
  }
  .name:nth-child(2) {
    grid-area: 1 / 2;
  }
  .hearts-controller:nth-child(1) {
    grid-area: 2 / 1;
  }
  .hearts-controller:nth-child(2) {
    grid-area: 2 / 2;
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
  private _playerNames: NameData[] = [null, null].map(_ => ({
    original: "",
    english: "",
  }));
  @state()
  private _playerHearts: HeartsData[] = [null, null].map((_) => ({
    lit: 0,
    max: 0,
  }));
  @state()
  private _playerProfilesVisible = false;

  private _matchDataController!: MatchDataController;

  override async firstUpdated() {
    const client = await this._denocgContext.getClient();
    this._matchDataController = new MatchDataController(
      this.numMatches,
      async () => await client.getReplicant("matchData"),
      value => {
        const matchData = value?.[this.matchIndex];
        this._playerNames = matchData.playerNames;
        this._playerHearts = matchData.playerHearts;
        this._playerProfilesVisible = matchData.playerProfilesVisible;
      });
  }

  private _setNumMaxHearts(numMaxHearts: number) {
    this._matchDataController.setNumMaxHearts(this.matchIndex, numMaxHearts);
  }

  private _changeNumLitHearts(playerIndex: number, delta: number) {
    const newValue = this._playerHearts[playerIndex].lit + delta;
    this._matchDataController.setNumLitHearts(this.matchIndex, playerIndex, newValue);
  }

  private _setPlayerProfilesVisible(visible: boolean) {
    this._matchDataController.setPlayerProfilesVisible(this.matchIndex, visible);
  }

  override render() {
    const matchNumber = Number(this.matchIndex) + 1;
    const numMaxHearts = Math.min(
      Math.max(this._playerHearts[0]?.max ?? 0, 0),
      5,
    );
    return html`
    <wakutet-section>
      <div slot="header">マッチ${matchNumber}</div>
      <div slot="content">
        <div>
          <fluent-checkbox ?checked=${this._playerProfilesVisible} @change=${(
          ev: Event,
        ) =>
          this._setPlayerProfilesVisible(
            (ev.target as HTMLInputElement).checked,
          )}>プロフィールを表示</fluent-checkbox>
        </div>
        <div>
          <fluent-select value=${numMaxHearts} @change=${(ev: Event) =>
          this._setNumMaxHearts(Number((ev.target as Select).value))}>
            <fluent-option value="0">ハート非表示</fluent-option>
            <fluent-option value="1">1本先取</fluent-option>
            <fluent-option value="2">2本先取</fluent-option>
            <fluent-option value="3">3本先取</fluent-option>
            <fluent-option value="4">4本先取</fluent-option>
            <fluent-option value="5">5本先取</fluent-option>
          </fluent-select>
        </div>
        <hr>
        <div class="grid">
          <div style="display: contents">
            ${map(this._playerNames, (e) => html`<div class="name">${e.original != "" ? e.original : "[空席]"}</div>`)}
          </div>
          <div style="display: contents">
            ${
            map(this._playerHearts, (e, i) =>
            html`
            <div class="hearts-controller">
              <div>
                ${map([...new Array(this._playerHearts[i].max)], (_, j) =>
                  html`<span class=${
                    classMap({
                      "heart": true,
                      "heart-lit": j < this._playerHearts[i].lit,
                    })
                  }>♥</span>`)
                }
              </div>
              <div>
                <fluent-button @click=${() =>
                this._changeNumLitHearts(i, -Infinity)}>0</fluent-button>
                <fluent-button @click=${() =>
                this._changeNumLitHearts(i, -1)}>-</fluent-button>
                <fluent-button @click=${() =>
                this._changeNumLitHearts(i, +1)}>+</fluent-button>
              </div>
            </div>
            `)}
          </div>
        </div>
      </div>
    </wakutet-section>
    `;
  }
}
