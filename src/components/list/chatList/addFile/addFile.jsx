import { useState } from "react";
import "./addFile.css";
import { db } from "../../../../lib/firebase";
import { collection, doc, setDoc, serverTimestamp, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { useUserStore } from "../../../../lib/userStore";
import { useChatStore } from "../../../../lib/chatStore";

const AddFile = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAddFile = async () => {
    if (!file) return;

    try {
      // 1️⃣ Cria nova sessão de chat
      const chatRef = collection(db, "chats");
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
        fileName: file.name,
        ownerId: currentUser.id,
      });

      // 2️⃣ Atualiza userSessions (cria se não existir)
      const userSessionsRef = doc(db, "userSessions", currentUser.id);
      const docSnap = await getDoc(userSessionsRef);
      if (!docSnap.exists()) {
        await setDoc(userSessionsRef, { sessions: [] });
      }

      await updateDoc(userSessionsRef, {
        sessions: arrayUnion({
          chatId: newChatRef.id,
          fileName: file.name,
          updateAt: Date.now(),
        }),
      });

      // 3️⃣ Muda a sessão atual
      changeChat(newChatRef.id, { fileName: file.name });

      // 4️⃣ Limpa input e fecha modal
      setFile(null);
      if (onClose) onClose();
    } catch (err) {
      console.log("Erro ao adicionar arquivo:", err);
    }
  };

  return (
    <div className="addFile">
      <label className="fileLabel">
        {file ? file.name : "Escolher arquivo…"}
        <input type="file" onChange={handleFileChange} />
      </label>
      <button onClick={handleAddFile}>Adicionar Arquivo</button>
    </div>
  );
};

export default AddFile;






