import { Transport } from "mediasoup-client/lib/Transport";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { DeviceContext } from ".";
import { AuthContext } from "../../context/auth/Auth";

export const SendTransportContext = createContext(null as any as Transport);
export const RecvTransportContext = createContext(null as any as Transport);

export function Transports({ children, preloader }: { children: ReactNode, preloader: (text: string) => any }) {
  const device = useContext(DeviceContext);
  const [sendTransport, setSendTransport] = useState<Transport | null>(null);
  const [recvTransport, setRecvTransport] = useState<Transport | null>(null);

  const { http } = useContext(AuthContext);

  useEffect(() => {
    let newTransport: Transport | null = null;
    (async () => {
      const options = await http.post('/transport/create').then((res) => res.data);
      newTransport = device.createSendTransport(options);

      newTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await http.post('/transport/connect', { transportId: newTransport?.id, dtlsParameters });
          callback();
        } catch (error: any) {
          console.log(error);
          errback(error);
        }
      });
    
      newTransport.on(
        'produce',
        async ({ kind, rtpParameters, appData }, callback, errback) => {
          try {        
            const { data: { id } } = await http.post(
              '/producer/create',
              {
                transportId: newTransport?.id,
                kind,
                rtpParameters,
                mediaTag: appData.mediaTag,
                paused: appData.paused,
              },
            );
            callback({ id });
          } catch (error: any) {
            errback(error);
          }
        },
      );

      setSendTransport(newTransport);
    })();

    return () => {
      if (newTransport) {
        newTransport.close();
      }
    }
  }, [device]);

  useEffect(() => {
    let newTransport: Transport | null = null;

    (async () => {
      const options = await http.post('/transport/create').then((res) => res.data);
      newTransport = device.createRecvTransport(options);

      newTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await http.post('/transport/connect', { transportId: newTransport?.id, dtlsParameters });
          callback();
        } catch (error: any) {
          console.log(error);
          errback(error);
        }
      });

      setRecvTransport(newTransport);
    })();

    return () => {
      if (newTransport) {
        newTransport.close();
      }
    }
  }, [device]);

  if (!sendTransport || !recvTransport) {
    return preloader("Подключаем транспорты");
  }

  return (
    <RecvTransportContext.Provider value={recvTransport}>
      <SendTransportContext.Provider value={sendTransport}>
        {children}
      </SendTransportContext.Provider>
    </RecvTransportContext.Provider>
  )
}