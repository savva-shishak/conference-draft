import React, { useEffect, useMemo } from 'react';
import { createContext, ReactNode, useState } from "react";
import { initUserState, UserType } from "./initUserState";

const userState = initUserState();

export const UserContext = createContext({
  user: userState,
  setUser: ((newState: UserType) => {}) as React.Dispatch<React.SetStateAction<UserType>>,
})

export function User({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(userState);

  useEffect(() => {
    localStorage.setItem('user-2-data', JSON.stringify(user))
  }, [user])

  return (
    <UserContext.Provider
      value={useMemo(() => ({
        user,
        setUser,
      }), [user, setUser])}
    >
      {children}
    </UserContext.Provider>
  );
}