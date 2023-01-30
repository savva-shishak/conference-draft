/* eslint-disable jsx-a11y/media-has-caption */
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '../../../../../../../components/ui/icon/Icon';
import PalleteSvg from '../../../../../../../images/palette.svg';
import EraserSvg from '../../../../../../../images/eraser.svg';
import ArrowBackSvg from '../../../../../../../images/components/windows/icons/arrow_back.svg';
import ArrowNextSvg from '../../../../../../../images/components/windows/icons/arrow_next.svg';
import { Modal } from '../../../../../../../components/ui/modal/Modal';
import { Button } from '../../../../../../../components/ui/button/Button';
import { ColorPicket } from '../../../../../../../components/ui/color-picker/colorpicker';
import userSvg from '../../../../../../../images/components/room/person.svg';
import { PresentationContext } from '../../../../../../../core/room/presntation';
import { UserContext } from '../../../../../../../core/context/user/User';
import { PeersContext } from '../../../../../../../core/room/peers';

function randomColor() {
  const item = () => ((Math.random() * 255) >> 0).toString(16);
  return `#${item()}${item()}${item()}ff`;
}

export function Controls({ presentation }) {
  const { pageNum, totalPages, pensColors } = presentation;
  const { clearPresentation, setColorsPens, setPage } = useContext(PresentationContext);
  const [openSettings, setOpenSettings] = useState(false);
  const { user } = useContext(UserContext);
  const peers = [
    ...useContext(PeersContext),
    { ...user, id: user.peerId },
  ];

  const [colors, setColors] = useState(pensColors);

  return (
    <div className="presentation__footer">
      Ваша презентация
      <div className="presentation__arrows">
        <Modal
          open={openSettings}
          onClose={() => setOpenSettings(false)}
          title="Настройки рисования"
        >
          <div className="presentation__palette">
            <div className="presentation__palette-btns">
              <Button
                small
                grey3
                onClick={() => {
                  setColors(peers.reduce((acc, { id }) => ({ ...acc, [id]: randomColor() }), {}));
                }}
              >
                Поставить всем случайные цвета
              </Button>
              <Button
                grey3
                small
                disabled={!Object.values(colors).some((val) => !!val)}
                onClick={() => {
                  setColors(peers.reduce((acc, { id }) => ({ ...acc, [id]: null }), {}));
                }}
              >
                Запретить всем рисовать
              </Button>
            </div>
            <div className="presentation__palette-grid">
              {peers.map((peer) => (
                <div key={peer.id} className="presentation__palette-peer">
                  <div className="presentation__palette-displayName">
                    {(peer.avatar && peer.avatar !== 'null')
                      ? (
                        <img
                          src={peer.avatar}
                          alt="peer avatar"
                          className="avatar"
                        />
                      )
                      : (
                        <Icon
                          src={userSvg}
                          iconSize={20}
                          size={20}
                          textBlue
                          noround
                        />
                      )}
                    {peer.displayName}
                  </div>
                  <ColorPicket
                    value={colors[peer.id]}
                    onChange={(color) => setColors({ ...colors, [peer.id]: color })}
                  />
                </div>
              ))}
            </div>
            <div className="presentation__palette-btns">
              <Button
                primary
                onClick={() => {
                  setColorsPens(colors);
                  setOpenSettings(false);
                }}
              >
                Применить настройки
              </Button>
            </div>
          </div>
        </Modal>
        <Icon
          src={PalleteSvg}
          size={22}
          iconSize={12}
          white
          pointer
          onClick={() => {
            setOpenSettings(true);
          }}
        />
        <Icon
          src={EraserSvg}
          size={22}
          iconSize={12}
          white
          pointer
          onClick={() => {
            toast(
              <div
                style={{
                  color: 'black',
                  display: 'flex',
                  flexFlow: 'column nowrap',
                  alignItems: 'flex-end',
                }}
              >
                <div>
                  Вы уверены что хотите очистить всю презентацию от пользовательских рисунков?
                </div>
                <Button smaller onClick={() => clearPresentation()}>Да</Button>
              </div>,
              {
                position: 'top-center',
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'light',
              },
            );
          }}
        />
        <div>
          Ст.
          {' '}
          {pageNum}
          /
          {totalPages}
        </div>
        <Icon
          src={ArrowBackSvg}
          size={22}
          iconSize={12}
          white
          pointer
          onClick={() => {
            if (pageNum > 1) {
              setPage(pageNum - 1);
            }
          }}
        />
        <Icon
          src={ArrowNextSvg}
          size={22}
          iconSize={12}
          pointer
          white
          onClick={() => {
            if (pageNum < totalPages) {
              setPage(pageNum + 1);
            }
          }}
        />
      </div>
    </div>
  );
}
