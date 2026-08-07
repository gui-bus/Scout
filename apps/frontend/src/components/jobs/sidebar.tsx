"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select/select";
import { Icon } from "@iconify/react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible/collapsible";
import { toast } from "@/components/ui/toast/toast";

export interface SavedFilterState {
  busca?: string;
  company?: string;
  location?: string;
  city?: string;
  period?: string;
  contractType?: string;
  favoritesOnly?: boolean;
  appliedOnly?: boolean;
  directContactsOnly?: boolean;
  exclude?: string;
  sources?: string[];
  modalities?: string[];
  levels?: string[];
}

interface JobsSidebarProps {
  isAuthenticated: boolean;
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (val: boolean) => void;
  appliedOnly: boolean;
  onAppliedOnlyChange: (val: boolean) => void;
  busca: string;
  onBuscaChange: (val: string) => void;
  onBuscaDebounced: (val: string) => void;
  company: string;
  onCompanyChange: (val: string) => void;
  onCompanyDebounced: (val: string) => void;
  location: string;
  onLocationChange: (val: string) => void;
  city: string;
  onCityChange: (val: string) => void;
  period: string;
  onPeriodChange: (val: string) => void;
  contractType: string;
  onContractTypeChange: (val: string) => void;
  sources: string[];
  onSourcesChange: (val: string[]) => void;
  modalities: string[];
  onModalitiesChange: (val: string[]) => void;
  levels: string[];
  onLevelsChange: (val: string[]) => void;
  directContactsOnly: boolean;
  onDirectContactsOnlyChange: (val: boolean) => void;
  exclude: string;
  onExcludeChange: (val: string) => void;
  onExcludeDebounced: (val: string) => void;
  savedFilters: (SavedFilterState | null)[];
  onSaveFilter: (index: number) => void;
  onDeleteFilter: (index: number) => void;
  onApplyFilter: (filterData: SavedFilterState) => void;
  onClearFilters: () => void;
}

function generateFilterName(f: SavedFilterState) {
  const parts: string[] = [];
  if (f.busca) parts.push(f.busca);
  if (f.location) parts.push(f.location.split(",")[1]?.trim() || f.location);
  if (f.city) parts.push(f.city);
  if (f.contractType && f.contractType !== "todos") parts.push(f.contractType);
  if (f.directContactsOnly) parts.push("Direta");
  if (f.modalities && f.modalities.length > 0) parts.push(f.modalities.join("/"));
  if (f.levels && f.levels.length > 0) parts.push(f.levels.join("/"));

  return parts.join(" · ") || "Filtro Ativo";
}

const sourceOptions = [
  { value: "Gupy", label: "Gupy" },
  { value: "Solides", label: "Sólides" },
  { value: "Remotar", label: "Remotar" },
  { value: "Jooble", label: "Jooble" },
  { value: "GitHub", label: "GitHub" },
  { value: "Remotive", label: "Remotive" },
];

const modalityOptions = [
  { value: "Remoto", label: "Remoto" },
  { value: "Híbrido", label: "Híbrido" },
  { value: "Presencial", label: "Presencial" },
];

const levelOptions = [
  { value: "Estágio", label: "Estágio" },
  { value: "Júnior", label: "Júnior" },
  { value: "Júnior/Pleno", label: "Júnior/Pleno" },
  { value: "Pleno", label: "Pleno" },
  { value: "Pleno/Sênior", label: "Pleno/Sênior" },
  { value: "Sênior", label: "Sênior" },
  { value: "Não informado", label: "Não informado" },
];

