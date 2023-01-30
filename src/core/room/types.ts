import { RtpCapabilities } from "mediasoup-client/lib/RtpParameters";

export type Peer = {
  id: string,
  displayName: string,
  avatar: string | null,
}

export type ProducerInfo = {
  id: string,
  peerId: string,
  kind: 'video' | 'audio',
  mediaTag: string,
  paused: boolean,
  recordStatus: 'stop' | 'setting' | 'run',
}

export type Track = {
  peerId: string;
  track: MediaStreamTrack;
  mediaTag: string;
};

export type LocalPausedTrack = {
  peerId: string;
  mediaTag: string;
}

export type Message ={
  id: string,
  text: string,
  files: {
      type: string,
      url: string,
      size: number,
      name: string,
  }[];
  author: Peer
}

export type Line = {
  start: {
    x: number,
    y: number,
  },
  end: {
    x: number,
    y: number,
  },
  color: string,
  page: number,
  peerId: string,
}

export type Presentation = {
  id: string;
  peerId: string;
  url: string;
  pageNum: number;
  totalPages: number;
  lines: Line[];
  pensColors: { [peerId: string]: string | null };
}

export type LoadedRoomData = {
  roomId: string,
  peers: Peer[],
  messages: Message[],
  presentation: Presentation | null,
  wavings: string[],
  producers: ProducerInfo[],
  routerRtpCapabilities: RtpCapabilities,
}