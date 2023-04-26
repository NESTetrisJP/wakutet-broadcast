import { denocg } from "../deps/denocg.ts";
import { DenoCGContext, denocgContext } from "../denocg_context.ts";
import {
  consume,
  css,
  customElement,
  html,
  LitElement,
  map,
  state,
} from "../deps/lit.ts";
import "../deps/fluent.ts";
import {
  NameData,
  PlayerDatabaseEntry,
  ProfileData,
} from "../../common/type_definition.ts";
import "./profile_card.ts";

@customElement("wakutet-player-assigner")
export class WakutetPlayerAssignerElement extends LitElement {
  static styles = css`
  .container {
  }

  .profile-card-preview div {
    display: inline-block;
    background-color: black;
  }

  wakutet-profile-card {
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
  private _fetchingPlayerDatabase = false;

  @state()
  private _playerDatabase: PlayerDatabaseEntry[] = [];
  @state()
  private _databaseSelectedId = -1;
  @state()
  private _playerProfileHiddenEntries: Record<string, string[]> = {};

  private _playerNamesReplicant!: denocg.Replicant<[NameData, NameData]>;
  private _playerProfilesReplicant!: denocg.Replicant<
    [ProfileData, ProfileData]
  >;
  private _playerProfileHiddenEntriesReplicant!: denocg.Replicant<
    Record<string, string[]>
  >;

  private _playerNames: [NameData, NameData] = [null, null].map((_) => ({
    original: "",
    english: "",
  })) as [NameData, NameData];
  private _playerProfiles: [ProfileData, ProfileData] = [null, null].map(
    (_) => ({ name: "", entries: [] as [string, string][] }),
  ) as [ProfileData, ProfileData];

  async firstUpdated() {
    const client = await this._denocgContext.getClient();
    const playerDatabaseReplicant = await client.getReplicant("playerDatabase");
    playerDatabaseReplicant.subscribe((value) => {
      this._playerDatabase = value ?? [];
    });
    this._playerNamesReplicant = await client.getReplicant("playerNames");
    this._playerProfilesReplicant = await client.getReplicant("playerProfiles");
    this._playerProfileHiddenEntriesReplicant = await client.getReplicant(
      "playerProfileHiddenEntries",
    );
    this._playerNamesReplicant.subscribe((value) => {
      this._playerNames = value ??
        [null, null].map((_) => ({ original: "", english: "" })) as [
          NameData,
          NameData,
        ];
    });
    this._playerProfilesReplicant.subscribe((value) => {
      this._playerProfiles = value ??
        [null, null].map((_) => ({
          name: "",
          entries: [] as [string, string][],
        })) as [ProfileData, ProfileData];
    });
    this._playerProfileHiddenEntriesReplicant.subscribe((value) => {
      this._playerProfileHiddenEntries = value ?? {};
    });
  }

  private async _fetchPlayerDatabase() {
    try {
      this._fetchingPlayerDatabase = true;
      const client = await this._denocgContext.getClient();
      await client.requestToServer("fetchPlayerDatabase");
    } finally {
      this._fetchingPlayerDatabase = false;
    }
  }

  private _constructNameData(
    databaseEntry: PlayerDatabaseEntry | null,
  ): NameData {
    if (databaseEntry == null) return { original: "", english: null };
    return { original: databaseEntry.name, english: databaseEntry.englishName };
  }

  private _constructProfileData(
    databaseEntry: PlayerDatabaseEntry | null,
  ): ProfileData {
    if (databaseEntry == null) return { name: "", entries: [] };
    const hiddenEntries =
      this._playerProfileHiddenEntries[databaseEntry.name] ?? [];
    return {
      name: databaseEntry.name,
      entries: databaseEntry.profileEntries.filter((e) =>
        hiddenEntries.indexOf(e[0]) == -1
      ),
    };
  }

  private async _selectRow(id: number) {
    // TODO: 仮対処 行を切り替えたときにチェックが切り替わらない
    this._databaseSelectedId = -1;
    await new Promise((res) => setTimeout(res, 0));
    this._databaseSelectedId = id;
  }

  private _assignPlayer(id: number, playerIndex: number) {
    const playerNames = [...this._playerNames] as [NameData, NameData];
    const playerProfiles = [...this._playerProfiles] as [
      ProfileData,
      ProfileData,
    ];
    playerNames[playerIndex] = this._constructNameData(
      this._playerDatabase.find((e) => e.id == id) ?? null,
    );
    playerProfiles[playerIndex] = this._constructProfileData(
      this._playerDatabase.find((e) => e.id == id) ?? null,
    );
    this._playerNamesReplicant.setValue(playerNames);
    this._playerProfilesReplicant.setValue(playerProfiles);
  }

  private _getProfileEntryVisibility(
    playerName: string,
    entryName: string,
  ): boolean {
    return (this._playerProfileHiddenEntries[playerName] ?? []).indexOf(
      entryName,
    ) == -1;
  }

  private _setProfileEntryVisibility(
    playerName: string,
    entryName: string,
    isVisible: boolean,
  ) {
    const modifiedEntries = [
      ...(this._playerProfileHiddenEntries[playerName] ?? []),
    ];
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
    this._playerProfileHiddenEntriesReplicant.setValue({
      ...this._playerProfileHiddenEntries,
      [playerName]: modifiedEntries,
    });
  }

  render() {
    const selectedDatabaseEntry = this._playerDatabase.find((e) =>
      e.id == this._databaseSelectedId
    );
    const previewProfile = selectedDatabaseEntry != null
      ? this._constructProfileData(selectedDatabaseEntry)
      : null;

    return html`
    <div class="container">
      <fluent-button @click=${() =>
      this
        ._fetchPlayerDatabase()} ?disabled=${this._fetchingPlayerDatabase}>プレイヤー情報更新</fluent-button>
      ${
      map(this._playerDatabase, (e) =>
        html`
      <div @click=${() => this._selectRow(e.id)}>
        ${e.name}
      </div>
      `)
    }
      <div>
        ${
      (() => {
        if (selectedDatabaseEntry == null) return null;
        const profileEntryKeys = selectedDatabaseEntry.profileEntries.map((e) =>
          e[0]
        );
        return map(profileEntryKeys, (e) =>
          html`
          <fluent-checkbox ?checked=${
            this._getProfileEntryVisibility(selectedDatabaseEntry.name, e)
          } @change=${(ev: Event) =>
            this._setProfileEntryVisibility(
              selectedDatabaseEntry.name,
              e,
              (ev.target as HTMLInputElement).checked,
            )}>${e}</fluent-checkbox>
          `);
      })()
    }
      </div>
      <div class="profile-card-preview">
        <div>
          <wakutet-profile-card .profile=${previewProfile}></wakutet-profile-card>
        </div>
      </div>
      <fluent-button @click=${(ev: Event) => {
      this._assignPlayer(this._databaseSelectedId, 0);
      ev.stopPropagation();
    }}>1P</fluent-button>
      <fluent-button @click=${(ev: Event) => {
      this._assignPlayer(this._databaseSelectedId, 1);
      ev.stopPropagation();
    }}>2P</fluent-button>
    </div>
    `;
  }
}
