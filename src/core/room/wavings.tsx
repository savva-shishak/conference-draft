import React, { createContext, useContext, useState } from "react";
import { AuthContext } from "../context/auth/Auth";
import { UserContext } from "../context/user/User";
import { LoadedDataContext } from "./Room";
import { useSocketEvent } from "./useSocketEvent";

export const WavingsContext = createContext({
  wavings: [] as string[],
  toggleWaving(value: boolean) {},
})

export function Wavings({ children }: any) {
  const { http } = useContext(AuthContext);
  const { peerId } = useContext(UserContext).user;
  const [wavings, setWavings] = useState(useContext(LoadedDataContext).wavings);

  useSocketEvent('update wavings', ({ peerId, value }) => {
    setWavings((state) => (
      value 
        ? [...state, peerId]
        : state.filter((id) => id !== peerId)
    ));
  }, []);

  return (
    <WavingsContext.Provider
      value={{
        wavings,
        toggleWaving() {
          http.post('/wavings/toggle');
          setWavings(
            wavings.includes(peerId)
              ? wavings.filter(id => id !== peerId)
              : [...wavings, peerId]
          );
        }
      }}
    >
      {children}
    </WavingsContext.Provider>
  )
}