import { useState } from "react";
import "./login.css"; 
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { usePageStore } from "../../lib/usePageStore";

const Register = () => {
  const { goToLogin } = usePageStore();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Conta criada! Faça login 😊");
      goToLogin();
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <img src="/llama_image.png" alt="Llama" className="llama-image" />

      <div className="item">
        <h2>Criar uma conta</h2>

        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Nome" name="username" required />
          <input type="email" placeholder="Email" name="email" required />
          <input type="password" placeholder="Senha" name="password" required />
          <button disabled={loading}>
            {loading ? "Criando..." : "Cadastrar"}
          </button>
        </form>

        <p className="hint">
          Já tem conta?{" "}
          <span className="link" onClick={goToLogin}>
            Entrar
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
