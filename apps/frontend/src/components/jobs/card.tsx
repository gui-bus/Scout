"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge/badge";
import type { Job } from "./types";
import { toast } from "@/components/ui/toast/toast";
import { calculateMatchScore, LumeResume } from "../../lib/match-score";

interface JobCardItemProps {
  job: Job;
  isAuthenticated: boolean;
  onToggleFavorite: (jobId: number, currentVal: boolean) => Promise<void>;
  onToggleApplied: (jobId: number, currentVal: boolean) => Promise<void>;
  onMarkAsViewed?: (jobId: number) => void;
  resume?: LumeResume | null;
}

function renderSourceLogo(source: string | null) {
  if (!source) return null;
  const sources = source.split(",").map((s) => s.trim());

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {sources.map((src, idx) => {
        const srcLower = src.toLowerCase();
        let logo = null;
        if (srcLower.includes("gupy")) {
          logo = (
            <>
              <Image src="/utils/icons/gupy_black.svg" alt="Gupy" width={45} height={16} style={{ height: "auto" }} className="dark:hidden select-none object-contain" />
              <Image src="/utils/icons/gupy_white.svg" alt="Gupy" width={45} height={16} style={{ height: "auto" }} className="hidden dark:block select-none object-contain" />
            </>
          );
        } else if (srcLower.includes("solides") || srcLower.includes("sólides")) {
          logo = <Image src="/utils/icons/solides.svg" alt="Sólides" width={55} height={16} style={{ height: "auto" }} className="select-none object-contain" />;
        } else if (srcLower.includes("remotar")) {
          logo = (
            <>
              <Image src="/utils/icons/remotar_black.svg" alt="Remotar" width={55} height={16} style={{ height: "auto" }} className="dark:hidden select-none object-contain" />
              <Image src="/utils/icons/remotar_white.svg" alt="Remotar" width={55} height={16} style={{ height: "auto" }} className="hidden dark:block select-none object-contain" />
            </>
          );
        } else if (srcLower.includes("jooble")) {
          logo = <Image src="/utils/icons/jooble.svg" alt="Jooble" width={45} height={16} style={{ height: "auto" }} className="select-none object-contain" />;
        } else if (srcLower.includes("github")) {
          logo = (
            <>
              <Image src="/utils/icons/github_logo_black.svg" alt="GitHub" width={55} height={16} style={{ height: "auto" }} className="dark:hidden select-none object-contain" />
              <Image src="/utils/icons/github_logo_white.svg" alt="GitHub" width={55} height={16} style={{ height: "auto" }} className="hidden dark:block select-none object-contain" />
            </>
          );
        } else if (srcLower.includes("remotive")) {
          logo = (
            <>
              <Image src="/utils/icons/remotive_black.svg" alt="Remotive" width={65} height={16} style={{ height: "auto" }} className="dark:hidden select-none object-contain" />
              <Image src="/utils/icons/remotive_white.svg" alt="Remotive" width={65} height={16} style={{ height: "auto" }} className="hidden dark:block select-none object-contain" />
            </>
          );
        } else {
          logo = (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border select-none">
              {src}
            </span>
          );
        }
        return <React.Fragment key={idx}>{logo}</React.Fragment>;
      })}
    </div>
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

  clean = clean.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, " $1 ");

  return clean.replace(/\s+/g, " ").trim();
}

function formatRelativeDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "Não informada";
  const date = new Date(dateInput);
  const now = new Date();

  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  if (diffDays === 0) {
    return `hoje às ${timeStr}`;
  }
  if (diffDays === 1) {
    return `ontem às ${timeStr}`;
  }
  if (diffDays < 0) {
    return `hoje às ${timeStr}`;
  }

  return `${diffDays} dias atrás às ${timeStr} (${date.toLocaleDateString("pt-BR")})`;
}

