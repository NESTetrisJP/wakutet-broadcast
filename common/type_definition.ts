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
  entries: [string, string][];
};

export type MatchData = {
  playerNames: NameData[];
  playerHearts: HeartsData[];
  playerProfiles: ProfileData[];
  playerProfilesVisible: boolean;
}

export type QualifierRankingEntry = {
  place: number;
  name: string;
  englishName: string | null;
  bestScore: number;
  numMaxout: number;
};

export type PlayerIntroductionData = {
  name: NameData;
  profile: ProfileData;
}

export type TypeDefinition = {
  replicants: {
    currentSceneName: string;
    titleScreenName: string;
    matchName: string;
    commentaryNames: string[];
    matchData: MatchData[];
    qualifierRanking: QualifierRankingEntry[];
    activePlayerIntroduction?: PlayerIntroductionData;

    // dashboard only
    playerDatabase: PlayerDatabaseEntry[];
    playerProfileHiddenEntries: Record<string, string[]>;
  };

  messages: {
    startTitleTimer: { params: { seconds: number } }
  };

  requests: {
    fetchPlayerDatabase: EmptyObject;
  };
};
