"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button/button";
import { toast } from "@/components/ui/toast/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LumeResume } from "./types";
import { API_URL } from "@/lib/config";

interface LumeImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string | null;
}

export function LumeImportModal({ open, onOpenChange, token }: LumeImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const queryClient = useQueryClient();

  const uploadResumeMutation = useMutation({
    mutationFn: async (resumeData: LumeResume) => {
      const response = await fetch(`${API_URL}/api/auth/resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resume: resumeData }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar currículo no servidor.");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Currículo Lume importado e salvo com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["user-resume"] });
      onOpenChange(false);
      setFile(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Falha ao processar arquivo.");
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndProcess = (file: File) => {
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast.error("O arquivo deve ser um JSON válido exportado do Lume.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json.skills || !Array.isArray(json.skills) || !json.personalInfo) {
          throw new Error("Estrutura inválida. Certifique-se de exportar do Lume.");
        }

        setFile(file);
      } catch {
        toast.error("Formato inválido! Certifique-se de que o arquivo foi gerado pelo Lume.");
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcess(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        uploadResumeMutation.mutate(json);
      } catch {
        toast.error("Falha ao analisar o JSON do arquivo.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Icon icon="hugeicons:file-attachment" className="size-6 text-sky-500" />
            Importar Currículo do Lume
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
            Importe o arquivo JSON gerado pelo criador de currículos Lume para calcular o grau de compatibilidade (Match Score) de todas as vagas automaticamente.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 p-4 border border-sky-100 dark:border-sky-950 bg-sky-50/50 dark:bg-sky-950/20 rounded-2xl">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">Integração Oficial com</span>
            <div className="relative h-6 w-20">
              <Image 
                src="/utils/lume/logo_black.svg" 
                alt="Lume Logo" 
                fill 
                className="dark:hidden select-none object-contain" 
              />
              <Image 
                src="/utils/lume/logo_white.svg" 
                alt="Lume Logo" 
                fill 
                className="hidden dark:block select-none object-contain" 
              />
            </div>
          </div>
          <p className="text-xs text-center text-zinc-600 dark:text-zinc-300">
            Apenas arquivos `.json` gerados e baixados a partir do criador de currículos Lume são aceitos para análise estruturada.
          </p>
          <a
            href="https://lume.guibus.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-500 hover:text-sky-600 hover:underline font-semibold flex items-center gap-1 mt-1 transition-all"
          >
            <span>Não tem um currículo Lume? Crie o seu gratuitamente aqui</span>
            <Icon icon="hugeicons:arrow-up-right-01" className="size-3" />
          </a>
        </div>
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${
            dragActive 
              ? "border-sky-500 bg-sky-500/10" 
              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50"
          }`}
        >
          <input
            type="file"
            id="lume-file-upload"
            className="hidden"
            accept=".json"
            onChange={handleChange}
          />
          <label htmlFor="lume-file-upload" className="absolute inset-0 w-full h-full cursor-pointer" />
          
          <div className="p-3 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl shadow-sm">
            <Icon icon="hugeicons:upload-04" className="size-6 text-zinc-400" />
          </div>

          <div className="text-center z-10 pointer-events-none">
            {file ? (
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-1.5">
                <Icon icon="hugeicons:file-check" className="size-4 text-emerald-500" />
                {file.name}
              </p>
            ) : (
              <>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Arraste ou clique para selecionar
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Somente arquivos JSON exportados do Lume (.json)
                </p>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploadResumeMutation.isPending}
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl"
          >
            {uploadResumeMutation.isPending ? "Processando..." : "Salvar Currículo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
