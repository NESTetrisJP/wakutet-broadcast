import {
  css,
  customElement,
  html,
  LitElement,
  provide,
  state,
} from "./deps/lit.ts";
import "./deps/fluent.ts";
import {
  createDenoCGContext,
  DenoCGContext,
  denocgContext,
} from "./denocg_context.ts";
import { WakutetStageControllerElement } from "./components/stage_controller.ts";
import "./components/stage_controller.ts";
import { WakutetPlayerAssignerElement } from "./components/player_assigner.ts";
import "./components/player_assigner.ts";
import { WakutetSectionElement } from "./components/section.ts";
import "./components/section.ts";

@customElement("wakutet-dashboard")
export class WakutetDashboardElement extends LitElement {
  static styles = css`
  .container {
  }
  `;

  // @ts-ignore: ?
  @provide({ context: denocgContext })
  @state()
  private _denocgContext: DenoCGContext = createDenoCGContext();

  constructor() {
    super();
  }

  private async _changeScene(sceneName: string) {
    const client = await this._denocgContext.getClient();
    const currentSceneNameReplicant = await client.getReplicant(
      "currentSceneName",
    );
    currentSceneNameReplicant.setValue(sceneName);
  }

  render() {
    return html`
    <div class="container">
      <wakutet-section>
        <div slot="header">
          シーン
        </div>
        <div slot="content">
          <fluent-button @click=${() =>
          this._changeScene("title")}>タイトル</fluent-button>
          <fluent-button @click=${() =>
          this._changeScene("commentary")}>実況席</fluent-button>
          <fluent-button @click=${() =>
          this._changeScene("play_screen")}>ゲーム画面</fluent-button>
          <fluent-button @click=${() =>
          this._changeScene("qualifier_ranking")}>予選ランキング</fluent-button>
          <fluent-button @click=${() =>
          this._changeScene("bracket")}>トーナメント表</fluent-button>
        </div>
      </wakutet-section>
      <wakutet-stage-controller></wakutet-stage-controller>
      <wakutet-player-assigner></wakutet-player-assigner>
    </div>
    `;
  }
}
