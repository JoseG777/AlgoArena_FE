import { useEffect, useState } from 'react';

type StatsItem = {
  id: string;
  startedAt: string;
  opponentUsername: string | null;
  points: number;
  result: 'win'|'loss'|'tie';
};

type StatsResponse = {
  totalPoints: number;
  matches: StatsItem[];
};

const StatsPage: React.FC = () => {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://localhost:3001/me/matches', { credentials: 'include' });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e?.error || 'Failed to load Stats');
        }
        const json: StatsResponse = await res.json();
        setData(json);
      } catch (e: any) {
        setErr(e?.message || 'Error');
      }
    })();
  }, []);

  if (err) return <div>Error: {err}</div>;
  if (!data) return <div>Loading…</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Your Points: {data.totalPoints}</h2>
      <h3>Match Stats</h3>
      <ul>
        {data.matches.map(m => (
          <li key={m.id}>
            {new Date(m.startedAt).toLocaleDateString()} — vs {m.opponentUsername ?? '—'} — {m.points} pts — {m.result}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatsPage;
