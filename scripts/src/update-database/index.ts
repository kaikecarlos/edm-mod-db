import * as core from "@actions/core";
import fs, { promises as fsp, writeFile } from "fs";
import path from "path";

import { fetchMods } from "./fetch-mods.js";
import { toJsonString } from "../helpers/to-json-string.js";
import { getSettledResult } from "../helpers/promises.js";
import { apiCallCount, rateLimitReached } from "./octokit.js";
import { DATABASE_FILE_NAME } from "../constants.js";
import type { OutputMod } from "../mod.js";

enum Input {
  outDirectory = "out-directory",
  modsFile = "mods",
  previousDatabaseFile = "previous-database",
}

enum Output {
  releases = "releases",
}

const measureTime = <T>(promise: Promise<T>, name: string) => {
  const initialTime = performance.now();

  promise.finally(() => {
    console.log(
      `Method "${name}" took ${performance.now() - initialTime} ms to finish.`
    );
  });

  return promise;
};

async function getAsyncStuff(previousDatabase: OutputMod[]) {
  const mods = (await fsp.readFile(core.getInput(Input.modsFile))).toString();

  const promises = [
    measureTime(
      fetchMods(mods, core.getInput(Input.outDirectory), previousDatabase),
      "fetchMods"
    ),
  ] as const;

  const [
    nextDatabase,
  ] = await Promise.allSettled(promises);

  return {
    nextDatabase: getSettledResult(nextDatabase) ?? [],
  };
}

type DatabaseOutput = {
  releases: OutputMod[];
};

async function run() {
  const previousDatabaseJson = (
    await fsp.readFile(core.getInput(Input.previousDatabaseFile))
  ).toString();

  const previousDatabaseOutput: DatabaseOutput =
    JSON.parse(previousDatabaseJson);

  const previousMods = [
    ...previousDatabaseOutput.releases,
  ];

  try {
    const {
      nextDatabase,
    } = await getAsyncStuff(previousMods);

    const modList = nextDatabase.map((mod) => ({
      ...mod,
    })) as OutputMod[];

    const databaseOutput: DatabaseOutput = {
      releases: modList
    };

    const databaseJson = toJsonString(databaseOutput);

    if (apiCallCount > 0) {
      console.log(`Called the GitHub API ${apiCallCount} times.`);
    }

    if (rateLimitReached) {
      core.setFailed("Rate limit reached");
      return;
    } else {
      core.setOutput(Output.releases, databaseJson);
    }

    const outputDirectoryPath = core.getInput(Input.outDirectory);

    if (!fs.existsSync(outputDirectoryPath)) {
      await fsp.mkdir(outputDirectoryPath, { recursive: true });
    }

    writeFile(
      path.join(outputDirectoryPath, DATABASE_FILE_NAME),
      databaseJson,
      (error) => {
        if (error) console.log("Error Saving To File:", error);
      }
    );
  } catch (error) {
    core.setFailed(`Error running workflow script: ${error}`);
    console.log(`Error running workflow script: ${error}`);
  }
}

run();
