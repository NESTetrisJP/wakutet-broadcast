type EmptyObject = Record<keyof unknown, never>;

export type PlayerDatabaseEntry = {
  name: string,
  profileEntries: [string, string][],
}

export type ProfileData = {
  name: string,
  entries: [string, string][],
}

export type TypeDefinition = {
  replicants: {
    currentSceneName: string;
    matchName: string,
    playerNames: string[],
    playerHearts: { max: number, lit: number }[],
    playerProfiles: ProfileData[],

    playerDatabase: PlayerDatabaseEntry[],
    playerProfileHiddenEntries: Record<string, string[]>,
  };

  messages: {};

  requests: {
  };
};
