import { denocg } from "../deps/denocg.ts";
import { denocgContext, DenoCGContext } from "../denocg_context.ts";
import { consume, css, customElement, html, LitElement, live, map, property, state } from "../deps/lit.ts";
import "../deps/fluent.ts";
import { PlayerDatabaseEntry, ProfileData } from "../../common/type_definition.ts";
import "./profile_card.ts";

@customElement("wakuteto-player-assigner")
export class WakutetoPlayerAssignerElement extends LitElement {
  static styles = css`
  .container {
  }

  .profile-card-preview div {
    display: inline-block;
    background-color: black;
  }

  wakuteto-profile-card {
    zoom: 50%;
  }
  `;

  constructor() {
    super();
  }

  // @ts-ignore: ?
  @consume({ context: denocgContext })
  private _denocgContext!: DenoCGContext;

  @state()
  private _playerDatabase: PlayerDatabaseEntry[] = [];
  @state()
  private _databaseSelectedIndex = -1;
  @state()
  private _playerProfileHiddenEntries: Record<string, string[]> = {};

  @state()
  private _assignedPlayerRowIndices = [-1, -1];

  private _playerNamesReplicant!: denocg.Replicant<string[]>;
  private _playerProfilesReplicant!: denocg.Replicant<ProfileData[]>;
  private _playerProfileHiddenEntriesReplicant!: denocg.Replicant<Record<string, string[]>>;

  async firstUpdated() {
    const client = await this._denocgContext.getClient();
    const playerDatabaseReplicant = await client.getReplicant("playerDatabase");
    playerDatabaseReplicant.subscribe(value => {
      this._playerDatabase = value ?? [];
    });
    this._playerNamesReplicant = await client.getReplicant("playerNames");
    this._playerProfilesReplicant = await client.getReplicant("playerProfiles");
    this._playerProfileHiddenEntriesReplicant = await client.getReplicant("playerProfileHiddenEntries");
    this._playerProfileHiddenEntries = this._playerProfileHiddenEntriesReplicant.getValue() ?? {};

    this._assignPlayer(-1, 0);
    this._assignPlayer(-1, 1);
  }

  private _constructProfileData(databaseEntry: PlayerDatabaseEntry | null): ProfileData {
    if (databaseEntry == null) return { name: "", entries: [] };
    const hiddenEntries = this._playerProfileHiddenEntries[databaseEntry.name] ?? [];
    return {
      name: databaseEntry.name,
      entries: databaseEntry.profileEntries.filter(e => hiddenEntries.indexOf(e[0]) == -1),
    }
  }

  private async _selectRow(rowIndex: number) {
    // TODO: 仮対処 行を切り替えたときにチェックが切り替わらない
    this._databaseSelectedIndex = -1;
    await new Promise(res => setTimeout(res, 0));
    this._databaseSelectedIndex = rowIndex;
  }

  private _assignPlayer(rowIndex: number, playerIndex: number) {
    this._assignedPlayerRowIndices[playerIndex] = rowIndex;
    this._playerNamesReplicant.setValue(this._assignedPlayerRowIndices.map(i => this._playerDatabase[i]?.name ?? ""));
    this._playerProfilesReplicant.setValue(this._assignedPlayerRowIndices.map(i => this._constructProfileData(this._playerDatabase[i])));
  }

  private _getProfileEntryVisibility(playerName: string, entryName: string): boolean {
    return (this._playerProfileHiddenEntries[playerName] ?? []).indexOf(entryName) == -1;
  }

  private _setProfileEntryVisibility(playerName: string, entryName: string, isVisible: boolean) {
    const modifiedEntries = [...(this._playerProfileHiddenEntries[playerName] ?? [])];
    if (isVisible) {
      const index = modifiedEntries.indexOf(entryName);
      if (index >= 0) {
        modifiedEntries.splice(index);
      }
    } else {
      if (modifiedEntries.indexOf(entryName) == -1) {
        modifiedEntries.push(entryName);
      }
    }
    this._playerProfileHiddenEntries = { ...this._playerProfileHiddenEntries, [playerName]: modifiedEntries };
    this._playerProfileHiddenEntriesReplicant.setValue(this._playerProfileHiddenEntries);
  }

  render() {
    const selectedDatabaseEntry = this._playerDatabase[this._databaseSelectedIndex];
    const previewProfile = selectedDatabaseEntry != null ? this._constructProfileData(selectedDatabaseEntry) : null;

    return html`
    <div class="container">
      ${map(this._playerDatabase, (e, i) => html`
      <div @click=${() => this._selectRow(i)}>
        ${e.name}
      </div>
      `)}
      <div>
        ${(() => {
          if (selectedDatabaseEntry == null) return null;
          const profileEntryKeys = selectedDatabaseEntry.profileEntries.map(e => e[0]);
          return map(profileEntryKeys, (e) => html`
          <fluent-checkbox ?checked=${this._getProfileEntryVisibility(selectedDatabaseEntry.name, e)} @change=${(ev: Event) => this._setProfileEntryVisibility(selectedDatabaseEntry.name, e, (ev.target as HTMLInputElement).checked)}>${e}</fluent-checkbox>
          `);
        })()}
      </div>
      <div class="profile-card-preview">
        <div>
          <wakuteto-profile-card .profile=${previewProfile}></wakuteto-profile-card>
        </div>
      </div>
      <fluent-button @click=${(ev: Event) => { this._assignPlayer(this._databaseSelectedIndex, 0); ev.stopPropagation(); }}>1P</fluent-button>
      <fluent-button @click=${(ev: Event) => { this._assignPlayer(this._databaseSelectedIndex, 1); ev.stopPropagation(); }}>2P</fluent-button>
    </div>
    `;
  }
}
