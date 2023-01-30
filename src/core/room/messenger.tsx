import React, { createContext, useContext, useState } from "react"
import { v4 } from "uuid";
import { UserContext } from "../context/user/User";
import { AuthContext } from "../context/auth/Auth";
import { Message } from "./types";
import { LoadedDataContext } from "./Room";
import { useSocketEvent } from "./useSocketEvent";

export const MessengerContext = createContext({
  newMessages: [] as Message[],
  oldMessages: [] as Message[],
  send: (message: Omit<Omit<Message, 'author'>, 'id'>) => {},
  makeAllMessagesAsReaded: () => {},
});

export function Messenger({ children }: any) {
  const { http } = useContext(AuthContext);
  const { user } = useContext(UserContext)
  const [oldMessages, setOldMessages] = useState([] as Message[]);
  const [newMessages, setNewMessages] = useState(useContext(LoadedDataContext).messages);
  
  useSocketEvent('new-message', (message: Message) => {
    setNewMessages((state) => [...state, message]);
  }, [setNewMessages]);

  return (
    <MessengerContext.Provider
      value={{
        newMessages,
        oldMessages,
        send: (preMessage: Omit<Omit<Message, 'author'>, 'id'>) => {
          const message = {
            ...preMessage,
            id: v4(),
          };
          setOldMessages([
            ...oldMessages,
            ...newMessages,
            {
              ...message,
              author: {
                id: user.peerId,
                displayName: user.displayName,
                avatar: user.avatar
              }
            }
          ]);
          setNewMessages([]);

          http.post('/messenger/send', { message });
        },
        makeAllMessagesAsReaded: () => {
          setOldMessages([...oldMessages, ...newMessages]);
          setNewMessages([]);
        },
      }}
    >
      {children}
    </MessengerContext.Provider>
  )
}