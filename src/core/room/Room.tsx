import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/auth/Auth";
import { UserContext } from "../context/user/User";
import { LoadedRoomData } from "./types";
import { Media } from "./media";
import { Messenger } from "./messenger";
import { Peers } from "./peers";
import { Presentation } from "./presntation";
import { useSocketEvent } from "./useSocketEvent";
import { Wavings } from "./wavings";

export const LoadedDataContext = createContext({
  roomId: '',
  peers: [],
  messages: [],
  presentation: null,
  wavings: [],
  producers: [],
  routerRtpCapabilities: {},
} as LoadedRoomData);

export function RoomProvider({ roomId, children, preloader }: { roomId: string, children: ReactNode, preloader: (text: string) => ReactNode }) {
  const { socket, http } = useContext(AuthContext);
  const { user } = useContext(UserContext);
  const [joined, setJoined] = useState(false);
  const [data, setData] = useState<LoadedRoomData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setJoined(false);
    socket.on('joined', async (data: Omit<LoadedRoomData, 'roomId'>) => {
      setData({ ...data, roomId, peers: data.peers.map((peer: any) => ({ ...peer, id: peer.peerId })) });
      setJoined(true);
    });
    
    socket.emit('join', { roomId });

    return () => {
      if (joined) {
        socket.emit('leave');
        setJoined(false);
      }
    }
  }, [roomId]);

  useSocketEvent('throw out', () => {
    if (joined) {
      toast.info('Произошла ошибка, скорее всего вы зашли в комнату с двух вкладок баузера');
      navigate('/');
    }
  }, [roomId, user.peerId, joined]);

  useEffect(() => {
    const interceptorId = http.interceptors.request.use((request) => {
      request.headers = {
        ...(request.headers || {}),
        room: roomId
      }
      return request;
    });

    return () => {
      http.interceptors.request.eject(interceptorId);
    }
  }, [http, roomId]);

  if (joined && data) {
    return (
      <LoadedDataContext.Provider value={data}>
        <Peers>
          <Media preloader={preloader}>
            <Presentation>
              <Wavings>
                <Messenger>
                  {children}
                </Messenger>
              </Wavings>
            </Presentation>
          </Media>
        </Peers>
      </LoadedDataContext.Provider >
    );
  } else {
    return preloader('Входим в комнату');
  }
}