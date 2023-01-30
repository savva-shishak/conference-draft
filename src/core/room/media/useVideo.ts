import { MutableRefObject, useContext, useEffect, useRef } from 'react';
import { MediaTag, useAllTracks } from '.';
import { UserContext } from '../../context/user/User';

export function useVideo(mediaTag: MediaTag, peerId?: string) {
  const { user } = useContext(UserContext);

  const ref = useRef<HTMLVideoElement>();

  const { data } = useAllTracks();

  const videoData = data.find((item) => 
    (item.peerId === (peerId || user.peerId) 
    && item.mediaTag === mediaTag)
  ) || { paused: true, producePaused: true };

  useEffect(() => {
    setTimeout(() => {
      const { current: elementVideo } = ref;
      if (!elementVideo) return;
      if (videoData && !videoData.paused) {
        const stream = new MediaStream();
        stream.addTrack(videoData.track);
        (elementVideo as HTMLVideoElement).srcObject = stream;
      } else if (elementVideo) {
        (elementVideo as HTMLVideoElement).srcObject = null;
      }
    }, 100);
  }, [videoData.paused, ref.current]);

  return ref as MutableRefObject<HTMLVideoElement>;
}

export default null;