export function JobCardItem({
  job,
  isAuthenticated,
  onToggleFavorite,
  onToggleApplied,
  onMarkAsViewed,
  resume = null,
}: JobCardItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTechsExpanded, setIsTechsExpanded] = useState(false);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);
  const sanitizedDesc = sanitizeDescription(job.description);
  const techList = job.technologies ? job.technologies.split(",") : [];
  const linkList = job.link ? job.link.split(",") : [];
  const sourceList = job.source ? job.source.split(",").map((s) => s.trim()) : [];
  const matchScore = calculateMatchScore(job, resume);

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

      {job.isViewed && (
        <div
          className={`absolute top-0 bg-muted border-x border-b border-border px-3 py-2.5 rounded-b-lg flex items-center gap-1 text-[10px] font-bold text-muted-foreground select-none z-10 ${
            isAuthenticated ? "right-20" : "right-6"
          }`}
          title="Vaga já visualizada"
        >
          <Icon icon="ph:check-bold" className="size-3.5 text-emerald-500" />
          <span>Visualizada</span>
        </div>
      )}

      <CardHeader className="p-6 pb-0 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1 pr-12">
            {job.company ? (
              <Link
                href={`https://www.google.com/search?q=${encodeURIComponent(job.company)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-muted-foreground text-xs uppercase tracking-wider hover:text-primary hover:underline transition-colors cursor-pointer flex items-center gap-1"
                title={`Pesquisar sobre ${job.company} no Google`}
              >
                <span>{job.company}</span>
                <Icon icon="ph:magnifying-glass-bold" className="size-3 text-muted-foreground/50 hover:text-primary" />
              </Link>
            ) : (
              <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider select-none">
                Empresa não informada
              </span>
            )}
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

          {matchScore !== null && (
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border select-none ${
                matchScore >= 80
                  ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50"
                  : matchScore >= 50
                  ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50"
                  : "bg-zinc-50 dark:bg-zinc-950/20 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-900/50"
              }`}>
                {matchScore}% Match
              </span>
            </div>
          )}

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
            {job.contractType && job.contractType !== "Não especificado" && (
              <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                {job.contractType}
              </span>
            )}
          </div>

          <div className="mt-3.5 flex flex-col gap-2">
            <div className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase flex items-center gap-1 select-none">
              <Icon icon="ph:list-bullets-bold" className="size-3.5 text-primary" />
              <span>Resumo Rápido</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">Tipo de Contrato</span>
                <span className="font-semibold text-foreground">
                  {job.contractType && job.contractType !== "Não especificado" ? job.contractType : "Não especificado"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">Localização</span>
                <span className="font-semibold text-foreground truncate">
                  {job.location || "Não informada"}
                </span>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">Salário / Benefícios</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {job.salaryText || "Não especificado"}
                </span>
              </div>
            </div>
          </div>

          {techList.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {techList
                  .slice(0, isTechsExpanded ? undefined : 8)
                  .map((tech, idx) => (
                    <Badge
                      key={idx}
                      color="primary"
                      variant="flat"
                      size="sm"
                      radius="sm"
                      className="text-[9px] font-semibold"
                    >
                      {tech.trim()}
                    </Badge>
                  ))}

                {techList.length > 8 && (
                  <button
                    onClick={() => setIsTechsExpanded(!isTechsExpanded)}
                    className="text-[10px] text-primary hover:underline font-bold px-1.5 py-0.5 rounded cursor-pointer focus:outline-none flex items-center gap-0.5"
                  >
                    <span>
                      {isTechsExpanded
                        ? "Ver menos"
                        : `+${techList.length - 8} mais`}
                    </span>
                  </button>
                )}
              </div>
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
                  onClick={() => {
                    setIsExpanded(!isExpanded);
                    if (!isExpanded && onMarkAsViewed) {
                      onMarkAsViewed(job.id);
                    }
                  }}
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



          {job.contactsText && (
            <div className="mt-3.5 p-3 bg-primary/5 border border-primary/10 rounded-lg flex flex-col gap-2">
              <div className="text-[10px] text-primary font-bold flex items-center gap-1">
                <Icon icon="ph:paper-plane-tilt-bold" className="size-3.5" />
                <span>Candidatura direta / Contato:</span>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                {job.contactsText.split(",").map((contact, idx) => {
                  const cTrim = contact.trim();
                  const isEmail = cTrim.includes("@");

                  if (isEmail) {
                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-card border border-border rounded-md shadow-sm"
                      >
                        <span className="text-[11px] font-mono select-all truncate text-foreground pr-2 font-medium">
                          {cTrim}
                        </span>
                        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(cTrim);
                              setCopiedContact(cTrim);
                              toast.success("E-mail copiado!", {
                                description: "O endereço foi copiado para a área de transferência.",
                              });
                              setTimeout(() => setCopiedContact(null), 2000);
                            }}
                            className={`text-[10px] flex items-center gap-1 px-2.5 py-1 font-semibold rounded transition-all cursor-pointer border ${
                              copiedContact === cTrim
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted hover:bg-muted/80 text-foreground border-border"
                            }`}
                            title="Copiar e-mail"
                          >
                            <Icon
                              icon={copiedContact === cTrim ? "ph:check-bold" : "ph:copy-bold"}
                              className="size-3"
                            />
                            <span>{copiedContact === cTrim ? "Copiado!" : "Copiar"}</span>
                          </button>
                          <a
                            href={`mailto:${cTrim}`}
                            className="text-[10px] flex items-center gap-1 px-2.5 py-1 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded transition-colors cursor-pointer"
                            title="Enviar e-mail"
                          >
                            <Icon icon="ph:envelope-simple-bold" className="size-3" />
                            <span>Enviar</span>
                          </a>
                        </div>
                      </div>
                    );
                  } else {
                    let domain = "Link";
                    try {
                      const url = new URL(cTrim);
                      domain = url.hostname.replace("www.", "");
                    } catch {
                      // ignore
                    }
                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-card border border-border rounded-md shadow-sm"
                      >
                        <span className="text-[11px] font-mono select-all truncate text-foreground pr-2 font-medium">
                          {cTrim}
                        </span>
                        <a
                          href={cTrim}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => onMarkAsViewed?.(job.id)}
                          className="text-[10px] flex items-center gap-1 px-2.5 py-1 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
                        >
                          <Icon icon="ph:arrow-square-out-bold" className="size-3" />
                          <span>Acessar {domain}</span>
                        </a>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}

          {job.location && (
            <div className="flex items-center text-xs text-muted-foreground mt-3.5 font-medium">
              <Icon icon="ph:map-pin" className="size-4 mr-1 shrink-0 text-primary" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{job.location}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 text-[10px] text-muted-foreground mt-4 border-t border-border/50 pt-4">
          <div className="flex items-center gap-1.5">
            <Icon icon="ph:calendar-blank" className="size-3.5 text-muted-foreground/75" />
            <span>
              Publicada: {formatRelativeDate(job.publishedAt)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon icon="ph:clock" className="size-3.5 text-muted-foreground/75" />
            <span>
              Coletada: {formatRelativeDate(job.collectedAt)}
            </span>
          </div>
        </div>
      </CardBody>

      <CardFooter className="p-6 pt-0 mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <div className="w-full sm:w-auto">
          {isAuthenticated && (
            <button
              onClick={() => {
                onToggleApplied(job.id, !!job.isApplied);
                if (onMarkAsViewed) {
                  onMarkAsViewed(job.id);
                }
              }}
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

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 self-end sm:self-auto mt-1 sm:mt-0 shrink-0">
          {linkList.map((link, idx) => {
            const sourceName = sourceList[idx] || "Ver Vaga";
            return (
              <Link
                key={idx}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onMarkAsViewed?.(job.id)}
                className="text-muted-foreground hover:text-foreground transition-colors font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <span>{linkList.length > 1 ? `Ver no ${sourceName}` : "Ver Vaga"}</span>
                <span>→</span>
              </Link>
            );
          })}
        </div>
      </CardFooter>
    </Card>
  );
}
