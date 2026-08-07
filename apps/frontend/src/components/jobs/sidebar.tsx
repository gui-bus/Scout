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
  onLocationDebounced: (val: string) => void;
  period: string;
  onPeriodChange: (val: string) => void;
  sources: string[];
  onSourcesChange: (val: string[]) => void;
  modalities: string[];
  onModalitiesChange: (val: string[]) => void;
  levels: string[];
  onLevelsChange: (val: string[]) => void;
  onClearFilters: () => void;
}

const sourceOptions = [
  { value: "Gupy", label: "Gupy" },
  { value: "Solides", label: "Sólides" },
  { value: "Remotar", label: "Remotar" },
  { value: "Jooble", label: "Jooble" },
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
  onLocationDebounced,
  period,
  onPeriodChange,
  sources,
  onSourcesChange,
  modalities,
  onModalitiesChange,
  levels,
  onLevelsChange,
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

        <Input
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          debouncedOnChange={onLocationDebounced}
          debounceTimeout={400}
          onClear={() => {
            onLocationChange("");
            onLocationDebounced("");
          }}
          isClearable
          placeholder="Ex: São Paulo, Remoto"
          label="Localização"
          variant="default"
          radius="lg"
        />

        <Select
          label="Período de Publicação"
          value={period}
          onValueChange={onPeriodChange}
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
          multiValue={sources}
          onMultiValueChange={onSourcesChange}
          options={sourceOptions}
          radius="lg"
          variant="default"
          maxTagsVisible={2}
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
        />
      </div>
    </aside>
  );
}
