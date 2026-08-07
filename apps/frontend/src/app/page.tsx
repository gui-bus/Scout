"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useQueryState, parseAsInteger, parseAsString, parseAsArrayOf } from "nuqs";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Select } from "@/components/ui/select/select";
import { Spinner } from "@/components/ui/spinner/spinner";
import { Skeleton } from "@/components/ui/skeleton/skeleton";
import { PaginationToolbar } from "@/components/ui/pagination/pagination";
import { AuthModal } from "@/components/ui/auth-modal";
import { useAuth } from "@/lib/contexts/AuthContext";

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
  isFavorite?: boolean;
  isApplied?: boolean;
}

interface Pagination {
  page: number;
  perPage: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const sourceOptions = [
  { value: "Gupy", label: "Gupy" },
  { value: "Solides", label: "Sólides" },
  { value: "Remotar", label: "Remotar" },
  { value: "Jooble", label: "Jooble" }
];

const modalityOptions = [
  { value: "Remoto", label: "Remoto" },
  { value: "Híbrido", label: "Híbrido" },
  { value: "Presencial", label: "Presencial" }
];

const levelOptions = [
  { value: "Estágio", label: "Estágio" },
  { value: "Júnior", label: "Júnior" },
  { value: "Júnior/Pleno", label: "Júnior/Pleno" },
  { value: "Pleno", label: "Pleno" },
  { value: "Pleno/Sênior", label: "Pleno/Sênior" },
  { value: "Sênior", label: "Sênior" },
  { value: "Não informado", label: "Não informado" }
];

function JobsPageContent() {
  const { user, logout, token, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [viewLayout, setViewLayout] = useState<"grid" | "list">("grid");

  const [buscaQuery, setBuscaQuery] = useQueryState("busca", parseAsString.withDefault(""));
  const [companyQuery, setCompanyQuery] = useQueryState("company", parseAsString.withDefault(""));
  const [locationQuery, setLocationQuery] = useQueryState("location", parseAsString.withDefault(""));
  const [periodQuery, setPeriodQuery] = useQueryState("period", parseAsString.withDefault(""));
  const [modalitiesQuery, setModalitiesQuery] = useQueryState("modalities", parseAsArrayOf(parseAsString).withDefault([]));
  const [levelsQuery, setLevelsQuery] = useQueryState("levels", parseAsArrayOf(parseAsString).withDefault([]));
  const [sourcesQuery, setSourcesQuery] = useQueryState("sources", parseAsArrayOf(parseAsString).withDefault([]));
  const [favoritesOnlyQuery, setFavoritesOnlyQuery] = useQueryState("favoritos", parseAsString.withDefault(""));
  const [appliedOnlyQuery, setAppliedOnlyQuery] = useQueryState("candidatados", parseAsString.withDefault(""));
  const [pageQuery, setPageQuery] = useQueryState("page", parseAsInteger.withDefault(1));

  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [busca, setBusca] = useState(buscaQuery);
  const [company, setCompany] = useState(companyQuery);
  const [location, setLocation] = useState(locationQuery);

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
      if (favoritesOnlyQuery) params.append("favoritesOnly", "true");
      if (appliedOnlyQuery) params.append("appliedOnly", "true");

      modalitiesQuery.forEach((m) => params.append("modality", m));
      levelsQuery.forEach((l) => params.append("level", l));
      sourcesQuery.forEach((s) => params.append("source", s));

      params.append("page", pageQuery.toString());
      params.append("per_page", "12");

      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:3001/api/jobs?${params.toString()}`, {
        headers,
      });

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
    setMounted(true);
    fetchJobs();
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [pageQuery, buscaQuery, companyQuery, locationQuery, periodQuery, modalitiesQuery, levelsQuery, sourcesQuery, favoritesOnlyQuery, appliedOnlyQuery, token]);

  const handleClearFilters = () => {
    setBusca("");
    setCompany("");
    setLocation("");

    setPageQuery(1);
    setBuscaQuery(null);
    setCompanyQuery(null);
    setLocationQuery(null);
    setPeriodQuery(null);
    setModalitiesQuery(null);
    setLevelsQuery(null);
    setSourcesQuery(null);
    setFavoritesOnlyQuery(null);
    setAppliedOnlyQuery(null);
  };

  const handleBuscaDebounced = useCallback((val: string) => {
    setPageQuery(1);
    setBuscaQuery(val || null);
  }, [setPageQuery, setBuscaQuery]);

  const handleCompanyDebounced = useCallback((val: string) => {
    setPageQuery(1);
    setCompanyQuery(val || null);
  }, [setPageQuery, setCompanyQuery]);

  const handleLocationDebounced = useCallback((val: string) => {
    setPageQuery(1);
    setLocationQuery(val || null);
  }, [setPageQuery, setLocationQuery]);

  const handleToggleFavorite = async (jobId: number, currentVal: boolean) => {
    if (!token) return;
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, isFavorite: !currentVal } : j))
    );

    try {
      await fetch(`http://localhost:3001/api/jobs/${jobId}/state`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isFavorite: !currentVal }),
      });
    } catch {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, isFavorite: currentVal } : j))
      );
    }
  };

  const handleToggleApplied = async (jobId: number, currentVal: boolean) => {
    if (!token) return;
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, isApplied: !currentVal } : j))
    );

    try {
      await fetch(`http://localhost:3001/api/jobs/${jobId}/state`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isApplied: !currentVal }),
      });
    } catch {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, isApplied: currentVal } : j))
      );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="bg-background border-b border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 flex items-center">
              <img src="/logos/logo_white.svg" alt="Scout Logo" className="h-8 hidden dark:block select-none" />
              <img src="/logos/logo_black.svg" alt="Scout Logo" className="h-8 block dark:hidden select-none" />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isSyncing && (
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mr-2">
                <Spinner size="xs" color="primary" />
                <span>Buscando novas vagas...</span>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Button
                onClick={handleSyncJobs}
                disabled={isSyncing}
                color="primary"
                variant="default"
                radius="lg"
                size="sm"
                startContent={
                  <Icon
                    icon={isSyncing ? "hugeicons:loading" : "hugeicons:refresh"}
                    className={isSyncing ? "animate-spin size-4" : "size-4"}
                  />
                }
              >
                {isSyncing ? "Sincronizando..." : "Sincronizar Vagas"}
              </Button>

              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-muted-foreground font-medium select-none max-w-[150px] truncate">
                    {user?.email}
                  </span>
                  <Button
                    onClick={logout}
                    color="primary"
                    variant="flat"
                    radius="lg"
                    size="sm"
                    endContent={<Icon icon="hugeicons:logout-01" className="size-4" />}
                  >
                    Sair
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setAuthModalOpen(true)}
                  color="primary"
                  variant="default"
                  radius="lg"
                  size="sm"
                  startContent={<Icon icon="hugeicons:user" className="size-4" />}
                >
                  Entrar
                </Button>
              )}
            </div>

            <span className="text-border select-none font-light">|</span>

            <Button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              color="primary"
              variant="flat"
              radius="lg"
              size="sm"
              isIconOnly
              ariaLabel="Alterar Tema"
              className="cursor-pointer"
              title="Alterar Tema"
            >
              {mounted && (
                <Icon
                  icon={theme === "dark" ? "hugeicons:sun-01" : "hugeicons:moon-02"}
                  className="size-4 text-muted-foreground"
                />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-80 shrink-0 space-y-6 lg:border-r lg:border-border lg:pr-8">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
              Filtros
            </h2>
            <button
              onClick={handleClearFilters}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold cursor-pointer"
            >
              Limpar Todos
            </button>
          </div>

          <div className="space-y-5">
            {isAuthenticated && (
              <CheckboxGroup label="Painel Pessoal">
                <Checkbox
                  checked={favoritesOnlyQuery === "true"}
                  onCheckedChange={(val) => {
                    setPageQuery(1);
                    setFavoritesOnlyQuery(val ? "true" : null);
                  }}
                  label="Apenas Favoritas"
                  color="primary"
                />
                <Checkbox
                  checked={appliedOnlyQuery === "true"}
                  onCheckedChange={(val) => {
                    setPageQuery(1);
                    setAppliedOnlyQuery(val ? "true" : null);
                  }}
                  label="Candidaturas Feitas"
                  color="primary"
                />
              </CheckboxGroup>
            )}

            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              debouncedOnChange={handleBuscaDebounced}
              debounceTimeout={400}
              onClear={() => {
                setBusca("");
                setPageQuery(1);
                setBuscaQuery(null);
              }}
              isClearable
              placeholder="Ex: Node.js, React, Python"
              label="Palavra-chave ou Tecnologia"
              variant="default"
              radius="lg"
            />

            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              debouncedOnChange={handleCompanyDebounced}
              debounceTimeout={400}
              onClear={() => {
                setCompany("");
                setPageQuery(1);
                setCompanyQuery(null);
              }}
              isClearable
              placeholder="Ex: Nubank, Google"
              label="Empresa"
              variant="default"
              radius="lg"
            />

            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              debouncedOnChange={handleLocationDebounced}
              debounceTimeout={400}
              onClear={() => {
                setLocation("");
                setPageQuery(1);
                setLocationQuery(null);
              }}
              isClearable
              placeholder="Ex: São Paulo, Remoto"
              label="Localização"
              variant="default"
              radius="lg"
            />

            <Select
              label="Período de Publicação"
              value={periodQuery}
              onValueChange={(val) => {
                setPageQuery(1);
                setPeriodQuery(val || null);
              }}
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

            <Select
              label="Origem"
              placeholder="Todas as origens"
              isMultiSelect
              multiValue={sourcesQuery}
              onMultiValueChange={(val) => {
                setPageQuery(1);
                setSourcesQuery(val);
              }}
              options={sourceOptions}
              radius="lg"
              variant="default"
              maxTagsVisible={2}
            />

            <Select
              label="Modalidade"
              placeholder="Todas as modalidades"
              isMultiSelect
              multiValue={modalitiesQuery}
              onMultiValueChange={(val) => {
                setPageQuery(1);
                setModalitiesQuery(val);
              }}
              options={modalityOptions}
              radius="lg"
              variant="default"
              maxTagsVisible={2}
            />

            <Select
              label="Nível"
              placeholder="Todos os níveis"
              isMultiSelect
              multiValue={levelsQuery}
              onMultiValueChange={(val) => {
                setPageQuery(1);
                setLevelsQuery(val);
              }}
              options={levelOptions}
              radius="lg"
              variant="default"
              maxTagsVisible={1}
            />
          </div>
        </aside>

        <section className="flex-1 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Vagas Encontradas</h1>
              <p className="text-xs text-muted-foreground mt-1">
                {pagination ? `${pagination.total} oportunidades disponíveis` : "Carregando..."}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ButtonGroup variant="flat" size="sm" radius="lg">
                <Button
                  onClick={() => setViewLayout("grid")}
                  color={viewLayout === "grid" ? "primary" : "secondary"}
                  isIconOnly
                  ariaLabel="Visualizar em Grid"
                >
                  <Icon icon="hugeicons:grid-view" className="size-4" />
                </Button>
                <Button
                  onClick={() => setViewLayout("list")}
                  color={viewLayout === "list" ? "primary" : "secondary"}
                  isIconOnly
                  ariaLabel="Visualizar em Lista"
                >
                  <Icon icon="hugeicons:menu-02" className="size-4" />
                </Button>
              </ButtonGroup>
              {pagination && (
                <span className="text-xs text-muted-foreground font-medium select-none">
                  Página {pagination.page} de {pagination.pages || 1}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-destructive text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className={viewLayout === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-3"}>
              {[...Array(6)].map((_, i) => (
                <Card
                  key={i}
                  variant="flat"
                  className="bg-card border border-border p-6 h-44 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-1/3 bg-muted" />
                    <Skeleton className="h-6 w-3/4 bg-muted" />
                  </div>
                  <Skeleton className="h-4 w-1/2 bg-muted" />
                </Card>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className={viewLayout === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-3"}>
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  variant="flat"
                  isHoverable
                  className="bg-card border border-border flex flex-col justify-between h-full hover:border-muted-foreground/35 transition-colors relative"
                >
                  <CardHeader className="p-6 pb-0 flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="h-9 w-9 rounded-lg bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center border border-border">
                          {(job.company || "?")[0].toUpperCase()}
                        </span>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">
                            {job.company || "Empresa não informada"}
                          </h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground mt-1 border border-border select-none">
                            {job.source}
                          </span>
                        </div>
                      </div>

                      {isAuthenticated && (
                        <button
                          onClick={() => handleToggleFavorite(job.id, !!job.isFavorite)}
                          className="text-muted-foreground hover:text-yellow-500 transition-colors p-1 cursor-pointer"
                          title={job.isFavorite ? "Remover dos Favoritos" : "Favoritar Vaga"}
                        >
                          <Icon
                            icon={job.isFavorite ? "hugeicons:star" : "hugeicons:star"}
                            className={`size-5 ${job.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                          />
                        </button>
                      )}
                    </div>
                  </CardHeader>

                  <CardBody className="p-6 py-4 flex-1">
                    <h3 className="text-sm font-bold text-foreground line-clamp-1 hover:text-muted-foreground transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.modality && (
                        <span className="text-[10px] bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                          {job.modality}
                        </span>
                      )}
                      {job.level && (
                        <span className="text-[10px] bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                          {job.level}
                        </span>
                      )}
                      {job.location && (
                        <span className="text-[10px] bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full font-medium truncate max-w-[150px]">
                          {job.location}
                        </span>
                      )}
                    </div>
                  </CardBody>

                  <CardFooter className="p-6 pt-0 mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center space-x-3">
                      <span>
                        Publicada em:{" "}
                        {job.publishedAt
                          ? new Date(job.publishedAt).toLocaleDateString("pt-BR")
                          : "Não informada"}
                      </span>

                      {isAuthenticated && (
                        <button
                          onClick={() => handleToggleApplied(job.id, !!job.isApplied)}
                          className={`flex items-center space-x-1 px-1.5 py-0.5 rounded border text-[9px] font-bold cursor-pointer transition-colors ${
                            job.isApplied
                              ? "bg-default border-border text-foreground"
                              : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                          }`}
                        >
                          <Icon
                            icon={job.isApplied ? "hugeicons:tick-02" : "hugeicons:tick-02"}
                            className="size-3"
                          />
                          <span>{job.isApplied ? "Candidatado" : "Marcar Candidatura"}</span>
                        </button>
                      )}
                    </div>

                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Ver Vaga</span>
                      <span>→</span>
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/10 border border-dashed border-border rounded-2xl w-full flex flex-col items-center">
              <p className="text-muted-foreground text-sm mb-4">Nenhuma vaga encontrada no banco de dados.</p>
              <Button
                onClick={handleSyncJobs}
                color="primary"
                radius="lg"
                startContent={<Icon icon="hugeicons:refresh" className="size-4" />}
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
              color="primary"
              className="w-full mt-6"
            />
          )}
        </section>
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" color="primary" label="Carregando..." />
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  );
}
