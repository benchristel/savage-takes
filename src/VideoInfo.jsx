// @flow
import type { Broadcast } from "./Broadcast"
import type { Channel } from "./Channel";
import type { PlayerStatus } from "./PlayerStatus"
import type { Player } from "./youtube/player.jsx"
import { stateString } from "./PlayerStateView.jsx"
import { bookmarklet } from "./scraper/bookmarklet";
import { durationAsWords, hoursMinutesSeconds } from "./lib/time";
import { videoIdFromUrl } from "./youtube/videoId"
import * as React from "react"

type VideoInfoViewModel = {|
  videoLink: ?Link,
  actual: TableColumn,
  scheduled: TableColumn,
  secondsBehindSchedule: string,
  timeRemainingInVideo: string,
|}

type Link = {|
  href: string,
  text: string,
|}

type TableColumn = {|
  video: string,
  playerState: string,
  currentTime: string,
|}

function viewModel({ broadcast, player }): VideoInfoViewModel {
  const hms = (seconds) => hoursMinutesSeconds(seconds, 2)

  return {
    videoLink:
      broadcast.type === "video"
        ? {
            text: broadcast.videoTitle,
            href: "https://youtube.com/watch?v=" + broadcast.videoId,
          }
        : null,
    actual: {
      video: player.videoId ?? "",
      playerState: stateString(player.state),
      currentTime: player.time != null ? hms(player.time) : "-",
    },
    scheduled: {
      video: broadcast.type === "video" ? broadcast.videoId : "-",
      playerState: broadcast.type,
      currentTime:
        broadcast.type === "video" ? hms(broadcast.currentTime) : "-",
    },
    secondsBehindSchedule:
      broadcast.type === "video" && player.time != null
        ? (broadcast.currentTime - player.time).toFixed(2)
        : "-",
    timeRemainingInVideo:
      player.duration != null && player.time != null
        ? hms(player.duration - player.time)
        : "-",
  }
}

export function VideoInfo(props: {|
  isOpen: boolean,
  channels: Array<Channel>,
  broadcast: Broadcast,
  player: PlayerStatus,
  onClose: () => mixed,
|}): React.Node {
  const { isOpen, broadcast, player, onClose } = props
  const vm = viewModel({ broadcast, player })
  const closeButtonRef = React.useRef<?HTMLElement>(null)

  React.useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus()
      const closeOnEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose()
        }
      }
      document.addEventListener("keydown", closeOnEscape)
      return () => document.removeEventListener("keydown", closeOnEscape)
    }
  }, [isOpen])

  return (
    <div role="dialog" className="info-pane">
      <button ref={closeButtonRef} className="close-button" aria-label="close info pane" onClick={onClose}>
        close
      </button>
      <h1>Savage Takes</h1>
      <p>
        <a href="https://www.youtube.com/channel/UCiDJtJKMICpb9B1qf7qjEOA">
          Adam Savage's
        </a>
        {" "}
        thoughts on making, curated for programmers.
      </p>
      <p>
        Design and code by <a href="https://github.com/benchristel">Ben Christel</a>.{" "}
        <a href="https://github.com/benchristel/tv">Source code here</a>.
      </p>
      <hr />
      <h2>Video Info</h2>
      <p
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        Now playing:{" "}
        {vm.videoLink ? (
          <a href={vm.videoLink.href}>{vm.videoLink.text}</a>
        ) : (
          "-"
        )}
      </p>
      <table>
        <thead>
          <tr>
            <td></td>
            <th scope="col">actual</th>
            <th scope="col">scheduled</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">video</th>
            <td>{vm.actual.video}</td>
            <td>{vm.scheduled.video}</td>
          </tr>
          <tr>
            <th scope="row">player state</th>
            <td>{vm.actual.playerState}</td>
            <td>{vm.scheduled.playerState}</td>
          </tr>
          <tr>
            <th scope="row">current time</th>
            <td>{vm.actual.currentTime}</td>
            <td>{vm.scheduled.currentTime}</td>
          </tr>
        </tbody>
      </table>
      <p>Seconds behind schedule: {vm.secondsBehindSchedule}</p>
      <p>Time remaining in video: {vm.timeRemainingInVideo}</p>
      <h2>Channel Stats</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">name</th>
            <th scope="col">duration</th>
          </tr>
        </thead>
        <tbody>
          {props.channels.map(channel =>
            <ChannelTableRow channel={channel}/>
          )}
        </tbody>
      </table>
      <div style={{height: 60}}/>
    </div>
  )
}

function ChannelTableRow(props: {|channel: Channel|}): React.Node {
  return <tr>
    <td>{props.channel.getName()}</td>
    <td>{durationAsWords(props.channel.getTotalDuration())}</td>
  </tr>
}