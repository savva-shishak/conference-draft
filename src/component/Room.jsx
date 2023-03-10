/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import { useContext, useEffect } from 'react';
import { FilesContext } from '../core/context/files';
import { useDevices } from '../core/hooks/useDevices';
import { Presentation } from '../core/presentation/Presentation';
import { PeersTracksContext } from '../core/room/media/consumers';
import { UserTracksContext } from '../core/room/media/producers';
import { Video } from '../core/room/media/Video';
import { MessengerContext } from '../core/room/messenger';
import { PeersContext } from '../core/room/peers';
import { PresentationContext } from '../core/room/presntation';
import { useUser } from '../core/room/useUser';

import './Room.scss';

function humanFileSize(size) {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / 1024 ** i).toFixed(2) * 1} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`;
}

export function Room() {
  const peers = useContext(PeersContext);
  const { user, setUser } = useUser();
  const {
    newMessages, oldMessages, send, makeAllMessagesAsReaded,
  } = useContext(MessengerContext);
  const { sendFile } = useContext(FilesContext);
  const { presentation, openPresentation, closePresentation } = useContext(PresentationContext);

  const {
    videoDevices,
    audioDevices,
    speakerDevices,
    enableOutputDevice,
    updateAudioDevices,
    updateVideoDevices,
    updateSpeakerDevices,
  } = useDevices();

  const {
    data: userTracks,
    pauseTrack,
    resumeTrack,
    closeTrack,
    sendTrack,
  } = useContext(UserTracksContext);

  const {
    data: peersTracks,
    resumeConsume,
    pauseConsume,
  } = useContext(PeersTracksContext);

  const userVideo = userTracks.find((track) => track.mediaTag === 'cam-video');
  const userAudio = userTracks.find((track) => track.mediaTag === 'cam-audio');
  const userScreen = userTracks.find((track) => track.mediaTag === 'screen-video');

  useEffect(() => {
    updateAudioDevices();
    updateVideoDevices();
    updateSpeakerDevices();
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '500px 1fr', gap: 20 }}>
      <div style={{
        display: 'grid', width: '100%', gap: 15, alignItems: 'baseline', marginTop: 10,
      }}
      >
        <div className="block translations">
          <b>???????? ????????????????????</b>
          :
          <div className="flex-center-row">

            {!userVideo ? '???????????? ???? ??????????????'
              : userVideo.paused
                ? <button type="button" onClick={() => resumeTrack('cam-video')}>???????????????? ??????????</button>
                : <button type="button" onClick={() => pauseTrack('cam-video')}>???????????????????? ??????????</button>}
            {!userAudio ? '???????????????? ???? ????????????'
              : userAudio.paused
                ? <button type="button" onClick={() => resumeTrack('cam-audio')}>???????????????? ??????????</button>
                : <button type="button" onClick={() => pauseTrack('cam-audio')}>???????????????????? ??????????</button>}
            {userScreen
              ? <button type="button" onClick={() => closeTrack('screen-video')}>????????. ?????????? ????????????</button>
              : (
                <button
                  type="button"
                  onClick={() => {
                    navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
                      sendTrack(stream.getVideoTracks()[0], 'screen-video', false);
                    });
                  }}
                >
                  ??????. ?????????? ????????????
                </button>
              )}
          </div>
          {userVideo && <Video mediaTag="cam-video" />}
          {userScreen && <Video mediaTag="screen-video" />}
        </div>
        <div className="block">
          <div className="flex-center-row">
            <b>????:</b>
            {' '}
            {user.avatar && <img src={user.avatar} alt="avatar" style={{ borderRadius: '50%', width: 30, height: 30 }} />}
            {user.displayName}
          </div>
          ????????????:
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              const displayName = e.target.displayName.value;
              const avatar = e.target.avatar.files[0]
                ? await sendFile(e.target.avatar.files[0]).then((file) => file.url)
                : null;

              const videoDeviceId = e.target.videoDeviceId.value;
              const audioDeviceId = e.target.audioDeviceId.value;
              const speakerDeviceId = e.target.speakerDeviceId.value;

              setUser({
                ...user,
                displayName,
                avatar,
                videoDeviceId,
                audioDeviceId,
                speakerDeviceId,
              });
            }}
            className="user-form"
          >
            <label htmlFor="displayName">
              ??????
              <input type="text" defaultValue={user.displayName} id="displayName" name="displayName" />
            </label>
            <label htmlFor="avatar">
              ????????????
              <input type="file" id="avatar" name="avatar" />
            </label>
            <label htmlFor="videoDeviceId">
              ????????????
              <select onFocus={updateVideoDevices} type="text" defaultValue={user.videoDeviceId} id="videoDeviceId" name="videoDeviceId">
                {videoDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
                ))}
              </select>
            </label>
            <label htmlFor="audioDeviceId">
              ????????????????
              <select onFocus={updateAudioDevices} type="text" defaultValue={user.audioDevicesId} id="audioDeviceId" name="audioDeviceId">
                {audioDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
                ))}
              </select>
            </label>
            <label htmlFor="speakerDeviceId">
              ??????????????
              {
                enableOutputDevice
                  ? (
                    <select onFocus={updateSpeakerDevices} type="text" defaultValue={user.speakerDeviceId} id="speakerDeviceId" name="speakerDeviceId">
                      {speakerDevices.map((device) => (
                        <option
                          key={device.deviceId}
                          value={device.deviceId}
                        >
                          {device.label}
                        </option>
                      ))}
                    </select>
                  )
                  : '?????? ?????????????? ???? ???????????????????????? ?????????? ?????????????????? ???????????? ??????????'
}
            </label>
            <button type="submit">??????????????????</button>
          </form>
        </div>
        <div className="block">
          <b style={{ marginBottom: 5, display: 'block' }}>???????????? ??????????????????:</b>
          {!peers.length && <i>?????????? ?????? ?? ?????????????? ???????????? ??????</i>}
          {peers.map((peer) => {
            const video = peersTracks.find((data) => data.peerId === peer.id && data.mediaTag === 'cam-video');
            const audio = peersTracks.find((data) => data.peerId === peer.id && data.mediaTag === 'cam-audio');
            const screen = peersTracks.find((data) => data.peerId === peer.id && data.mediaTag === 'screen-video');

            return (
              <div>
                <div className="flex-center-row" key={peer.id}>
                  {peer.avatar && <img src={peer.avatar} alt="avatar" style={{ borderRadius: '50%', width: 30, height: 30 }} />}
                  {peer.displayName}
                </div>
                <div>
                  {!video || video.producePaused ? ''
                    : video.consumePaused
                      ? (
                        <button
                          onClick={() => resumeConsume(peer.id, 'cam-video')}
                          type="button"
                        >
                          ???????????????? ??????????
                        </button>
                      )
                      : (
                        <button
                          onClick={() => pauseConsume(peer.id, 'cam-video')}
                          type="button"
                        >
                          ???????????????????? ??????????
                        </button>
                      )}
                  {!audio || audio.producePaused ? ''
                    : audio.consumePaused
                      ? (
                        <button
                          onClick={() => resumeConsume(peer.id, 'cam-audio')}
                          type="button"
                        >
                          ???????????????? ??????????
                        </button>
                      )
                      : (
                        <button
                          onClick={() => pauseConsume(peer.id, 'cam-audio')}
                          type="button"
                        >
                          ???????????????????? ??????????
                        </button>
                      )}
                  {!screen || screen.producePaused ? ''
                    : screen.consumePaused
                      ? (
                        <button
                          onClick={() => resumeConsume(peer.id, 'screen-video')}
                          type="button"
                        >
                          ???????????????? ?????????? ????????????
                        </button>
                      )
                      : (
                        <button
                          onClick={() => pauseConsume(peer.id, 'screen-video')}
                          type="button"
                        >
                          ???????????????????? ?????????? ????????????
                        </button>
                      )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="block">
          <b>??????:</b>
          <br />
          ?????????? ??????????????????:
          {' '}
          <button type="button" onClick={makeAllMessagesAsReaded}>???????????????? ?????? ?????? ????????????</button>
          <ul>
            {newMessages.map(({
              id, text, author, files,
            }) => (
              <li key={id} className="flex-center-row">
                <i style={{ width: 200, marginBottom: 10 }} className="flex-center-row">
                  {author.avatar && <img src={author.avatar} alt="avatar" style={{ borderRadius: '50%', width: 30, height: 30 }} />}
                  {author.displayName}
                  :
                </i>
                {text}
                {files.map((file) => (
                  <a download={file.name} href={file.url}>
                    {file.name}
                    {' '}
                    (
                    {humanFileSize(file.size)}
                    )
                  </a>
                ))}
              </li>
            ))}
          </ul>
          ???????????? ??????????????????:
          <ul>
            {oldMessages.map(({
              id, text, author, files,
            }) => (
              <li key={id} className="flex-center-row">
                <i style={{ width: 200, marginBottom: 10 }} className="flex-center-row">
                  {author.avatar && <img src={author.avatar} alt="avatar" style={{ borderRadius: '50%', width: 30, height: 30 }} />}
                  {author.displayName}
                  :
                </i>
                {text}
                {files.map((file) => (
                  <a download={file.name} href={file.url}>
                    {file.name}
                    {' '}
                    (
                    {humanFileSize(file.size)}
                    )
                  </a>
                ))}
              </li>
            ))}
          </ul>
          ???????????????? ??????????????????:
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              const text = e.target.msgText.value;
              const files = await Promise.all(
                Array.from(e.target.msgFiles.files).map((file) => sendFile(file)),
              );

              send({ text, files });

              e.target.reset();
            }}
          >
            <div style={{ marginBottom: 5 }} className="flex-center-row">
              <input style={{ width: 300 }} type="text" placeholder="?????????????? ?????????? ??????????????????" name="msgText" />
              <input type="file" multiple name="msgFiles" />
            </div>
            <button type="submit">??????????????????</button>
          </form>
        </div>
        <div className="block" style={{}}>
          <b style={{ marginBottom: 5, display: 'block' }}>??????????????????????:</b>
          {!presentation
            ? (<button type="button" onClick={() => openPresentation()}>?????????????? ??????????????????????</button>)
            : (
              user.peerId === presentation.peerId
                ? <button type="button" onClick={closePresentation}>?????????????? ??????????????????????</button>
                : '???????????? ???????????????? ?????? ???????????? ??????????????????????'
            )}
        </div>
      </div>
      <div>
        {presentation && (
          <div style={{ height: 500, display: 'flex', justifyContent: 'center' }}>
            <Presentation />
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {peersTracks
            .filter((tracksData) => !tracksData.paused)
            .filter((tracksData) => tracksData.track.kind === 'video')
            .map(({ peerId, mediaTag }) => (
              <Video
                peerId={peerId}
                mediaTag={mediaTag}
                render={(ref, transform) => (
                  <video
                    ref={ref}
                    width="100%"
                    height="300"
                    autoPlay
                    style={{
                      transform,
                      objectFit: 'contain',
                      objectPosition: 'center',
                    }}
                  />
                )}
              />
            ))}
          {userVideo && !userVideo.paused && (
            <Video
              mediaTag="cam-video"
              render={(ref, transform) => (
                <video
                  ref={ref}
                  width="100%"
                  height="300"
                  autoPlay
                  style={{
                    transform,
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                />
              )}
            />
          )}
          {userScreen && !userScreen.paused && (
            <Video
              mediaTag="screen-video"
              render={(ref, transform) => (
                <video
                  ref={ref}
                  width="100%"
                  height="300"
                  autoPlay
                  style={{
                    transform,
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                />
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
