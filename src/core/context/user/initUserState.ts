import { v4 } from "uuid";

export type UserType = {
  avatar: string | null;
  displayName: string;
  peerId: string;
  speakerDeviceId: string | null;
  audioDeviceId: string | null;
  videoDeviceId: string | null;
  audioStatePause: boolean;
  videoStatePause: boolean;
  role?: string;
};

export function initUserState(): UserType {
  const localStoreState = localStorage.getItem('user-2-data');
    
  if (localStoreState) {
    return JSON.parse(localStoreState);
  } else {
    return {
      avatar: null,
      displayName: `Пользователь_${Math.random() * 100 >> 0}`,
      peerId: v4(),
      audioDeviceId: null,
      videoDeviceId: null,
      speakerDeviceId: null,
      audioStatePause: false,
      videoStatePause: false,
    }
  }
}