import {
  createDenoCGContext,
  DenoCGContext,
  denocgContext,
} from "./denocg_context.ts";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { provide } from "@lit-labs/context";

@customElement("wakutet-sponsor")
export class WakutetSponsorElement extends LitElement {
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
  private _activeSponsorId?: string;

  constructor() {
    super();
  }

  override async firstUpdated() {
    const client = await this._denocgContext.getClient();
    const activeSponsorIdReplicant = await client.getReplicant(
      "activeSponsorId",
    );
    activeSponsorIdReplicant.subscribe((value) => {
      this._activeSponsorId = value;
    });
  }

  override render() {
    // deno-fmt-ignore
    return html`
    <div class="container">
      ${this._activeSponsorId != null
        ? html`<img src=${`images/sponsors/${this._activeSponsorId}.png`}></img>`
        : null
      }
    </div>
    `;
  }
}
