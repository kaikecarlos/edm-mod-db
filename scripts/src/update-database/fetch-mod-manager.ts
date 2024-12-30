import { RELEASE_EXTENSION } from "../constants.js";
import { getAllReleases, getOctokit } from "./octokit.js";

const MANAGER_REPO_AUTHOR = "kaikecarlos";
const MANAGER_REPO_NAME = "EDMModManager";
const LEGACY_RELEASE_TAG = "LEGACY";
const EXE_EXTENSION = "exe";

export type ModManagerOutput = {
  version: string;
  downloadUrl: string;
  zipDownloadUrl: string;
  installerDownloadUrl: string;
  downloadCount: number;
};
