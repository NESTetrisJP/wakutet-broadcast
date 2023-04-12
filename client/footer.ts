import { css, customElement, html, LitElement } from "./deps/lit.ts";

@customElement("wakuteto-footer")
export class WakutetoFooterElement extends LitElement {
  static styles = css`
  .container {
    width: 1920px;
    height: 80px;
    background: white;
  }
  `;

  constructor() {
    super();
  }

  async firstUpdated() {
  }

  render() {
    return html`
    <div class="container">
      <div>!!!</div>
    </div>
    `;
  }
}
