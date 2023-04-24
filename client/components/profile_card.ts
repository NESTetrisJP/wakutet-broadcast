import { ProfileData } from "../../common/type_definition.ts";
import { commonColors } from "../common_values.js";
import { css, customElement, html, LitElement, map, property } from "../deps/lit.ts";

@customElement("wakutet-profile-card")
export class WakutetProfileCardElement extends LitElement {
  static styles = css`
  .container {
    width: 356px;
    height: 716px;
    padding: 10px;
    box-sizing: border-box;
    color: white;
    overflow: hidden;
    overflow-wrap: break-word;
  }

  .name {
    font-size: 32px;
    line-height: 36px;
    font-weight: bold;
    text-align: center;
  }

  .name::after {
    content: "";
    width: 100%;
    height: 4px;
    margin-top: 4px;
    display: block;
    background: linear-gradient(90deg, transparent, ${commonColors.theme}, ${commonColors.theme}, transparent);
  }

  dl {
    margin-top: 20px;
    margin-bottom: 0;
  }

  dt {
    margin-top: 12px;
    margin-bottom: 8px;
    font-size: 28px;
    line-height: 32px;
    color: ${commonColors.themeLighter};
    text-align: center;
  }

  dd {
    margin: 0;
    font-size: 26px;
    line-height: 30px;
    text-align: center;
  }
  `;

  @property()
  profile?: ProfileData;

  constructor() {
    super();
  }

  render() {
    const profile = this.profile ?? { name: "", entries: [] };
    return html`
    <div class="container">
      <div class="name">${profile.name}</div>
      <dl>
      ${map(profile.entries, e => html`<dt>${e[0]}</dt><dd>${e[1].split("\n").map((line, i, arr) => i == arr.length - 1 ? html`${line}` : html`${line}<br>`)}</dd>`)}
      </dl>
    </div>
    `;
  }
}
