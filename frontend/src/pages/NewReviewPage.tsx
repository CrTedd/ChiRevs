import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { StarsInput } from "../components/Stars";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

interface Ref {
  id: number;
  title?: string;
  name?: string;
}

export default function NewReviewPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Ref[]>([]);
  const [platforms, setPlatforms] = useState<Ref[]>([]);
  const [sellers, setSellers] = useState<Ref[]>([]);

  const [productId, setProductId] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [scores, setScores] = useState({ service: 5, seller: 5, product: 5, delivery: 5 });
  const [comment, setComment] = useState("");

  useEffect(() => {
    Promise.all([api.products(), api.platforms(), api.sellers()]).then(([p, pl, s]) => {
      setProducts(p);
      setPlatforms(pl);
      setSellers(s);
      if (p[0]) setProductId(String(p[0].id));
      if (pl[0]) setPlatformId(String(pl[0].id));
      if (s[0]) setSellerId(String(s[0].id));
    });
  }, []);

  if (!user)
    return (
      <div className="card">
        <h2>Требуется вход</h2>
        <p className="hint">Войдите, чтобы оставить отзыв.</p>
        <button className="btn" onClick={() => navigate("/auth")}>
          Перейти ко входу
        </button>
      </div>
    );

  const setScore = (k: keyof typeof scores) => (v: number) =>
    setScores((s) => ({ ...s, [k]: v }));

  async function submit() {
    if (!productId) {
      toast("Выберите товар", "err");
      return;
    }
    try {
      const rv = await api.createReview({
        product_id: +productId,
        platform_id: +platformId,
        seller_id: +sellerId,
        score_service: scores.service,
        score_seller: scores.seller,
        score_product: scores.product,
        score_delivery: scores.delivery,
        comment_text: comment,
      });
      toast("Отзыв опубликован", "ok");
      navigate(`/review/${rv.id}`);
    } catch (e: any) {
      toast(e.message, "err");
    }
  }

  return (
    <div className="view">
      <div className="page-head">
        <div>
          <h1>Оставить отзыв</h1>
          <p>Оцените заказ по четырём критериям</p>
        </div>
      </div>

      <div className="card">
        <label className="field">
          <span className="lbl">Товар</span>
          <select value={productId} onChange={(e) => setProductId(e.target.value)}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>

        <div className="row">
          <label className="field">
            <span className="lbl">Площадка</span>
            <select value={platformId} onChange={(e) => setPlatformId(e.target.value)}>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="lbl">Продавец</span>
            <select value={sellerId} onChange={(e) => setSellerId(e.target.value)}>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="divider" />
        <div className="grid-2">
          {(
            [
              ["service", "Сервис / площадка"],
              ["seller", "Продавец"],
              ["product", "Товар"],
              ["delivery", "Доставка"],
            ] as const
          ).map(([key, label]) => (
            <label className="field" key={key}>
              <span className="lbl">{label}</span>
              <StarsInput value={scores[key]} onChange={setScore(key)} />
            </label>
          ))}
        </div>

        <label className="field">
          <span className="lbl">Комментарий (необязательно)</span>
          <textarea
            placeholder="Расскажите о вашем опыте..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </label>

        <button className="btn" onClick={submit}>
          Опубликовать отзыв
        </button>
      </div>
    </div>
  );
}
