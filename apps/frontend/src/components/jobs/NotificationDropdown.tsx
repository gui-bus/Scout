"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu/dropdown-menu";
import { Button } from "@/components/ui/button/button";
import { toast } from "@/components/ui/toast/toast";

interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  jobId: number | null;
  createdAt: string;
}

interface NotificationDropdownProps {
  token: string | null;
  onSelectJob: (jobId: number) => void;
}

export function NotificationDropdown({ token, onSelectJob }: NotificationDropdownProps) {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications", token],
    queryFn: async () => {
      if (!token) return [];
      const response = await fetch("http://localhost:3001/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!token,
    refetchInterval: 30000, // Poll notifications every 30s
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await fetch("http://localhost:3001/api/notifications/read-all", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Todas as notificações marcadas como lidas.");
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`http://localhost:3001/api/notifications/${id}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`http://localhost:3001/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notificação excluída.");
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) {
      markAsReadMutation.mutate(n.id);
    }
    if (n.jobId) {
      onSelectJob(n.jobId);
    }
  };

  if (!token) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all cursor-pointer focus:outline-none flex items-center justify-center">
          <Icon icon="hugeicons:notification-02" className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-background animate-pulse select-none">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto bg-card border-border p-2">
        <div className="flex items-center justify-between px-2 py-1">
          <DropdownMenuLabel className="font-bold text-sm">Notificações</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-[10px] text-sky-500 hover:text-sky-600 hover:underline font-semibold cursor-pointer"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="my-1" />
        
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Nenhuma notificação por enquanto.
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`flex flex-col items-start gap-1 p-2 rounded-lg cursor-pointer transition-colors ${
                  n.read 
                    ? "opacity-60 hover:bg-muted/40" 
                    : "bg-sky-500/5 hover:bg-sky-500/10 border-l-2 border-sky-500"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-semibold text-foreground ${n.read ? "" : "text-sky-500 dark:text-sky-400"}`}>
                    {n.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotificationMutation.mutate(n.id);
                    }}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    title="Excluir"
                  >
                    <Icon icon="hugeicons:delete-02" className="size-3" />
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground text-left leading-relaxed">
                  {n.message}
                </p>
                <span className="text-[9px] text-muted-foreground/60 select-none">
                  {new Date(n.createdAt).toLocaleDateString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
