import {
  createDenoCGContext,
  DenoCGContext,
  denocgContext,
} from "./denocg_context.ts";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { map } from "lit/directives/map.js";
import { provide } from "@lit-labs/context";
import type { PlayerIntroductionData } from "../common/type_definition.ts";

@customElement("wakutet-player-introduction")
export class WakutetPlayerIntroductionElement extends LitElement {
  static override styles = css`
  .container {
    width: 1920px;
    height: 1000px;
    background: url("images/introduction-background.png");
  }
  
  .content {
    position: absolute;
    left: 850px;
    top: 250px;
    width: 500px;
    height: 600px;
  }

  .name {
    font-size: 30px;
  }

  .name .english {
    font-size: 18px;
  }

  dl {
    font-size: 20px;
    margin: 0;
  }
  
  dt.essential {
    display: inline;
  }
  
  dt.essential:after {
    content: ": ";
  }

  dd.essential {
    display: inline;
    margin: 0;
  }

  dd.essential:after {
    display: block;
    content: "";
  }

  .hybrid-types:before {
    content: " ";
  }

  .hybrid-types {
    font-size: 70%;
  }
  `;

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

  #renderProfileEntry(entry: [string, string]) {
    const [header, content] = entry;
    let contentHtml;
    if (header == "プレイスタイル") {
      const match = content.match(/^(.*?)( \((.*)\))?$/);
      if (match) {
        if (match[3] != null) {
          contentHtml = html`${match[1]}<span class="hybrid-types">(${match[3]})</span>`;
        } else {
          contentHtml = content;
        }
      } else {
        contentHtml = content;
      }
    } else {
      contentHtml = content.split("\n").map((line, i, arr) => i == arr.length - 1 ? html`${line}` : html`${line}<br>`)
    }
    const isEssential = ["居住地", "プレイスタイル", "自己ベスト", "前回成績"].indexOf(header) >= 0;
    const classes = classMap({ essential: isEssential });
    // deno-fmt-ignore
    return html`
    <dt class=${classes}>${header}</dt>
    <dd class=${classes}>${contentHtml}</dd>
    `
  }

  override render() {
    let profileContent;
    if (this._activePlayerIntroduction != null) {
      const { name, profile } = this._activePlayerIntroduction;
      // deno-fmt-ignore
      profileContent = html`
      <div class="name">
        <span>${name.original}</span>
        <span class="english">${name.english != null ? `(${name.english})` : null}</span>
      </div>
      <div class="profile">
        <dl>
          ${map(profile.entries, (e) => this.#renderProfileEntry(e))}
        </dl>
      </div>
      `
    } else {
      profileContent = html``
    }

    // deno-fmt-ignore
    return html`
    <div class="container">
      <div class="content">
        ${profileContent}
      </div>
    </div>
    `;
  }
}
