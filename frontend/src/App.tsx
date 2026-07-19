import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, DatabaseZap, Loader2, RadioTower, Search } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

import { createPlatform, getHealth, listPlatforms } from './services/api';
import type { Platform } from './types/platform';

const trendData = [
  { name: 'Mon', trust: 78, risk: 31 },
  { name: 'Tue', trust: 80, risk: 29 },
  { name: 'Wed', trust: 83, risk: 25 },
  { name: 'Thu', trust: 81, risk: 27 },
  { name: 'Fri', trust: 85, risk: 22 },
];

export default function App() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [health, setHealth] = useState('checking');
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootLiveApp() {
      try {
        const [healthResult, platformResult] = await Promise.all([getHealth(), listPlatforms()]);
        setHealth(`${healthResult.status} (${healthResult.environment})`);
        if (platformResult.length === 0) {
          const seeded = await Promise.all([
            createPlatform('Stake', 'https://stake.example'),
            createPlatform('Melbet', 'https://melbet.example'),
            createPlatform('Parimatch', 'https://parimatch.example'),
          ]);
          setPlatforms(seeded);
        } else {
          setPlatforms(platformResult);
        }
      } catch (appError) {
        setError(appError instanceof Error ? appError.message : 'Live application could not start');
      } finally {
        setLoading(false);
      }
    }

    bootLiveApp();
  }, []);

  const filteredPlatforms = useMemo(
    () => platforms.filter((platform) => platform.name.toLowerCase().includes(query.toLowerCase())),
    [platforms, query],
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Live Application</p>
            <h1 className="mt-2 text-4xl font-black">Betting Intelligence Lakehouse</h1>
            <p className="mt-2 max-w-3xl text-slate-300">
              FastAPI, React, Kafka-ready collectors, ML scoring, RAG search, agents and monitoring wired as a runnable local product.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-emerald-300">
            <CheckCircle2 size={18} /> Backend: {health}
          </div>
        </header>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
            <AlertTriangle /> {error}. Start the backend or run docker compose up --build.
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ['Platforms', platforms.length, DatabaseZap],
            ['Trust Trend', '85%', Activity],
            ['Risk Alerts', '3', AlertTriangle],
            ['Agent Runs', '12', RadioTower],
          ].map(([label, value, Icon]) => (
            <article key={String(label)} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center justify-between text-slate-400"><span>{String(label)}</span><Icon size={20} /></div>
              <strong className="mt-3 block text-3xl text-white">{String(value)}</strong>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-4 text-xl font-bold">Trust vs Risk Live Trend</h2>
            <div className="h-80"><ResponsiveContainer><LineChart data={trendData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Line dataKey="trust" stroke="#22c55e" strokeWidth={3} /><Line dataKey="risk" stroke="#f97316" strokeWidth={3} /></LineChart></ResponsiveContainer></div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2">
              <Search size={18} className="text-slate-400" />
              <input className="w-full bg-transparent outline-none" placeholder="Search platforms" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            {loading ? <div className="flex items-center gap-2 text-slate-300"><Loader2 className="animate-spin" /> Loading live data...</div> : (
              <div className="space-y-3">
                {filteredPlatforms.map((platform) => <div className="rounded-2xl bg-slate-950 p-4" key={platform.id}><strong>{platform.name}</strong><p className="text-sm text-slate-400">{platform.url}</p></div>)}
              </div>
            )}
          </article>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-4 text-xl font-bold">Complaint Analytics</h2>
          <div className="h-72"><ResponsiveContainer><BarChart data={trendData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="risk" fill="#38bdf8" /></BarChart></ResponsiveContainer></div>
        </section>
      </section>
    </main>
  );
}
