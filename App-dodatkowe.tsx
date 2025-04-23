import { useEffect, useState } from 'react'
import io from 'socket.io-client'

const socket = io("http://localhost:3000"); // port socketów

function App() {
  const [nick, setNick] = useState('');
  const [nickSet, setNickSet] = useState(false);
  const [userList, setUserList] = useState<{ socketId: string; nick: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState<{ from: string, content: string }[]>([]);

  useEffect(() => {
    socket.on("user-list", (users) => {
      setUserList(users);
    });

    socket.on("private-message", ({ from, content }) => {
      setMessages(prev => [...prev, { from, content }]);
    });

    return () => {
      socket.off("user-list");
      socket.off("private-message");
    };
  }, []);

  const handleSetNick = () => {
    socket.emit("set-nickname", nick);
    setNickSet(true);
  };

  const sendMessage = () => {
    if (selectedUser && msg) {
      socket.emit("private-message", {
        toSocketId: selectedUser,
        from: nick,
        content: msg,
      });
      setMessages(prev => [...prev, { from: "Ja", content: msg }]);
      setMsg('');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {!nickSet ? (
        <div>
          <input value={nick} onChange={e => setNick(e.target.value)} placeholder="Podaj nick" />
          <button onClick={handleSetNick}>Zatwierdź</button>
        </div>
      ) : (
        <div>
          <h2>Zalogowany jako: {nick}</h2>
          <div style={{ display: 'flex', gap: 20 }}>
            <div>
              <h3>Użytkownicy:</h3>
              {userList.map(user => (
                <div
                  key={user.socketId}
                  onClick={() => setSelectedUser(user.socketId)}
                  style={{
                    cursor: 'pointer',
                    fontWeight: user.socketId === selectedUser ? 'bold' : 'normal',
                  }}
                >
                  {user.nick}
                </div>
              ))}
            </div>
            <div>
              <h3>Wiadomości:</h3>
              <div style={{ border: '1px solid gray', padding: 10, minHeight: 100 }}>
                {messages.map((m, idx) => (
                  <div key={idx}><strong>{m.from}:</strong> {m.content}</div>
                ))}
              </div>
              {selectedUser && (
                <div>
                  <input
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    placeholder="Wiadomość"
                  />
                  <button onClick={sendMessage}>Wyślij</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;