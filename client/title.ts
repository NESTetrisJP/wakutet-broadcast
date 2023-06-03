import { QualifierRankingEntry } from "../common/type_definition.ts";
import { toFullwidthName } from "./common.ts";
import {
  createDenoCGContext,
  DenoCGContext,
  denocgContext,
} from "./denocg_context.ts";
import {
  css,
  customElement,
  html,
  LitElement,
  map,
  provide,
  state,
} from "./deps/lit.ts";

@customElement("wakutet-title")
export class WakutetTitleElement extends LitElement {
  static styles = css`
  .container {
    width: 1920px;
    height: 1080px;
    background: gray;
  }
  `;

  // @ts-ignore: ?
  @provide({ context: denocgContext })
  @state()
  private _denocgContext: DenoCGContext = createDenoCGContext();

  constructor() {
    super();
  }

  async firstUpdated() {
    const client = await this._denocgContext.getClient();
  }

  render() {
    return html`
    <div class="container">
      Hello
    </div>
    `;
  }
}
