import * as core from "@actions/core";

import { writeFile } from "fs";
import type { ModInfo, ModList } from "../mod-info";

enum Input {
  outFile = "out-file",
  form = "form",
  mods = "mods",
  gitHubToken = "github-token",
}

enum Output {
  mods = "mods",
  editedExistingMod = "edited-existing-mod",
}

// From .github/ISSUE_TEMPLATE/add-mod.yml.
type IssueForm = {
  name?: string;
  uniqueName?: string;
  repoUrl?: string;
  description?: string;
  author?: string;
  tags?: string;
};

async function run() {
  const {
    name,
    repoUrl,
    uniqueName,
    description,
    author,
    tags,
  }: IssueForm = JSON.parse(core.getInput(Input.form));

  if (!name || !repoUrl || !uniqueName || !description || !author) {
    throw new Error("Invalid form format");
  }

  let repo = repoUrl.match(/github\.com\/([^/]+\/[^/]+)\/?.*/)?.[1];

  if (!repo) {
    throw new Error("Invalid repo URL " + repoUrl);
  }

  if (repo.endsWith(".git")) {
    repo = repo.slice(0, -4);
  }

  const modDb: ModList = JSON.parse(core.getInput(Input.mods));
  const mods = modDb.mods;

  const newMod: ModInfo = {
    name,
    uniqueName,
    repo,
    description,
    author,
    tags: [],
  };

  if (tags) {
    newMod.tags = tags.split(", ");
  }

  const existingMod = mods.find(
    (modFromList) => uniqueName === modFromList.uniqueName
  );

  if (existingMod) {
    existingMod.name = newMod.name;
    existingMod.repo = newMod.repo;
    existingMod.author = newMod.author;
    existingMod.description = newMod.description;
    existingMod.tags = newMod.tags;
  }

  const newModDb: ModList = {
    mods: existingMod ? mods : [...mods, newMod],
  };

  const jsonString = JSON.stringify(newModDb, null, 2);

  core.setOutput(Output.mods, jsonString);

  const outFile = core.getInput(Input.outFile);

  if (outFile) {
    writeFile(outFile, jsonString, (error) => {
      if (error) console.log("Couldn't Write To Mods File: ", error);
    });
  }

  if (existingMod) {
    core.setOutput(Output.editedExistingMod, true);
  }
}

run();
