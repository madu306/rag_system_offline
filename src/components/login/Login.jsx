import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { usePageStore } from "../../lib/usePageStore";

const Login = () => {
  const { goToRegister } = usePageStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email, password);
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
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" name="email" required />
          <input type="password" placeholder="Senha" name="password" required />
          <button disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="hint">
        Não tem conta?{" "}
        <span className="link" onClick={goToRegister}>
            Criar uma
        </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
