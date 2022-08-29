// @flow
import type { Channel } from "../Channel"

import type { Episode, Video } from "./types"

import { createChannel } from "../Channel"
import { albums } from "./music"
import { channel1Videos, channel2Videos, debuggingVideos } from "./shows"

export const channels: Array<Channel> = [
  // PROTOTYPE: for now, each episode just has one video in it.
  createChannel("Channel 1", channel1Videos.map(singleVideoEpisode)),
  createChannel("Channel 2", channel2Videos.map(singleVideoEpisode)),
  createChannel("Channel 3", albums),
  createChannel("debug", debuggingVideos.map(singleVideoEpisode)),
]

function singleVideoEpisode(v: Video): Episode {
  return { videos: [v] }
}
