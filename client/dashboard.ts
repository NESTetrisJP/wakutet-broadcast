import * as denocg from "denocg/client";
import { css, html, LitElement } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { map } from "lit/directives/map.js";
import { provide } from "@lit-labs/context";
import "./register_fluentui_elements.ts";
import {
  createDenoCGContext,
  DenoCGContext,
  denocgContext,
} from "./denocg_context.ts";
import "./components/player_introduction_controller.ts";
import "./components/stage_controller.ts";
import "./components/player_assigner.ts";
import "./components/section.ts";
import { NumberField, TextField } from "@fluentui/web-components";

const numMatches = 2;

@customElement("wakutet-dashboard")
export class WakutetDashboardElement extends LitElement {
  static override styles = css`
  .container {
  }
  `;

  // @ts-ignore: ?
  @provide({ context: denocgContext })
  @state()
  private _denocgContext: DenoCGContext = createDenoCGContext();

  private _matchNameReplicant!: denocg.Replicant<string>
  private _commentaryNamesReplicant!: denocg.Replicant<string[]>

  @state()
  private _matchName = "";
  @state()
  private _commentaryNames: string[] = [];

  @query("#countdown-seconds")
  private _countdownSecondsNumber!: NumberField

  @query("#match-name")
  private _matchNameText!: TextField
  @query("#commentary-1")
  private _commentary1Text!: TextField
  @query("#commentary-2")
  private _commentary2Text!: TextField

  constructor() {
    super();
  }

  override async firstUpdated() {
    const client = await this._denocgContext.getClient();
    this._matchNameReplicant = await client.getReplicant("matchName");
    this._matchNameReplicant.subscribe(value => {
      this._matchName = value ?? "";
    });
    this._commentaryNamesReplicant = await client.getReplicant("commentaryNames");
    this._commentaryNamesReplicant.subscribe(value => {
      this._commentaryNames = value ?? [];
    });
  }

  private async _changeScene(sceneName: string) {
    const client = await this._denocgContext.getClient();
    const currentSceneNameReplicant = await client.getReplicant(
      "currentSceneName",
    );
    currentSceneNameReplicant.setValue(sceneName);
  }

  private async _setTitleScreenName(name: string) {
    const client = await this._denocgContext.getClient();
    const titleScreenNameReplicant = await client.getReplicant("titleScreenName");
    titleScreenNameReplicant.setValue(name);
  }

  private async _startCountdown() {
    const client = await this._denocgContext.getClient();
    const seconds = this._countdownSecondsNumber.valueAsNumber;
    client.broadcastMessage("startTitleTimer", { seconds });
  }

  private _setFooter() {
    this._matchNameReplicant.setValue(this._matchNameText.value);
    this._matchName = this._matchNameText.value;
    const commentaryNames: string[] = [];
    const rawCommentaryNames = [this._commentary1Text.value, this._commentary2Text.value];
    rawCommentaryNames.forEach(e => {
      if (e != "") commentaryNames.push(e);
    });
    this._commentaryNamesReplicant.setValue(commentaryNames);
    this._commentaryNames = commentaryNames;
  }

  override render() {
    // deno-fmt-ignore
    return html`
    <div class="container">
      <wakutet-section>
        <div slot="header">シーン</div>
        <div slot="content">
          <fluent-button @click=${() => this._changeScene("title")}>タイトル</fluent-button>
          <fluent-button @click=${() => this._changeScene("commentary")}>実況席</fluent-button>
          <fluent-button @click=${() => this._changeScene("player_introduction")}>プレイヤー紹介</fluent-button>
          <span style="display: inline-block">
            <fluent-button @click=${() => this._changeScene("play_screen_match12")}>ゲーム画面 (1, 2)</fluent-button>
            <fluent-button @click=${() => this._changeScene("play_screen_match1")}>ゲーム画面 (1)</fluent-button>
            <fluent-button @click=${() => this._changeScene("play_screen_match2")}>ゲーム画面 (2)</fluent-button>
          </span>
          <fluent-button @click=${() => this._changeScene("qualifier_ranking")}>予選ランキング</fluent-button>
          <fluent-button @click=${() => this._changeScene("bracket")}>トーナメント表</fluent-button>
        </div>
      </wakutet-section>
      <wakutet-section>
        <div slot="header">タイトル画面</div>
        <div slot="content">
          <fluent-button @click=${() => this._setTitleScreenName("generic")}>汎用</fluent-button>
          <fluent-button @click=${() => this._setTitleScreenName("preparing")}>準備中</fluent-button>
          <fluent-button @click=${() => this._setTitleScreenName("break")}>休憩中</fluent-button>
          <fluent-number-field id="countdown-seconds" style="margin-left: 16px; width: 150px; vertical-align: bottom;" min="0" value="600">カウントダウン秒数</fluent-number-field>
          <fluent-button @click=${() => this._startCountdown()}>セット</fluent-button>
        </div>
      </wakutet-section>
      <wakutet-player-introduction-controller></wakutet-player-introduction-controller>
      <wakutet-section>
        <div slot="header">フッター</div>
        <div slot="content">
          <fluent-text-field id="match-name" value=${this._matchName}>試合名</fluent-text-field>
          <div style="display: inline-block">
            <fluent-text-field id="commentary-1" value=${live(this._commentaryNames[0] ?? "")}>実況1</fluent-text-field>
            <fluent-text-field id="commentary-2" value=${live(this._commentaryNames[1] ?? "")}>実況2</fluent-text-field>
          </div>
          <br>
          <fluent-button appearance="accent" @click=${() => this._setFooter()}>更新</fluent-button>
        </div>
      </wakutet-section>
      ${map([...new Array(numMatches)].map((_, i) => i), matchIndex => {
        return html`<wakutet-stage-controller num-matches=${numMatches} match-index=${matchIndex}></wakutet-stage-controller>`;
      })}
      <wakutet-player-assigner num-matches=${numMatches}></wakutet-player-assigner>
      <wakutet-section>
        <div slot="header">その他リンク</div>
        <div slot="content">
          <a href="/profile_editor.html" target="_blank">プロフィールエディタ</a>
          <a href="/title.html" target="_blank">タイトルCG</a>
          <a href="/commentary.html" target="_blank">実況席CG</a>
          <a href="/player_introduction.html" target="_blank">プレイヤー紹介CG</a>
          <a href="http://localhost:5000/view/wakutet_2matches/PLAYER1?am=1,2" target="_blank">ゲーム画面CG (1, 2)</a>
          <a href="http://localhost:5000/view/wakutet_2matches/PLAYER1?am=1" target="_blank">ゲーム画面CG (1)</a>
          <a href="http://localhost:5000/view/wakutet_2matches/PLAYER1?am=2" target="_blank">ゲーム画面CG (2)</a>
          <a href="/qualifier_ranking.html" target="_blank">予選ランキングCG</a>
          <a href="/bracket.html" target="_blank">トーナメント表CG</a>
          <a href="/footer.html" target="_blank">フッターCG</a>
        </div>
      </wakutet-section>
    </div>
    `;
  }
}
