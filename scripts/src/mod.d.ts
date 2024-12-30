import { type ModManagerOutput } from "./update-database/fetch-mod-manager.js";

export interface BaseMod {
  name: string;
  uniqueName: string;
  slug: string;
  description: string;
  author: string;
  repo: string;
  latestReleaseDate: string;
  firstReleaseDate: string;
  repoUpdatedAt: string;
  databaseEntryUpdatedAt: string;
  downloadUrl: string;
  version: string;
  tags?: string[];
  thumbnail: {
    main?: string;
    openGraph?: string;
  };
  latestReleaseDescription?: string;
  latestPrereleaseDescription?: string;
  prerelease?: {
    version: string;
    downloadUrl: string;
    date: string;
  };
  repoVariations?: string[];
}

export interface OutputMod extends BaseMod {
}

export type DatabaseOutput = {
  modManager: ModManagerOutput;
  releases: OutputMod[];
  alphaReleases: OutputMod[];
};
