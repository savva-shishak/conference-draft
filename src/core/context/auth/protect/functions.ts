import { AxiosInstance } from 'axios';
import jwtDecode from 'jwt-decode';
import React, { SetStateAction } from 'react';
import { v4 } from "uuid";
import { UserType } from '../../user/initUserState';

export async function getAcceptPeerId(agent: AxiosInstance) {
  let peerId = '';
  
  do {
    peerId = v4();

    if (await agent.post('/peer/access-peerId', { peerId }).then((res) => res.data)) {
      break
    }
  } while (true);

  return peerId;
}

export async function authByAuthToken(agent: AxiosInstance, user: UserType, setUser: React.Dispatch<SetStateAction<UserType>>) {
  const authToken = localStorage.getItem('authToken');

  try {
    const { data: token } = await agent.post('/peer/auth', { role: 'user', way: 'token', authToken });

    localStorage.setItem('token', token);

    const { peerId, displayName, avatar } = jwtDecode(token) as any;

    setUser((state) => ({
      ...state,
      peerId, displayName, avatar,
      role: 'user',
    }));
  } catch (e: any) {
    localStorage.removeItem('authToken');
    await authAsGuest(agent, user, setUser);
  }
}

export async function authAsGuest(agent: AxiosInstance, user: UserType, setUser: React.Dispatch<SetStateAction<UserType>>) {
  try {
    const peerId = await getAcceptPeerId(agent);
    setUser((state) => ({ ...state, peerId, role: 'guest' }))

    const { displayName, avatar } = user;

    const { data: token } = await agent.post('/peer/auth', { role: 'guest', peerId, displayName, avatar });
    
    localStorage.setItem('token', token);

  } catch (e: any) {
    await authAsGuest(agent, user, setUser);
  }
}