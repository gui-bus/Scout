"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select/select";

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
  onClearFilters: () => void;
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
  onClearFilters,
}: JobsSidebarProps) {
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
