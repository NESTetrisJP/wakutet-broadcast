import { css, customElement, html, LitElement, provide, state } from "./deps/lit.ts";
import "./deps/fluent.ts";
import { createDenoCGContext, denocgContext, DenoCGContext } from "./denocg_context.ts";
import { WakutetoPlayerAssignerElement } from "./components/player_assigner.ts";
import "./components/player_assigner.ts";

@customElement("wakuteto-dashboard")
export class WakutetoDashboardElement extends LitElement {
  static styles = css`
  .container {
  }
  `;

  @provide({ context: denocgContext })
  @state()
  private _denocgContext: DenoCGContext = createDenoCGContext();

  constructor() {
    super();
  }

  private async _changeScene(sceneName: string) {
    const client = await this._denocgContext.getClient();
    const currentSceneNameReplicant = await client.getReplicant("currentSceneName");
    currentSceneNameReplicant.setValue(sceneName);
  }

  render() {
    return html`
    <div class="container">
      <fluent-button @click=${() => this._changeScene("title")}>タイトル</fluent-button>
      <fluent-button @click=${() => this._changeScene("commentary")}>実況席</fluent-button>
      <fluent-button @click=${() => this._changeScene("play_screen")}>ゲーム画面</fluent-button>
      <fluent-button @click=${() => this._changeScene("qualifier_ranking")}>予選ランキング</fluent-button>
      <fluent-button @click=${() => this._changeScene("bracket")}>トーナメント表</fluent-button>
      <wakuteto-player-assigner></wakuteto-player-assigner>
    </div>
    `;
  }
}
