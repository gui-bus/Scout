"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button/button";
import { Spinner } from "@/components/ui/spinner/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar/avatar";
import { NotificationDropdown } from "./NotificationDropdown";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu/dropdown-menu";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
} from "@/components/ui/drawer/drawer";

interface JobsHeaderProps {
  isSyncing: boolean;
  onSync: () => Promise<void>;
  userEmail?: string | null;
  isAuthenticated: boolean;
  onLogout: () => void;
  onOpenAuthModal: () => void;
  token: string | null;
  onImportResume: () => void;
  onSelectJob: (jobId: number) => void;
}

export function JobsHeader({
  isSyncing,
  onSync,
  userEmail,
  isAuthenticated,
  onLogout,
  onOpenAuthModal,
  token,
  onImportResume,
  onSelectJob,
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-3">
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

            {isAuthenticated && (
              <Button
                onClick={onImportResume}
                color="primary"
                variant="flat"
                radius="lg"
                size="sm"
                startContent={
                  <Image
                    src="/utils/lume/lume_icon.svg"
                    alt="Lume"
                    width={16}
                    height={16}
                    className="select-none object-contain"
                  />
                }
              >
                Importar Currículo Lume
              </Button>
            )}

            {isAuthenticated && (
              <NotificationDropdown token={token} onSelectJob={onSelectJob} />
            )}

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

        {/* Mobile Navigation (Drawer) */}
        <div className="md:hidden flex items-center">
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                color="primary"
                variant="flat"
                radius="lg"
                size="sm"
                isIconOnly
                ariaLabel="Abrir Menu"
                className="cursor-pointer"
              >
                <Icon icon="hugeicons:menu-01" className="size-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent
              position="right"
              size="sm"
              className="bg-background border-l border-border"
            >
              <div className="flex flex-col space-y-6 mt-8">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <span className="font-bold text-sm">Menu</span>
                </div>

                {isSyncing && (
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Spinner size="xs" color="primary" />
                    <span>Buscando novas vagas...</span>
                  </div>
                )}

                <Button
                  onClick={async () => {
                    await onSync();
                  }}
                  disabled={isSyncing}
                  color="primary"
                  variant="default"
                  radius="lg"
                  size="sm"
                  className="w-full justify-start"
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
                  <div className="flex flex-col space-y-4 border-t border-border pt-4">
                    <div className="flex items-center space-x-3">
                      <Avatar size="sm" color="primary" isBordered>
                        <AvatarFallback>
                          {userEmail ? userEmail.slice(0, 2).toUpperCase() : "US"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground">Usuário</span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                          {userEmail}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={onImportResume}
                      color="primary"
                      variant="flat"
                      radius="lg"
                      size="sm"
                      className="w-full justify-start"
                      startContent={
                        <Image
                          src="/utils/lume/lume_icon.svg"
                          alt="Lume"
                          width={16}
                          height={16}
                          className="select-none object-contain"
                        />
                      }
                    >
                      Importar Currículo Lume
                    </Button>
                    <Button
                      onClick={onLogout}
                      color="danger"
                      variant="flat"
                      radius="lg"
                      size="sm"
                      className="w-full justify-start"
                      startContent={<Icon icon="hugeicons:logout-01" className="size-4" />}
                    >
                      Sair da Conta
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={onOpenAuthModal}
                    color="primary"
                    variant="default"
                    radius="lg"
                    size="sm"
                    className="w-full justify-start"
                    startContent={<Icon icon="hugeicons:user" className="size-4" />}
                  >
                    Entrar
                  </Button>
                )}

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Tema do Sistema</span>
                  <Button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    color="primary"
                    variant="flat"
                    radius="lg"
                    size="sm"
                    isIconOnly
                    ariaLabel="Alterar Tema"
                    className="cursor-pointer"
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
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
