import { useContext } from 'react';
import { Icon } from '../../../../../../../components/ui/icon/Icon';
import { UserContext } from '../../../../../../../core/context/user/User';
import { PeersContext } from '../../../../../../../core/room/peers';
import { PresentationContext } from '../../../../../../../core/room/presntation';
import userSvg from '../../../../../../../images/components/room/person.svg';
import { Controls } from './Controls';

export function ControlPresentation({ iconSize }) {
  const { presentation, setPresentation } = useContext(PresentationContext);
  const { user } = useContext(UserContext);
  const peers = useContext(PeersContext);

  if (!presentation) {
    return null;
  }

  if (presentation.peerId !== user.peerId) {
    const peer = peers.find((item) => item.id === presentation.peerId);

    return (
      <div style={{ fontSize: `${iconSize.icon}px` }} className="presentation__username">
        {(peer?.avatar && peer?.avatar !== 'null')
          ? (
            <img
              src={peer.avatar}
              alt="peer avatar"
              className="presentation__pre-name-avatar avatar"
            />
          )
          : (
            <Icon
              src={userSvg}
              size={iconSize.icon}
              iconSize={iconSize.icon}
              noround
              textWhite
            />
          )}
        Презентация от
        {' '}
        {peer?.displayName}
      </div>
    );
  }

  return (
    <Controls presentation={presentation} setPresentation={setPresentation} />
  );
}
