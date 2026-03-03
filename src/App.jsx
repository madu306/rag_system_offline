import React, { useState, useEffect } from 'react';
import { useUserStore } from './lib/userStore';
import { useChatStore } from './lib/chatStore';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase"; 
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Chat from "./components/chat/Chat";
import Auth from "./components/auth/Auth";
import Notification from "./components/notification/Notification";

import { PacmanLoader } from "react-spinners";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  // Estado de loading local temporário (opcional)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simula um loading temporário de 8s
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); 

    return () => clearTimeout(timer);
  }, []);

  // Busca usuário no Firebase
  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid); 
    });
    return () => unSub();
  }, [fetchUserInfo]);

  // Loading temporário com ClipLoader
  if (loading) {
    return (
      <div className="loading-screen">
        <PacmanLoader
          color="#f4a7e3"
          loading={loading}
          size={70}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }

  // App normal
  return (
    <div className={currentUser ? "container" : ""}>
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Detail />}
        </>
      ) : (
        <Auth />
      )}
      <Notification />
    </div>
  );
};

export default App;


