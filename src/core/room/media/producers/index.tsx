import { Producer } from "mediasoup-client/lib/Producer";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { MediaTag, TrackData } from "..";
import { AuthContext } from "../../../context/auth/Auth";
import { UserContext } from "../../../context/user/User";
import { LoadedDataContext } from "../../Room";
import { SendTransportContext } from "../Transports";

export type UserTracksType = {
  data: TrackData[];
  sendTrack(track: MediaStreamTrack, mediaTag: MediaTag, paused: boolean): any;
  resumeTrack(mediaTag: MediaTag): any;
  pauseTrack(mediaTag: MediaTag): any;
  closeTrack(mediaTag: MediaTag): any;
}

export const UserTracksContext = createContext(null as any as UserTracksType);

export function UserTracks({ children }: any) {
  const transport = useContext(SendTransportContext);
  
  const { http } = useContext(AuthContext);
  const { user: { peerId } } = useContext(UserContext);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [paused, setPaused] = useState<MediaTag[]>([]);

  const producerByMediaTag = (handler: (producer: Producer) => any) => {
    return (mediaTag: MediaTag) => {
      const producer = producers.find(producer => producer.appData.mediaTag === mediaTag);

      if (producer) {
        return handler(producer)
      }
    }
  }

  const value: UserTracksType = useMemo(() => ({
    data: producers.map((producer) => {
      const isPaused = paused.includes(producer.appData.mediaTag as MediaTag);

      return ({
        track: producer.track as MediaStreamTrack,
        peerId,
        paused: isPaused,
        consumePaused: isPaused,
        producePaused: isPaused,
        mediaTag: producer.appData.mediaTag as MediaTag,
      });
    }),

    async sendTrack(track, mediaTag, paused) {
      if (paused) {
        setPaused((state) => [...state, mediaTag]);
      }

      try {
        const producer = await transport.produce({
          track,
          appData: {
            mediaTag,
            paused,
          },
        });

        setProducers(producers => [...producers, producer]);
      } catch (e: any) {
        setPaused((paused) => paused.filter((id) => id !== mediaTag));
      }
    },

    resumeTrack: producerByMediaTag((producer) => {
      producer.resume();
      http.post('/producer/resume', { producerId: producer.id });
      setPaused((paused) => paused.filter((id) => id !== producer.appData.mediaTag));
    }),

    pauseTrack: producerByMediaTag((producer) => {
      producer.pause();
      http.post('/producer/pause', { producerId: producer.id });
      setPaused((paused) => [...paused, producer.appData.mediaTag as MediaTag]);
    }),

    closeTrack: producerByMediaTag((producer) => {
      producer.close();
      http.post('/producer/close', { producerId: producer.id });
      setPaused((paused) => paused.filter((id) => id !== producer.appData.mediaTag));
      setProducers((producers) => producers.filter((item) => item.id !== producer.id))
    }),
  }), [setPaused, setProducers, producers, http, paused]);

  return (
    <UserTracksContext.Provider value={value}>
      {children}
    </UserTracksContext.Provider>
  )
}

export function UserTracksAutoSendForJoinAndCloseForLeave({ children, preloader }: any) {
  const { roomId } = useContext(LoadedDataContext);
  const { sendTrack, closeTrack } = useContext(UserTracksContext);
  const { user: { videoDeviceId, audioDeviceId, audioStatePause, videoStatePause } } = useContext(UserContext);

  const [sended, setSended] = useState(false);

  useEffect(() => {
    setSended(false);
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoDeviceId ? { deviceId: videoDeviceId } : false,
        audio: audioDeviceId ? { deviceId: audioDeviceId } : false,
      });

      sendTrack(stream.getAudioTracks()[0], 'cam-audio', audioStatePause);

      if (videoDeviceId) {
        sendTrack(stream.getVideoTracks()[0], 'cam-video', videoStatePause);
      }

      setSended(true);
    })();

    () => {
      setSended(false);
      closeTrack('cam-audio');
      closeTrack('cam-video');
      closeTrack('screen-video');
    }
  }, [roomId]);

  return sended ? children : preloader("Отправляем Вашу трансляцию");
}
