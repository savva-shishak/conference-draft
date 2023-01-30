/* eslint-disable import/no-unresolved */
import {
  useContext,
} from 'react';
import { UserContext } from '../context/user/User';
import { AuthContext } from '../context/auth/Auth';
import { UserTracksContext } from './media/producers';

export function useUser() {
  const { user, setUser } = useContext(UserContext);
  const { closeTrack, sendTrack } = useContext(UserTracksContext);
  const { http } = useContext(AuthContext);

  return {
    user,
    async setUser(data: typeof user) {
      const { videoDeviceId, audioDeviceId } = user;

      setUser((state) => ({
        ...state,
        displayName: data.displayName,
        avatar: data.avatar,
        videoDeviceId: data.videoDeviceId,
        audioDeviceId: data.audioDeviceId,
        speakerDeviceId: data.speakerDeviceId,
      }));

      if (data.videoDeviceId || data.audioDeviceId) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: data.videoDeviceId ? { deviceId: data.videoDeviceId } : false,
          audio: data.audioDeviceId ? { deviceId: data.audioDeviceId } : false,
        });

        if (data.videoDeviceId !== videoDeviceId) {
          await closeTrack('cam-video');
          sendTrack(stream.getVideoTracks()[0], 'cam-video', user.videoStatePause);
        }

        if (data.audioDeviceId !== audioDeviceId) {
          await closeTrack('cam-audio');
          sendTrack(stream.getAudioTracks()[0], 'cam-audio', user.audioStatePause);
        }
      } else {
        await closeTrack('cam-audio');
        await closeTrack('cam-video');
      }

      http.post('/peer/update', {
        displayName: data.displayName,
        avatar: data.avatar,
      });
    },
  };
}
