import { css, customElement, html, LitElement } from "./deps/lit.ts";

@customElement("wakutet-footer")
export class WakutetFooterElement extends LitElement {
  static styles = css`
  .container {
    width: 1920px;
    height: 80px;
    background: url("images/footer.png");
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
