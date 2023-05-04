import {
  css,
  customElement,
  html,
  LitElement,
} from "../deps/lit.ts";

@customElement("wakutet-section")
export class WakutetSectionElement extends LitElement {
  static styles = css`
	:host {
		--color: #3e82d4;
	}
	.container {
		margin: 8px;
	}
	.header {
		display: inline-block;
		color: white;
		background-color: var(--color);
		font-size: 16px;
		line-height: 16px;
		font-weight: bold;
		padding: 8px;
		border-radius: 6px 6px 0px 0px;
	}
	.content {
		border: 2px var(--color) solid;
		padding: 8px;
		border-radius: 0px 6px 6px 6px;
	}
  `;

  constructor() {
    super();
  }

  render() {
    return html`
    <div class="container">
			<div class="header">
				<slot name="header">
			</div>
			<div class="content">
				<slot name="content">
			</div>
    </div>
    `;
  }
}