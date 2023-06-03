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

@customElement("wakutet-qualifier-ranking")
export class WakutetQualifierRankingElement extends LitElement {
  static styles = css`
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

	.ranking {
		position: absolute;
		left: 192px;
    top: 160px;
    /*width: 1664px;*/
    height: 768px;
		column-count: 2;
    column-gap: 128px;
		column-fill: auto;
	}

	.row {
		color: white;
		width: 704px;
		height: 64px;
		font-size: 32px;
		display: grid;
		grid-template-columns: 64px 320px 256px;
		grid-template-rows: 32px 16px;
    justify-content: space-between;
	}

	.place {
		grid-area: 1 / 1;
		font-family: "Press Start K";
		text-align: right;
	}

	.name {
		grid-area: 1 / 2;
		font-family: "Misaki Gothic";
		text-align: left;
	}

	.name-english {
		grid-area: 2 / 2;
		font-family: "Press Start K";
		text-align: left;
		font-size: 16px;
	}

	.score {
		grid-area: 1 / 3;
		font-family: "Press Start K";
		text-align: right;
		white-space: pre;
	}
  `;

  // @ts-ignore: ?
  @provide({ context: denocgContext })
  @state()
  private _denocgContext: DenoCGContext = createDenoCGContext();

  @state()
  private _qualifierRanking: QualifierRankingEntry[] = [];

  constructor() {
    super();
  }

  async firstUpdated() {
    const client = await this._denocgContext.getClient();
    const qualifierRankingReplicant = await client.getReplicant(
      "qualifierRanking",
    );
    qualifierRankingReplicant.subscribe((value) => {
      this._qualifierRanking = value ?? [];
    });
  }

  render() {
    return html`
    <div class="container">
			<div class="header">予選ランキング</div>
			<div class="ranking">
				${
      map(this._qualifierRanking, (e) =>
        html`
				<div class="row">
					<div class="place">${e.place}</div>
					<div class="name">${toFullwidthName(e.name)}</div>
					<div class="name-english">${
          e.englishName ? `(${e.englishName})` : ``
        }</div>
					<div class="score">${
          e.numMaxout > 0
            ? `${e.numMaxout}+${String(e.bestScore).padStart(6, " ")}`
            : `${e.bestScore}`
        }</div>
				</div>
				`)
    }
			</div>
    </div>
    `;
  }
}
