import {
  createDenoCGContext,
  DenoCGContext,
  denocgContext,
} from "./denocg_context.ts";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { provide } from "@lit-labs/context";

@customElement("wakutet-bracket")
export class WakutetBracketElement extends LitElement {
  static override styles = css`
  .container {
    width: 1920px;
    height: 1000px;
    background: url("images/background.png");
  }

	.header {
		color: white;
		position: absolute;
    left: 832px;
    top: 82px;
    width: 256px;
		font-family: "Misaki Gothic";
		font-size: 32px;
    text-align: center;
	}
  `;

  // @ts-ignore: ?
  @provide({ context: denocgContext })
  @state()
  private _denocgContext: DenoCGContext = createDenoCGContext();

  constructor() {
    super();
  }

  override render() {
    return html`
    <div class="container">
			<div class="header">トーナメント</div>
    </div>
    `;
  }
}
