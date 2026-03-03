import Login from "../../components/login/Login";
import Register from "../../components/login/Register";
import { usePageStore } from "../../lib/usePageStore";

const Auth = () => {
  const { page } = usePageStore();

  return page === "login" ? <Login /> : <Register />;
};

export default Auth;
