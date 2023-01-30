import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { UserContext } from '../context/user/User';

const audioElement = document.createElement('audio');

export function useDevices() {
  const { user: { videoDeviceId } } = useContext(UserContext);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([]);

  const updateVideoDevices = async () => {
    await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .catch(() => toast.warn('Пожалуйста, предоставьте доступ к камере'));
    setVideoDevices((await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === 'videoinput'));
  };

  const updateAudioDevices = async () => {
    await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .catch(() => toast.warn('Пожалуйста, предоставьте доступ к микрофону'));
    setAudioDevices((await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === 'audioinput'));
  };

  const updateSpeakerDevices = async () => {
    setSpeakerDevices((await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === 'audiooutput'));
  };

  useEffect(() => {
    if (videoDeviceId) {
      updateVideoDevices();
    }
    updateAudioDevices();
    updateSpeakerDevices();
  }, []);

  return ({
    updateVideoDevices,
    updateAudioDevices,
    updateSpeakerDevices,
    videoDevices,
    audioDevices,
    speakerDevices,
    enableOutputDevice: audioElement && (typeof (audioElement as any).sinkId !== 'undefined'),
  });
}

export default null;
