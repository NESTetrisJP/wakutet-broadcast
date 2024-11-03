import { QualifierRankingEntry } from "../common/type_definition.ts";
import { toFullwidthName } from "./common.ts";
import {
  createDenoCGContext,
  DenoCGContext,
  denocgContext,
} from "./denocg_context.ts";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { provide } from "@lit-labs/context";

@customElement("wakutet-title")
export class WakutetTitleElement extends LitElement {
  static override styles = css`
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

  .timer {
    position: absolute;
    transition: opacity 0.5s;
  }

  .timer-hidden {
    opacity: 0;
  }

  .timer * {
    text-anchor: middle;
    font-weight: bold;
    fill: white;
  }

  .timer .header-ja {
    font-size: 48px;
  }

  .timer .header-en {
    font-size: 32px;
  }

  .timer .value {
    font-size: 64px;
  }
  
  .timer .stroke {
    stroke: #ed2224;
    stroke-width: 12px;
    stroke-linejoin: round;
  }
  `;

  // @ts-ignore: ?
  @provide({ context: denocgContext })
  @state()
  private _denocgContext: DenoCGContext = createDenoCGContext();

  @state()
  private _screenName = "generic";

  private _currentTimerInterval?: number

  @state()
  private _currentTimerValue = 0;

  constructor() {
    super();
  }

  override async firstUpdated() {
    const client = await this._denocgContext.getClient();

    const titleScreenNameReplicant = await client.getReplicant("titleScreenName");
    titleScreenNameReplicant.subscribe(value => {
      this._screenName = value ?? "generic";
    });

    client.addMessageListener("startTitleTimer", params => {
      if (this._currentTimerInterval != null) {
        clearInterval(this._currentTimerInterval);
        this._currentTimerInterval = undefined;
      }

      this._currentTimerValue = params.seconds;
      this._currentTimerInterval = setInterval(() => {
        this._currentTimerValue -= 1;
        if (this._currentTimerValue <= 0) {
          clearInterval(this._currentTimerInterval);
          this._currentTimerInterval = undefined;
        }
      }, 1000);
    });
  }

  override render() {
    const shouldShowTimer = this._currentTimerValue > 0 && this._screenName != "generic";
    const timerMinute = Math.floor(this._currentTimerValue / 60);
    const timerSecond = this._currentTimerValue % 60;
    const timerString = `${timerMinute}:${String(timerSecond).padStart(2, "0")}`
    const timerHeaderJa = this._screenName == "break" ? "再開まで" : "開始まで";

    return html`
    <div class="container">
      <div class="backgrounds">
        <div class=${classMap({ "background-generic": true, "background-hidden": this._screenName != "generic" })}></div>
        <div class=${classMap({ "background-preparing": true, "background-hidden": this._screenName != "preparing" })}></div>
        <div class=${classMap({ "background-break": true, "background-hidden": this._screenName != "break" })}></div>
      </div>
      <svg class=${classMap({ "timer": true, "timer-hidden": !shouldShowTimer })} width="1920" height="1080">
        <text class="header-ja stroke" x="960" y="800">${timerHeaderJa}</text>
        <text class="header-ja" x="960" y="800">${timerHeaderJa}</text>
        <text class="header-en stroke" x="960" y="835">Starting in</text>
        <text class="header-en" x="960" y="835">Starting in</text>
        <text class="value stroke" x="960" y="900">${timerString}</text>
        <text class="value" x="960" y="900">${timerString}</text>
      </svg>
    </div>
    `;
  }
}
