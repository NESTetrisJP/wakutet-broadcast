type EmptyObject = Record<keyof unknown, never>;

export type PlayerDatabaseEntry = {
  id: number;
  name: string;
  englishName: string | null;
  qualifierBestScore: number;
  qualifierNumMaxout: number;
  profileEntries: [string, string][];
};

export type NameData = {
  original: string;
  english: string | null;
};

export type HeartsData = {
  max: number;
  lit: number;
};

export type ProfileData = {
  name: string;
  entries: [string, string][];
};

export type QualifierRankingEntry = {
  place: number;
  name: string;
  englishName: string | null;
  bestScore: number;
  numMaxout: number;
};

export type TypeDefinition = {
  replicants: {
    currentSceneName: string;
    matchName: string;
    playerNames: [NameData, NameData];
    playerHearts: [HeartsData, HeartsData];
    playerProfiles: [ProfileData, ProfileData];
    playerProfilesVisible: boolean;
    qualifierRanking: QualifierRankingEntry[];

    // dashboard only
    playerDatabase: PlayerDatabaseEntry[];
    playerProfileHiddenEntries: Record<string, string[]>;
  };

  messages: {};

  requests: {
    fetchPlayerDatabase: EmptyObject;
  };
};
