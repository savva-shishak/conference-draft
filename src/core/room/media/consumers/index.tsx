import { Consumer } from "mediasoup-client/lib/Consumer";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DeviceContext, MediaTag, TrackData } from "..";
import { AuthContext } from "../../../context/auth/Auth";
import { ProducerInfo } from "../../types";
import { LoadedDataContext } from "../../Room";
import { createConsumerFactory } from "./createConsumer";
import { useSocketEvent } from "../../useSocketEvent";
import { RecvTransportContext } from "../Transports";

export type PeersTracksType = {
  data: TrackData[],
  pauseConsume: (peerId: string, mediaTag: MediaTag) => void,
  resumeConsume: (peerId: string, mediaTag: MediaTag) => void,
}

export const PeersTracksContext = createContext(null as any as PeersTracksType);

export function PeersTracks({ children }: any) {
  const { producers } = useContext(LoadedDataContext);
  const { http } = useContext(AuthContext);
  const transport = useContext(RecvTransportContext);
  const device = useContext(DeviceContext);
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [pausedProducers, setPausedProducers] = useState<string[]>([]);
  const [pausedConsumers, setPausedConsumers] = useState<string[]>([]);

  const createConsumer =
    transport
      ? createConsumerFactory(transport, http, device)
      : (producer: ProducerInfo) => null;

  useEffect(() => {
    if (transport) {
      for (const producer of producers) {
        if (producer.paused) {
          setPausedProducers((pausedProducers) => [...pausedProducers, producer.id]);
        }
        createConsumer(producer)?.then((consumer) => {
          setConsumers((consumers) => [...consumers, consumer]);
        })
      }
    }

    return () => {
      setConsumers((consumers) => consumers.filter((consumer) => {
        consumer.close();
        return false;
      }));
    };
  }, [producers, transport]);

  useSocketEvent('create producer', async (producer: ProducerInfo) => {
    if (producer.paused) {
      setPausedProducers((pausedProducers) => [...pausedProducers, producer.id]);
    }
    createConsumer(producer)?.then((consumer) => {
      setConsumers((consumers) => [...consumers, consumer]);
    })
  }, [transport, setPausedProducers]);

  useSocketEvent('pause producer', ({ id }) => {
    setPausedProducers((pausedProducers) => [...pausedProducers, id]);
  }, [transport, setPausedProducers]);

  useSocketEvent('resume producer', ({ id }) => {
    
    setPausedProducers((pausedProducers) => pausedProducers.filter((item) => item !== id));
  }, [transport, setPausedProducers]);

  useSocketEvent('close producer', ({ id }) => {
    setPausedProducers((pausedProducers) => pausedProducers.filter((item) => item !== id));

    setConsumers((consumers) => consumers.filter((consumer) => {
      if (consumer.producerId === id) {
        consumer.close();
        return false;
      }
      return true;
    }))
  }, [transport, setPausedProducers, setConsumers]);

  

  const value = useMemo(() => ({
    data: consumers.map(({ producerId, id, track, appData: { peerId, mediaTag } }: any) => {
      const consumePaused = pausedConsumers.includes(id);
      const producePaused = pausedProducers.includes(producerId);
      return ({
        producerId,
        paused: consumePaused || producePaused,
        peerId,
        mediaTag,
        track,
        consumePaused,
        producePaused, 
      })
    }),
    pauseConsume(peerId: string, mediaTag: MediaTag) {
      const consumer = consumers
        .find(({ appData }) => (
          appData.peerId === peerId
          && appData.mediaTag === mediaTag
        ));

      if (consumer) {
        http.post('/consumer/pause', { consumerId: consumer.id });
        consumer.pause();
        setPausedConsumers((paused) => [...paused, consumer.id]);
      }
    },
    resumeConsume(peerId: string, mediaTag: MediaTag) {
      const consumer = consumers
        .find(({ appData }) => (
          appData.peerId === peerId
          && appData.mediaTag === mediaTag
        ));

      if (consumer) {
        http.post('/consumer/resume', { consumerId: consumer.id });
        consumer.resume();
        setPausedConsumers((paused) => paused.filter((item) => item !== consumer.id));
      }
    },
  }), [consumers, pausedConsumers, pausedProducers]);

  return (
    <PeersTracksContext.Provider value={value}>
      {children}
    </PeersTracksContext.Provider>
  )
}