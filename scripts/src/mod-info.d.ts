export type ModList = {
  mods: ModInfo[];
};

export type ModInfo = {
  name: string;
  uniqueName: string;
  repo: string;
  description: string;
  author: string;
  tags?: string[];
  downloadCountOffset?: number;
  firstReleaseDateOverride?: string;
};
