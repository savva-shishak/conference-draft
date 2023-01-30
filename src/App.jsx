import { useContext, useState } from 'react';
import { Room } from './component/Room';
import { Auth } from './core/context/auth/Auth';
import { UserContext } from './core/context/user/User';
import { useDevices } from './core/hooks/useDevices';
import { RoomProvider } from './core/room/Room';

function App() {
  const [roomId, setRoomId] = useState('');
  const { user, setUser } = useContext(UserContext);
  const { audioDevices, updateAudioDevices } = useDevices()

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setRoomId(e.target.roomId.value);
        }}
      >
        <input placeholder="Введите название комнаты" name="roomId" required />
        <button>Войти</button>
        <button type="reset" onClick={() => setRoomId('')}>Выйти</button>
      </form>

      {roomId && user.audioDeviceId && (
        <Auth preloader={(text) => <i>{text}...</i>}>
          <RoomProvider roomId={roomId} preloader={(text) => <i>{text}...</i>}>
            <Room />
          </RoomProvider>
        </Auth>
      )}

      {roomId && !user.audioDeviceId && (
        <div>
          <select
            className="preparation__select select"
            onFocus={updateAudioDevices}
            value={user.audioDeviceId}
            onChange={(e) => setUser((user) => ({ ...user, audioDeviceId: e.target.value }))}
          >
            <option value="">Без микрофона</option>
            {audioDevices
              .filter((device) => device.kind === 'audioinput')
              .map((device) => (
                <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default App;
