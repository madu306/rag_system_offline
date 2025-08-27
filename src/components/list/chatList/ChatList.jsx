import { useState, useEffect } from "react";
import "./chatList.css";
import AddFile from "./addFile/addFile"; 
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import { useUserStore } from "../../../lib/userStore";

const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState([]);
  const [currentScreen, setCurrentScreen] = useState("chatList");

  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  // Pega sessões do usuário
  useEffect(() => {
    if (!currentUser?.id) return;

    const unSub = onSnapshot(doc(db, "userSessions", currentUser.id), async (res) => {
      const items = res.data()?.sessions || [];
      setSessions(items.sort((a, b) => b.updateAt - a.updateAt));
    });

    return () => unSub();
  }, [currentUser?.id]);

  const handleSelect = (session) => {
    changeChat(session.sessionId, session.fileName);
    setCurrentScreen("chatDetail");
  };

  const filteredSessions = sessions.filter((s) =>
    s.fileName.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input
            type="text"
            placeholder="Pesquisar"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />

        {currentScreen === "chatList" && (
          <button className="logout" onClick={() => auth.signOut()}>
            Sair
          </button>
        )}
      </div>

      {filteredSessions.map((session) => (
        <div
          className="item"
          key={session.sessionId}
          onClick={() => handleSelect(session)}
          style={{
            backgroundColor: session?.isSeen ? "transparent" : "#5193be",
          }}
        >
          <img src="./arquivo.png" alt="" />
          <div className="texts">
            <span>{session.fileName}</span>
            <p>{session.lastMessage || "Sem mensagens ainda"}</p>
          </div>
        </div>
      ))}

      {addMode && <AddFile onClose={() => setAddMode(false)} />}
    </div>
  );
};

export default ChatList;

