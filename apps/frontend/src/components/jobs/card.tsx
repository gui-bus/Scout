"use client";

import React from "react";
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

export function JobCardItem({
  job,
  isAuthenticated,
  onToggleFavorite,
  onToggleApplied,
}: JobCardItemProps) {
  return (
    <Card
      variant="flat"
      isHoverable
      className="bg-card border border-border flex flex-col justify-between h-full hover:border-muted-foreground/35 transition-colors relative"
    >
      <CardHeader className="p-6 pb-0 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            <h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              {job.company || "Empresa não informada"}
            </h4>
            <div className="h-5 flex items-center mt-1">
              {renderSourceLogo(job.source)}
            </div>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => onToggleFavorite(job.id, !!job.isFavorite)}
              className="text-muted-foreground hover:text-yellow-500 transition-colors p-1 cursor-pointer"
              title={job.isFavorite ? "Remover dos Favoritos" : "Favoritar Vaga"}
            >
              <Icon
                icon="hugeicons:star"
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
        </div>
        {job.location && (
          <div className="flex items-center text-xs text-muted-foreground mt-3 font-medium">
            <Icon icon="ph:map-pin" className="size-4 mr-1 shrink-0 text-primary" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
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
              onClick={() => onToggleApplied(job.id, !!job.isApplied)}
              className={`flex items-center space-x-1 px-1.5 py-0.5 rounded border text-[9px] font-bold cursor-pointer transition-colors ${
                job.isApplied
                  ? "bg-default border-border text-foreground"
                  : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              }`}
            >
              <Icon icon="hugeicons:tick-02" className="size-3" />
              <span>{job.isApplied ? "Candidatado" : "Marcar Candidatura"}</span>
            </button>
          )}
        </div>

        <Link
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors font-semibold flex items-center space-x-1 cursor-pointer"
        >
          <span>Ver Vaga</span>
          <span>→</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
