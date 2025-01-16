import {
  createDenoCGContext,
  DenoCGContext,
  denocgContext,
} from "./denocg_context.ts";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { provide } from "@lit-labs/context";
import type { PlayerIntroductionData } from "../common/type_definition.ts";

@customElement("wakutet-player-introduction")
export class WakutetPlayerIntroductionElement extends LitElement {
  static override styles = css`
  .container {
    width: 1920px;
    height: 1080px;
  }

  img {
    width: 1920px;
    height: 1080px;
  }
  `

  // @ts-ignore: ?
  @provide({ context: denocgContext })
  @state()
  private _denocgContext: DenoCGContext = createDenoCGContext();

  @state()
  private _activePlayerIntroduction?: PlayerIntroductionData;

  constructor() {
    super();
  }

  override async firstUpdated() {
    const client = await this._denocgContext.getClient();
    const activePlayerIntroductionReplicant = await client.getReplicant(
      "activePlayerIntroduction",
    );
    activePlayerIntroductionReplicant.subscribe((value) => {
      this._activePlayerIntroduction = value;
    });
  }

  override render() {
    // deno-fmt-ignore
    return html`
    <div class="container">
      ${this._activePlayerIntroduction != null
        ? html`<img src=${`images/introductions/${this._activePlayerIntroduction?.id}.png`}></img>`
        : null
      }
    </div>
    `;
  }
}
