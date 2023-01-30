import { AxiosInstance } from 'axios';
import jwtDecode from 'jwt-decode';
import { SetStateAction } from 'react';
import { UserType } from '../../user/initUserState';
import { authAsGuest, authByAuthToken } from './functions';

export async function auth(agent: AxiosInstance, user: UserType, setUser: React.Dispatch<SetStateAction<UserType>>) {
  const searchAuthToken = new URLSearchParams(window.location.search || '').get('a');

  const storeToken = localStorage.getItem('token');

  let idCompare: boolean = false;
  try {
    idCompare = jwtDecode<{ peerId: string }>(storeToken || '').peerId === user.peerId;
  } catch (e: any) {
    idCompare = false;
  }

  if (
    (searchAuthToken && searchAuthToken !== localStorage.getItem('authToken'))
    || (!storeToken && localStorage.getItem('authToken'))
  ) {
    if (searchAuthToken) {
      localStorage.setItem('authToken', searchAuthToken);
    }

    await authByAuthToken(agent, user, setUser);
  } else if (!storeToken || !idCompare) {
    await authAsGuest(agent, user, setUser);
  }

  return localStorage.getItem('token') as string;
};
