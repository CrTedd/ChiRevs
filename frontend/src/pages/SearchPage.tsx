import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { StarsDisplay } from "../components/Stars";

interface ResultItem {
  review_id: number;
  product_id: number;
  product_title: string;
  category: string | null;
  platform: string | null;
  seller: string | null;
  score_total: number | null;
  relevance: number;
  rank: number;
  comment_text: string | null;
  created_at: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("relevance");
  const [order, setOrder] = useState("desc");
  const [cats, setCats] = useState<{ id: number; name: string }[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.categories().then(setCats).catch(() => {});
  }, []);

  const run = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.search({ q, category, sort, order, limit: "30" });
      setResults(data.results);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [q, category, sort, order]);

  // Перезапуск при смене сортировки/категории.
  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, order, category]);

  return (
    <div className="view">
      <div className="page-head">
        <div>
          <h1>Поиск отзывов</h1>
          <p>Рекомендательное ранжирование по релевантности, баллам и свежести</p>
        </div>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="grow">
            <input
              placeholder="Например: наушники, смарт-часы, кабель..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run()}
            />
          </div>
          <button className="btn" onClick={run}>
            Найти
          </button>
        </div>
        <div className="controls">
          <div>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Все категории</option>
              {cats.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="relevance">Сортировка: по релевантности</option>
              <option value="score">Сортировка: по баллам</option>
              <option value="date">Сортировка: по дате</option>
            </select>
          </div>
          <div>
            <select value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="desc">По убыванию</option>
              <option value="asc">По возрастанию</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : results.length === 0 ? (
        <div className="empty">Ничего не найдено. Измените запрос или категорию.</div>
      ) : (
        results.map((x) => (
          <Link key={x.review_id} className="result" to={`/review/${x.review_id}`}>
            <div className="result-top">
              <span className="result-title">{x.product_title}</span>
              <span className="score-pill">
                <StarsDisplay value={x.score_total} />
                {x.score_total != null ? x.score_total.toFixed(2) : "—"}
              </span>
            </div>
            <div className="badges">
              {x.category && <span className="badge">{x.category}</span>}
              {x.platform && <span className="badge brand">{x.platform}</span>}
              {x.seller && <span className="badge">{x.seller}</span>}
              <span className="metric">rank {x.rank}</span>
              <span className="metric">релевантность {x.relevance}</span>
            </div>
            {x.comment_text && <div className="comment">{x.comment_text}</div>}
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              {fmtDate(x.created_at)}
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
