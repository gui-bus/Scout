"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button/button";
import { Spinner } from "@/components/ui/spinner/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu/dropdown-menu";

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
    <header>
      <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 relative w-30 flex items-center">
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
              size="md"
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center focus:outline-none cursor-pointer">
                    <Avatar size="sm" color="primary" isPressable isBordered>
                      <AvatarFallback>
                        {userEmail ? userEmail.slice(0, 2).toUpperCase() : "US"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                  <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs font-semibold text-foreground leading-none">Usuário</p>
                      <p className="text-[11px] text-muted-foreground leading-none truncate mt-0.5">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    color="danger"
                    onClick={onLogout}
                    className="cursor-pointer flex items-center"
                  >
                    <Icon icon="hugeicons:logout-01" className="size-4 mr-2" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={onOpenAuthModal}
                color="primary"
                variant="default"
                radius="lg"
                size="md"
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
            variant="light"
            radius="lg"
            size="md"
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
