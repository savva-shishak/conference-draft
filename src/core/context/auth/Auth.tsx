import axios, { AxiosInstance } from "axios";
import React, { useRef, useState, useContext, useEffect, createContext, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { auth } from "./protect";
import { UserContext } from "../user/User";
import { HttpContext } from "../http";

const serverUrl = (import.meta as any).env.VITE_SERVER_URL;

const url = new URL(serverUrl);

export const AuthContext = createContext({
  http: null as any as AxiosInstance,
  socket: null as any as Socket,
});

export function Auth({ children, preloader }: { children: ReactNode, preloader: (text: string) => ReactNode }) {
  const [transports, setTransports] = useState<{ socket: Socket | null, http: AxiosInstance | null} | null>(null);
  const [connected, setConnected] = useState(false);
  const authWaitRef = useRef<Promise<any> | null>(null);

  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    const http = axios.create({ baseURL: serverUrl });
    const socket = io(url.origin, { path: (url.pathname.length > 1 ? url.pathname : '') + '/socket.io' });

    const init = async () => {
      if (!authWaitRef.current) {
        authWaitRef.current = auth(http, user, setUser).then((token) => {
          authWaitRef.current = null;
          setTransports({ http, socket });
          localStorage.setItem('token', token as string); 
        });
      }

      await authWaitRef.current;

      socket.on('auth-success', () => {
        setConnected(true);
        setTransports({ http, socket })
      });
      socket.on('auth-error', async () => {
        setConnected(false);
        localStorage.removeItem('token');
        await init();
        socket.emit('auth', { token: localStorage.getItem('token') });
      });
      
      socket.emit('auth', { token: localStorage.getItem('token') });
  
      socket.on('connect', () => socket.emit('auth', { token: localStorage.getItem('token') }))
  
      socket.on('disconnect', () => {
        setConnected(false);
      })
    };

    const interceptorsIds = {
      req: null as null | number,
      res: null as null | number,
    };

    interceptorsIds.req = http.interceptors.request.use((request) => {
      request.headers = {
        ...(request.headers || {}),
        authorization: 'Bearer ' + localStorage.getItem('token')
      }

      return request;
    });

    interceptorsIds.res = http.interceptors.response.use(
      (r) => r,
      async (error) => {
        if (
          error?.response?.status === 401 ||
          (error?.response?.status === 403)
        ) {
          await init();

          return http(error.config)
        }
    
        throw error;
      }
    );

    init();

    return () => {
      socket.close();

      if (interceptorsIds.req) {
        http.interceptors.request.eject(interceptorsIds.req);
      }

      if (interceptorsIds.res) {
        http.interceptors.response.eject(interceptorsIds.res);
      }
    }
  }, []);

  if (transports && transports.http && transports.socket && connected) {
    return (
      <AuthContext.Provider value={transports as any}>
        <HttpContext.Provider value={{ http: transports.http }}>
          {children}
        </HttpContext.Provider>
      </AuthContext.Provider>
    );
  } else {
    return preloader(!transports ? 'Авторизуемся' : 'Устанавливаем сокет соединение с сервером');
  }
}