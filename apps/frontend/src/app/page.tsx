"use client";

import React, { useState, useEffect, useRef } from "react";

interface Job {
  id: number;
  title: string;
  description: string | null;
  company: string | null;
  location: string | null;
  modality: string | null;
  level: string;
  technologies: string | null;
  source: string | null;
  link: string;
  publishedAt: string | null;
}

interface Pagination {
  page: number;
  perPage: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [busca, setBusca] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [period, setPeriod] = useState("");
  const [modalities, setModalities] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const [triggerFetch, setTriggerFetch] = useState(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (busca) params.append("busca", busca);
      if (company) params.append("company", company);
      if (location) params.append("location", location);
      if (period) params.append("period", period);

      modalities.forEach((m) => params.append("modality", m));
      levels.forEach((l) => params.append("level", l));

      params.append("page", page.toString());
      params.append("per_page", "12");

      const response = await fetch(`http://localhost:3001/api/jobs?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar as vagas");
      }

      const data = await response.json();
      setJobs(data.items || []);
      setPagination(data.pagination || null);
    } catch (err: any) {
      setError(err.message || "Algo deu errado");
    } finally {
      setLoading(false);
    }
  };

  const checkSyncStatus = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/collect/status");
      if (response.ok) {
        const data = await response.json();
        if (!data.collecting) {
          if (syncIntervalRef.current) {
            clearInterval(syncIntervalRef.current);
            syncIntervalRef.current = null;
          }
          setIsSyncing(false);
          fetchJobs();
        }
      }
    } catch {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      setIsSyncing(false);
    }
  };

  const handleSyncJobs = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/api/collect", {
        method: "POST",
        headers: {
          Authorization: "Bearer development_cron_secret",
        },
      });

      if (!response.ok && response.status !== 409) {
        throw new Error("Falha ao iniciar a sincronização");
      }

      syncIntervalRef.current = setInterval(checkSyncStatus, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao sincronizar");
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [page, triggerFetch]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setTriggerFetch((prev) => prev + 1);
  };

  const handleClearFilters = () => {
    setBusca("");
    setCompany("");
    setLocation("");
    setPeriod("");
    setModalities([]);
    setLevels([]);
    setPage(1);
    setTriggerFetch((prev) => prev + 1);
  };

  const toggleModality = (val: string) => {
    setModalities((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const toggleLevel = (val: string) => {
    setLevels((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              S
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Scout
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {isSyncing && (
              <div className="flex items-center space-x-2 text-xs text-indigo-400">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Buscando novas vagas...</span>
              </div>
            )}
            <button
              onClick={handleSyncJobs}
              disabled={isSyncing}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl px-4 py-2 text-xs font-semibold transition-all shadow-md shadow-indigo-600/10 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSyncing ? "Sincronizando..." : "Sincronizar Vagas"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sticky top-24 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-6 flex items-center justify-between text-indigo-400">
              Filtros
              <button
                onClick={handleClearFilters}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
              >
                Limpar Todos
              </button>
            </h2>

            <form onSubmit={handleApplyFilters} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Palavra-chave ou Tecnologia
                </label>
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Ex: Node.js, React, Python"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Empresa
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ex: Nubank, Google"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Localização
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: São Paulo, Remoto"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Período de Publicação
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                >
                  <option value="">Qualquer data</option>
                  <option value="hoje">Hoje</option>
                  <option value="semana">Últimos 7 dias</option>
                  <option value="mes">Últimos 30 dias</option>
                </select>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Modalidade
                </span>
                <div className="space-y-2">
                  {["Remoto", "Híbrido", "Presencial"].map((m) => (
                    <label key={m} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={modalities.includes(m)}
                        onChange={() => toggleModality(m)}
                        className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 focus:ring-offset-2 transition-all cursor-pointer h-4 w-4"
                      />
                      <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
                        {m}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Nível
                </span>
                <div className="space-y-2">
                  {[
                    "Estágio",
                    "Júnior",
                    "Júnior/Pleno",
                    "Pleno",
                    "Pleno/Sênior",
                    "Sênior",
                    "Não informado",
                  ].map((l) => (
                    <label key={l} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={levels.includes(l)}
                        onChange={() => toggleLevel(l)}
                        className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 focus:ring-offset-2 transition-all cursor-pointer h-4 w-4"
                      />
                      <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
                        {l}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl py-3 text-sm font-semibold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Aplicar Filtros
              </button>
            </form>
          </div>
        </aside>

        <section className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Vagas Encontradas</h1>
              <p className="text-sm text-slate-400 mt-1">
                {pagination ? `${pagination.total} oportunidades disponíveis` : "Carregando..."}
              </p>
            </div>
            {pagination && (
              <span className="text-xs text-slate-500 font-medium">
                Página {pagination.page} de {pagination.pages || 1}
              </span>
            )}
          </div>

          {error && (
            <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-6 text-red-200 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 h-48 animate-pulse flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-4 w-1/3 bg-slate-800 rounded"></div>
                    <div className="h-6 w-3/4 bg-slate-800 rounded"></div>
                  </div>
                  <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
                </div>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <article
                  key={job.id}
                  className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/80 transition-all flex flex-col justify-between group relative overflow-hidden backdrop-blur-sm"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="h-10 w-10 rounded-xl bg-slate-800 text-slate-200 font-bold text-sm flex items-center justify-center border border-slate-700">
                          {(job.company || "?")[0].toUpperCase()}
                        </span>
                        <div>
                          <h4 className="font-semibold text-slate-200 text-sm">
                            {job.company || "Empresa não informada"}
                          </h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 mt-1">
                            {job.source}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.modality && (
                          <span className="text-xs bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                            {job.modality}
                          </span>
                        )}
                        {job.level && (
                          <span className="text-xs bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                            {job.level}
                          </span>
                        )}
                        {job.location && (
                          <span className="text-xs bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg truncate max-w-[150px]">
                            {job.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/50 mt-6 pt-4 text-xs text-slate-400">
                    <span>
                      Publicada em:{" "}
                      {job.publishedAt
                        ? new Date(job.publishedAt).toLocaleDateString("pt-BR")
                        : "Não informada"}
                    </span>
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Ver Vaga</span>
                      <span>→</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl w-full">
              <p className="text-slate-400 text-sm mb-4">Nenhuma vaga encontrada no banco de dados.</p>
              <button
                onClick={handleSyncJobs}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2.5 text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-600/10"
              >
                Buscar Novas Vagas Agora
              </button>
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <nav className="flex items-center justify-between border-t border-slate-800/50 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={!pagination.hasPrev}
                className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Anterior
              </button>
              <span className="text-sm text-slate-400">
                Página {pagination.page} de {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
                disabled={!pagination.hasNext}
                className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Próxima
              </button>
            </nav>
          )}
        </section>
      </main>
    </div>
  );
}
