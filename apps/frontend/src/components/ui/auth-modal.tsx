"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Input } from "./input";
import { Button } from "./button/button";
import { PasswordInput } from "./password-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog/dialog";
import { useAuth } from "@/lib/contexts/AuthContext";
import { toast } from "./toast/toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Erro", { description: "Por favor, preencha todos os campos obrigatórios." });
      return;
    }

    if (isRegister) {
      if (!isPasswordValid) {
        toast.error("Senha fraca", { description: "Por favor, atenda a todos os requisitos de segurança da senha." });
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Erro", { description: "A confirmação da senha não corresponde." });
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? "register" : "login";
      const response = await fetch(`http://localhost:3001/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ocorreu um erro na autenticação.");
      }

      login(data.access_token, data.user);
      toast.success(isRegister ? "Conta criada!" : "Bem-vindo de volta!", {
        description: isRegister ? "Sua conta foi registrada com sucesso." : "Você está logado.",
      });
      onClose();
    } catch (err: any) {
      toast.error("Erro na autenticação", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setIsPasswordValid(false);
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    handleReset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} modal>
      <DialogContent size="md" overlay="blur" className="bg-card border-border">
        <DialogHeader className="flex flex-col items-center">
          <div className="flex justify-center mb-3 relative w-[105px] h-[28px]">
            <Image
              src="/logos/logo_white.svg"
              width={105}
              height={28}
              className="hidden dark:block select-none object-contain"
              alt="Scout Logo"
            />
            <Image
              src="/logos/logo_black.svg"
              width={105}
              height={28}
              className="block dark:hidden select-none object-contain"
              alt="Scout Logo"
            />
          </div>
          <DialogTitle className="text-foreground font-bold">
            {isRegister ? "Criar Conta" : "Entrar no Scout"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input
            type="email"
            label="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onClear={() => setEmail("")}
            isClearable
            variant="default"
            radius="lg"
          />

          {isRegister ? (
            <PasswordInput
              label="Senha"
              placeholder="Crie uma senha forte"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onValidityChange={setIsPasswordValid}
              variant="default"
              radius="lg"
            />
          ) : (
            <Input
              type="password"
              label="Senha"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isPasswordToggle
              variant="default"
              radius="lg"
            />
          )}

          {isRegister && (
            <Input
              type="password"
              label="Confirmar Senha"
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              isPasswordToggle
              variant="default"
              radius="lg"
            />
          )}

          <Button
            type="submit"
            color="primary"
            variant="default"
            radius="lg"
            className="w-full"
            isLoading={loading}
          >
            {isRegister ? "Registrar" : "Entrar"}
          </Button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={toggleMode}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline cursor-pointer"
            >
              {isRegister
                ? "Já tem conta? Faça Login"
                : "Não tem conta? Registre-se"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
