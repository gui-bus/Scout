"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useQueryState, parseAsInteger, parseAsString, parseAsArrayOf } from "nuqs";
import { Icon } from "@iconify/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Select } from "@/components/ui/select/select";
import { Spinner } from "@/components/ui/spinner/spinner";
import { Skeleton } from "@/components/ui/skeleton/skeleton";
import { PaginationToolbar } from "@/components/ui/pagination/pagination";
import { AuthModal } from "@/components/ui/auth-modal";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Job, Pagination } from "@/components/jobs/types";
import { JobsHeader } from "@/components/jobs/header";
import { JobsSidebar } from "@/components/jobs/sidebar";
import { JobCardItem } from "@/components/jobs/card";

interface QueryData {
  items: Job[];
  pagination: Pagination;
}

interface SyncStatusData {
  collecting: boolean;
}

function JobsPageContent() {
  const { user, logout, token, isAuthenticated } = useAuth();
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
  const [contractTypeQuery, setContractTypeQuery] = useQueryState("contrato", parseAsString.withDefault("todos"));
  const [pageQuery, setPageQuery] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPageQuery, setPerPageQuery] = useQueryState("limite", parseAsInteger.withDefault(10));

  const [busca, setBusca] = useState(buscaQuery);
  const [company, setCompany] = useState(companyQuery);
  const [location, setLocation] = useState(locationQuery);

  const queryClient = useQueryClient();

  const {
    data: jobsData,
    isLoading: loading,
    error: queryError,
  } = useQuery<QueryData, Error>({
    queryKey: [
      "jobs",
      buscaQuery,
      companyQuery,
      locationQuery,
      periodQuery,
      modalitiesQuery,
      levelsQuery,
      sourcesQuery,
      favoritesOnlyQuery,
      appliedOnlyQuery,
      contractTypeQuery,
      pageQuery,
      perPageQuery,
      token,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (buscaQuery) params.append("busca", buscaQuery);
      if (companyQuery) params.append("company", companyQuery);
      if (locationQuery) params.append("location", locationQuery);
      if (periodQuery) params.append("period", periodQuery);
      if (favoritesOnlyQuery) params.append("favoritesOnly", "true");
      if (appliedOnlyQuery) params.append("appliedOnly", "true");
      if (contractTypeQuery && contractTypeQuery !== "todos") {
        params.append("contractType", contractTypeQuery);
      }

      modalitiesQuery.forEach((m) => params.append("modality", m));
      levelsQuery.forEach((l) => params.append("level", l));
      sourcesQuery.forEach((s) => params.append("source", s));

      params.append("page", pageQuery.toString());
      params.append("per_page", perPageQuery.toString());

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

      return response.json();
    },
    refetchInterval: 300000,
  });

  const { data: syncStatus } = useQuery<SyncStatusData, Error>({
    queryKey: ["syncStatus"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3001/api/collect/status");
      if (!response.ok) {
        throw new Error("Erro ao checar status de sincronização");
      }
      return response.json();
    },
    refetchInterval: (query) => {
      return query.state.data?.collecting ? 2000 : 15000;
    },
  });

  const isSyncing = !!syncStatus?.collecting;
  const jobs = jobsData?.items || [];
  const pagination = jobsData?.pagination || null;
  const error = queryError ? queryError.message : null;

  const prevCollectingRef = useRef(false);
  useEffect(() => {
    const isCollecting = !!syncStatus?.collecting;
    if (prevCollectingRef.current && !isCollecting) {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    }
    prevCollectingRef.current = isCollecting;
  }, [syncStatus, queryClient]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pageQuery]);

  const syncJobsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("http://localhost:3001/api/collect", {
        method: "POST",
        headers: {
          Authorization: "Bearer development_cron_secret",
        },
      });
      if (!response.ok && response.status !== 409) {
        throw new Error("Falha ao iniciar a sincronização");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syncStatus"] });
    },
  });

  const handleSyncJobs = async () => {
    if (isSyncing) return;
    syncJobsMutation.mutate();
  };

  const handleClearFilters = useCallback(() => {
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
    setContractTypeQuery(null);
  }, [setPageQuery, setBuscaQuery, setCompanyQuery, setLocationQuery, setPeriodQuery, setModalitiesQuery, setLevelsQuery, setSourcesQuery, setFavoritesOnlyQuery, setAppliedOnlyQuery, setContractTypeQuery]);

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

  const handlePeriodChange = useCallback((val: string) => {
    setPageQuery(1);
    setPeriodQuery(val || null);
  }, [setPageQuery, setPeriodQuery]);

  const handleSourcesChange = useCallback((val: string[]) => {
    setPageQuery(1);
    setSourcesQuery(val);
  }, [setPageQuery, setSourcesQuery]);

  const handleModalitiesChange = useCallback((val: string[]) => {
    setPageQuery(1);
    setModalitiesQuery(val);
  }, [setPageQuery, setModalitiesQuery]);

  const handleLevelsChange = useCallback((val: string[]) => {
    setPageQuery(1);
    setLevelsQuery(val);
  }, [setPageQuery, setLevelsQuery]);

  const handleFavoritesOnlyChange = useCallback((val: boolean) => {
    setPageQuery(1);
    setFavoritesOnlyQuery(val ? "true" : null);
  }, [setPageQuery, setFavoritesOnlyQuery]);

  const handleAppliedOnlyChange = useCallback((val: boolean) => {
    setPageQuery(1);
    setAppliedOnlyQuery(val ? "true" : null);
  }, [setPageQuery, setAppliedOnlyQuery]);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ jobId, currentVal }: { jobId: number; currentVal: boolean }) => {
      const response = await fetch(`http://localhost:3001/api/jobs/${jobId}/state`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isFavorite: !currentVal }),
      });
      if (!response.ok) throw new Error("Erro ao atualizar favorito");
      return response.json();
    },
    onMutate: async ({ jobId, currentVal }) => {
      await queryClient.cancelQueries({ queryKey: ["jobs"] });
      const previousJobsData = queryClient.getQueryData(["jobs"]);

      queryClient.setQueriesData<QueryData>({ queryKey: ["jobs"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((j: Job) =>
            j.id === jobId ? { ...j, isFavorite: !currentVal } : j
          ),
        };
      });

      return { previousJobsData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousJobsData) {
        queryClient.setQueriesData({ queryKey: ["jobs"] }, context.previousJobsData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const toggleAppliedMutation = useMutation({
    mutationFn: async ({ jobId, currentVal }: { jobId: number; currentVal: boolean }) => {
      const response = await fetch(`http://localhost:3001/api/jobs/${jobId}/state`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isApplied: !currentVal }),
      });
      if (!response.ok) throw new Error("Erro ao atualizar candidatura");
      return response.json();
    },
    onMutate: async ({ jobId, currentVal }) => {
      await queryClient.cancelQueries({ queryKey: ["jobs"] });
      const previousJobsData = queryClient.getQueryData(["jobs"]);

      queryClient.setQueriesData<QueryData>({ queryKey: ["jobs"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((j: Job) =>
            j.id === jobId ? { ...j, isApplied: !currentVal } : j
          ),
        };
      });

      return { previousJobsData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousJobsData) {
        queryClient.setQueriesData({ queryKey: ["jobs"] }, context.previousJobsData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const handleToggleFavorite = useCallback(async (jobId: number, currentVal: boolean) => {
    if (!token) return;
    toggleFavoriteMutation.mutate({ jobId, currentVal });
  }, [token, toggleFavoriteMutation]);

  const handleToggleApplied = useCallback(async (jobId: number, currentVal: boolean) => {
    if (!token) return;
    toggleAppliedMutation.mutate({ jobId, currentVal });
  }, [token, toggleAppliedMutation]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <JobsHeader
        isSyncing={isSyncing}
        onSync={handleSyncJobs}
        userEmail={user?.email}
        isAuthenticated={isAuthenticated}
        onLogout={logout}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <JobsSidebar
          isAuthenticated={isAuthenticated}
          favoritesOnly={favoritesOnlyQuery === "true"}
          onFavoritesOnlyChange={handleFavoritesOnlyChange}
          appliedOnly={appliedOnlyQuery === "true"}
          onAppliedOnlyChange={handleAppliedOnlyChange}
          busca={busca}
          onBuscaChange={setBusca}
          onBuscaDebounced={handleBuscaDebounced}
          company={company}
          onCompanyChange={setCompany}
          onCompanyDebounced={handleCompanyDebounced}
          location={location}
          onLocationChange={setLocation}
          onLocationDebounced={handleLocationDebounced}
          period={periodQuery}
          onPeriodChange={handlePeriodChange}
          contractType={contractTypeQuery}
          onContractTypeChange={setContractTypeQuery}
          sources={sourcesQuery}
          onSourcesChange={handleSourcesChange}
          modalities={modalitiesQuery}
          onModalitiesChange={handleModalitiesChange}
          levels={levelsQuery}
          onLevelsChange={handleLevelsChange}
          onClearFilters={handleClearFilters}
        />

        <section className="flex-1 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Vagas Encontradas</h1>
              <p className="text-xs text-muted-foreground mt-1">
                {pagination ? `${pagination.total} oportunidades disponíveis` : "Carregando..."}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={perPageQuery.toString()}
                onValueChange={(val) => {
                  setPageQuery(1);
                  setPerPageQuery(parseInt(val || "10", 10));
                }}
                radius="lg"
                variant="default"
                size="sm"
                className="w-28 shrink-0"
                options={[
                  { value: "10", label: "10 / pág" },
                  { value: "20", label: "20 / pág" },
                  { value: "30", label: "30 / pág" },
                  { value: "40", label: "40 / pág" },
                  { value: "50", label: "50 / pág" },
                ]}
              />

              <ButtonGroup variant="light" size="sm" radius="none">
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
                <span className="text-xs text-muted-foreground font-medium select-none whitespace-nowrap shrink-0">
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
                <JobCardItem
                  key={job.id}
                  job={job}
                  isAuthenticated={isAuthenticated}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleApplied={handleToggleApplied}
                />
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

      <footer className="border-t border-border bg-background mt-auto py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[110rem] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="h-6 relative w-[90px] flex items-center">
            <Image
              src="/logos/logo_white.svg"
              alt="Scout Logo"
              width={90}
              height={24}
              className="hidden dark:block select-none object-contain"
            />
            <Image
              src="/logos/logo_black.svg"
              alt="Scout Logo"
              width={90}
              height={24}
              className="block dark:hidden select-none object-contain"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Link
                href="https://github.com/gui-bus"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform duration-200 cursor-pointer flex items-center justify-center"
                title="GitHub"
              >
                <Image
                  src="/utils/icons/github_black.svg"
                  alt="GitHub"
                  width={20}
                  height={20}
                  className="dark:hidden select-none"
                />
                <Image
                  src="/utils/icons/github_white.svg"
                  alt="GitHub"
                  width={20}
                  height={20}
                  className="hidden dark:block select-none"
                />
              </Link>
              <Link
                href="https://www.linkedin.com/in/gui-bus/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform duration-200 cursor-pointer flex items-center justify-center"
                title="LinkedIn"
              >
                <Image
                  src="/utils/icons/linkedin.svg"
                  alt="LinkedIn"
                  width={20}
                  height={20}
                  className="select-none"
                />
              </Link>
            </div>

            <span className="text-border select-none font-light">|</span>

            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              color="primary"
              variant="flat"
              radius="lg"
              size="sm"
              className="flex items-center space-x-1 font-semibold text-xs py-1.5 cursor-pointer"
              startContent={<Icon icon="hugeicons:arrow-up-01" className="size-4" />}
            >
              Voltar ao topo
            </Button>
          </div>
        </div>
      </footer>
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
