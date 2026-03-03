import { onSnapshot, doc, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import "./chat.css";
import { useEffect, useRef, useState } from "react";
import { db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import { useChatStore } from "../../lib/chatStore";

const Chat = () => {
  const { chatId } = useChatStore();
  const { currentUser } = useUserStore();

  const [chat, setChat] = useState({ messages: [] });
  const [text, setText] = useState("");
  const [session, setSession] = useState(null);

  const endRef = useRef(null);
  const chatDocRef = chatId ? doc(db, "chats", chatId) : null;

  useEffect(() => {
    if (!chatDocRef) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, chatDocRef]);

  useEffect(() => {
    if (!chatDocRef || !currentUser) {
      setChat({ messages: [] });
      return;
    }

    let unSub;

    const initChat = async () => {
      try {
        const docSnap = await getDoc(chatDocRef);

        if (!docSnap.exists()) {
          await setDoc(chatDocRef, { messages: [] });
        } else {
          const data = docSnap.data();
          setSession({
            fileName: data.fileName || "Sem arquivo carregado",
          });
        }
      } catch (err) {
        console.warn("Chat encerrado ou usuário deslogado");
      }
    };

    initChat();

    unSub = onSnapshot(chatDocRef, (res) => {
      if (res.exists()) {
        setChat(res.data());
      }
    });

    return () => {
      if (unSub) unSub();
    };
  }, [chatDocRef, currentUser]);

  const handleSend = async () => {
    if (!currentUser || !text || !chatDocRef) return;

    try {
      await updateDoc(chatDocRef, {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
        }),
      });

      setText("");

      const payload = {
        input_value: text,
        output_type: "chat",
        input_type: "chat",
        session_id: currentUser.id,
      };

      const response = await fetch(
        "http://127.0.0.1:7860/api/v1/run/211fb1de-9f5a-4f0a-bec5-c344631e22d5",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      const findText = (obj) => {
        if (!obj || typeof obj !== "object") return null;
        if ("text" in obj && typeof obj.text === "string") return obj.text;
        for (const key in obj) {
          const result = findText(obj[key]);
          if (result) return result;
        }
        return null;
      };

      const respostaIA = findText(data) || "Sem resposta da IA";

      await updateDoc(chatDocRef, {
        messages: arrayUnion({
          senderId: "IA",
          text: respostaIA,
          createdAt: new Date(),
        }),
      });
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  if (!currentUser) return null;

  if (!chatId) {
    return <div className="chat">Selecione uma conversa</div>;
  }

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src="./ollama.png" alt="IA" />
          <div className="texts">
            <span>Ollama</span>
            <p>{session?.fileName || "Sem arquivo carregado"}</p>
          </div>
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.senderId === currentUser.id ? "own" : "ia"
            }`}
          >
            <div className="texts">
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="bottom">
        <input
          type="text"
          placeholder="Digite algo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="sendButton" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;












