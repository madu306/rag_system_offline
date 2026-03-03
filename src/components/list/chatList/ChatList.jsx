import { useState, useEffect, useRef } from "react";
import "./chatList.css";
import AddFile from "./addFile/addFile"; 
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import { useUserStore } from "../../../lib/userStore";
import SessionItem from "./SessionItem";

const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const addRef = useRef(null);
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
    changeChat(session.chatId, { fileName: session.fileName });
    setCurrentScreen("chatDetail");
  };

  // Fecha o AddFile ao clicar fora
  useEffect(() => {
    if (!addMode) return;

    const handleClickOutside = (event) => {
      if (addRef.current && !addRef.current.contains(event.target)) {
        setAddMode(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [addMode]);

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

        <i
          className={`fa ${addMode ? "fa-minus-circle" : "fa fa-paperclip"} add`}
          onClick={() => setAddMode(prev => !prev)}
        ></i>

        {currentScreen === "chatList" && !addMode && (
          <button className="logout" onClick={() => auth.signOut()}>
            Sair
          </button>
        )}
      </div>

      {filteredSessions.map((session) => (
        <SessionItem
          key={session.sessionId}
          session={session}
          onSelect={handleSelect}
        />
      ))}

      {addMode && (
        <div ref={addRef}>
          <AddFile onClose={() => setAddMode(false)} />
        </div>
      )}
    </div>
  );
};

export default ChatList;



