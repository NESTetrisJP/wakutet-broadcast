import { createDenoCGContext, denocgContext, DenoCGContext } from "./denocg_context.ts";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { provide } from "@lit-labs/context";

@customElement("wakutet-footer")
export class WakutetFooterElement extends LitElement {
  static override styles = css`
  .container {
    position: relative;
    width: 1920px;
    height: 80px;
    background: url("images/footer.png");
  }

  .content {
    position: absolute;
    left: 480px;
    bottom: 0px;
    width: 960px;
    height: 70px;
    display: flex;
    justify-content: center;
    gap: 32px;
    color: white;
    text-shadow: 0px 0px 3px rgb(174, 204, 247);
  }

  .match-name {
    font-size: 40px;
    line-height: 70px;
  }

  .commentary {
    font-size: 32px;
    line-height: 70px;
  }

  .sponsor {
    position: absolute;
    right: 0px;
    width: 240px;
    height: 80px;
    background: url("images/sponsor_1.png");
  }
  `;

  // @ts-ignore: ?
  @provide({ context: denocgContext })
  @state()
  private _denocgContext: DenoCGContext = createDenoCGContext();

  @state()
  private _matchName = "";

  @state()
  private _commentaryNames: string[] = [];

  constructor() {
    super();
  }

  override async firstUpdated() {
    const client = await this._denocgContext.getClient();
    const matchNameReplicant = await client.getReplicant("matchName");
    matchNameReplicant.subscribe((value) => {
      this._matchName = value ?? "";
    });
    const commentaryNamesReplicant = await client.getReplicant("commentaryNames");
    commentaryNamesReplicant.subscribe((value) => {
      this._commentaryNames = value ?? [];
    });
  }

  override render() {
    return html`
    <div class="container">
      <div class="content">
        <div class="match-name" style=${styleMap({ display: this._matchName == null ? "none" : null })}>${this._matchName}</div>
        <div class="commentary" style=${styleMap({ display: this._commentaryNames.length == 0 ? "none" : null })}>実況：${this._commentaryNames.join("・")}</div>
      </div>
      <div class="sponsor"></div>
    </div>
    `;
  }
}
