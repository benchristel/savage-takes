// @flow
import * as channel1 from "./channel1"
import type { Episode } from "../video/types";
import { allEpisodes } from "./parser";

export const channels: Array<[string, BroadcastAlgorithm, Array<Episode>]> = [
  ["Channel 1", "shuffle", channel1],
].filter(Boolean)
  .map(([name, algorithm, module]) => [name, algorithm, allEpisodes(module)])

  export type BroadcastAlgorithm =
    | "shuffle"
    | "test-segment-boundaries"