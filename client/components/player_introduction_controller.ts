import { DenoCGContext, denocgContext } from "../denocg_context.ts";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { consume } from "@lit-labs/context";
import "../register_fluentui_elements.ts";
import { type PlayerDatabaseEntry, type PlayerIntroductionData } from "../../common/type_definition.ts";
import "./profile_card.ts";
import { Select } from "@fluentui/web-components";
import "./section.ts";
import { Replicant } from "denocg/client";

@customElement("wakutet-player-introduction-controller")
export class WakutetPlayerIntroductionController extends LitElement {
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
  `;

  constructor() {
    super();
  }

  // @ts-ignore: ?
  @consume({ context: denocgContext })
  private _denocgContext!: DenoCGContext;

  @state()
  private _playerDatabase: PlayerDatabaseEntry[] = [];

  private _activePlayerIntroductionReplicant!: Replicant<PlayerIntroductionData | undefined>;
  @state()
  private _activePlayerIntroduction?: PlayerIntroductionData;

  override async firstUpdated() {
    const client = await this._denocgContext.getClient();
    const playerDatabaseReplicant = await client.getReplicant("playerDatabase");
    playerDatabaseReplicant.subscribe((value) => {
      this._playerDatabase = value ?? [];
    });
    this._activePlayerIntroductionReplicant = await client.getReplicant("activePlayerIntroduction");
    this._activePlayerIntroductionReplicant.subscribe((value) => {
      this._activePlayerIntroduction = value;
    });
  }

  private _setActivePlayerIntroductionId(id: number) {
    if (id == -1) {
      this._activePlayerIntroductionReplicant.setValue(undefined);
    } else {
      this._activePlayerIntroductionReplicant.setValue({ id });
    }
  }

  override render() {
    // deno-fmt-ignore
    return html`
    <wakutet-section>
      <div slot="header">プレイヤー紹介</div>
      <div slot="content">
        <fluent-select
          value=${this._activePlayerIntroduction?.id ?? -1}
          @change=${(ev: Event) => this._setActivePlayerIntroductionId(Number((ev.target as Select).value))}
        >
          <fluent-option value="-1">[表示しない]</fluent-option>
          ${map(this._playerDatabase, entry => html`<fluent-option value="${entry.id}">${entry.name}</fluent-option>`)}
        </fluent-select>
      </div>
    </wakutet-section>
    `;
  }
}
