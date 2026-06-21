import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Bars, Donut } from "../components/Donut";

export default function AnalyticsPage() {
  const [platforms, setPlatforms] = useState<{ label: string; value: number }[]>([]);
  const [criteria, setCriteria] = useState<{ label: string; value: number }[]>([]);
  const [dist, setDist] = useState<{ score: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.byPlatform(), api.criteriaAvg(), api.scoreDistribution()])
      .then(([p, c, d]) => {
        setPlatforms(p.map((x: any) => ({ label: x.platform, value: x.avg })));
        setCriteria(c.map((x: any) => ({ label: x.criterion, value: x.avg })));
        setDist(d);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div className="view">
      <div className="page-head">
        <div>
          <h1>Аналитика</h1>
          <p>Сводные показатели по отзывам</p>
        </div>
      </div>

      <div className="card">
        <h2>Средний балл по площадкам</h2>
        <Bars rows={platforms} max={5} />
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Средние по критериям</h2>
          <Bars rows={criteria} max={5} />
        </div>
        <div className="card">
          <h2>Распределение оценок</h2>
          <div className="center">
            <Donut data={dist} />
          </div>
        </div>
      </div>
    </div>
  );
}
