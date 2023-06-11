import { QualifierRankingEntry } from "../common/type_definition.ts";
import { toFullwidthName } from "./common.ts";
import {
  createDenoCGContext,
  DenoCGContext,
  denocgContext,
} from "./denocg_context.ts";
import {
classMap,
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

  .backgrounds > * {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 1920px;
    height: 1080px;
    transition: opacity 0.5s;
  }

  .background-generic {
    background: url("images/title_generic.png");
  }

  .background-preparing {
    background: url("images/title_preparing.png");
  }

  .background-break {
    background: url("images/title_break.png");
  }

  .background-hidden {
    opacity: 0;
  }
  `;

  // @ts-ignore: ?
  @provide({ context: denocgContext })
  @state()
  private _denocgContext: DenoCGContext = createDenoCGContext();

  @state()
  private _screenName = "generic";

  constructor() {
    super();
  }

  async firstUpdated() {
    const client = await this._denocgContext.getClient();
    const titleScreenNameReplicant = await client.getReplicant("titleScreenName");
    titleScreenNameReplicant.subscribe(value => {
      this._screenName = value ?? "generic";
    });
  }

  render() {
    return html`
    <div class="container">
      <div class="backgrounds">
        <div class=${classMap({ "background-generic": true, "background-hidden": this._screenName != "generic" })}></div>
        <div class=${classMap({ "background-preparing": true, "background-hidden": this._screenName != "preparing" })}></div>
        <div class=${classMap({ "background-break": true, "background-hidden": this._screenName != "break" })}></div>
      </div>
    </div>
    `;
  }
}
