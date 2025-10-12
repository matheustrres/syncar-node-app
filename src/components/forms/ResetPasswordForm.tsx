"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const { showToast } = useToast();
  const router = useRouter();

  const validatePassword = (pwd: string) => {
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const strength = {
      minLength: pwd.length >= 9,
      hasLowerCase: /[a-z]/.test(pwd),
      hasUpperCase: /[A-Z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasTwoSpecialChars:
        (pwd.match(new RegExp(specialCharRegex.source, "g")) || []).length >= 2,
    };
    return strength;
  };

  const isPasswordValid = (strength: ReturnType<typeof validatePassword>) => {
    return Object.values(strength).every((value) => value === true);
  };

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    const strength = validatePassword(password);
    if (!password) {
      newErrors.password = "Senha é obrigatória";
    } else if (!isPasswordValid(strength)) {
      newErrors.password = "A senha não atende aos requisitos";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao redefinir senha.");
      }

      showToast("Senha redefinida com sucesso!", "success");
      router.push("/login?reset=success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Ocorreu um erro inesperado.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = validatePassword(password);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nova Senha *
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full pl-11 pr-11 py-3 border rounded-lg ${errors.password ? "border-red-500" : "border-gray-300"}`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
        <div className="mt-2 text-sm">
          <p
            className={
              passwordStrength.minLength ? "text-green-500" : "text-red-500"
            }
          >
            Pelo menos 9 caracteres
          </p>
          <p
            className={
              passwordStrength.hasTwoSpecialChars
                ? "text-green-500"
                : "text-red-500"
            }
          >
            Pelo menos 2 caracteres especiais
          </p>
          <p
            className={
              passwordStrength.hasLowerCase ? "text-green-500" : "text-red-500"
            }
          >
            Pelo menos 1 letra minúscula
          </p>
          <p
            className={
              passwordStrength.hasUpperCase ? "text-green-500" : "text-red-500"
            }
          >
            Pelo menos 1 letra maiúscula
          </p>
          <p
            className={
              passwordStrength.hasNumber ? "text-green-500" : "text-red-500"
            }
          >
            Pelo menos 1 número
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirmar Nova Senha *
        </label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            className={`w-full pl-11 pr-11 py-3 border rounded-lg ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          "Redefinir Senha"
        )}
      </button>
    </form>
  );
}
