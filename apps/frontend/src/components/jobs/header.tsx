"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button/button";
import { Spinner } from "@/components/ui/spinner/spinner";

interface JobsHeaderProps {
  isSyncing: boolean;
  onSync: () => Promise<void>;
  userEmail?: string | null;
  isAuthenticated: boolean;
  onLogout: () => void;
  onOpenAuthModal: () => void;
}

export function JobsHeader({
  isSyncing,
  onSync,
  userEmail,
  isAuthenticated,
  onLogout,
  onOpenAuthModal,
}: JobsHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
    });
  }, []);

  return (
    <header className="bg-background border-b border-border">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 relative w-[120px] flex items-center">
            <Image
              src="/logos/logo_white.svg"
              alt="Scout Logo"
              width={120}
              height={32}
              priority
              className="hidden dark:block select-none object-contain"
            />
            <Image
              src="/logos/logo_black.svg"
              alt="Scout Logo"
              width={120}
              height={32}
              priority
              className="block dark:hidden select-none object-contain"
            />
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
              onClick={onSync}
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
                  {userEmail}
                </span>
                <Button
                  onClick={onLogout}
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
                onClick={onOpenAuthModal}
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
  );
}
