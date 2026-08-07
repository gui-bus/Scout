"use client";

import React, { useState } from "react";
import { Input } from "./input";
import { Button } from "./button/button";
import { Card, CardHeader, CardTitle, CardBody } from "./card";
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
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Erro", { description: "Por favor, preencha todos os campos." });
      return;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm p-4">
        <Card variant="bordered" className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between p-6 pb-0">
            <CardTitle className="text-zinc-100 font-bold">
              {isRegister ? "Criar Conta" : "Entrar no Scout"}
            </CardTitle>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer text-lg font-bold"
            >
              &times;
            </button>
          </CardHeader>
          <CardBody className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="default"
                radius="lg"
              />

              <Input
                type="password"
                label="Senha"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="default"
                radius="lg"
              />

              <Button
                type="submit"
                color="default"
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
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors underline cursor-pointer"
                >
                  {isRegister
                    ? "Já tem conta? Faça Login"
                    : "Não tem conta? Registre-se"}
                </button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
