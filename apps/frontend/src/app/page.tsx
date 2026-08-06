"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useQueryState, parseAsInteger, parseAsString, parseAsArrayOf } from "nuqs";
import { Input } from "@/components/ui/input";
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { Select } from "@/components/ui/select/select";
import { Spinner } from "@/components/ui/spinner/spinner";
import { Skeleton } from "@/components/ui/skeleton/skeleton";
import { PaginationToolbar } from "@/components/ui/pagination/pagination";

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

function JobsPageContent() {
  const [buscaQuery, setBuscaQuery] = useQueryState("busca", parseAsString.withDefault(""));
  const [companyQuery, setCompanyQuery] = useQueryState("company", parseAsString.withDefault(""));
  const [locationQuery, setLocationQuery] = useQueryState("location", parseAsString.withDefault(""));
  const [periodQuery, setPeriodQuery] = useQueryState("period", parseAsString.withDefault(""));
  const [modalitiesQuery, setModalitiesQuery] = useQueryState("modalities", parseAsArrayOf(parseAsString).withDefault([]));
  const [levelsQuery, setLevelsQuery] = useQueryState("levels", parseAsArrayOf(parseAsString).withDefault([]));
  const [pageQuery, setPageQuery] = useQueryState("page", parseAsInteger.withDefault(1));

  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [busca, setBusca] = useState(buscaQuery);
  const [company, setCompany] = useState(companyQuery);
  const [location, setLocation] = useState(locationQuery);
  const [period, setPeriod] = useState(periodQuery);
  const [modalities, setModalities] = useState<string[]>(modalitiesQuery);
  const [levels, setLevels] = useState<string[]>(levelsQuery);

  const [triggerFetch, setTriggerFetch] = useState(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (buscaQuery) params.append("busca", buscaQuery);
      if (companyQuery) params.append("company", companyQuery);
      if (locationQuery) params.append("location", locationQuery);
      if (periodQuery) params.append("period", periodQuery);

      modalitiesQuery.forEach((m) => params.append("modality", m));
      levelsQuery.forEach((l) => params.append("level", l));

      params.append("page", pageQuery.toString());
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
  }, [pageQuery, triggerFetch, buscaQuery, companyQuery, locationQuery, periodQuery, modalitiesQuery, levelsQuery]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setPageQuery(1);
    setBuscaQuery(busca || null);
    setCompanyQuery(company || null);
    setLocationQuery(location || null);
    setPeriodQuery(period || null);
    setModalitiesQuery(modalities.length > 0 ? modalities : null);
    setLevelsQuery(levels.length > 0 ? levels : null);
    setTriggerFetch((prev) => prev + 1);
  };

  const handleClearFilters = () => {
    setBusca("");
    setCompany("");
    setLocation("");
    setPeriod("");
    setModalities([]);
    setLevels([]);

    setPageQuery(1);
    setBuscaQuery(null);
    setCompanyQuery(null);
    setLocationQuery(null);
    setPeriodQuery(null);
    setModalitiesQuery(null);
    setLevelsQuery(null);
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <header className="bg-zinc-950 border-b border-zinc-800">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-800 text-zinc-100 border border-zinc-700 flex items-center justify-center font-bold">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-100">
              Scout
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {isSyncing && (
              <div className="flex items-center space-x-2 text-xs text-zinc-400">
                <Spinner size="xs" color="default" />
                <span>Buscando novas vagas...</span>
              </div>
            )}
            <Button
              onClick={handleSyncJobs}
              disabled={isSyncing}
              color="default"
              variant="default"
              radius="lg"
              size="sm"
            >
              {isSyncing ? "Sincronizando..." : "Sincronizar Vagas"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 sticky top-24 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-6 flex items-center justify-between text-zinc-200">
              Filtros
              <button
                onClick={handleClearFilters}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-medium cursor-pointer"
              >
                Limpar Todos
              </button>
            </h2>

            <form onSubmit={handleApplyFilters} className="space-y-6">
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Ex: Node.js, React, Python"
                label="Palavra-chave ou Tecnologia"
                variant="default"
                radius="lg"
              />

              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ex: Nubank, Google"
                label="Empresa"
                variant="default"
                radius="lg"
              />

              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: São Paulo, Remoto"
                label="Localização"
                variant="default"
                radius="lg"
              />

              <Select
                label="Período de Publicação"
                value={period}
                onValueChange={setPeriod}
                placeholder="Qualquer data"
                radius="lg"
                variant="default"
                options={[
                  { value: "", label: "Qualquer data" },
                  { value: "hoje", label: "Hoje" },
                  { value: "semana", label: "Últimos 7 dias" },
                  { value: "mes", label: "Últimos 30 dias" },
                ]}
              />

              <CheckboxGroup label="Modalidade">
                {["Remoto", "Híbrido", "Presencial"].map((m) => (
                  <Checkbox
                    key={m}
                    checked={modalities.includes(m)}
                    onCheckedChange={() => toggleModality(m)}
                    label={m}
                    color="default"
                  />
                ))}
              </CheckboxGroup>

              <CheckboxGroup label="Nível">
                {[
                  "Estágio",
                  "Júnior",
                  "Júnior/Pleno",
                  "Pleno",
                  "Pleno/Sênior",
                  "Sênior",
                  "Não informado",
                ].map((l) => (
                  <Checkbox
                    key={l}
                    checked={levels.includes(l)}
                    onCheckedChange={() => toggleLevel(l)}
                    label={l}
                    color="default"
                  />
                ))}
              </CheckboxGroup>

              <Button
                type="submit"
                color="default"
                variant="default"
                radius="lg"
                className="w-full"
              >
                Aplicar Filtros
              </Button>
            </form>
          </div>
        </aside>

        <section className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Vagas Encontradas</h1>
              <p className="text-sm text-zinc-400 mt-1">
                {pagination ? `${pagination.total} oportunidades disponíveis` : "Carregando..."}
              </p>
            </div>
            {pagination && (
              <span className="text-xs text-zinc-500 font-medium">
                Página {pagination.page} de {pagination.pages || 1}
              </span>
            )}
          </div>

          {error && (
            <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-6 text-red-200 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card
                  key={i}
                  variant="default"
                  className="bg-zinc-900/20 border border-zinc-900 p-6 h-48 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-1/3 bg-zinc-800" />
                    <Skeleton className="h-6 w-3/4 bg-zinc-800" />
                  </div>
                  <Skeleton className="h-4 w-1/2 bg-zinc-800" />
                </Card>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  variant="default"
                  isHoverable
                  className="bg-zinc-900/30 border border-zinc-800/80 flex flex-col justify-between h-full"
                >
                  <CardHeader className="p-6 pb-0 flex flex-col space-y-4">
                    <div className="flex items-center space-x-3">
                      <span className="h-10 w-10 rounded-xl bg-zinc-800 text-zinc-200 font-bold text-sm flex items-center justify-center border border-zinc-700">
                        {(job.company || "?")[0].toUpperCase()}
                      </span>
                      <div>
                        <h4 className="font-semibold text-zinc-200 text-sm">
                          {job.company || "Empresa não informada"}
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-850 text-zinc-400 mt-1 border border-zinc-800">
                          {job.source}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardBody className="p-6 py-4 flex-1">
                    <h3 className="text-base font-bold text-zinc-100 line-clamp-1 hover:text-zinc-300 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.modality && (
                        <span className="text-xs bg-zinc-950 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg">
                          {job.modality}
                        </span>
                      )}
                      {job.level && (
                        <span className="text-xs bg-zinc-950 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg">
                          {job.level}
                        </span>
                      )}
                      {job.location && (
                        <span className="text-xs bg-zinc-950 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg truncate max-w-[150px]">
                          {job.location}
                        </span>
                      )}
                    </div>
                  </CardBody>

                  <CardFooter className="p-6 pt-0 border-t border-zinc-800/50 mt-2 flex items-center justify-between text-xs text-zinc-500">
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
                      className="text-zinc-400 hover:text-zinc-200 transition-colors font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Ver Vaga</span>
                      <span>→</span>
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl w-full flex flex-col items-center">
              <p className="text-zinc-400 text-sm mb-4">Nenhuma vaga encontrada no banco de dados.</p>
              <Button
                onClick={handleSyncJobs}
                color="default"
                radius="lg"
              >
                Buscar Novas Vagas Agora
              </Button>
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <PaginationToolbar
              page={pageQuery}
              total={pagination.total}
              pageSize={pagination.perPage}
              onPageChange={setPageQuery}
              showRowsPerPage={false}
              showJumper={false}
              showFirstButton={false}
              showLastButton={false}
              color="default"
              className="w-full mt-6"
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Spinner size="lg" color="default" label="Carregando..." />
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  );
}
