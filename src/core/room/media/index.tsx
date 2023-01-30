import { Device } from 'mediasoup-client'
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Audio } from '../Audio';
import { LoadedDataContext } from "../Room";
import { PeersTracks, PeersTracksContext } from './consumers';
import { UserTracks, UserTracksAutoSendForJoinAndCloseForLeave, UserTracksContext } from './producers';
import { Transports } from './Transports';

export type MediaTag = 'cam-video' | 'cam-audio' | 'screen-video';

export type TrackData = {
  producerId?: string,
  track: MediaStreamTrack,
  peerId: string,
  paused: boolean,
  mediaTag: MediaTag,
  consumePaused: boolean,
  producePaused: boolean,
}

export const DeviceContext = createContext(null as any as Device);

export function Media({ children, preloader }: { children: ReactNode, preloader: (text: string) => any }) {
  const { routerRtpCapabilities } = useContext(LoadedDataContext);
  const [device, setDevice] = useState<Device | null>(null)

  useEffect(() => {
    setDevice(null);

    const device = new Device();

    device.load({ routerRtpCapabilities }).then(() => {
      setDevice(device)
    });
  }, [routerRtpCapabilities]);

  if (!device) {
    return preloader("Подключаемся к трансляции");
  }

  return (
    <DeviceContext.Provider value={device}>
      <Transports preloader={preloader}>
        <UserTracks>
          <UserTracksAutoSendForJoinAndCloseForLeave preloader={preloader}>
            <PeersTracks>
              <Audio />
              {children}
            </PeersTracks>
          </UserTracksAutoSendForJoinAndCloseForLeave>
        </UserTracks>
      </Transports>
    </DeviceContext.Provider>
  )
}

export function useAllTracks() {
  const { data: userTracks, ...userFunctions } = useContext(UserTracksContext);
  const { data: peersTracks, ...peersFunctions } = useContext(PeersTracksContext);

  return {
    data: [...peersTracks, ...userTracks],
    ...userFunctions,
    ...peersFunctions,
  }
}