import { useContext, useEffect } from "react";
import { AuthContext } from "../context/auth/Auth";

export function useSocketEvent(eventName, listener: (data: any) => any, deps: any[]) {
  const { socket } = useContext(AuthContext);

  useEffect(() => {
    const func = (data: any) => listener(data);

    socket.onAny((event, data) => {
      if (event === eventName) {
        func(data);
      }
    });

    return () => {
      socket.off(eventName, func);
    }
  }, [eventName, socket, ...deps]);
}