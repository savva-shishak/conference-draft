import axios, { AxiosInstance } from "axios";
import React, { useState } from "react";
import { createContext, ReactNode } from "react";

export const HttpContext = createContext({
  http: null as any as AxiosInstance,
});

export const serverUrl = (import.meta as any).env.VITE_SERVER_URL;

const http = axios.create({ baseURL: serverUrl });

export function Http({ children }: { children: ReactNode }) {
  const [transports] = useState<{ http: AxiosInstance | null} | null>({ http });

  if (transports && transports.http) {
    return (
      <HttpContext.Provider value={transports as any}>
        {children}
      </HttpContext.Provider>
    );
  }

  return <>Авторизуемся...</>;
}