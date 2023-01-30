import React, { createContext, useContext, useState } from "react";
import { LoadedDataContext } from "./Room";
import { Peer } from "./types";
import { useSocketEvent } from "./useSocketEvent";
import { UserContext } from "../context/user/User";

export const PeersContext = createContext<Peer[]>([]);

export function Peers({ children }: any) {
  const { user } = useContext(UserContext);
  const { peers: loadedPeers } = useContext(LoadedDataContext);
  const [peers, setPeers] = useState(loadedPeers.filter(peer => peer.id !== user.peerId));
  
  useSocketEvent('peer join', ({ peer }) => {
    setPeers(peers => [...peers, { ...peer, id: peer.peerId }]);
  }, [setPeers]);

  useSocketEvent('peer update', ({ peer }) => {
    peer.id = peer.peerId;
    setPeers(peers => peers.map((item) => item.id === peer.id ? peer : item))
  }, [setPeers]);

  useSocketEvent('peer leave', ({ peerId }) => {
    setPeers(peers => peers.filter((peer) => peer.id !== peerId));
  }, [setPeers])

  return (
    <PeersContext.Provider value={peers}>
      {children}
    </PeersContext.Provider>
  )
}