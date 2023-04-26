import { denocg } from "../deps/denocg.ts";
import { DenoCGContext, denocgContext } from "../denocg_context.ts";
import {
  classMap,
  consume,
  css,
  customElement,
  html,
  LitElement,
  map,
  state,
} from "../deps/lit.ts";
import "../deps/fluent.ts";
import { HeartsData, NameData } from "../../common/type_definition.ts";
import "./profile_card.ts";
import { FluentSelect } from "../deps/fluent.ts";

@customElement("wakutet-stage-controller")
export class WakutetStageControllerElement extends LitElement {
  static styles = css`
  .container {
  }

  .heart {
    color: gray;
  }
  .heart-lit {
    color: red;
  }
  `;

  constructor() {
    super();
  }

  // @ts-ignore: ?
  @consume({ context: denocgContext })
  private _denocgContext!: DenoCGContext;

  @state()
  private _playerNames: string[] = ["", ""];
  @state()
  private _playerHearts: HeartsData[] = [null, null].map((_) => ({
    lit: 0,
    max: 0,
  }));
  @state()
  private _playerProfilesVisible = false;

  private _playerNamesReplicant!: denocg.Replicant<NameData[]>;
  private _playerHeartsReplicant!: denocg.Replicant<HeartsData[]>;
  private _playerProfilesVisibleReplicant!: denocg.Replicant<boolean>;

  async firstUpdated() {
    const client = await this._denocgContext.getClient();
    this._playerNamesReplicant = await client.getReplicant("playerNames");
    this._playerHeartsReplicant = await client.getReplicant("playerHearts");
    this._playerProfilesVisibleReplicant = await client.getReplicant(
      "playerProfilesVisible",
    );
    this._playerNamesReplicant.subscribe((value) => {
      this._playerNames = value?.map((e) => e.original) ?? ["", ""];
    });
    this._playerHeartsReplicant.subscribe((value) => {
      this._playerHearts = value ??
        [null, null].map((_) => ({ lit: 0, max: 0 }));
    });
    this._playerProfilesVisibleReplicant.subscribe((value) => {
      this._playerProfilesVisible = value ?? false;
    });
  }

  private _setNumMaxHearts(numMaxHearts: number) {
    this._playerHeartsReplicant.setValue([
      { ...this._playerHearts[0], max: numMaxHearts },
      { ...this._playerHearts[1], max: numMaxHearts },
    ]);
  }

  private _changeNumLitHearts(playerIndex: number, delta: number) {
    const playerHearts = [...this._playerHearts];
    playerHearts[playerIndex] = {
      ...playerHearts[playerIndex],
      lit: Math.min(
        Math.max(playerHearts[playerIndex].lit + delta, 0),
        playerHearts[playerIndex].max,
      ),
    };
    this._playerHeartsReplicant.setValue(playerHearts);
  }

  private _setPlayerProfilesVisible(visible: boolean) {
    this._playerProfilesVisibleReplicant.setValue(visible);
  }

  render() {
    const numMaxHearts = Math.min(
      Math.max(this._playerHearts[0]?.max ?? 0, 0),
      5,
    );
    return html`
    <div class="container">
      <fluent-select value=${numMaxHearts} @change=${(ev: Event) =>
      this._setNumMaxHearts(Number((ev.target as FluentSelect).value))}>
        <fluent-option value="0">0 (非表示)</fluent-option>
        <fluent-option value="1">1</fluent-option>
        <fluent-option value="2">2</fluent-option>
        <fluent-option value="3">3</fluent-option>
        <fluent-option value="4">4</fluent-option>
        <fluent-option value="5">5</fluent-option>
      </fluent-select>
      <div>
        ${
      map(this._playerHearts, (e, i) =>
        html`
        <div>
          ${
          map([...new Array(this._playerHearts[i].max)], (_, j) =>
            html`<span class=${
              classMap({
                "heart": true,
                "heart-lit": j < this._playerHearts[i].lit,
              })
            }>♥</span>`)
        }
          <fluent-button @click=${() =>
          this._changeNumLitHearts(i, +1)}>+</fluent-button>
          <fluent-button @click=${() =>
          this._changeNumLitHearts(i, -1)}>-</fluent-button>
          <fluent-button @click=${() =>
          this._changeNumLitHearts(i, -Infinity)}>0</fluent-button>
        </div>
        `)
    }
      </div>
      ${map(this._playerNames, (e) => html`${e}`)}
      <fluent-checkbox ?checked=${this._playerProfilesVisible} @change=${(
      ev: Event,
    ) =>
      this._setPlayerProfilesVisible(
        (ev.target as HTMLInputElement).checked,
      )}>プロフィールを表示</fluent-checkbox>
    </div>
    `;
  }
}
