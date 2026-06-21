import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function AuthPage() {
  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [liEmail, setLiEmail] = useState("user1@example.com");
  const [liPass, setLiPass] = useState("password123");
  const [rgEmail, setRgEmail] = useState("");
  const [rgName, setRgName] = useState("");
  const [rgPass, setRgPass] = useState("");

  async function doLogin() {
    try {
      await login(liEmail, liPass);
      toast("Вход выполнен", "ok");
      navigate("/search");
    } catch (e: any) {
      toast(e.message, "err");
    }
  }

  async function doRegister() {
    try {
      await register(rgEmail, rgPass, rgName);
      toast("Аккаунт создан. Теперь войдите.", "ok");
    } catch (e: any) {
      toast(e.message, "err");
    }
  }

  return (
    <div className="view">
      <div className="page-head">
        <div>
          <h1>Вход и регистрация</h1>
          <p>Войдите, чтобы оставлять отзывы и комментарии</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Вход</h2>
          <label className="field">
            <span className="lbl">Email</span>
            <input value={liEmail} onChange={(e) => setLiEmail(e.target.value)} />
          </label>
          <label className="field">
            <span className="lbl">Пароль</span>
            <input type="password" value={liPass} onChange={(e) => setLiPass(e.target.value)} />
          </label>
          <button className="btn" onClick={doLogin}>
            Войти
          </button>
          <p className="hint" style={{ marginTop: 12 }}>
            Демо-аккаунт: user1@example.com / password123
          </p>
        </div>

        <div className="card">
          <h2>Регистрация</h2>
          <label className="field">
            <span className="lbl">Email</span>
            <input
              placeholder="you@example.com"
              value={rgEmail}
              onChange={(e) => setRgEmail(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="lbl">Имя</span>
            <input
              placeholder="Ваше имя"
              value={rgName}
              onChange={(e) => setRgName(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="lbl">Пароль (мин. 6 символов)</span>
            <input type="password" value={rgPass} onChange={(e) => setRgPass(e.target.value)} />
          </label>
          <button className="btn secondary" onClick={doRegister}>
            Создать аккаунт
          </button>
        </div>
      </div>
    </div>
  );
}
