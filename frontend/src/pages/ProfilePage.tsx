import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const KEYS = [
  ["service", "Сервис / площадка"],
  ["seller", "Продавец"],
  ["product", "Товар"],
  ["delivery", "Доставка"],
] as const;

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [w, setW] = useState<Record<string, number>>({
    service: 0.25,
    seller: 0.25,
    product: 0.25,
    delivery: 0.25,
  });

  useEffect(() => {
    if (user?.crit_weights) setW({ ...w, ...user.crit_weights });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user)
    return (
      <div className="card">
        <h2>Требуется вход</h2>
        <p className="hint">Войдите, чтобы настроить профиль.</p>
        <button className="btn" onClick={() => navigate("/auth")}>
          Перейти ко входу
        </button>
      </div>
    );

  async function save() {
    try {
      await api.saveWeights(w);
      await refresh();
      toast("Веса сохранены", "ok");
    } catch (e: any) {
      toast(e.message, "err");
    }
  }

  return (
    <div className="view">
      <div className="page-head">
        <div>
          <h1>Профиль</h1>
          <p>Настройте важность критериев для персональных рекомендаций</p>
        </div>
      </div>

      <div className="card">
        <div className="kv">
          <span>Имя</span>
          <b>{user.display_name || "—"}</b>
        </div>
        <div className="kv">
          <span>Email</span>
          <b>{user.email}</b>
        </div>
      </div>

      <div className="card">
        <h2>Веса критериев</h2>
        <p className="hint">
          Чем выше вес, тем сильнее критерий влияет на рекомендации (сумма нормализуется
          автоматически)
        </p>
        {KEYS.map(([key, label]) => (
          <label className="field" key={key}>
            <span className="lbl">{label}</span>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={w[key]}
              onChange={(e) => setW({ ...w, [key]: parseFloat(e.target.value) || 0 })}
            />
          </label>
        ))}
        <button className="btn" onClick={save}>
          Сохранить веса
        </button>
      </div>
    </div>
  );
}
