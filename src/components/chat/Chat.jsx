import { onSnapshot, doc, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import "./chat.css";
import { useEffect, useRef, useState } from "react";
import { db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";

const Chat = () => {
  const [chat, setChat] = useState({ messages: [] });
  const [text, setText] = useState("");
  const { currentUser } = useUserStore();
  const endRef = useRef(null);

  const chatDocRef = doc(db, "chats", currentUser?.id); // chat único por usuário
  const [session, setSession] = useState(null);


  // Scroll automático
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Carregar chat do Firestore
  useEffect(() => {
    if (!currentUser?.id) return;

    const initChat = async () => {
      const docSnap = await getDoc(chatDocRef);
      if (!docSnap.exists()) {
        // cria documento se não existir
        await setDoc(chatDocRef, { messages: [] });
      }
    };

    initChat();

    const unSub = onSnapshot(chatDocRef, (res) => {
      setChat(res.data());
    });

    return () => unSub();
  }, [currentUser?.id]);

  const handleSend = async () => {
    if (!text) return;

    try {
      // 1️⃣ Salva mensagem do usuário
      await updateDoc(chatDocRef, {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
        }),
      });

      setText("");

      // 2️⃣ Prepara payload para IA
      const payload = {
        input_value: text,
        output_type: "chat",
        input_type: "chat",
        session_id: currentUser.id,
      };

      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      };

      // 3️⃣ Chama API da IA
      const response = await fetch(
        "http://127.0.0.1:7860/api/v1/run/211fb1de-9f5a-4f0a-bec5-c344631e22d5",
        options
      );
      const data = await response.json();

      // 4️⃣ Função recursiva para encontrar texto da IA
      function findText(obj) {
        if (!obj || typeof obj !== "object") return null;
        if ("text" in obj && typeof obj.text === "string") return obj.text;
        for (const key in obj) {
          const result = findText(obj[key]);
          if (result) return result;
        }
        return null;
      }

      const respostaIA = findText(data) || "Sem resposta da IA";

      // 5️⃣ Salva a resposta da IA
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

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src="./ollama.png" alt="" />
          <div className="texts">
            <span>Ollama</span>
            <p>{session?.fileName || "Sem arquivo carregado"}</p>
          </div>
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div
            className={`message ${message.senderId === currentUser.id ? "own" : "ia"}`}
            key={index}
          >
            <div className="texts">
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
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








