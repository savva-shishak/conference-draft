/* eslint-disable jsx-a11y/media-has-caption */
import { useContext, useEffect, useRef } from 'react';
import { UserContext } from '../context/user/User';
import { PeersTracksContext } from './media/consumers';

function AudioItem({ track }) {
  const ref = useRef(null);
  const speakerDevice = useContext(UserContext).user.videoDeviceId;

  useEffect(() => {
    setTimeout(() => {
      if (ref.current) {
        ref.current.srcObject = new MediaStream([track]);
        if (ref.current.setSinkId && speakerDevice) {
          ref.current.setSinkId(speakerDevice);
        }
      }
    }, 100);
  }, [track, speakerDevice]);

  return <audio ref={ref} autoPlay muted={false} />;
}

export function Audio() {
  const { data } = useContext(PeersTracksContext);

  return (
    <div style={{ display: 'none' }}>
      {data
        .filter((item) => item.mediaTag === 'cam-audio')
        .map((item) => (<AudioItem key={item.producerId} track={item.track} />))}
    </div>);
}
