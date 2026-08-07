"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import type { Job } from "./types";

interface JobCardItemProps {
  job: Job;
  isAuthenticated: boolean;
  onToggleFavorite: (jobId: number, currentVal: boolean) => Promise<void>;
  onToggleApplied: (jobId: number, currentVal: boolean) => Promise<void>;
}

function renderSourceLogo(source: string | null) {
  if (!source) return null;
  const srcLower = source.toLowerCase();

  if (srcLower.includes("gupy")) {
    return (
      <>
        <Image
          src="/utils/icons/gupy_black.svg"
          alt="Gupy"
          width={45}
          height={16}
          className="dark:hidden select-none object-contain"
        />
        <Image
          src="/utils/icons/gupy_white.svg"
          alt="Gupy"
          width={45}
          height={16}
          className="hidden dark:block select-none object-contain"
        />
      </>
    );
  }
  if (srcLower.includes("solides") || srcLower.includes("sólides")) {
    return (
      <Image
        src="/utils/icons/solides.svg"
        alt="Sólides"
        width={55}
        height={16}
        className="select-none object-contain"
      />
    );
  }
  if (srcLower.includes("remotar")) {
    return (
      <>
        <Image
          src="/utils/icons/remotar_black.svg"
          alt="Remotar"
          width={55}
          height={16}
          className="dark:hidden select-none object-contain"
        />
        <Image
          src="/utils/icons/remotar_white.svg"
          alt="Remotar"
          width={55}
          height={16}
          className="hidden dark:block select-none object-contain"
        />
      </>
    );
  }
  if (srcLower.includes("jooble")) {
    return (
      <Image
        src="/utils/icons/jooble.svg"
        alt="Jooble"
        width={45}
        height={16}
        className="select-none object-contain"
      />
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border select-none">
      {source}
    </span>
  );
}

function sanitizeDescription(desc: string | null): string {
  if (!desc) return "";
  let clean = desc
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"');

  // Adiciona espaçamento entre emojis grudados e letras se necessário
  clean = clean.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, " $1 ");

  // Remove espaços múltiplos e limpa as pontas
  return clean.replace(/\s+/g, " ").trim();
}

export function JobCardItem({
  job,
  isAuthenticated,
  onToggleFavorite,
  onToggleApplied,
}: JobCardItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sanitizedDesc = sanitizeDescription(job.description);

  return (
    <Card
      variant="flat"
      isHoverable
      className="bg-card border border-border flex flex-col justify-between h-full hover:-translate-y-1 hover:shadow-lg hover:border-primary/45 transition-all duration-300 ease-out will-change-transform relative overflow-visible"
    >
      {isAuthenticated && (
        <button
          onClick={() => onToggleFavorite(job.id, !!job.isFavorite)}
          className={`absolute top-0 right-6 px-2.5 py-3 rounded-b-lg transition-all duration-200 cursor-pointer z-10 flex items-center justify-center ${
            job.isFavorite
              ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/95"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border-x border-b border-border"
          }`}
          title={job.isFavorite ? "Remover dos Salvos" : "Salvar Vaga"}
        >
          <Icon
            icon={job.isFavorite ? "ph:bookmark-simple-fill" : "ph:bookmark-simple"}
            className="size-5"
          />
        </button>
      )}

      <CardHeader className="p-6 pb-0 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1 pr-12">
            <h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              {job.company || "Empresa não informada"}
            </h4>
            <div className="h-5 flex items-center mt-1">
              {renderSourceLogo(job.source)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-6 py-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground hover:text-muted-foreground transition-colors">
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
          </div>

          {job.technologies && (
            <div className="flex flex-wrap gap-1 mt-3">
              {job.technologies.split(",").map((tech, idx) => (
                <span
                  key={idx}
                  className="text-[9px] font-semibold bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded"
                >
                  {tech.trim()}
                </span>
              ))}
            </div>
          )}

          {sanitizedDesc && (
            <div className="mt-3">
              <p
                className={`text-xs text-muted-foreground leading-relaxed transition-all ${
                  isExpanded ? "" : "line-clamp-3"
                }`}
              >
                {sanitizedDesc}
              </p>
              {sanitizedDesc.length > 160 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[11px] text-primary hover:underline font-bold mt-1 cursor-pointer focus:outline-none flex items-center gap-0.5"
                >
                  <span>{isExpanded ? "Ver menos" : "Ver mais"}</span>
                  <Icon
                    icon={isExpanded ? "ph:caret-up-bold" : "ph:caret-down-bold"}
                    className="size-3"
                  />
                </button>
              )}
            </div>
          )}

          {job.location && (
            <div className="flex items-center text-xs text-muted-foreground mt-3 font-medium">
              <Icon icon="ph:map-pin" className="size-4 mr-1 shrink-0 text-primary" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{job.location}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 text-[10px] text-muted-foreground mt-4 border-t border-border/50 pt-4">
          <div className="flex items-center gap-1.5">
            <Icon icon="ph:calendar-blank" className="size-3.5 text-muted-foreground/75" />
            <span>
              Publicada:{" "}
              {job.publishedAt
                ? new Date(job.publishedAt).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : "Não informada"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon icon="ph:clock" className="size-3.5 text-muted-foreground/75" />
            <span>
              Coletada:{" "}
              {job.collectedAt
                ? new Date(job.collectedAt).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : "Não informada"}
            </span>
          </div>
        </div>
      </CardBody>

      <CardFooter className="p-6 pt-0 mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <div className="w-full sm:w-auto">
          {isAuthenticated && (
            <button
              onClick={() => onToggleApplied(job.id, !!job.isApplied)}
              className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold cursor-pointer transition-all w-fit ${
                job.isApplied
                  ? "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "bg-muted/40 border-border text-muted-foreground hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              <Icon
                icon={job.isApplied ? "ph:check-circle-fill" : "ph:circle"}
                className="size-3.5"
              />
              <span>{job.isApplied ? "Candidatado" : "Marcar Candidatura"}</span>
            </button>
          )}
        </div>

        <Link
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors font-semibold flex items-center space-x-1 cursor-pointer self-end sm:self-auto shrink-0 mt-1 sm:mt-0"
        >
          <span>Ver Vaga</span>
          <span>→</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