export function JobsSidebar({
  isAuthenticated,
  favoritesOnly,
  onFavoritesOnlyChange,
  appliedOnly,
  onAppliedOnlyChange,
  busca,
  onBuscaChange,
  onBuscaDebounced,
  company,
  onCompanyChange,
  onCompanyDebounced,
  location,
  onLocationChange,
  city,
  onCityChange,
  period,
  onPeriodChange,
  contractType,
  onContractTypeChange,
  sources,
  onSourcesChange,
  modalities,
  onModalitiesChange,
  levels,
  onLevelsChange,
  directContactsOnly,
  onDirectContactsOnlyChange,
  exclude,
  onExcludeChange,
  onExcludeDebounced,
  savedFilters = [],
  onSaveFilter,
  onDeleteFilter,
  onApplyFilter,
  onClearFilters,
}: JobsSidebarProps) {
  const [cities, setCities] = React.useState<{ value: string; label: string }[]>([]);
  const [loadingCities, setLoadingCities] = React.useState(false);

  const uf = location && location.includes(",") ? location.split(",")[1]?.trim() : "";

  React.useEffect(() => {
    if (!uf) {
      Promise.resolve().then(() => setCities([]));
      return;
    }

    let active = true;
    Promise.resolve().then(() => setLoadingCities(true));
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then((res) => res.json())
      .then((data: unknown) => {
        if (!active) return;
        const parsed = (data as { nome: string }[]).map((item) => ({
          value: item.nome,
          label: item.nome,
        }));
        parsed.sort((a, b) => a.label.localeCompare(b.label));
        setCities([
          { value: "", label: "Todas as cidades" },
          ...parsed,
        ]);
        setLoadingCities(false);
      })
      .catch(() => {
        if (active) setLoadingCities(false);
      });

    return () => {
      active = false;
    };
  }, [uf]);

  const isAnyFilterActive = !!(
    busca ||
    company ||
    location ||
    city ||
    (contractType && contractType !== "todos") ||
    period ||
    (sources && sources.length > 0) ||
    (modalities && modalities.length > 0) ||
    (levels && levels.length > 0) ||
    directContactsOnly ||
    exclude ||
    favoritesOnly ||
    appliedOnly
  );

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-6 lg:border-r lg:border-border lg:pr-8">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
          Filtros
        </h2>
        <button
          onClick={onClearFilters}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold cursor-pointer"
        >
          Limpar Todos
        </button>
      </div>

      <div className="space-y-5">
        {isAuthenticated && (
          <div className="pb-4 border-b border-border">
            <Collapsible defaultOpen={true}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Filtros Salvos (Slots)
                </h3>
                <CollapsibleTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-1 rounded hover:bg-muted/40 group">
                    <Icon
                      icon="ph:caret-down-bold"
                      className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180"
                    />
                  </button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="mt-3">
                <div className="space-y-2">
                  {[0, 1, 2].map((idx) => {
                    const filter = savedFilters[idx];
                    const displayName = filter ? generateFilterName(filter) : null;

                    return (
                      <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-muted/20 border border-border rounded-lg text-xs">
                        {filter ? (
                          <>
                            <button
                              onClick={() => onApplyFilter(filter)}
                              className="flex-1 text-left font-semibold text-foreground truncate hover:text-primary transition-colors cursor-pointer"
                              title="Clique para aplicar esta combinação"
                            >
                              Slot {idx + 1}: <span className="text-muted-foreground font-medium">{displayName}</span>
                            </button>
                            <button
                              onClick={() => onDeleteFilter(idx)}
                              className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                              title="Excluir Slot"
                            >
                              <Icon icon="ph:trash-bold" className="size-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-muted-foreground italic text-[11px]">Slot {idx + 1} Vazio</span>
                            <button
                              onClick={() => {
                                if (!isAnyFilterActive) {
                                  toast.warning("Nenhum filtro ativo!", {
                                    description: "Por favor, selecione pelo menos um filtro na barra lateral antes de salvar.",
                                  });
                                  return;
                                }
                                onSaveFilter(idx);
                              }}
                              disabled={!isAnyFilterActive}
                              className={`text-[10px] font-bold transition-all cursor-pointer ${
                                isAnyFilterActive
                                  ? "text-primary hover:underline"
                                  : "text-muted-foreground/40 cursor-not-allowed"
                              }`}
                              title={isAnyFilterActive ? "Salvar filtros ativos neste slot" : "Nenhum filtro ativo para salvar"}
                            >
                              + Salvar Atual
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

         {isAuthenticated && (
          <CheckboxGroup label="Painel Pessoal">
            <Checkbox
              checked={favoritesOnly}
              onCheckedChange={(val) => onFavoritesOnlyChange(!!val)}
              label="Apenas Salvas"
              color="primary"
            />
            <Checkbox
              checked={appliedOnly}
              onCheckedChange={(val) => onAppliedOnlyChange(!!val)}
              label="Candidaturas Feitas"
              color="primary"
            />
          </CheckboxGroup>
        )}

        <CheckboxGroup label="Filtros Especiais">
          <Checkbox
            checked={directContactsOnly}
            onCheckedChange={(val) => onDirectContactsOnlyChange(!!val)}
            label="Apenas Candidatura Direta"
            color="primary"
          />
        </CheckboxGroup>

        <Input
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          debouncedOnChange={onBuscaDebounced}
          debounceTimeout={400}
          onClear={() => {
            onBuscaChange("");
            onBuscaDebounced("");
          }}
          isClearable
          placeholder="Ex: Node.js, React, Python"
          label="Palavra-chave ou Tecnologia"
          variant="default"
          radius="lg"
        />

        <Input
          value={company}
          onChange={(e) => onCompanyChange(e.target.value)}
          debouncedOnChange={onCompanyDebounced}
          debounceTimeout={400}
          onClear={() => {
            onCompanyChange("");
            onCompanyDebounced("");
          }}
          isClearable
          placeholder="Ex: Nubank, Google"
          label="Empresa"
          variant="default"
          radius="lg"
        />

        <Select
          label="Localização / Estado"
          value={location}
          onValueChange={onLocationChange}
          placeholder="Todas as localizações"
          radius="lg"
          variant="default"
          isSearchable
          options={[
            { value: "", label: "Todas as localizações" },
            { value: "Remoto", label: "Remoto" },
            { value: "Acre, AC", label: "Acre, AC" },
            { value: "Alagoas, AL", label: "Alagoas, AL" },
            { value: "Amapá, AP", label: "Amapá, AP" },
            { value: "Amazonas, AM", label: "Amazonas, AM" },
            { value: "Bahia, BA", label: "Bahia, BA" },
            { value: "Ceará, CE", label: "Ceará, CE" },
            { value: "Distrito Federal, DF", label: "Distrito Federal, DF" },
            { value: "Espírito Santo, ES", label: "Espírito Santo, ES" },
            { value: "Goiás, GO", label: "Goiás, GO" },
            { value: "Maranhão, MA", label: "Maranhão, MA" },
            { value: "Mato Grosso, MT", label: "Mato Grosso, MT" },
            { value: "Mato Grosso do Sul, MS", label: "Mato Grosso do Sul, MS" },
            { value: "Minas Gerais, MG", label: "Minas Gerais, MG" },
            { value: "Pará, PA", label: "Pará, PA" },
            { value: "Paraíba, PB", label: "Paraíba, PB" },
            { value: "Paraná, PR", label: "Paraná, PR" },
            { value: "Pernambuco, PE", label: "Pernambuco, PE" },
            { value: "Piauí, PI", label: "Piauí, PI" },
            { value: "Rio de Janeiro, RJ", label: "Rio de Janeiro, RJ" },
            { value: "Rio Grande do Norte, RN", label: "Rio Grande do Norte, RN" },
            { value: "Rio Grande do Sul, RS", label: "Rio Grande do Sul, RS" },
            { value: "Rondônia, RO", label: "Rondônia, RO" },
            { value: "Roraima, RR", label: "Roraima, RR" },
            { value: "Santa Catarina, SC", label: "Santa Catarina, SC" },
            { value: "São Paulo, SP", label: "São Paulo, SP" },
            { value: "Sergipe, SE", label: "Sergipe, SE" },
            { value: "Tocantins, TO", label: "Tocantins, TO" },
          ]}
        />

        {uf && (
          <Select
            label="Cidade"
            value={city}
            onValueChange={onCityChange}
            placeholder={loadingCities ? "Carregando cidades..." : "Todas as cidades"}
            radius="lg"
            variant="default"
            options={cities}
            isSearchable
            disabled={loadingCities}
          />
        )}

        <Input
          value={exclude}
          onChange={(e) => onExcludeChange(e.target.value)}
          debouncedOnChange={onExcludeDebounced}
          debounceTimeout={400}
          onClear={() => {
            onExcludeChange("");
            onExcludeDebounced("");
          }}
          isClearable
          placeholder="Ex: wordpress, php, c#"
          label="Ocultar termos (Blacklist)"
          variant="default"
          radius="lg"
        />

        <Select
          label="Tipo de Contrato"
          value={contractType}
          onValueChange={onContractTypeChange}
          placeholder="Todos os contratos"
          radius="lg"
          variant="default"
          isSearchable
          options={[
            { value: "todos", label: "Todos os contratos" },
            { value: "CLT", label: "Apenas CLT" },
            { value: "PJ", label: "Apenas PJ" },
          ]}
        />

        <Select
          label="Período de Publicação / Coleta"
          value={period}
          onValueChange={onPeriodChange}
          placeholder="Qualquer data"
          radius="lg"
          variant="default"
          isSearchable
          options={[
            { value: "", label: "Qualquer data" },
            { value: "coletadas_hoje", label: "Coletadas hoje" },
            { value: "hoje", label: "Publicadas hoje" },
            { value: "24h", label: "Últimas 24 horas" },
            { value: "3dias", label: "Últimos 3 dias" },
            { value: "semana", label: "Últimos 7 dias" },
            { value: "mes", label: "Últimos 30 dias" },
          ]}
        />

        <Select
          label="Origem"
          placeholder="Todas as origens"
          isMultiSelect
          multiValue={sources}
          onMultiValueChange={onSourcesChange}
          options={sourceOptions}
          radius="lg"
          variant="default"
          maxTagsVisible={2}
          isSearchable
        />

        <Select
          label="Modalidade"
          placeholder="Todas as modalidades"
          isMultiSelect
          multiValue={modalities}
          onMultiValueChange={onModalitiesChange}
          options={modalityOptions}
          radius="lg"
          variant="default"
          maxTagsVisible={2}
          isSearchable
        />

        <Select
          label="Nível"
          placeholder="Todos os níveis"
          isMultiSelect
          multiValue={levels}
          onMultiValueChange={onLevelsChange}
          options={levelOptions}
          radius="lg"
          variant="default"
          maxTagsVisible={1}
          isSearchable
        />
      </div>
    </aside>
  );
}
